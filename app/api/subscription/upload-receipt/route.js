/**
 * POST /api/subscription/upload-receipt
 * User uploads payment receipt screenshot → admin notified via Telegram
 */
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Settings from '@/models/Settings';
import { authenticate } from '@/middleware/authMiddleware';
import { successResponse, errorResponse, serverError } from '@/lib/apiResponse';
import { sendReceiptNotification } from '@/lib/telegram';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'receipts');
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request) {
    try {
        const auth = await authenticate(request);
        if (!auth.success) {
            return errorResponse(auth.error, 401);
        }

        const formData = await request.formData();
        const file = formData.get('receipt');
        const days = parseInt(formData.get('days')) || 1;

        if (!file) {
            return errorResponse('Chek rasmi tanlanmagan', 400);
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            return errorResponse('Faqat JPG, PNG, WebP formatlar qabul qilinadi', 400);
        }

        if (file.size > MAX_SIZE) {
            return errorResponse('Fayl hajmi 10MB dan oshmasligi kerak', 400);
        }

        await dbConnect();

        const user = await User.findById(auth.userId).select('name phone').lean();
        if (!user) {
            return errorResponse('Foydalanuvchi topilmadi', 404);
        }

        // Save receipt image
        if (!existsSync(UPLOAD_DIR)) {
            await mkdir(UPLOAD_DIR, { recursive: true });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const ext = file.type.split('/')[1].replace('jpeg', 'jpg');
        const filename = `receipt_${Date.now()}_${auth.userId}.${ext}`;
        await writeFile(path.join(UPLOAD_DIR, filename), buffer);

        // Notify admin via Telegram
        const dailyPrice = await Settings.get('dailyPrice', 200);
        const amount = dailyPrice * days;
        await sendReceiptNotification(user, days, amount, buffer);

        return successResponse({
            message: 'Chek yuborildi! Admin tekshirib, kun qo\'shadi.'
        });

    } catch (error) {
        console.error('Receipt upload error:', error);
        return serverError('Chek yuklashda xatolik');
    }
}
