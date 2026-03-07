/**
 * Lessons API Routes
 * GET /api/lessons - Get all lessons (cached)
 * POST /api/lessons - Create new lesson (admin only)
 */
import dbConnect from '@/lib/mongodb';
import Lesson from '@/models/Lesson';
import { authenticate, adminOnly } from '@/middleware/authMiddleware';

import { successResponse, errorResponse, serverError } from '@/lib/apiResponse';
import { getCached, setCache, clearCache } from '@/lib/cache';

const LESSONS_CACHE_KEY = 'lessons:active';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes (longer cache for better performance)

// Configure route segment for large payloads and caching
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds timeout
export const revalidate = 300; // Revalidate every 5 minutes

// GET - Get all active lessons (requires authentication)
export async function GET(request) {
    try {
        // Require authentication — lessons are paid content
        const auth = await authenticate(request);
        if (!auth.success) {
            return errorResponse(auth.error, auth.status);
        }

        // Check cache first (instant response if cached)
        const cached = getCached(LESSONS_CACHE_KEY);
        if (cached) {
            return successResponse({ lessons: cached, cached: true });
        }

        await dbConnect();

        // Optimized query: only select necessary fields, exclude large vocabulary
        const lessons = await Lesson.find({ isActive: true })
            .select('title description videoUrl thumbnail level duration order gameType')
            .sort({ level: 1, order: 1 })
            .lean() // Convert to plain JS objects (faster)
            .hint({ level: 1, order: 1 }); // Use index for faster sorting

        // Cache the result for 5 minutes
        setCache(LESSONS_CACHE_KEY, lessons, CACHE_TTL);

        return successResponse({ lessons, cached: false });
    } catch (error) {
        console.error('Get lessons error:', error);
        return serverError('Failed to fetch lessons');
    }
}

// POST - Create new lesson (admin only)
export async function POST(request) {
    try {
        const auth = await adminOnly(request);
        if (!auth.success) {
            return errorResponse(auth.error, auth.status);
        }

        await dbConnect();

        const body = await request.json();
        const { title, description, videoUrl, thumbnail, level, duration, order, vocabulary, gameType, gameSettings } = body;

        // Validation
        if (!title || !description || !videoUrl || !level) {
            return errorResponse('Title, description, videoUrl and level are required');
        }

        const lesson = await Lesson.create({
            title,
            description,
            videoUrl,
            thumbnail: thumbnail || '',
            level,
            duration: duration || 0,
            order: order || 0,
            vocabulary: vocabulary || [],
            gameType: gameType || 'vocabulary',
            gameSettings: gameSettings || {
                numberRange: { min: 1, max: 10 },
                duration: 60,
                balloonColors: []
            }
        });

        // Clear lessons cache
        clearCache('lessons');

        return successResponse({
            message: 'Lesson created successfully',
            lesson
        }, 201);

    } catch (error) {
        console.error('Create lesson error:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(e => e.message);
            return errorResponse(messages.join(', '));
        }

        return serverError('Failed to create lesson');
    }
}
