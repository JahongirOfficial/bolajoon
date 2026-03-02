import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { adminOnly } from '@/middleware/authMiddleware';

export async function POST(request) {
    try {
        // Verify admin authentication
        const authResult = await adminOnly(request);
        if (!authResult.success) {
            return NextResponse.json(
                { success: false, error: authResult.error },
                { status: authResult.status }
            );
        }

        await connectDB();

        const { userIds, message } = await request.json();

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Foydalanuvchilar tanlanmagan' },
                { status: 400 }
            );
        }

        // Max 100 recipients per request
        if (userIds.length > 100) {
            return NextResponse.json(
                { success: false, error: 'Bir vaqtda maksimal 100 ta foydalanuvchiga SMS yuborish mumkin' },
                { status: 400 }
            );
        }

        if (!message || !message.trim()) {
            return NextResponse.json(
                { success: false, error: 'Xabar kiritilmagan' },
                { status: 400 }
            );
        }

        // Get users with phone numbers
        const users = await User.find({
            _id: { $in: userIds },
            phone: { $exists: true, $ne: '' }
        }).select('phone name');

        if (users.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Telefon raqami bo\'lgan foydalanuvchilar topilmadi' },
                { status: 404 }
            );
        }

        // SMS yuborish logikasi
        // Bu yerda SMS provider API'sini chaqirish kerak
        // Masalan: Eskiz.uz, Playmobile.uz, yoki boshqa SMS gateway
        
        const results = [];
        let successCount = 0;
        let failCount = 0;

        for (const user of users) {
            try {
                // SMS yuborish funksiyasini chaqirish
                const smsResult = await sendSMS(user.phone, message);
                
                if (smsResult.success) {
                    successCount++;
                    results.push({
                        phone: user.phone,
                        name: user.name,
                        status: 'success'
                    });
                } else {
                    failCount++;
                    results.push({
                        phone: user.phone,
                        name: user.name,
                        status: 'failed',
                        error: smsResult.error
                    });
                }
            } catch (error) {
                failCount++;
                results.push({
                    phone: user.phone,
                    name: user.name,
                    status: 'failed',
                    error: error.message
                });
            }
        }

        return NextResponse.json({
            success: true,
            sent: successCount,
            failed: failCount,
            total: users.length,
            results
        });

    } catch (error) {
        console.error('SMS yuborishda xato:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// SMS yuborish funksiyasi
// Bu yerda o'zingizning SMS provider'ingizni ulang
async function sendSMS(phone, message) {
    try {
        // ESKIZ.UZ misoli
        const SMS_API_URL = process.env.SMS_API_URL || 'https://notify.eskiz.uz/api/message/sms/send';
        const SMS_API_TOKEN = process.env.SMS_API_TOKEN;

        if (!SMS_API_TOKEN) {
            console.warn('SMS_API_TOKEN sozlanmagan. SMS yuborilmaydi.');
            // Development rejimida success qaytaramiz
            return { success: true, message: 'Development mode - SMS not sent' };
        }

        // Telefon raqamini formatlash (998901234567 formatiga)
        const formattedPhone = phone.replace(/[^0-9]/g, '');

        const response = await fetch(SMS_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SMS_API_TOKEN}`
            },
            body: JSON.stringify({
                mobile_phone: formattedPhone,
                message: message,
                from: '4546', // Eskiz.uz dan olingan sender ID
                callback_url: process.env.NEXT_PUBLIC_BASE_URL + '/api/sms/callback'
            })
        });

        const data = await response.json();

        if (response.ok && data.status === 'success') {
            return { success: true, data };
        } else {
            return { 
                success: false, 
                error: data.message || 'SMS yuborishda xatolik' 
            };
        }

    } catch (error) {
        console.error('SMS API xatosi:', error);
        return { 
            success: false, 
            error: error.message 
        };
    }
}
