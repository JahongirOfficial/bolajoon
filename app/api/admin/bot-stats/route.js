/**
 * GET /api/admin/bot-stats
 * Returns platform stats for the Telegram bot /s command.
 * Auth: x-bot-secret header (no JWT needed — internal use only)
 */
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Student from '@/models/Student';
import Lesson from '@/models/Lesson';
import Progress from '@/models/Progress';
import PageView from '@/models/PageView';

const BOT_SECRET = process.env.BOT_API_SECRET;

export async function GET(request) {
    // Simple secret-key auth
    const secret = request.headers.get('x-bot-secret');
    if (!BOT_SECRET || secret !== BOT_SECRET) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    try {
        await dbConnect();

        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

        const [
            totalUsers,
            totalStudents,
            totalLessons,
            activeLessons,
            totalProgress,
            newUsersToday,
            newUsersWeek,
            newUsersMonth,
            activeSubscriptions,
            trialSubscriptions,
            todayPageViews,
            totalPageViews,
        ] = await Promise.all([
            User.countDocuments({}),
            Student.countDocuments({}),
            Lesson.countDocuments({}),
            Lesson.countDocuments({ isActive: true }),
            Progress.countDocuments({}),
            User.countDocuments({ createdAt: { $gte: todayStart } }),
            User.countDocuments({ createdAt: { $gte: weekAgo } }),
            User.countDocuments({ createdAt: { $gte: monthAgo } }),
            User.countDocuments({ subscriptionStatus: 'active' }).catch(() => 0),
            User.countDocuments({ subscriptionStatus: 'trial' }).catch(() => 0),
            PageView.countDocuments({ createdAt: { $gte: todayStart } }).catch(() => 0),
            PageView.countDocuments({}).catch(() => 0),
        ]);

        return new Response(JSON.stringify({
            totalUsers,
            totalStudents,
            totalLessons,
            activeLessons,
            totalProgress,
            newUsersToday,
            newUsersWeek,
            newUsersMonth,
            activeSubscriptions,
            trialSubscriptions,
            todayPageViews,
            totalPageViews,
        }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
