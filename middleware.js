/**
 * Next.js Middleware
 * Handles authentication checks and request modifications
 */
import { NextResponse } from 'next/server';

/**
 * Decode JWT payload without signature verification (Edge Runtime safe).
 * Actual signature verification happens in API routes via jsonwebtoken.
 */
function decodeTokenPayload(token) {
    try {
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload));
        return decoded;
    } catch {
        return null;
    }
}

export function middleware(request) {
    const { pathname } = request.nextUrl;

    // ── Admin route protection ──────────────────────────────────────────────
    if (pathname.startsWith('/admin')) {
        // Check token from cookie (set during login) or Authorization header
        const cookieToken = request.cookies.get('token')?.value;
        const authHeader = request.headers.get('authorization');
        const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
        const token = cookieToken || headerToken;

        if (token) {
            const decoded = decodeTokenPayload(token);
            // Check expiry and role (signature verified by API routes)
            const now = Math.floor(Date.now() / 1000);
            if (!decoded || decoded.role !== 'admin' || (decoded.exp && decoded.exp < now)) {
                return NextResponse.redirect(new URL('/login', request.url));
            }
        }
        // If no cookie token, client-side auth (localStorage) will redirect
        return NextResponse.next();
    }

    // ── Allow large payloads for lesson API routes ──────────────────────────
    if (pathname.startsWith('/api/lessons')) {
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-large-payload', 'true');
        return NextResponse.next({ request: { headers: requestHeaders } });
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/api/lessons/:path*',
    ],
};
