/**
 * Next.js Middleware
 * Handles request/response modifications before reaching API routes
 */
import { NextResponse } from 'next/server';

export function middleware(request) {
    // Allow large payloads for lesson API routes
    if (request.nextUrl.pathname.startsWith('/api/lessons')) {
        // Clone the request headers
        const requestHeaders = new Headers(request.headers);
        
        // Add custom header to indicate large payload support
        requestHeaders.set('x-large-payload', 'true');
        
        // Return response with modified headers
        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    }

    return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
    matcher: [
        '/api/lessons/:path*',
    ],
};
