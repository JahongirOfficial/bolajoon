import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

/**
 * Auto-Expiry Cron Job
 *
 * Purpose: Mark expired subscriptions as 'expired'
 * Trigger: Daily cron job
 * Security: Requires Bearer token matching CRON_SECRET env variable
 */

const TRIAL_DURATION_DAYS = 7;

function verifyCronAuth(request) {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) return false;
    const authHeader = request.headers.get('authorization');
    return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request) {
    try {
        if (!verifyCronAuth(request)) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const now = new Date();
        const trialExpiryDate = new Date(now.getTime() - TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000);

        // Mark expired trial users
        const trialResult = await User.updateMany(
            { role: 'teacher', subscriptionStatus: 'trial', trialStartDate: { $lte: trialExpiryDate } },
            { $set: { subscriptionStatus: 'expired' } }
        );

        // Mark expired active users
        const activeResult = await User.updateMany(
            { role: 'teacher', subscriptionStatus: 'active', subscriptionEndDate: { $lte: now } },
            { $set: { subscriptionStatus: 'expired' } }
        );

        return NextResponse.json({
            success: true,
            message: `Expired: ${trialResult.modifiedCount} trial, ${activeResult.modifiedCount} active`,
            timestamp: now.toISOString()
        });

    } catch (error) {
        console.error('[CRON] Auto-expiry failed:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
