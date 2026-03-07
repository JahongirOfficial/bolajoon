/**
 * Authentication Utilities
 * JWT token generation and verification
 */
import jwt from 'jsonwebtoken';

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function getSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET environment variable is not set');
    return secret;
}

/**
 * Generate JWT token for user
 * @param {Object} user - User object with _id, email, role
 * @returns {string} JWT token
 */
export function generateToken(user) {
    return jwt.sign(
        {
            userId: user._id,
            phone: user.phone,
            role: user.role
        },
        getSecret(),
        { expiresIn: JWT_EXPIRES_IN }
    );
}

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object|null} Decoded token payload or null if invalid
 */
export function verifyToken(token) {
    try {
        return jwt.verify(token, getSecret());
    } catch (error) {
        return null;
    }
}

/**
 * Extract token from Authorization header
 * @param {Request} request - Next.js request object
 * @returns {string|null} Token or null
 */
export function getTokenFromHeader(request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    return null;
}
