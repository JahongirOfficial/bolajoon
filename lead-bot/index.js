require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const TOKEN = process.env.BOT_TOKEN;
const GUIDE_VIDEO_URL = process.env.GUIDE_VIDEO_URL || 'https://bolajoon.uz';
const SITE_URL = process.env.SITE_URL || 'https://bolajoon.uz';
const ADMIN_ID = Number(process.env.ADMIN_ID);
const BOT_API_SECRET = process.env.BOT_API_SECRET || '';
const STATS_API_URL = process.env.STATS_API_URL || 'https://bolajoon.uz/api/admin/bot-stats';
const DB_FILE = path.join(__dirname, 'leads.json');

if (!TOKEN) {
    console.error('❌ BOT_TOKEN topilmadi! .env faylini tekshiring.');
    process.exit(1);
}

const bot = new TelegramBot(TOKEN, { polling: true });

// ─── Ma'lumotlar bazasi (JSON fayl) ───────────────────────────────────────────

function loadLeads() {
    if (!fs.existsSync(DB_FILE)) return [];
    try {
        return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch {
        return [];
    }
}

function saveLead(lead) {
    const leads = loadLeads();
    leads.push(lead);
    fs.writeFileSync(DB_FILE, JSON.stringify(leads, null, 2), 'utf8');
}

// ─── Admin statistikasi ───────────────────────────────────────────────────────

function fetchPlatformStats() {
    return new Promise((resolve) => {
        if (!BOT_API_SECRET) return resolve(null);
        try {
            const url = new URL(STATS_API_URL);
            const lib = url.protocol === 'https:' ? https : http;
            const req = lib.get(STATS_API_URL, {
                headers: { 'x-bot-secret': BOT_API_SECRET }
            }, (res) => {
                let data = '';
                res.on('data', chunk => { data += chunk; });
                res.on('end', () => {
                    try { resolve(JSON.parse(data)); } catch { resolve(null); }
                });
            });
            req.on('error', () => resolve(null));
            req.setTimeout(5000, () => { req.destroy(); resolve(null); });
        } catch {
            resolve(null);
        }
    });
}

async function buildStats() {
    const leads = loadLeads();
    const total = leads.length;

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

    const todayCount = leads.filter(l => l.created_at?.startsWith(todayStr)).length;
    const weekCount  = leads.filter(l => new Date(l.created_at) >= weekAgo).length;

    // Yosh bo'yicha
    const byAge = {};
    leads.forEach(l => { byAge[l.child_age] = (byAge[l.child_age] || 0) + 1; });
    const ageLines = total > 0
        ? Object.entries(byAge)
            .sort((a, b) => b[1] - a[1])
            .map(([age, cnt]) => `  • ${age}: <b>${cnt}</b> (${Math.round(cnt / total * 100)}%)`)
            .join('\n')
        : "  — yo'q";

    // Qiziqish bo'yicha
    const byInterest = {};
    leads.forEach(l => { byInterest[l.interest] = (byInterest[l.interest] || 0) + 1; });
    const interestLines = total > 0
        ? Object.entries(byInterest)
            .sort((a, b) => b[1] - a[1])
            .map(([int, cnt]) => `  • ${int}: <b>${cnt}</b> (${Math.round(cnt / total * 100)}%)`)
            .join('\n')
        : "  — yo'q";

    // So'nggi 5 ta lead
    const recentLeads = leads.slice(-5).reverse()
        .map((l, i) => {
            const name = l.first_name || 'Noma\'lum';
            const user = l.username ? `@${l.username}` : `ID: ${l.telegram_id}`;
            const date = l.created_at?.slice(0, 10) || '—';
            return `  ${i + 1}. ${name} (${user})\n     ${l.child_age} • ${l.interest}\n     📅 ${date}`;
        })
        .join('\n\n');

    // Platform statistikasi (bolajoon.uz dan)
    const p = await fetchPlatformStats();
    const platformSection = p ? `
━━━━━━━━━━━━━━━━━━━━
🌐 <b>PLATFORMA (bolajoon.uz)</b>

👤 <b>Jami foydalanuvchilar:</b> ${p.totalUsers || 0}
🎓 <b>O'quvchilar:</b> ${p.totalStudents || 0}
✅ <b>Faol obuna:</b> ${p.activeSubscriptions || 0}
🆓 <b>Trial:</b> ${p.trialSubscriptions || 0}
📚 <b>Darslar:</b> ${p.activeLessons || 0} / ${p.totalLessons || 0}
📈 <b>Jami progress:</b> ${p.totalProgress || 0}

👥 <b>Yangi a'zolar:</b>
  • Bugun: <b>${p.newUsersToday || 0}</b>
  • Oxirgi 7 kun: <b>${p.newUsersWeek || 0}</b>
  • Oxirgi 30 kun: <b>${p.newUsersMonth || 0}</b>

👁 <b>Sahifa ko'rishlar:</b>
  • Bugun: <b>${p.todayPageViews || 0}</b>
  • Jami: <b>${p.totalPageViews || 0}</b>` : '';

    const leadsSection = total === 0
        ? "\n📭 Hali hech qanday lead yo'q."
        : `
━━━━━━━━━━━━━━━━━━━━
📬 <b>TELEGRAM LEADLAR</b>

👥 <b>Jami leadlar:</b> ${total}
📅 <b>Bugun:</b> ${todayCount}
📆 <b>Oxirgi 7 kun:</b> ${weekCount}

━━━━━━━━━━━━━━━━━━━━
👶 <b>Yosh bo'yicha:</b>
${ageLines}

━━━━━━━━━━━━━━━━━━━━
📚 <b>Qiziqish bo'yicha:</b>
${interestLines}

━━━━━━━━━━━━━━━━━━━━
🕐 <b>So'nggi 5 ta lead:</b>

${recentLeads}`;

    const dateStr = new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Tashkent' });
    return `📊 <b>BOLAJOON STATISTIKA</b>\n🕐 ${dateStr}\n${platformSection}${leadsSection}`;
}

// ─── Foydalanuvchi sessiyalari (xotirada) ──────────────────────────────────────

const sessions = {};

// ─── /s komandasi (faqat admin) ───────────────────────────────────────────────

bot.onText(/\/s/, async (msg) => {
    if (msg.from.id !== ADMIN_ID) return;
    const chatId = msg.chat.id;
    // Send loading indicator
    const loadingMsg = await bot.sendMessage(chatId, '⏳ Statistika yuklanmoqda...');
    try {
        const text = await buildStats();
        await bot.editMessageText(text, {
            chat_id: chatId,
            message_id: loadingMsg.message_id,
            parse_mode: 'HTML'
        });
    } catch {
        bot.sendMessage(chatId, await buildStats(), { parse_mode: 'HTML' });
    }
});

// ─── Admin video file_id olish (forward video → bot replies with file_id) ────

bot.on('message', (msg) => {
    if (msg.from.id !== ADMIN_ID) return;
    if (msg.video) {
        const fileId = msg.video.file_id;
        bot.sendMessage(msg.chat.id, `Video file_id (kopyalang):\n${fileId}`);
    }
});

// ─── /start komandasi ─────────────────────────────────────────────────────────

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    // Agar foydalanuvchi allaqachon ro'yxatdan o'tgan bo'lsa
    const leads = loadLeads();
    const alreadyDone = leads.some(l => l.telegram_id === chatId);
    if (alreadyDone) {
        bot.sendMessage(
            chatId,
            `Assalomu alaykum! 👋\n\nSiz allaqachon ro'yxatdan o'tgansiz. Bolajoon.uz platformasiga o'ting va o'rganishni davom eting! 🎓`,
            {
                reply_markup: {
                    inline_keyboard: [[{ text: '🚀 Bolajoon.uz — Darsni boshlash', url: SITE_URL }]]
                }
            }
        );
        return;
    }

    sessions[chatId] = { step: 'age' };

    bot.sendMessage(
        chatId,
        `Assalomu alaykum! 👋\n\nBiz *Bolajoon.uz* platformasimiz — bu yerda bolalar ingliz tilini o'yin orqali, qiziqarli videolar bilan o'rganadilar. 🎓\n\nSizga eng mos darslarni tavsiya qilishimiz uchun *bitta savol*:\n\n👶 *Farzandingiz necha yoshda?*`,
        {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '👶 2–4 yosh', callback_data: 'age_2-4' },
                        { text: '🧒 5–6 yosh', callback_data: 'age_5-6' },
                        { text: '👦 7 yosh va undan katta', callback_data: 'age_7+' }
                    ]
                ]
            }
        }
    );
});

// ─── Callback (Inline tugmalar) ───────────────────────────────────────────────

bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;
    const session = sessions[chatId] || { step: 'age' };

    await bot.answerCallbackQuery(query.id);

    // 1-savol: Yosh
    if (data.startsWith('age_') && session.step === 'age') {
        session.child_age = data.replace('age_', '') + ' yosh';
        session.step = 'interest';
        sessions[chatId] = session;

        await bot.editMessageReplyMarkup(
            { inline_keyboard: [] },
            { chat_id: chatId, message_id: query.message.message_id }
        );

        await bot.sendMessage(
            chatId,
            `Zo'r! 👍\n\nEndi *ikkinchi va oxirgi savol*:\n\n📚 *Farzandingiz uchun qaysi yo'nalish qiziqarliroq?*\n\nQuyidagi tugmalardan birini bosing 👇`,
            {
                parse_mode: 'Markdown',
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '🇬🇧 Ingliz tilini o\'rganish', callback_data: 'interest_english' }],
                        [{ text: '🎒 Maktabga tayyorlash (harf, raqam, mantiq)', callback_data: 'interest_school' }],
                        [{ text: '📖 Ertaklar va rivojlantiruvchi o\'yinlar', callback_data: 'interest_stories' }]
                    ]
                }
            }
        );
        return;
    }

    // 2-savol: Qiziqish
    if (data.startsWith('interest_') && session.step === 'interest') {
        const interestMap = {
            interest_english: '🇬🇧 Ingliz tili',
            interest_school: '🎒 Maktabga tayyorgarlik',
            interest_stories: '📖 Ertaklar va Mantiq'
        };
        session.interest = interestMap[data] || data;
        session.step = 'done';
        sessions[chatId] = session;

        // Lead saqlash
        saveLead({
            telegram_id: chatId,
            first_name: query.from.first_name || '',
            username: query.from.username || '',
            child_age: session.child_age,
            interest: session.interest,
            created_at: new Date().toISOString()
        });

        await bot.editMessageReplyMarkup(
            { inline_keyboard: [] },
            { chat_id: chatId, message_id: query.message.message_id }
        );

        // Video caption xabari
        await bot.sendMessage(
            chatId,
            `Rahmat! Siz uchun maxsus tayyorlangan qo'llanmani ko'ring 🎬\n\nBu videoda bolajoon.uz platformasidan qanday foydalanish va farzandingizni ingliz tiliga qanday qiziqtirish mumkinligi haqida gapirilgan. Albatta tomosha qiling! 👇`,
            { parse_mode: 'Markdown' }
        );

        // Qo'llanma videosini yuborish
        try {
            await bot.sendVideo(chatId, 'BAACAgIAAxkBAAMuaaryEzESWahEIwGnDJfcCRNtOcQAAiSRAAI4UOBK_uFuAAHszsBVOgQ');
        } catch {
            // Silent
        }

        // CTA tugma
        await bot.sendMessage(chatId, '👆 Videoni tomosha qilib, platformaga o\'ting:', {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '🚀 Bolajoon.uz — Darsni boshlash',
                            url: SITE_URL
                        }
                    ]
                ]
            }
        });
    }
});

// ─── Xatolarni ushlash ────────────────────────────────────────────────────────

bot.on('polling_error', (err) => {
    console.error('Polling xato:', err.message);
});

console.log('✅ Bolajoon Lead Bot ishga tushdi...');
