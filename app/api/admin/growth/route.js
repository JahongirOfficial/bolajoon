/**
 * GET /api/admin/growth
 * Growth & activity metrics for admin dashboard
 * Query params:
 *   ?inactive=7|14|30  (days of inactivity filter, default 7)
 */
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import PageView from '@/models/PageView';
import { adminOnly } from '@/middleware/authMiddleware';
import { successResponse, errorResponse, serverError } from '@/lib/apiResponse';

export async function GET(request) {
    try {
        const auth = await adminOnly(request);
        if (!auth.success) return errorResponse(auth.error, auth.status);

        await dbConnect();

        const { searchParams } = new URL(request.url);
        const inactiveDays = parseInt(searchParams.get('inactive') || '7');

        const now = new Date();

        // ── 1. Online users (active in last 15 min) ──────────────────────────
        const onlineThreshold = new Date(now.getTime() - 15 * 60 * 1000);
        const onlineUsers = await User.find({
            role: 'teacher',
            lastActivityAt: { $gte: onlineThreshold }
        }).select('name phone subscriptionStatus lastActivityAt').lean();

        // ── 2. Inactive users ─────────────────────────────────────────────────
        const inactiveThreshold = new Date(now.getTime() - inactiveDays * 24 * 60 * 60 * 1000);
        const inactiveUsers = await User.find({
            role: 'teacher',
            $or: [
                { lastActivityAt: { $lt: inactiveThreshold } },
                { lastActivityAt: null }
            ]
        }).select('name phone subscriptionStatus lastLogin lastActivityAt createdAt').lean();

        // ── 3. Active hours heatmap (last 30 days, from PageView) ─────────────
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const hourlyData = await PageView.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            { $group: { _id: { $hour: { date: '$createdAt', timezone: 'Asia/Tashkent' } }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);
        const activeHours = Array.from({ length: 24 }, (_, h) => {
            const found = hourlyData.find(d => d._id === h);
            return { hour: h, label: `${h.toString().padStart(2, '0')}:00`, count: found?.count || 0 };
        });

        // ── 4. Subscription expiry calendar (next 30 days) ───────────────────
        const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        // Active subscriptions expiring
        const expiringActive = await User.find({
            role: 'teacher',
            subscriptionStatus: 'active',
            subscriptionEndDate: { $gte: now, $lte: thirtyDaysLater }
        }).select('name phone subscriptionEndDate subscriptionStatus').lean();

        // Trial subscriptions expiring (trialStartDate + 7 days)
        const trialCutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // started <= 7 days ago = expiring now
        const trialExpiring = await User.find({
            role: 'teacher',
            subscriptionStatus: 'trial',
            trialStartDate: { $lte: thirtyDaysLater, $gte: new Date(now.getTime() - 37 * 24 * 60 * 60 * 1000) }
        }).select('name phone trialStartDate subscriptionStatus').lean().then(users =>
            users.map(u => {
                const expiry = new Date(u.trialStartDate);
                expiry.setDate(expiry.getDate() + 7);
                return { ...u, subscriptionEndDate: expiry };
            }).filter(u => u.subscriptionEndDate >= now && u.subscriptionEndDate <= thirtyDaysLater)
        );

        const expiryCalendar = [...expiringActive, ...trialExpiring].sort(
            (a, b) => new Date(a.subscriptionEndDate) - new Date(b.subscriptionEndDate)
        );

        // ── 5. Conversion stats ───────────────────────────────────────────────
        const [trialCount, activeCount, expiredCount] = await Promise.all([
            User.countDocuments({ role: 'teacher', subscriptionStatus: 'trial' }),
            User.countDocuments({ role: 'teacher', subscriptionStatus: 'active' }),
            User.countDocuments({ role: 'teacher', subscriptionStatus: 'expired' })
        ]);
        const totalNonAdmin = trialCount + activeCount + expiredCount;
        const conversionRate = totalNonAdmin > 0 ? Math.round((activeCount / totalNonAdmin) * 100) : 0;

        // ── 6. DAU — last 30 days ─────────────────────────────────────────────
        const dauData = await PageView.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo }, userId: { $ne: null } } },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Asia/Tashkent' } }
                    },
                    uniqueUsers: { $addToSet: '$userId' }
                }
            },
            { $project: { date: '$_id.date', dau: { $size: '$uniqueUsers' } } },
            { $sort: { date: 1 } }
        ]);

        return successResponse({
            onlineUsers,
            inactiveUsers,
            inactiveDays,
            activeHours,
            expiryCalendar,
            conversion: { trialCount, activeCount, expiredCount, conversionRate },
            dauData
        });

    } catch (error) {
        console.error('Growth API error:', error);
        return serverError('Ma\'lumotlarni olishda xatolik');
    }
}
