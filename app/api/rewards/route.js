/**
 * Rewards API Routes
 * GET /api/rewards - Get all rewards (cached)
 * POST /api/rewards - Create new reward (admin only)
 */
import dbConnect from '@/lib/mongodb';
import Reward from '@/models/Reward';
import { adminOnly, authenticate } from '@/middleware/authMiddleware';
import { successResponse, errorResponse, serverError } from '@/lib/apiResponse';
import { getCached, setCache, clearCache } from '@/lib/cache';

const REWARDS_CACHE_KEY = 'rewards:active';
const REWARDS_ALL_CACHE_KEY = 'rewards:all';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// GET - Get all rewards with caching
export async function GET(request) {
    try {
        // Check if admin (needs all rewards) or regular user (only active)
        const auth = await authenticate(request);
        const isAdmin = auth.success && auth.user?.role === 'admin';
        
        const cacheKey = isAdmin ? REWARDS_ALL_CACHE_KEY : REWARDS_CACHE_KEY;
        
        // 🚀 Check cache first
        const cached = getCached(cacheKey);
        if (cached) {
            return successResponse({ rewards: cached, cached: true });
        }

        await dbConnect();

        // 🚀 Optimized query with minimal fields
        const query = isAdmin ? {} : { isActive: true };
        const rewards = await Reward.find(query)
            .select('title description cost image category stock isActive')
            .sort({ cost: 1 })
            .lean()
            .exec();

        // Cache the result
        setCache(cacheKey, rewards, CACHE_TTL);

        return successResponse({ rewards });
    } catch (error) {
        console.error('Get rewards error:', error);
        return serverError('Failed to fetch rewards');
    }
}

// POST - Create new reward (admin only)
export async function POST(request) {
    try {
        const auth = await adminOnly(request);
        if (!auth.success) {
            return errorResponse(auth.error, auth.status);
        }

        await dbConnect();

        const body = await request.json();
        const { title, description, cost, image, category, stock } = body;

        // Validation
        if (!title || !cost) {
            return errorResponse('Title and cost are required');
        }

        const reward = await Reward.create({
            title,
            description: description || '',
            cost,
            image: image || '',
            category: category || 'other',
            stock: stock !== undefined ? stock : -1
        });

        // Clear both caches
        clearCache(REWARDS_CACHE_KEY);
        clearCache(REWARDS_ALL_CACHE_KEY);

        return successResponse({
            message: 'Reward created successfully',
            reward
        }, 201);

    } catch (error) {
        console.error('Create reward error:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return errorResponse(messages.join(', '));
        }

        return serverError('Failed to create reward');
    }
}
