/**
 * MongoDB Backup Script
 * Barcha collectionlarni JSON formatda saqlaydi
 * Ishlatish: node scripts/backup.js
 */

import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// .env.local dan URI ni o'qish
function getMongoUri() {
    try {
        const envPath = path.join(__dirname, '..', '.env.local');
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/MONGODB_URI=(.+)/);
        if (match) return match[1].trim();
    } catch {}
    return process.env.MONGODB_URI;
}

const MONGODB_URI = getMongoUri();

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI topilmadi!');
    process.exit(1);
}

async function backup() {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const backupDir = path.join(__dirname, '..', 'backups', `backup-${timestamp}`);

    fs.mkdirSync(backupDir, { recursive: true });

    console.log(`\n🔄 Backup boshlandi: ${now.toLocaleString('uz-UZ')}`);
    console.log(`📁 Papka: backups/backup-${timestamp}\n`);

    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        console.log('✅ MongoDB ga ulandi\n');

        const dbName = MONGODB_URI.split('/').pop().split('?')[0];
        const db = client.db(dbName);

        const collections = await db.listCollections().toArray();
        console.log(`📋 Topilgan collectionlar: ${collections.map(c => c.name).join(', ')}\n`);

        let totalDocs = 0;
        const summary = [];

        for (const col of collections) {
            const name = col.name;
            const collection = db.collection(name);
            const docs = await collection.find({}).toArray();

            const filePath = path.join(backupDir, `${name}.json`);
            fs.writeFileSync(filePath, JSON.stringify(docs, null, 2), 'utf8');

            totalDocs += docs.length;
            summary.push({ collection: name, count: docs.length });
            console.log(`  ✓ ${name}: ${docs.length} ta document`);
        }

        // Summary fayl
        const summaryData = {
            backupDate: now.toISOString(),
            database: dbName,
            totalCollections: collections.length,
            totalDocuments: totalDocs,
            collections: summary
        };
        fs.writeFileSync(
            path.join(backupDir, '_summary.json'),
            JSON.stringify(summaryData, null, 2)
        );

        console.log(`\n✅ Backup muvaffaqiyatli yakunlandi!`);
        console.log(`   📊 Jami: ${collections.length} ta collection, ${totalDocs} ta document`);
        console.log(`   📁 Joylashuv: backups/backup-${timestamp}\n`);

    } catch (err) {
        console.error('❌ Xatolik:', err.message);
        process.exit(1);
    } finally {
        await client.close();
    }
}

backup();
