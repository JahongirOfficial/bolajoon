/**
 * GET /api/admin/analytics
 * Returns aggregated page analytics — admin only
 */
import dbConnect from '@/lib/mongodb';
import PageView from '@/models/PageView';
import { adminOnly } from '@/middleware/authMiddleware';
import { successResponse, errorResponse, serverError } from '@/lib/apiResponse';

export async function GET(request) {
    try {
        const auth = await adminOnly(request);
        if (!auth.success) return errorResponse(auth.error, auth.status);

        await dbConnect();

        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(todayStart);
        weekStart.setDate(weekStart.getDate() - 6);
        const monthStart = new Date(todayStart);
        monthStart.setDate(monthStart.getDate() - 29);

        // Run all aggregations in parallel
        const [
            todayViews,
            todaySessions,
            totalViews,
            pageStats,
            entryPages,
            exitPages,
            hourlyToday,
            dailyLast7,
        ] = await Promise.all([
            // Today total page views
            PageView.countDocuments({ createdAt: { $gte: todayStart } }),

            // Today unique sessions
            PageView.distinct('sessionId', { createdAt: { $gte: todayStart } }).then(r => r.length),

            // Total all-time views
            PageView.countDocuments({}),

            // Per-page stats (last 30 days)
            PageView.aggregate([
                { $match: { createdAt: { $gte: monthStart } } },
                {
                    $group: {
                        _id: '$page',
                        views: { $sum: 1 },
                        avgTime: { $avg: '$timeSpent' },
                        exits: { $sum: { $cond: ['$isExit', 1, 0] } },
                        entries: { $sum: { $cond: ['$isEntry', 1, 0] } },
                    }
                },
                { $sort: { views: -1 } },
                { $limit: 20 }
            ]),

            // Top entry pages (last 30 days)
            PageView.aggregate([
                { $match: { createdAt: { $gte: monthStart }, isEntry: true } },
                { $group: { _id: '$page', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]),

            // Top exit pages (last 30 days)
            PageView.aggregate([
                { $match: { createdAt: { $gte: monthStart }, isExit: true } },
                { $group: { _id: '$page', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]),

            // Hourly distribution today (0-23)
            PageView.aggregate([
                { $match: { createdAt: { $gte: todayStart } } },
                {
                    $group: {
                        _id: { $hour: '$createdAt' },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]),

            // Daily views last 7 days
            PageView.aggregate([
                { $match: { createdAt: { $gte: weekStart } } },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                        },
                        count: { $sum: 1 },
                        sessions: { $addToSet: '$sessionId' }
                    }
                },
                { $sort: { _id: 1 } }
            ])
        ]);

        // Build hourly array (fill missing hours with 0)
        const hourlyMap = new Map(hourlyToday.map(h => [h._id, h.count]));
        const hourly = Array.from({ length: 24 }, (_, i) => ({
            hour: i,
            label: `${String(i).padStart(2, '0')}:00`,
            count: hourlyMap.get(i) || 0
        }));

        // Build daily array (fill missing days)
        const dailyMap = new Map(dailyLast7.map(d => [d._id, { count: d.count, sessions: d.sessions.length }]));
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(todayStart);
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split('T')[0];
            days.push({
                date: key,
                label: d.toLocaleDateString('uz-UZ', { weekday: 'short', day: 'numeric' }),
                ...(dailyMap.get(key) || { count: 0, sessions: 0 })
            });
        }

        // Identify low-engagement pages (avg < 15s AND 5+ views)
        const lowEngagement = pageStats
            .filter(p => p.avgTime < 15 && p.views >= 5)
            .sort((a, b) => a.avgTime - b.avgTime)
            .slice(0, 5);

        return successResponse({
            summary: {
                todayViews,
                todaySessions,
                totalViews,
                weekViews: days.reduce((s, d) => s + d.count, 0),
            },
            pageStats,
            entryPages,
            exitPages,
            lowEngagement,
            hourly,
            days
        });
    } catch (error) {
        console.error('Analytics error:', error);
        return serverError('Analytics yuklanmadi');
    }
}
