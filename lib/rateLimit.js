/**
 * Simple in-memory rate limiter
 * Limits requests per IP address within a time window
 */

const store = new Map();

/**
 * Check if request is rate limited
 * @param {string} key - Unique key (e.g. IP address)
 * @param {number} maxRequests - Max allowed requests in window
 * @param {number} windowMs - Time window in milliseconds
 * @returns {{ limited: boolean, remaining: number }}
 */
export function rateLimit(key, maxRequests = 10, windowMs = 15 * 60 * 1000) {
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!store.has(key)) {
        store.set(key, []);
    }

    // Remove expired entries
    const requests = store.get(key).filter(ts => ts > windowStart);
    requests.push(now);
    store.set(key, requests);

    // Cleanup old keys every 1000 calls to prevent memory leak
    if (store.size > 5000) {
        for (const [k, v] of store.entries()) {
            if (v.every(ts => ts <= windowStart)) store.delete(k);
        }
    }

    const limited = requests.length > maxRequests;
    return { limited, remaining: Math.max(0, maxRequests - requests.length) };
}

/**
 * Get client IP from Next.js request
 */
export function getClientIp(request) {
    return (
        request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
        request.headers.get('x-real-ip') ||
        'unknown'
    );
}
