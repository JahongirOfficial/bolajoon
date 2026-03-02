import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Settings from '@/models/Settings';

/**
 * Auto-Renewal Cron Job
 * 
 * Purpose: Automatically renew expired subscriptions using user balance
 * Trigger: Daily cron job (recommended: 00:00 UTC)
 * 
 * Business Logic:
 * - When subscription expires (0 days remaining)
 * - Convert ENTIRE balance to subscription days
 * - Formula: days = floor(balance / dailyPrice)
 * - Example: 20,000 so'm / 500 so'm = 40 days
 * 
 * Security: Requires Bearer token matching CRON_SECRET env variable
 */

const TRIAL_DURATION_DAYS = 7;
const MIN_BALANCE_THRESHOLD = 500;

/**
 * Verify cron job authorization
 */
function verifyCronAuth(request) {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) return false;
    const authHeader = request.headers.get('authorization');
    return authHeader === `Bearer ${cronSecret}`;
}

/**
 * Calculate subscription end date based on current status
 */
function calculateEndDate(user, daysToAdd, now) {
    const isExpiredOrTrial = ['trial', 'expired'].includes(user.subscriptionStatus);
    const hasValidEndDate = user.subscriptionEndDate && new Date(user.subscriptionEndDate) > now;
    
    let endDate;
    if (isExpiredOrTrial || !hasValidEndDate) {
        // Start fresh subscription from now
        endDate = new Date(now);
        endDate.setDate(endDate.getDate() + daysToAdd);
    } else {
        // Extend existing subscription
        endDate = new Date(user.subscriptionEndDate);
        endDate.setDate(endDate.getDate() + daysToAdd);
    }
    
    return endDate;
}

/**
 * Process single user renewal
 */
async function processUserRenewal(user, dailyPrice, now) {
    // Validate sufficient balance
    if (user.balance < dailyPrice) {
        user.subscriptionStatus = 'expired';
        await user.save();
        
        return {
            status: 'insufficient_balance',
            balance: user.balance,
            required: dailyPrice
        };
    }

    // Calculate days and cost
    const daysCanBuy = Math.floor(user.balance / dailyPrice);
    const totalCost = daysCanBuy * dailyPrice;
    const remainingBalance = user.balance - totalCost;

    // Update user subscription
    user.balance = remainingBalance;
    user.subscriptionEndDate = calculateEndDate(user, daysCanBuy, now);
    user.subscriptionStatus = 'active';
    user.lastPaymentDate = now;
    
    await user.save();

    return {
        status: 'renewed',
        daysAdded: daysCanBuy,
        amountDeducted: totalCost,
        newBalance: remainingBalance,
        subscriptionEndDate: user.subscriptionEndDate
    };
}

/**
 * Main cron handler
 */
export async function GET(request) {
    try {
        // Security check
        if (!verifyCronAuth(request)) {
            return NextResponse.json({ 
                success: false, 
                error: 'Unauthorized' 
            }, { status: 401 });
        }

        await dbConnect();

        const dailyPrice = await Settings.get('dailyPrice', MIN_BALANCE_THRESHOLD);
        const now = new Date();
        const trialExpiryDate = new Date(now.getTime() - TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000);

        // Query expired users with sufficient balance
        const users = await User.find({
            role: 'teacher',
            balance: { $gte: dailyPrice },
            $or: [
                { subscriptionStatus: 'trial', trialStartDate: { $lte: trialExpiryDate } },
                { subscriptionStatus: 'active', subscriptionEndDate: { $lte: now } },
                { subscriptionStatus: 'expired' }
            ]
        }).select('name balance subscriptionStatus subscriptionEndDate trialStartDate lastPaymentDate');

        // Process renewals
        const results = {
            total: users.length,
            renewed: 0,
            insufficient: 0,
            errors: 0,
            details: []
        };

        for (const user of users) {
            try {
                const result = await processUserRenewal(user, dailyPrice, now);
                
                if (result.status === 'renewed') {
                    results.renewed++;
                } else if (result.status === 'insufficient_balance') {
                    results.insufficient++;
                }

                results.details.push({
                    userId: user._id,
                    name: user.name,
                    ...result
                });

            } catch (error) {
                results.errors++;
                results.details.push({
                    userId: user._id,
                    name: user.name,
                    status: 'error',
                    error: error.message
                });
            }
        }

        return NextResponse.json({
            success: true,
            message: `Auto-renewal: ${results.renewed} renewed, ${results.insufficient} insufficient, ${results.errors} errors`,
            timestamp: now.toISOString(),
            results
        });

    } catch (error) {
        console.error('[CRON] Auto-renewal failed:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Cron job failed',
            details: error.message
        }, { status: 500 });
    }
}
