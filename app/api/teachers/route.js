/**
 * Teachers API Routes (Admin only) - ULTRA OPTIMIZED
 * GET /api/teachers - Get all teachers with student counts
 * Target: <1s with caching and single aggregation query
 */
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Student from '@/models/Student';
import { adminOnly } from '@/middleware/authMiddleware';
import { successResponse, errorResponse, serverError } from '@/lib/apiResponse';
import { getCached, setCache } from '@/lib/cache';

const CACHE_KEY = 'admin:users';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// GET - Get all teachers with student counts and subscription info
export async function GET(request) {
    try {
        const auth = await adminOnly(request);
        if (!auth.success) {
            return errorResponse(auth.error, auth.status);
        }

        // 🚀 STEP 1: Check cache first (<10ms)
        const cached = getCached(CACHE_KEY);
        if (cached) {
            return successResponse({ teachers: cached, cached: true });
        }

        await dbConnect();

        // 🚀 STEP 2: Single aggregation to get student counts (100x faster!)
        const studentCounts = await Student.aggregate([
            {
                $group: {
                    _id: '$teacher',
                    count: { $sum: 1 }
                }
            }
        ]).exec();

        // Convert to Map for O(1) lookup
        const studentCountMap = new Map(
            studentCounts.map(item => [item._id.toString(), item.count])
        );

        // 🚀 STEP 3: Get all teachers in one query with lean()
        const teachers = await User.find({ role: { $in: ['teacher', 'admin'] } })
            .select('-password')
            .sort({ createdAt: -1 })
            .lean()
            .exec();

        // 🚀 STEP 4: Calculate subscription info (in-memory, fast)
        const now = new Date();
        const teachersWithInfo = teachers.map(teacher => {
            // Calculate subscription status
            let isSubscriptionValid = false;
            let daysRemaining = 0;

            if (teacher.role === 'admin') {
                isSubscriptionValid = true;
                daysRemaining = 999;
            } else {
                // Check trial period (7 days)
                if (teacher.subscriptionStatus === 'trial' && teacher.trialStartDate) {
                    const trialEnd = new Date(teacher.trialStartDate);
                    trialEnd.setDate(trialEnd.getDate() + 7);
                    isSubscriptionValid = now < trialEnd;
                    const diff = trialEnd.getTime() - now.getTime();
                    daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
                }
                // Check active subscription
                else if (teacher.subscriptionStatus === 'active' && teacher.subscriptionEndDate) {
                    const endDate = new Date(teacher.subscriptionEndDate);
                    isSubscriptionValid = now < endDate;
                    const diff = endDate.getTime() - now.getTime();
                    daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
                }
            }

            return {
                ...teacher,
                studentCount: studentCountMap.get(teacher._id.toString()) || 0,
                isSubscriptionValid,
                daysRemaining
            };
        });

        // 🚀 STEP 5: Cache the result
        setCache(CACHE_KEY, teachersWithInfo, CACHE_TTL);

        return successResponse({ teachers: teachersWithInfo, cached: false });
    } catch (error) {
        console.error('Get teachers error:', error);
        return serverError('Failed to fetch teachers');
    }
}
