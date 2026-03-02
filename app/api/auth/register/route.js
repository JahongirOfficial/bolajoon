/**
 * POST /api/auth/register
 * Register a new teacher account using phone number
 */
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken } from '@/lib/auth';
import { successResponse, errorResponse, serverError } from '@/lib/apiResponse';
import { sendRegistrationNotification } from '@/lib/telegram';
import { clearCache } from '@/lib/cache';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(request) {
    try {
        // Rate limit: 5 registrations per hour per IP
        const ip = getClientIp(request);
        const { limited } = rateLimit(`register:${ip}`, 5, 60 * 60 * 1000);
        if (limited) {
            return errorResponse('Juda ko\'p urinish. 1 soatdan so\'ng qayta urinib ko\'ring.', 429);
        }

        await dbConnect();

        const body = await request.json();
        const { name, phone, password, role } = body;

        // Validation
        if (!name || !phone || !password) {
            return errorResponse('Ism, telefon raqam va parol kiritilishi shart');
        }

        if (password.length < 6) {
            return errorResponse('Parol kamida 6 ta belgidan iborat bo\'lishi kerak');
        }

        // Normalize phone number - remove all spaces, dashes, and non-digit characters except +
        const normalizedPhone = phone.replace(/\s+/g, '').replace(/-/g, '').replace(/[^\d+]/g, '');

        // Check if user already exists
        const existingUser = await User.findOne({ phone: normalizedPhone });
        if (existingUser) {
            return errorResponse('Bu telefon raqam allaqachon ro\'yxatdan o\'tgan', 409);
        }

        // Role always defaults to teacher — admin can only be set via DB directly
        const userRole = 'teacher';

        // Create new user (teacher or admin)
        const user = await User.create({
            name,
            phone: normalizedPhone,
            password,
            role: userRole,
            subscriptionStatus: 'trial',
            trialStartDate: new Date()
        });

        // Generate token
        const token = generateToken(user);

        // Calculate days remaining (should be 7 for new trial users)
        const daysRemaining = user.getDaysRemaining();

        // 🚀 Clear cache so admin users list gets updated
        clearCache('admin:users');

        // Telegram ga xabar yuborish
        try {
            await sendRegistrationNotification({
                name: user.name,
                phone: user.phone,
                role: user.role,
                email: user.email
            });
        } catch (telegramError) {
            console.error('Telegram xabar yuborishda xato:', telegramError);
            // Telegram xatosi ro'yxatdan o'tishni to'xtatmasin
        }

        return successResponse({
            message: 'Ro\'yxatdan o\'tish muvaffaqiyatli',
            token,
            user: {
                _id: user._id,
                name: user.name,
                phone: user.phone,
                role: user.role,
                subscriptionStatus: user.subscriptionStatus,
                trialStartDate: user.trialStartDate,
                daysRemaining
            }
        }, 201);

    } catch (error) {
        console.error('Register error:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return errorResponse(messages.join(', '));
        }

        if (error.code === 11000) {
            return errorResponse('Bu telefon raqam allaqachon ro\'yxatdan o\'tgan', 409);
        }

        return serverError('Ro\'yxatdan o\'tishda xatolik');
    }
}
