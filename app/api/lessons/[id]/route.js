/**
 * Lesson API Routes by ID
 * GET /api/lessons/:id - Get single lesson
 * PUT /api/lessons/:id - Update lesson (admin)
 * DELETE /api/lessons/:id - Delete lesson (admin)
 */
import dbConnect from '@/lib/mongodb';
import Lesson from '@/models/Lesson';
import Progress from '@/models/Progress';
import { adminOnly, authenticate } from '@/middleware/authMiddleware';
import { successResponse, errorResponse, serverError, notFoundResponse } from '@/lib/apiResponse';
import { clearCache, getCached, setCache } from '@/lib/cache';

// Configure route segment for large payloads and caching
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds timeout
export const revalidate = 300; // Revalidate every 5 minutes

// GET - Get single lesson with caching (authentication required but no subscription check)
export async function GET(request, { params }) {
    try {
        // Only check authentication, not subscription
        const auth = await authenticate(request);
        if (!auth.success) {
            return errorResponse(auth.error, auth.status);
        }

        // Check cache first
        const cacheKey = `lesson:${params.id}`;
        const cached = getCached(cacheKey);
        if (cached) {
            return successResponse({ lesson: cached, cached: true });
        }

        await dbConnect();

        // Optimized query with lean()
        const lesson = await Lesson.findById(params.id)
            .lean() // Convert to plain JS object (faster)
            .exec();
            
        if (!lesson) {
            return notFoundResponse('Lesson');
        }

        // Get completion count (parallel query for speed)
        const completionCount = await Progress.countDocuments({ lessonId: params.id });

        const lessonWithStats = {
            ...lesson,
            completionCount
        };

        // Cache for 5 minutes
        setCache(cacheKey, lessonWithStats, 5 * 60 * 1000);

        return successResponse({ lesson: lessonWithStats, cached: false });
    } catch (error) {
        console.error('Get lesson error:', error);
        return serverError('Failed to fetch lesson');
    }
}

// PUT - Update lesson (admin only)
export async function PUT(request, { params }) {
    try {
        const auth = await adminOnly(request);
        if (!auth.success) {
            return errorResponse(auth.error, auth.status);
        }

        await dbConnect();

        const lesson = await Lesson.findById(params.id);
        if (!lesson) {
            return notFoundResponse('Lesson');
        }

        const body = await request.json();
        const { title, description, videoUrl, thumbnail, level, duration, order, isActive, vocabulary, gameType, gameSettings } = body;

        console.log('PUT request body:', body);
        console.log('Received gameSettings:', gameSettings);
        console.log('Received balloonColors:', gameSettings?.balloonColors);

        if (title) lesson.title = title;
        if (description) lesson.description = description;
        if (videoUrl) lesson.videoUrl = videoUrl;
        if (thumbnail !== undefined) lesson.thumbnail = thumbnail;
        if (level) lesson.level = level;
        if (duration !== undefined) lesson.duration = duration;
        if (order !== undefined) lesson.order = order;
        if (isActive !== undefined) lesson.isActive = isActive;
        if (vocabulary !== undefined) lesson.vocabulary = vocabulary;
        if (gameType !== undefined) lesson.gameType = gameType;
        if (gameSettings !== undefined) {
            lesson.gameSettings = gameSettings;
            lesson.markModified('gameSettings'); // Tell Mongoose this nested object changed
        }

        await lesson.save();
        
        console.log('Saved lesson gameSettings:', lesson.gameSettings);
        console.log('Saved balloonColors:', lesson.gameSettings?.balloonColors);

        // 🚀 Clear all lesson caches (including admin cache)
        clearCache('lessons'); // User lessons cache
        clearCache('admin:lessons'); // Admin lessons cache
        clearCache(`lesson:${params.id}`); // Single lesson cache

        return successResponse({
            message: 'Lesson updated successfully',
            lesson
        });
    } catch (error) {
        console.error('Update lesson error:', error);
        return serverError('Failed to update lesson');
    }
}

// DELETE - Delete lesson (admin only)
export async function DELETE(request, { params }) {
    try {
        const auth = await adminOnly(request);
        if (!auth.success) {
            return errorResponse(auth.error, auth.status);
        }

        await dbConnect();

        const lesson = await Lesson.findById(params.id);
        if (!lesson) {
            return notFoundResponse('Lesson');
        }

        // Delete all progress records for this lesson
        await Progress.deleteMany({ lessonId: params.id });

        // Delete lesson
        await Lesson.findByIdAndDelete(params.id);

        // 🚀 Clear all lesson caches (including admin cache)
        clearCache('lessons'); // User lessons cache
        clearCache('admin:lessons'); // Admin lessons cache
        clearCache(`lesson:${params.id}`); // Single lesson cache

        return successResponse({
            message: 'Lesson deleted successfully'
        });
    } catch (error) {
        console.error('Delete lesson error:', error);
        return serverError('Failed to delete lesson');
    }
}
