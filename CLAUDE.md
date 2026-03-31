# Bolajoon.uz — Bolalar ingliz tili platformasi

## Tech Stack
- **Framework:** Next.js 14 (App Router) + custom server (`server.js`)
- **DB:** MongoDB + Mongoose (models/ papkada)
- **Realtime:** Socket.IO (server: `lib/socket.js`, client: `hooks/useSocket.js`)
- **UI:** Bootstrap 5 + react-bootstrap, lucide-react icons, AOS animations
- **State:** React Query (@tanstack/react-query), AuthContext + DataContext
- **Auth:** JWT (cookie + localStorage), Edge middleware (`middleware.js`)
- **Cache:** Redis (ioredis) with in-memory fallback (`lib/cache.js`)
- **Payments:** Payme (Paycom) — `lib/payme.js`, `app/api/payme/`
- **Telegram:** node-telegram-bot-api — notifications (`lib/telegram.js`), webhook (`app/api/telegram/`)
- **Validation:** Joi + Zod (`lib/validation.js`)
- **Logging:** Winston
- **File uploads:** Local filesystem (`uploads/` — images, videos, books)
- **Export:** ExcelJS, XLSX
- **PDF:** pdf-parse

## Buyruqlar
```bash
npm run dev          # Development (port 3007)
npm run build        # Production build
npm start            # Production server
npm run cron         # Setup cron jobs
```

## Loyiha tuzilmasi
```
app/
  admin/        — Admin panel sahifalari (analytics, lessons, users, payments, sms, teachers, rewards, settings, statistics)
  dashboard/    — Foydalanuvchi dashboard (lessons, games, leaderboard, rewards, statistics, students, book, profile)
  games/        — O'yin sahifalari (vocabulary, catch-the-number, pop-the-balloon, drop-to-basket, shopping-basket, build-the-body, movements)
  api/          — API routes (quyida batafsil)
  login/        — Kirish
  register/     — Ro'yxatdan o'tish
  blocked/      — Bloklangan foydalanuvchi sahifasi
components/
  admin/        — Admin komponentlari (AdminSidebar, VocabularyEditor)
  dashboard/    — Dashboard komponentlari (Header, Navbar, Sidebar, Footer, modals)
  *.js          — Umumiy komponentlar (ProtectedRoute, Providers, Logo, VideoPlayer, PhoneInput...)
context/        — AuthContext.js, DataContext.js
lib/            — Utility funksiyalar (auth, mongodb, cache, payme, validation, rateLimit, apiResponse, formatPhone, queries, socket, telegram)
middleware/     — authMiddleware.js (API route auth)
models/         — Mongoose modellar
scripts/        — Utility skriptlar (seed, export, test, cron setup)
hooks/          — useSocket.js
uploads/        — Yuklangan fayllar (images/, videos/, books/)
lead-bot/       — Alohida Telegram bot (polling mode, leads.json)
```

## Modellar
| Model | Fayl | Vazifasi |
|-------|------|----------|
| User | `models/User.js` | Foydalanuvchilar (admin/teacher/parent) |
| Student | `models/Student.js` | O'quvchilar |
| Lesson | `models/Lesson.js` | Darslar (video, content) |
| Progress | `models/Progress.js` | O'quvchi darslari progressi |
| Reward | `models/Reward.js` | Mukofotlar |
| Redemption | `models/Redemption.js` | Mukofot almashtirishlar |
| GameProgress | `models/GameProgress.js` | O'yin progressi |
| PageView | `models/PageView.js` | Sahifa ko'rishlar (analytics) |
| Settings | `models/Settings.js` | Tizim sozlamalari |

## API Routes tuzilmasi
- `api/auth/` — login, register, me, update-profile
- `api/admin/` — analytics, bot-stats, lessons, settings, sms/send, statistics, users
- `api/lessons/`, `api/lessons/[id]` — Darslar CRUD
- `api/students/`, `api/students/[id]`, `api/students/[id]/stars` — O'quvchilar
- `api/teachers/`, `api/teachers/[id]`, `api/teachers/[id]/students` — O'qituvchilar
- `api/progress/`, `api/progress/[studentId]`, `api/progress/complete` — Progress
- `api/rewards/`, `api/rewards/[id]`, `api/rewards/redeem` — Mukofotlar
- `api/payme/` — create-payment, check-payment, callback
- `api/subscription/`, `api/subscription/check` — Obuna
- `api/upload/` — image, video, book
- `api/cron/` — daily-report, auto-renew-subscriptions
- `api/telegram/webhook` — Telegram webhook
- `api/analytics`, `api/statistics`, `api/dashboard`, `api/leaderboard`, `api/game-progress`, `api/redemptions`, `api/settings`, `api/socket`

## Muhim lib/ fayllar
| Fayl | Vazifasi |
|------|----------|
| `lib/mongodb.js` | Mongoose connection (cached, serverless-safe) |
| `lib/auth.js` | JWT: generateToken, verifyToken, getTokenFromHeader |
| `lib/cache.js` | Redis cache + in-memory fallback |
| `lib/payme.js` | Payme payment integration |
| `lib/telegram.js` | Telegram bot notifications |
| `lib/validation.js` | Input validation (Joi/Zod) |
| `lib/rateLimit.js` | API rate limiting |
| `lib/apiResponse.js` | Standardized API responses |
| `lib/queries.js` | Reusable DB queries |
| `lib/formatPhone.js` | Phone number formatting |
| `lib/socket.js` | Socket.IO server init |
| `lib/seed.js` | Database seeding |

## Auth oqimi
1. Login/Register → JWT token generatsiya (`lib/auth.js`)
2. Token localStorage + cookie da saqlanadi
3. Edge middleware (`middleware.js`) — admin route himoyasi (payload decode, role check)
4. API routes — `middleware/authMiddleware.js` orqali to'liq JWT verification
5. Client — `context/AuthContext.js` orqali auth holat boshqaruvi

## Deploy
- **Production:** VPS + pm2 (`deploy.sh`: git pull → npm install → build → pm2 restart)
- **Cron:** Vercel cron (`vercel.json`) — daily-report har kuni 15:00 UTC
- **lead-bot:** Alohida process (polling mode)

## Env variables
`.env.local.example` ga qarang. Asosiy: MONGODB_URI, JWT_SECRET, PORT (3007), REDIS_URL, PAYME_*, TELEGRAM_*, CRON_SECRET

## Rollar va obuna
- **admin** — to'liq platforma boshqaruvi, obuna kerak emas
- **teacher** — o'z o'quvchilarini boshqaradi, obuna kerak (7 kun trial, keyin Payme orqali to'lov)
- **student** — login yo'q, teacher orqali boshqariladi, yulduz (stars) tizimi

## Socket.IO events
- `student:update`, `lesson:update`, `reward:update`, `progress:update`, `dashboard:update`, `subscription:update`
- Room: `user:{userId}`, `role:{roleName}`

## Qoidalar
- UI matni o'zbek tilida, kod/comments ingliz tilida
- API routes `app/api/` ichida (Next.js App Router convention)
- Modellar import: `import { User, Student } from '@/models'` yoki `from '@/models/User'`
- DB connection: `import dbConnect from '@/lib/mongodb'` — har API route boshida chaqiriladi
- Auth check: `import { authenticate } from '@/middleware/authMiddleware'`
- Standardized responses: `import { success, error } from '@/lib/apiResponse'`
- File uploads local filesystem ga (uploads/ papka)
- Socket.IO custom server orqali (`server.js`)
- Rate limiting: login 20/15min, register 5/hour
- Phone format: O'zbekiston (+998...), `lib/formatPhone.js` orqali normalize
- Payme callback: Basic auth (merchantId:secretKey), signature verify
- Obuna expired → `/blocked` sahifaga redirect
