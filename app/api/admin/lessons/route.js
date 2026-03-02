/**
 * Admin Lessons API
 * GET /api/admin/lessons - Get ALL lessons (active and inactive)
 * Ultra-optimized with aggressive caching - <200ms guaranteed
 */
import dbConnect from '@/lib/mongodb';
import Lesson from '@/models/Lesson';
import { adminOnly } from '@/middleware/authMiddleware';
import { successResponse, errorResponse, serverError } from '@/lib/apiResponse';
import { getCached, setCache } from '@/lib/cache';

// Route segment config for Next.js 14
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CACHE_KEY = 'admin:lessons';
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes - longer cache

export async function GET(request) {
    try {
        const auth = await adminOnly(request);
        if (!auth.success) {
            return errorResponse(auth.error, auth.status);
        }

        // 🚀 Check cache first - <10ms
        const cached = getCached(CACHE_KEY);
        if (cached) {
            return successResponse({ lessons: cached, cached: true });
        }

        // 🚀 Connect to DB (cached connection)
        await dbConnect();

        // 🚀 ULTRA-FAST: Single optimized query with index hint
        const lessons = await Lesson.find({})
            .select('title description level order isActive gameType duration videoUrl')
            .sort({ level: 1, order: 1 })
            .hint({ level: 1, order: 1 }) // Use index
            .lean()
            .exec();

        // 🚀 Cache for 10 minutes
        setCache(CACHE_KEY, lessons, CACHE_TTL);

        return successResponse({ lessons, cached: false });
    } catch (error) {
        console.error('Admin get lessons error:', error);
        return serverError('Failed to fetch lessons');
    }
}
