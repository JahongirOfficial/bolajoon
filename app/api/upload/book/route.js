/**
 * Book PDF Upload API
 * POST /api/upload/book - Upload book PDF file
 */
import { writeFile, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { adminOnly } from '@/middleware/authMiddleware';
import { successResponse, errorResponse, serverError } from '@/lib/apiResponse';

export async function POST(request) {
    try {
        const auth = await adminOnly(request);
        if (!auth.success) {
            return errorResponse(auth.error, auth.status);
        }

        const formData = await request.formData();
        const file = formData.get('pdf');

        if (!file) {
            return errorResponse('PDF fayl topilmadi');
        }

        // Validate file type
        if (!file.type.includes('pdf')) {
            return errorResponse('Faqat PDF fayl yuklash mumkin');
        }

        // Validate file size (50MB max)
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
            return errorResponse('Fayl hajmi 50MB dan oshmasligi kerak');
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Define file path
        const publicDir = path.join(process.cwd(), 'public', 'book');
        const filePath = path.join(publicDir, 'bolajon-darslik.pdf');

        // Delete old file if exists
        if (existsSync(filePath)) {
            try {
                await unlink(filePath);
            } catch (error) {
                console.error('Error deleting old file:', error);
            }
        }

        // Save new file
        await writeFile(filePath, buffer);

        return successResponse({
            message: 'Kitobcha muvaffaqiyatli yuklandi',
            filename: 'bolajon-darslik.pdf',
            url: '/book/bolajon-darslik.pdf',
            size: file.size
        });

    } catch (error) {
        console.error('Book upload error:', error);
        return serverError('Kitobchani yuklashda xatolik');
    }
}
