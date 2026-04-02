/**
 * POST /api/auth/login
 * Authenticate user with phone number and password
 */
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken } from '@/lib/auth';
import { successResponse, errorResponse, serverError } from '@/lib/apiResponse';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(request) {
    try {
        // Rate limit: 20 attempts per 15 minutes per IP
        const ip = getClientIp(request);
        const { limited } = rateLimit(`login:${ip}`, 20, 15 * 60 * 1000);
        if (limited) {
            return errorResponse('Juda ko\'p urinish. 15 daqiqadan so\'ng qayta urinib ko\'ring.', 429);
        }

        await dbConnect();

        const body = await request.json();
        const { phone, password } = body;

        // Validation
        if (!phone || !password) {
            return errorResponse('Telefon raqam va parol kiritilishi shart');
        }

        // Normalize phone number - remove all spaces, dashes, and non-digit characters except +
        const normalizedPhone = phone.replace(/\s+/g, '').replace(/-/g, '').replace(/[^\d+]/g, '');

        // Find user with password field
        const user = await User.findOne({ phone: normalizedPhone }).select('+password');

        if (!user) {
            return errorResponse('Telefon raqam yoki parol noto\'g\'ri', 401);
        }

        // Check if account is active
        if (!user.isActive) {
            return errorResponse('Hisob bloklangan. Admin bilan bog\'laning.', 403);
        }

        // Verify password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return errorResponse('Telefon raqam yoki parol noto\'g\'ri', 401);
        }

        // Update lastLogin
        await User.updateOne({ _id: user._id }, { lastLogin: new Date() });

        // Generate token
        const token = generateToken(user);

        // Calculate days remaining
        const daysRemaining = user.getDaysRemaining();

        const response = successResponse({
            message: 'Kirish muvaffaqiyatli',
            token,
            user: {
                _id: user._id,
                name: user.name,
                phone: user.phone,
                role: user.role,
                avatar: user.avatar,
                subscriptionStatus: user.subscriptionStatus,
                trialStartDate: user.trialStartDate,
                daysRemaining
            }
        });

        // Set token as cookie so Next.js middleware can verify server-side
        response.headers.set('Set-Cookie', `token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=604800`);

        return response;

    } catch (error) {
        console.error('Login error:', error.message, error.stack);
        if (error.message?.includes('MONGODB_URI') || error.message?.includes('connect')) {
            return serverError('Ma\'lumotlar bazasiga ulanishda xatolik. Qaytadan urinib ko\'ring.');
        }
        return serverError('Kirishda xatolik');
    }
}
