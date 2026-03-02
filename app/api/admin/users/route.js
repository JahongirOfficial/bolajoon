import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { adminOnly } from '@/middleware/authMiddleware';

export async function GET(request) {
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

        // Get all users (teachers and admins)
        const users = await User.find({ role: { $ne: 'admin' } })
            .select('name phone role subscriptionStatus subscriptionEndDate trialStartDate createdAt')
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            users
        });

    } catch (error) {
        console.error('Foydalanuvchilarni olishda xato:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
