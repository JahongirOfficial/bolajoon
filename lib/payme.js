/**
 * Payme Integration Library
 * Handles payment creation, verification and callbacks
 */

import { ObjectId } from 'mongodb';

// Payme konfiguratsiyasi
export const PAYME_CONFIG = {
    merchantId: process.env.PAYME_MERCHANT_ID,
    secretKey: process.env.PAYME_SECRET_KEY,
    endpoint: process.env.PAYME_ENDPOINT || 'https://checkout.paycom.uz/api',
    callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/payme/callback`,
    returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/profile?payment=success`,
    minAmount: 1000, // Minimal to'lov summasi (so'm)
};

/**
 * Generate Payme checkout URL
 * @param {string} orderId - Unique order ID
 * @param {number} amount - Amount in so'm
 * @param {object} account - Account info (userId, etc)
 * @returns {string} Payme checkout URL
 */
export function generatePaymeUrl(orderId, amount, account) {
    const amountInTiyin = amount * 100; // Convert so'm to tiyin

    // Create merchant string: m={merchantId};ac.{key}={value};a={amount};c={callback}
    const merchantId = PAYME_CONFIG.merchantId;
    const accountParams = Object.entries(account)
        .map(([key, value]) => `ac.${key}=${encodeURIComponent(String(value))}`)
        .join(';');

    const params = `m=${merchantId};${accountParams};a=${amountInTiyin};c=${PAYME_CONFIG.returnUrl}`;

    console.log('Generated Payme params:', params);

    // Encode to base64
    const encodedParams = Buffer.from(params).toString('base64');

    console.log('Encoded params:', encodedParams);
    console.log('Final URL:', `https://checkout.paycom.uz/${encodedParams}`);

    return `https://checkout.paycom.uz/${encodedParams}`;
}

/**
 * Verify Payme callback signature
 * @param {string} authorization - Authorization header from Payme
 * @returns {boolean} Is signature valid
 */
export function verifyPaymeSignature(authorization) {
    if (!authorization || !authorization.startsWith('Basic ')) {
        return false;
    }

    const credentials = Buffer.from(authorization.slice(6), 'base64').toString();
    const [username, password] = credentials.split(':');

    return username === 'Paycom' && password === PAYME_CONFIG.secretKey;
}

/**
 * Generate Payme error response
 * @param {number} code - Error code
 * @param {string} message - Error message
 * @param {string} data - Additional data
 * @returns {object} Error response
 */
export function generatePaymeError(code, message, data = null) {
    return {
        error: {
            code,
            message: message || getPaymeErrorMessage(code),
            data
        }
    };
}

/**
 * Get Payme error message by code
 */
function getPaymeErrorMessage(code) {
    const errors = {
        '-32700': 'Parse error',
        '-32600': 'Invalid Request',
        '-32601': 'Method not found',
        '-32602': 'Invalid params',
        '-32603': 'Internal error',
        '-31001': 'Wrong amount',
        '-31003': 'Transaction not found',
        '-31008': 'Transaction cancelled',
        '-31050': 'Мы не нашли вашу учетную запись',
        '-31051': 'Order already paid',
    };
    return errors[code] || 'Unknown error';
}

/**
 * Payme RPC Methods Handler
 */
export class PaymeRPC {
    constructor(db) {
        this.db = db;
    }

    async handleRequest(method, params) {
        switch (method) {
            case 'CheckPerformTransaction':
                return await this.checkPerformTransaction(params);
            case 'CreateTransaction':
                return await this.createTransaction(params);
            case 'PerformTransaction':
                return await this.performTransaction(params);
            case 'CancelTransaction':
                return await this.cancelTransaction(params);
            case 'CheckTransaction':
                return await this.checkTransaction(params);
            case 'GetStatement':
                return await this.getStatement(params);
            default:
                throw generatePaymeError(-32601, 'Method not found');
        }
    }

    async checkPerformTransaction(params) {
        const { amount, account } = params;
        
        console.log('🔍 CheckPerformTransaction:', { amount, account });
        
        // Check if user exists
        try {
            const user = await this.db.collection('users').findOne({ 
                _id: new ObjectId(account.userId) 
            });

            if (!user) {
                console.log('❌ User not found:', account.userId);
                throw generatePaymeError(-31050, 'Мы не нашли вашу учетную запись');
            }

            // Check if user is active
            if (!user.isActive) {
                console.log('❌ User is not active:', account.userId);
                throw generatePaymeError(-31050, 'Мы не нашли вашу учетную запись');
            }

            // Check amount
            if (amount < PAYME_CONFIG.minAmount * 100) {
                console.log('❌ Amount too small:', amount);
                throw generatePaymeError(-31001, 'Wrong amount');
            }

            console.log('✅ CheckPerformTransaction passed');
            return { allow: true };
        } catch (error) {
            // If it's already a Payme error, rethrow it
            if (error.error) {
                throw error;
            }
            // If it's a MongoDB error (invalid ObjectId), return order not found
            console.log('❌ Invalid userId format:', account.userId, error.message);
            throw generatePaymeError(-31050, 'Мы не нашли вашу учетную запись');
        }
    }

    async createTransaction(params) {
        const { id, time, amount, account } = params;

        console.log('🔍 CreateTransaction:', { id, time, amount, account });

        // Check if user exists first
        try {
            const user = await this.db.collection('users').findOne({ 
                _id: new ObjectId(account.userId) 
            });

            if (!user) {
                console.log('❌ User not found in CreateTransaction:', account.userId);
                throw generatePaymeError(-31050, 'Мы не нашли вашу учетную запись');
            }
        } catch (error) {
            if (error.error) {
                throw error;
            }
            console.log('❌ Invalid userId in CreateTransaction:', account.userId);
            throw generatePaymeError(-31050, 'Мы не нашли вашу учетную запись');
        }

        // Check if transaction already exists
        let transaction = await this.db.collection('payme_transactions').findOne({ 
            paymeTransactionId: id 
        });

        if (transaction) {
            if (transaction.state !== 1) {
                throw generatePaymeError(-31008, 'Transaction cancelled');
            }
            return {
                create_time: transaction.createTime,
                transaction: transaction._id.toString(),
                state: transaction.state
            };
        }

        // Create new transaction
        const newTransaction = {
            paymeTransactionId: id,
            userId: account.userId,
            amount: amount / 100, // Convert tiyin to so'm
            state: 1, // Created
            createTime: time,
            performTime: 0,
            cancelTime: 0,
            reason: null,
            createdAt: new Date()
        };

        const result = await this.db.collection('payme_transactions').insertOne(newTransaction);

        return {
            create_time: time,
            transaction: result.insertedId.toString(),
            state: 1
        };
    }

    async performTransaction(params) {
        const { id } = params;

        const transaction = await this.db.collection('payme_transactions').findOne({ 
            paymeTransactionId: id 
        });

        if (!transaction) {
            throw generatePaymeError(-31003, 'Transaction not found');
        }

        if (transaction.state === 1) {
            // Get dailyPrice from settings
            const settingsDoc = await this.db.collection('settings').findOne({ key: 'dailyPrice' });
            const dailyPrice = settingsDoc ? settingsDoc.value : 500;

            console.log('💰 Payment amount:', transaction.amount, 'so\'m');
            console.log('💰 Daily price:', dailyPrice, 'so\'m');

            // Get current user
            const user = await this.db.collection('users').findOne({ 
                _id: new ObjectId(transaction.userId) 
            });

            if (!user) {
                throw generatePaymeError(-31050, 'User not found');
            }

            // Check current days remaining
            const now = new Date();
            let currentDaysRemaining = 0;
            
            if (user.subscriptionStatus === 'active' && user.subscriptionEndDate) {
                const endDate = new Date(user.subscriptionEndDate);
                if (endDate > now) {
                    const diff = endDate.getTime() - now.getTime();
                    currentDaysRemaining = Math.ceil(diff / (1000 * 60 * 60 * 24));
                }
            }

            console.log('📅 Current days remaining:', currentDaysRemaining);

            // 🔥 NEW LOGIC: If days = 0, convert ALL balance to days
            let daysToAdd;
            let finalBalance;
            
            if (currentDaysRemaining === 0) {
                // Add payment to balance first
                const totalBalance = (user.balance || 0) + transaction.amount;
                
                // Convert ALL balance to days
                daysToAdd = Math.floor(totalBalance / dailyPrice);
                const usedAmount = daysToAdd * dailyPrice;
                finalBalance = totalBalance - usedAmount;
                
                console.log('🔥 Days = 0: Converting ALL balance to days');
                console.log('💰 Total balance:', totalBalance, 'so\'m');
                console.log('📅 Days to add:', daysToAdd);
                console.log('💰 Final balance:', finalBalance, 'so\'m');
            } else {
                // Normal flow: just add payment amount to days
                daysToAdd = Math.floor(transaction.amount / dailyPrice);
                finalBalance = (user.balance || 0) + transaction.amount;
                
                console.log('✅ Normal flow: Adding payment to balance');
                console.log('📅 Days to add:', daysToAdd);
                console.log('💰 Final balance:', finalBalance, 'so\'m');
            }

            // Calculate new subscription end date
            let newEndDate;
            if (user.subscriptionStatus === 'active' && user.subscriptionEndDate && currentDaysRemaining > 0) {
                // If already active, add days to existing end date
                newEndDate = new Date(user.subscriptionEndDate);
                newEndDate.setDate(newEndDate.getDate() + daysToAdd);
            } else {
                // If trial or expired, start from now
                newEndDate = new Date();
                newEndDate.setDate(newEndDate.getDate() + daysToAdd);
            }

            console.log('📅 New subscription end date:', newEndDate);

            // Update user: set balance + update subscription
            await this.db.collection('users').updateOne(
                { _id: new ObjectId(transaction.userId) },
                { 
                    $set: { 
                        balance: finalBalance,
                        subscriptionStatus: 'active',
                        subscriptionEndDate: newEndDate,
                        lastPaymentDate: new Date()
                    }
                }
            );

            console.log('✅ User balance and subscription updated');

            // Update transaction state
            const performTime = Date.now();
            await this.db.collection('payme_transactions').updateOne(
                { paymeTransactionId: id },
                { 
                    $set: { 
                        state: 2, // Performed
                        performTime 
                    } 
                }
            );

            return {
                transaction: transaction._id.toString(),
                perform_time: performTime,
                state: 2
            };
        }

        if (transaction.state === 2) {
            return {
                transaction: transaction._id.toString(),
                perform_time: transaction.performTime,
                state: 2
            };
        }

        throw generatePaymeError(-31008, 'Transaction cancelled');
    }

    async cancelTransaction(params) {
        const { id, reason } = params;

        const transaction = await this.db.collection('payme_transactions').findOne({ 
            paymeTransactionId: id 
        });

        if (!transaction) {
            throw generatePaymeError(-31003, 'Transaction not found');
        }

        const cancelTime = Date.now();

        if (transaction.state === 1) {
            // Cancel created transaction
            await this.db.collection('payme_transactions').updateOne(
                { paymeTransactionId: id },
                { 
                    $set: { 
                        state: -1, // Cancelled
                        cancelTime,
                        reason 
                    } 
                }
            );

            return {
                transaction: transaction._id.toString(),
                cancel_time: cancelTime,
                state: -1
            };
        }

        if (transaction.state === 2) {
            // Refund performed transaction
            // Get dailyPrice to calculate days to remove
            const settingsDoc = await this.db.collection('settings').findOne({ key: 'dailyPrice' });
            const dailyPrice = settingsDoc ? settingsDoc.value : 500;
            const daysToRemove = Math.floor(transaction.amount / dailyPrice);

            console.log('🔄 Refunding transaction:', transaction.amount, 'so\'m');
            console.log('🔄 Days to remove:', daysToRemove);

            // Get current user
            const user = await this.db.collection('users').findOne({ 
                _id: new ObjectId(transaction.userId) 
            });

            if (user && user.subscriptionEndDate) {
                // Remove days from subscription
                const newEndDate = new Date(user.subscriptionEndDate);
                newEndDate.setDate(newEndDate.getDate() - daysToRemove);

                // Check if subscription should be expired
                const now = new Date();
                const subscriptionStatus = newEndDate > now ? 'active' : 'expired';

                await this.db.collection('users').updateOne(
                    { _id: new ObjectId(transaction.userId) },
                    { 
                        $inc: { balance: -transaction.amount },
                        $set: {
                            subscriptionEndDate: newEndDate,
                            subscriptionStatus
                        }
                    }
                );

                console.log('✅ Refund completed, subscription updated');
            } else {
                // Just refund balance if no subscription
                await this.db.collection('users').updateOne(
                    { _id: new ObjectId(transaction.userId) },
                    { $inc: { balance: -transaction.amount } }
                );
            }

            await this.db.collection('payme_transactions').updateOne(
                { paymeTransactionId: id },
                { 
                    $set: { 
                        state: -2, // Refunded
                        cancelTime,
                        reason 
                    } 
                }
            );

            return {
                transaction: transaction._id.toString(),
                cancel_time: cancelTime,
                state: -2
            };
        }

        return {
            transaction: transaction._id.toString(),
            cancel_time: transaction.cancelTime,
            state: transaction.state
        };
    }

    async checkTransaction(params) {
        const { id } = params;

        const transaction = await this.db.collection('payme_transactions').findOne({ 
            paymeTransactionId: id 
        });

        if (!transaction) {
            throw generatePaymeError(-31003, 'Transaction not found');
        }

        return {
            create_time: transaction.createTime,
            perform_time: transaction.performTime,
            cancel_time: transaction.cancelTime,
            transaction: transaction._id.toString(),
            state: transaction.state,
            reason: transaction.reason
        };
    }

    async getStatement(params) {
        const { from, to } = params;

        const transactions = await this.db.collection('payme_transactions')
            .find({
                createTime: { $gte: from, $lte: to }
            })
            .toArray();

        return {
            transactions: transactions.map(t => ({
                id: t.paymeTransactionId,
                time: t.createTime,
                amount: t.amount * 100,
                account: { userId: t.userId },
                create_time: t.createTime,
                perform_time: t.performTime,
                cancel_time: t.cancelTime,
                transaction: t._id.toString(),
                state: t.state,
                reason: t.reason
            }))
        };
    }
}
