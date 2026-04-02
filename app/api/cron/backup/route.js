import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Student from '@/models/Student';
import Lesson from '@/models/Lesson';
import Progress from '@/models/Progress';
import Reward from '@/models/Reward';
import Redemption from '@/models/Redemption';
import GameProgress from '@/models/GameProgress';
import Settings from '@/models/Settings';
import { sendBackupJson } from '@/lib/telegram';

export async function GET(request) {
    try {
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const [users, students, lessons, progress, rewards, redemptions, gameProgress, settings] = await Promise.all([
            User.find({}).select('-password').lean(),
            Student.find({}).lean(),
            Lesson.find({}).lean(),
            Progress.find({}).lean(),
            Reward.find({}).lean(),
            Redemption.find({}).lean(),
            GameProgress.find({}).lean(),
            Settings.find({}).lean(),
        ]);

        const backup = {
            exportedAt: new Date().toISOString(),
            exportedAtUz: new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' }),
            counts: {
                users: users.length,
                students: students.length,
                lessons: lessons.length,
                progress: progress.length,
                rewards: rewards.length,
                redemptions: redemptions.length,
                gameProgress: gameProgress.length,
            },
            data: { users, students, lessons, progress, rewards, redemptions, gameProgress, settings },
        };

        const buffer = Buffer.from(JSON.stringify(backup, null, 2), 'utf8');
        const fileName = `backup-${new Date().toISOString().slice(0, 16).replace(/[T:]/g, '-')}.json`;

        await sendBackupJson(buffer, fileName, backup.counts);

        return NextResponse.json({ success: true, counts: backup.counts });
    } catch (error) {
        console.error('Backup cron xatosi:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
