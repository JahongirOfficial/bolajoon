/**
 * MongoDB Connection Helper
 * Handles database connection with caching for serverless environments
 */
import mongoose from 'mongoose';

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI) {
        console.error('MONGODB_URI not found in environment variables');
        throw new Error('Please define the MONGODB_URI environment variable in .env');
    }
    // Return cached connection if available
    if (cached.conn) {
        return cached.conn;
    }

    // Create new connection promise if not exists
    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            serverSelectionTimeoutMS: 5000, // Reduced from 10s to 5s
            socketTimeoutMS: 45000,
            family: 4, // Use IPv4, skip trying IPv6
            maxPoolSize: 10, // Maximum connection pool size
            minPoolSize: 5, // Increased from 2 to 5 for faster queries
            maxIdleTimeMS: 30000, // Close idle connections after 30 seconds
            compressors: ['zlib'], // Enable compression for faster data transfer
            zlibCompressionLevel: 6, // Compression level (1-9, 6 is balanced)
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
            console.log('MongoDB connected successfully');
            return mongoose;
        }).catch((error) => {
            console.error('MongoDB connection error:', error);
            cached.promise = null;
            throw error;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

export default dbConnect;
