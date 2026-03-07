/**
 * POST /api/analytics
 * Records a page view (public endpoint — no auth required)
 * Called by PageTracker component via navigator.sendBeacon
 */
import dbConnect from '@/lib/mongodb';
import PageView from '@/models/PageView';

export async function POST(request) {
    try {
        const contentType = request.headers.get('content-type') || '';
        let body;

        if (contentType.includes('application/json')) {
            body = await request.json();
        } else {
            // sendBeacon sends as text/plain blob
            const text = await request.text();
            body = JSON.parse(text);
        }

        const { sessionId, page, timeSpent, isEntry, isExit, userId } = body;

        if (!sessionId || !page) {
            return new Response(null, { status: 204 });
        }

        // Skip admin and API routes
        if (page.startsWith('/admin') || page.startsWith('/api')) {
            return new Response(null, { status: 204 });
        }

        await dbConnect();

        await PageView.create({
            sessionId,
            page,
            timeSpent: Math.min(timeSpent || 0, 3600), // cap at 1 hour
            isEntry: !!isEntry,
            isExit: !!isExit,
            userId: userId || null,
        });

        return new Response(null, { status: 204 });
    } catch {
        return new Response(null, { status: 204 }); // Always 204 — never fail silently
    }
}
