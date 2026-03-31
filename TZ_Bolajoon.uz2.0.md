# Bolajoon.uz — To'liq Texnik Topshiriq (TZ)

Ushbu hujjat platformaning barcha sahifalari, rollari, ma'lumotlar bazasi modellari, o'yin mantiqlari, API, auth oqimi va integratsiyalarini batafsil tushuntiradi. Dasturchi shu TZ ga qarab loyihani noldan qura olishi kerak.

---

## 1. Loyiha Haqida

**Bolajoon.uz** — 5-9 yoshli bolalar uchun ingliz tili o'rgatish platformasi. O'qituvchilar (tarbiyachilar) tizim orqali:
- Bolalarga tayyor video-darslarni namoyish qiladi
- Darsdan keyin 7 xil mini-o'yinlardan birini o'ynatadi
- Bolalarga 1-5 yulduz beradi
- Bolalar yulduzlarini haqiqiy sovg'alarga almashtiradi (gamification)

**Tech stack:** Next.js 14 (App Router), MongoDB (Mongoose), Socket.IO (realtime), JWT auth, Bootstrap 5, React Query, Payme to'lov, Telegram bot, Redis cache (optional).

**Custom server:** `server.js` — Node.js HTTP server + Socket.IO. Port: 3007.

---

## 2. Foydalanuvchi Rollari

### 2.1. Admin
- Darslar CRUD (video, vocabulary, gameType, gameSettings)
- O'qituvchilar boshqaruvi (obuna uzaytirish, bloklash, balans qo'shish)
- Sovg'alar CRUD (narx yulduzda, stok, kategoriya)
- Buyurtmalar tasdiqlash (Redemption: pending → delivered)
- Tizim sozlamalari (karta raqam, admin telefon, kunlik narx)
- SMS yuborish, analytics, statistika
- Obuna kerak emas (daysRemaining: 999)

### 2.2. Teacher (O'qituvchi)
- O'z o'quvchilarini qo'shish/tahrirlash/o'chirish
- Barcha darslarga kirish, video ko'rish, o'yin boshlash
- O'quvchiga yulduz berish (CompleteLessonModal yoki QuickStarsModal orqali)
- Sovg'a do'kondan o'quvchi uchun xarid qilish (RedeemRewardModal)
- Reyting, statistika ko'rish
- **Obuna kerak:** 7 kun bepul trial, keyin Payme orqali to'lov. Muddati o'tsa `/blocked` sahifaga redirect.

### 2.3. Student (O'quvchi/Bola)
- Tizimga mustaqil kirmaydi (login/parol yo'q)
- O'qituvchi akkauntiga sub-element sifatida biriktiriladi
- O'yin jarayonida ekranga bosib qatnashadi
- Yulduz to'playdi, sovg'a oladi

---

## 3. Sahifalar va Logikasi

### 3.1. Landing Page (`/`)
Ro'yxatdan o'tmagan foydalanuvchilar uchun asosiy sahifa:

1. **Header/Nav:** Logo, havolalar (Features, How it works, FAQ), Login/Register tugmalari. Scroll da sticky. Mobilda hamburger menu.
2. **Hero:** Katta sarlavha, qisqa tavsif, CTA tugmalar (Ro'yxatdan o'tish / Kirish), animatsiyali gradient fon.
3. **Stats:** 500+ faol o'quvchi, 50+ video dars, 7 kun bepul, 5-9 yosh.
4. **Features:** 6 ta karta — Video darslar, Interaktiv o'yinlar, Mukofot tizimi, Ota-ona monitoring, Tez natija, Istalgan joydan kirish.
5. **How it Works:** 4 qadam — Akkaunt yarating → Bola qo'shing → O'rganishni boshlang → Natijani ko'ring.
6. **Testimonials:** 3 ta ota-ona sharhi, 5 yulduzli reyting.
7. **FAQ:** Accordion formatda — Necha yosh? Ingliz bilishi kerakmi? Trial dan keyin nima? Bir nechta bola bo'ladimi?
8. **CTA footer:** Oxirgi chaqiriq + Ro'yxatdan o'tish tugmasi.

### 3.2. Auth Sahifalari

**`/login`:**
- Telefon raqami (PhoneInput, O'zbekiston formati) + parol
- Show/hide parol tugmasi
- Gradient fon, dekorativ blob'lar, logo
- Muvaffaqiyatli login → JWT token → role ga qarab `/admin` yoki `/dashboard` ga redirect
- Obuna tugagan bo'lsa → `/blocked`
- Register sahifaga havola
- Rate limit: 20 urinish / 15 daqiqa

**`/register`:**
- Ism, telefon, parol (min 6), parol tasdiqlash
- Terms/conditions checkbox
- Muvaffaqiyatli → `subscriptionStatus='trial'`, `trialStartDate=now()`, 7 kun bepul
- Darhol `/dashboard` ga redirect
- Telegram ga bildirishnoma yuboriladi
- Rate limit: 5 urinish / soat
- Desktopda chap tomonda branding panel

**`/blocked`:**
- Obuna tugagani haqida xabar
- "To'lov qilish" tugmasi → SubscriptionModal ochiladi
- Modalda: paket tanlov (1 kun, 1 hafta, 1 oy), karta raqam (copy tugma), karta egasi, admin telefon, jami summa

### 3.3. Teacher Dashboard (`/dashboard/*`)

**Layout:** Sidebar (navigatsiya) + Header (user info) + asosiy kontent. ProtectedRoute bilan himoyalangan.

**1. Bosh sahifa (`/dashboard`):**
- Welcome banner (foydalanuvchi ismi)
- 4 ta tezkor harakat tugmalari:
  - "O'quvchi qo'shish" → `/dashboard/students/add`
  - "Dars boshlash" → `/dashboard/lessons`
  - "Yulduz berish" → `/dashboard/students`
  - "Sovg'a berish" → `/dashboard/rewards`
- Obuna holati (qolgan kunlar)
- To'lov ma'lumotlari (karta, admin telefon)
- Kitob promo (PDF yuklab olish + sotib olish tugmasi)
- API: GET `/api/settings`, GET `/api/auth/me`

**2. Darslar (`/dashboard/lessons`):**
- Darslar "bosqichlar" (stages) ga bo'lingan: har bosqichda 15 ta dars
- Har bosqich collapse/expand qiladi
- Bosqich headerida: raqam, dars diapazoni, progress bar
- Dars kartochkasida: nomi, davomiyligi, play tugma, daraja
- Dars ustiga bossa → video player ochiladi
- Video tugagach "O'yinni boshlash" tugmasi (agar gameType biriktirilgan bo'lsa) → `/games/[gameType]/[lessonId]`

**3. O'yinlar (`/dashboard/games`):**
- Yuqorida o'quvchi tanlash dropdown (1 ta bo'lsa avtomatik tanlaydi, localStorage ga saqlanadi)
- Darslar kartochkalarda ketma-ketlikda ("ilon" progressiya)
- Har kartochkada: dars nomi, o'yin turi icon, holat (✓ tugallangan / ○ boshlanmagan)
- Avtomatik keyingi tugallanmagan o'yinga scroll
- API: GET `/api/lessons`, GET `/api/game-progress?student=[id]`

**4. O'quvchilarim (`/dashboard/students`):**
- O'qituvchining barcha o'quvchilari ro'yxati
- Har o'quvchi kartochkada: avatar, ism, yosh, yulduzlar soni
- Ustiga bossa → QuickStarsModal (1-5 yulduz berish, sabab kiritish)
- Tahrirlash (qalamcha icon) → ism, yosh, ota-ona ma'lumotlarini o'zgartirish
- Progress ko'rish tugmasi
- O'chirish tugmasi (tasdiqlash bilan)
- "O'quvchi qo'shish" tugmasi → `/dashboard/students/add` (ism, yosh 5-9, ota-ona telefon)

**5. Sovg'alar do'koni (`/dashboard/rewards`):**
- Mavjud sovg'alar ro'yxati (kategoriya bo'yicha filter)
- Kartochkada: rasm, nomi, narx (yulduzda), kategoriya badge
- Sovg'a ustiga bossa → RedeemRewardModal:
  - "O'quvchini tanlang" dropdown
  - Narx va qolgan yulduz ko'rsatiladi
  - Tasdiqlansa: yulduzdan ayiriladi, Redemption (status: pending) yaratiladi

**6. Reyting (`/dashboard/leaderboard`):**
- O'qituvchining o'quvchilari yulduz bo'yicha tartiblangan
- 1, 2, 3 o'rinlar maxsus ranglarda

**7. Statistika (`/dashboard/statistics`):**
- Dars tugallash statistikasi
- O'yin natijalarari
- Yulduz dinamikasi
- O'quvchilar progressi

**8. Kitob (`/dashboard/book`):**
- Tugallangan darslardan so'z ro'yxati
- Ikki tilli kartochkalar (ingliz-o'zbek)
- Har so'zda rasm + talaffuz (Web Speech API)
- Bosma kitob sotib olish imkoniyati

**9. Profil (`/dashboard/profile`):**
- Telefon raqam, obuna holati, qolgan kunlar
- Akkaunt yaratilgan sana
- Obunani uzaytirish imkoniyati

### 3.4. Admin Dashboard (`/admin/*`)

**Layout:** Admin sidebar + header. Edge middleware orqali himoyalangan (role=admin tekshiruvi).

**1. Bosh sahifa (`/admin`):**
- O'qituvchilar soni: faol, trial, tugagan (doiracha vizuallarda)
- Bugun qo'shilganlar
- O'quvchilar soni (o'rtacha har o'qituvchiga)
- Faol darslar soni
- Sovg'alar soni
- Obuna statistikasi (active/trial/expired/tez tugaydiganlar)
- Oxirgi ro'yxatdan o'tganlar
- API: GET `/api/admin/statistics`, GET `/api/admin/users`

**2. Darslarni boshqarish (`/admin/lessons`):**
- Barcha darslar ro'yxati (faol + nofaol)
- Qidiruv (nomi/tavsifi bo'yicha)
- Faol/nofaol filter
- Har darsda: nomi, daraja, tartib, davomiylik, video, gameType, holat toggle, tahrirlash/o'chirish
- "Yangi dars" tugmasi → `/admin/lessons/add`

**Dars formasi (add/edit):**
- Sarlavha (required), tavsif (required), video URL (required)
- Thumbnail URL, daraja (1-10), davomiylik (minutlarda), tartib raqami
- Faol/nofaol toggle
- **O'yin turi tanlash** (dropdown): none, vocabulary, catch-the-number, pop-the-balloon, drop-to-basket, shopping-basket, build-the-body, movements
- **Vocabulary ro'yxati:** inglizcha so'z + o'zbekcha tarjima + rasm URL (max 1000 ta). Qator qo'shish/o'chirish.
- **O'yin sozlamalari** (gameType ga qarab):
  - catch-the-number: min/max raqam diapazoni
  - pop-the-balloon: maxsus ranglar (hex + nom)
  - duration (sekundlarda, default 60)

**3. Foydalanuvchilar (`/admin/users`):**
- Barcha o'qituvchilar jadvali (adminlar ko'rinmaydi)
- Ism, telefon, rol, obuna holati, qolgan kunlar, o'quvchilar soni, qachon qo'shilgan
- Qidiruv (ism/telefon)
- Har foydalanuvchida modallar:
  - **Ko'rish:** to'liq info
  - **Tahrirlash:** ism, telefon, rol, parol o'zgartirish
  - **Obuna qo'shish:** kunlar soni (1-365). Status → active, subscriptionEndDate yangilanadi.
  - **Balans qo'shish:** summa kiritish
  - **O'quvchilari:** teacher ning o'quvchilari ro'yxati
  - **O'chirish:** tasdiqlash bilan
- "Yangi foydalanuvchi" tugmasi → `/admin/users/add`

**4. O'qituvchilar (`/admin/teachers`):**
- Users bilan bir xil, faqat teacher lar filtrlangan
- "O'qituvchi qo'shish" → `/admin/teachers/add` (ism, telefon, parol, rol=teacher)

**5. Sovg'alar (`/admin/rewards`):**
- Barcha sovg'alar ro'yxati
- Kategoriya filter
- Har sovg'ada: rasm, nom, narx (yulduz), kategoriya, stok, holat toggle, tahrirlash/o'chirish
- "Yangi sovg'a" → `/admin/rewards/add`

**Sovg'a formasi (add/edit):**
- Nomi (required), tavsif, narx yulduzda (required), rasm URL
- Kategoriya: toy, book, game, certificate, other
- Stok (-1 = cheksiz)
- Faol/nofaol toggle

**6. To'lovlar/Buyurtmalar (`/admin/payments`):**
- Redemption lar ro'yxati
- Har birida: o'quvchi ismi, o'qituvchi, sovg'a nomi, yulduz narxi, sana, holat
- Admin sovg'ani yetkazib bergach → status: delivered ga o'tkazadi

**7. Sozlamalar (`/admin/settings`):**
- Admin telefon raqami
- Karta raqami (16 xonali)
- Karta egasi ismi
- Kunlik obuna narxi (so'mda)
- API: GET/PUT `/api/admin/settings`

**8. SMS (`/admin/sms`):**
- Ommaviy SMS yuborish
- Foydalanuvchilar tanlash
- Xabar shabloni

**9. Analytics (`/admin/analytics`):**
- Foydalanuvchi faoliyati grafiklari
- Dars tugallash ko'rsatkichlari
- O'yin statistikasi
- Sahifa ko'rishlar (PageView)

**10. Statistika (`/admin/statistics`):**
- Tizim bo'yicha batafsil statistika
- O'qituvchilar natijasi
- O'quvchilar progressi agregat

**11. Kitob (`/admin/book`):**
- Bosma kitob katalog boshqaruvi
- Kitob narxi sozlash

**12. O'yinlar test (`/admin/games-test`):**
- O'yinlarni test qilish sahifasi

---

## 4. O'yinlar (7 xil game engine)

Har darsga admin bitta gameType biriktiradi. O'yin URL: `/games/[gameType]/[lessonId]?student=[studentId]`

### 4.1. Vocabulary (Lug'at o'yini)
**URL:** `/games/vocabulary/[lessonId]`

**Logika:**
1. Darsning vocabulary massividan so'zlar shuffle qilinadi
2. Ekranda: rasm + o'zbekcha tarjima ko'rsatiladi
3. 4 ta variant (1 to'g'ri + 3 noto'g'ri inglizcha so'z)
4. Har variantda "Tinglash" tugmasi (Web Speech API, 0.9x tezlik)
5. **To'g'ri javob:** yashil rang, confetti animatsiya, ovoz
6. **Noto'g'ri javob:** qizil rang, shake/vibratsiya effekti
7. **Review mode:** noto'g'ri javob berilgan so'zlar oxirida qayta so'raladi. Barchasini to'g'ri topmaguncha o'yin tugamaydi.
8. Progress bar yuqorida

**State:** currentIndex, score, vocabulary (shuffled), wrongAnswers, isReviewingWrong, options (4 ta), selectedOption, isCorrect, showConfetti

### 4.2. Catch the Number (Raqam tutish)
**URL:** `/games/catch-the-number/[lessonId]`

**Logika:**
1. Darsning gameSettings.numberRange (min/max) dan raqamlar olinadi
2. Tepada target raqam so'z bilan ko'rsatiladi (masalan "Twenty Three")
3. Rangli pufaklar (balloon) pastdan yuqoriga suzib chiqadi, ichida raqamlar
4. To'g'ri raqamli pufakni bossa → +1 ball
5. Noto'g'ri → +1 xato (max 5 xato = game over)
6. **15 ta to'g'ri = yutish**
7. Har 3 sekundda raqam nomi ovoz bilan takrorlanadi (Web Speech API)
8. Qiyinlik: spawn interval boshlang'ich 2000ms → har ball uchun 20ms kamayadi (min 1200ms)
9. Pufak soni: 2 ta (0-6 ball), 3 ta (7-11), 4 ta (12-14)
10. `numberToWord()` funksiyasi 0-1000 gacha raqamlarni inglizcha so'zga aylantiradi
11. Oxirgi 5 ta raqam takrorlanmaydi

**State:** targetNumber {value, word}, score (0-15), mistakes (0-5), balloons[], minNumber, maxNumber

### 4.3. Pop the Balloon (Ranglar o'yini)
**URL:** `/games/pop-the-balloon/[lessonId]`

**Logika:**
1. Darsning gameSettings.balloonColors dan maxsus ranglar olinadi (agar bo'lmasa 8 ta default rang)
2. Tepada target rang ko'rsatiladi: "Pop the RED!" + katta rang nomi
3. Ranglar pufaklar pastdan suzib chiqadi
4. To'g'ri rangni bossa → +1 ball
5. Noto'g'ri → +1 xato (max 5 = game over)
6. **15 ta to'g'ri = yutish**
7. Har 3 sekundda rang nomi ovoz bilan takrorlanadi
8. Pufak 6 sekunddan keyin o'z-o'zidan yo'qoladi
9. 10 sekund ichida target rang albatta spawn bo'ladi (garantiya)
10. Pufaklar bir-biriga yaqin bo'lmasligi tekshiriladi (min 15% masofa)
11. Spawn qiyinligi: boshlang'ich 2000ms → kamayib boradi

**Default ranglar:** red, blue, yellow, green, black, orange, purple, cyan
**State:** balloons[], score (0-15), mistakes (0-5), targetColor, gameActive, lessonColors, dynamicColorStyles

### 4.4. Drop to Basket (Savatga tashla)
**URL:** `/games/drop-to-basket/[lessonId]`

**Logika:**
1. Tepada bitta inglizcha so'z + rasm ko'rsatiladi
2. Vocabulary elementlari yuqoridan tushib keladi (har biri kartochkada: rasm + so'z)
3. To'g'ri elementni bossa → +1 ball, "Perfect!" xabari
4. Noto'g'ri → +1 xato
5. Max 5 xato = game over
6. Barcha vocabulary tugallansa = yutish
7. Har 3 sekundda so'z ovoz bilan takrorlanadi
8. Tushish davomiyligi: 6 sekund

**State:** currentWord {word, translation, image}, score, mistakes, fallingItems[], completedWords count

### 4.5. Shopping Basket (Savdo savati — Drag & Drop)
**URL:** `/games/shopping-basket/[lessonId]`

**Logika:**
1. Tepada topshiriq: "Select the [APPLE]"
2. 8-9 ta kartochka grid da ko'rsatiladi (1 ta to'g'ri + qolganlari)
3. To'g'ri kartochkani savatga drag qilish yoki click qilish kerak
4. To'g'ri → keyingi raund (yangi so'z tanlanadi)
5. Noto'g'ri → +1 xato (max 3 = game over)
6. Barcha vocabulary ishlatilsa = yutish
7. Har 3 sekundda so'z ovoz bilan takrorlanadi
8. Touch support: touchStartPos tracking

**State:** currentTask {word, translation, image}, items[] (8-9 ta), basket[], completedItems[], score, mistakes (max 3), draggedItem, isDragging

### 4.6. Build the Body (Tana a'zolari)
**URL:** `/games/build-the-body/[lessonId]`

**Logika:**
1. Ekranda 4 ta tana a'zosi variant (emoji bilan)
2. Tepada: "Find the [HEAD]!" + ovoz
3. To'g'ri variantni bossa → +1 ball
4. Noto'g'ri → +1 xato (max 5 = game over)
5. **10 ta to'g'ri = yutish**
6. Ishlatilgan so'zlar takrorlanmaydi

**Emoji xaritasi:** head→👤, hair→💇, eyes→👀, eye→👁️, nose→👃, mouth→👄, ears→👂, neck→🦴, shoulders→💪, arm→💪, hand→✋, fingers→🖐️, finger→☝️, chest→🫁, stomach→🫃, back→🔙, leg→🦵, knee→🦵, foot→🦶, face→😊, body→🧍, teeth→🦷, tongue→👅

**State:** currentQuestion, options (4 ta), score (max 10), mistakes (max 5), usedWords[]

### 4.7. Movements (Harakatlar — fe'llar)
**URL:** `/games/movements`

**Logika:**
1. SVG stickman (bosh, qo'llar, oyoqlar, soya bilan)
2. Ekranda ko'rsatma: "walk left", "walk right", "jump", "stop"
3. **Desktop:** Arrow tugmalari (←→↑↓)
4. **Mobil:** 4 ta tugma (Left, Jump, Right, Stop)
5. To'g'ri harakat → stickman animatsiya + +1 ball
6. Noto'g'ri → +1 xato (max 3 = game over)
7. **10 ta to'g'ri = yutish**
8. Timer (o'tgan sekund)
9. Progress bar (0-10)

**Keyboard mapping:** ArrowLeft→walk left, ArrowRight→walk right, ArrowUp→jump, ArrowDown→stop
**Mobil tugmalar:** Left (ko'k), Jump (binafsha), Right (ko'k), Stop (qizil)

**Stickman animatsiyalari:**
- Walk: egilgan tana, qo'l/oyoq tebranishi
- Jump: qo'llar yuqori, oyoqlar yig'ilgan, soya kichrayadi
- Stop: qo'llar yuqori (to'xta pozasi)

**State:** currentInstruction, correctActions (0-10), mistakes (0-3), gameStarted, gameOver, won, timeElapsed, lastAction, animationType

### O'yin tugagandan keyin umumiy oqim:
1. `recordGameWin()` → POST `/api/game-progress` (student, lesson, gameWon, attempts)
2. **GameOverModal** ko'rinadi:
   - Yutish: "Ajoyib!" + yashil gradient + ball/foiz + 3 sekunddan keyin auto-redirect
   - Yutqazish: "Yaxshi harakat!" + ko'k gradient + qayta o'ynash tugmasi
   - Tugmalar: "Qayta o'ynash" va "Keyingi" (`/dashboard/games`)
3. O'qituvchi CompleteLessonModal orqali 1-5 yulduz beradi → POST `/api/progress/complete`

---

## 5. Modallar

| Modal | Vazifasi |
|-------|----------|
| **CompleteLessonModal** | Dars/o'yin tugagach yulduz berish (1-5). Progress yaratadi, student.stars oshadi. 5 ta yulduz animatsiyasi. |
| **GameOverModal** | Yutish/yutqazish natijasi. Ball, foiz, qayta o'ynash/keyingi tugmalari. Yutganda 3s auto-redirect. |
| **RedeemRewardModal** | Sovg'a xaridi. O'quvchi tanlash dropdown, narx, qolgan yulduz. Tasdiqlansa yulduz ayiriladi, Redemption yaratiladi. |
| **SubscriptionModal** | Obuna tugaganda. Paket tanlov (1 kun/hafta/oy), karta raqam (copy), karta egasi, admin telefon, kunlik narx, jami summa. |
| **QuickStarsModal** | Darsdan tashqari tez yulduz berish. O'quvchi tanlash, yulduz (1-5), sabab. |
| **AlertModal** | Success/error xabar ko'rsatish, bitta tugma. |
| **ConfirmModal** | Tasdiqlash so'rash — Bekor qilish / Tasdiqlash tugmalari. |

---

## 6. Ma'lumotlar Bazasi Modellari (MongoDB / Mongoose)

### User (O'qituvchi va Admin)
```
name:                String (required, max 100, trimmed)
phone:               String (required, unique, trimmed) — login uchun
password:            String (required, min 6, bcrypt hash, select: false)
role:                Enum ['admin', 'teacher'], default 'teacher'
avatar:              String, default ''
isActive:            Boolean, default true
subscriptionStatus:  Enum ['trial', 'active', 'expired'], default 'trial'
trialStartDate:      Date, default now
subscriptionEndDate: Date, default null
lastPaymentDate:     Date, default null
onboardingCompleted: [String] — onboarding ko'rilgan sahifalar
balance:             Number, min 0, default 0
timestamps:          createdAt, updatedAt (auto)
```
**Methodlar:**
- `isSubscriptionValid()` — trial (7 kun) yoki active obuna tekshirish
- `getDaysRemaining()` — qolgan kunlar. Admin: 999. Trial: 7 kundan hisoblash. Active: subscriptionEndDate gacha.
- `comparePassword(password)` — bcrypt bilan solishtitrish
**Index:** role (1)

### Student (O'quvchi/Bola)
```
name:        String (required, max 100)
age:         Number (required, min 5, max 9)
teacher:     ObjectId ref User (required)
stars:       Number, default 0, min 0
avatar:      String, default ''
parentName:  String, default ''
parentPhone: String, default ''
isActive:    Boolean, default true
timestamps:  createdAt, updatedAt
```
**Indexlar:** teacher(1); teacher(1)+isActive(1)

### Lesson (Dars)
```
title:        String (required, max 200)
description:  String (required, max 2000)
videoUrl:     String (required)
thumbnail:    String, default ''
level:        Number (required, min 1, max 10)
duration:     Number (minutlarda), default 0
order:        Number, default 0
isActive:     Boolean, default true
vocabulary:   [{word: String, translation: String, image: String}] — max 1000 ta
gameType:     Enum ['none','vocabulary','catch-the-number','pop-the-balloon','drop-to-basket','shopping-basket','build-the-body','movements'], default 'vocabulary'
gameSettings: {
  numberRange: { min: Number (default 1), max: Number (default 10) }
  duration:    Number (sekundlarda, default 60)
  balloonColors: Mixed — [{hex, name}] yoki [hex strings]
}
timestamps:   createdAt, updatedAt
```
**Indexlar:** level(1)+order(1); isActive(1)

### Progress (Dars tugallash)
```
student:      ObjectId ref Student (required)
lesson:       ObjectId ref Lesson (required)
teacher:      ObjectId ref User (required)
starsEarned:  Number (required, min 1, max 5)
completedAt:  Date, default now
notes:        String, default ''
timestamps:   createdAt, updatedAt
```
**Indexlar:** student(1)+lesson(1) UNIQUE; student(1); student(1)+completedAt(-1); teacher(1)

### GameProgress (O'yin natijasi)
```
student:    ObjectId ref Student (required)
lesson:     ObjectId ref Lesson (required)
teacher:    ObjectId ref User (required)
gameWon:    Boolean, default false
wonAt:      Date, default null
attempts:   Number, default 0
timestamps: createdAt, updatedAt
```
**Indexlar:** student(1)+lesson(1) UNIQUE; student(1)

### Reward (Sovg'a)
```
title:       String (required, max 200)
description: String, default ''
cost:        Number (required, min 1) — yulduzda
image:       String, default ''
category:    Enum ['toy','book','game','certificate','other'], default 'other'
stock:       Number, default -1 (-1 = cheksiz)
isActive:    Boolean, default true
timestamps:  createdAt, updatedAt
```
**Index:** cost(1)

### Redemption (Sovg'a xaridi)
```
studentId:   ObjectId ref Student (required)
rewardId:    ObjectId ref Reward (required)
teacherId:   ObjectId ref User (required)
starsCost:   Number (required)
status:      Enum ['pending','delivered','cancelled'], default 'pending'
redeemedAt:  Date, default now
deliveredAt: Date, optional
timestamps:  createdAt, updatedAt
```
**Indexlar:** studentId(1); teacherId(1)

### Settings (Tizim sozlamalari)
```
key:   String (required, unique)
value: Mixed
timestamps: createdAt, updatedAt
```
**Static methodlar:** `Settings.get(key, defaultValue)`, `Settings.set(key, value)`
**Ishlatiladigan kalitlar:** adminPhone, cardNumber, cardHolder, dailyPrice (default 500 so'm)

### PageView (Sahifa analytics)
```
sessionId: String (required, indexed)
page:      String (required)
timeSpent: Number (sekundlarda, default 0)
isEntry:   Boolean, default false
isExit:    Boolean, default false
userId:    ObjectId ref User, default null
createdAt: Date, default now
```
**Indexlar:** sessionId(1); page(1)+createdAt(-1); sessionId(1)+createdAt(1)

---

## 7. Auth Oqimi

1. **Register:** telefon + parol → bcrypt hash → User yaratiladi (role=teacher, trial, 7 kun) → JWT token → localStorage + HttpOnly cookie → Telegram bildirishnoma
2. **Login:** telefon + parol → bcrypt verify → JWT token (default 7 kun amal qiladi) → localStorage + cookie → role ga qarab redirect
3. **Edge Middleware** (`middleware.js`): `/admin/*` routelarni himoyalaydi. Cookie yoki Authorization headerdan token oladi. Payload decode qiladi (signature tekshirmaydi — Edge safe). Role=admin va expiry tekshiradi. Noto'g'ri bo'lsa `/login` ga redirect.
4. **API Middleware** (`middleware/authMiddleware.js`): to'liq JWT verification + DB dan user olish.
   - `authenticate(request)` — token verify + user fetch
   - `authorize(request, roles)` — authenticate + role tekshirish
   - `adminOnly(request)` — faqat admin
   - `teacherOnly(request)` — faqat teacher
   - `requireSubscription(request)` — obuna tekshirish (admin=999 kun, expired=402 error)
5. **Client** (`context/AuthContext.js`): localStorage dan token/user yuklaydi → darhol render → background da `/api/auth/me` orqali verify

---

## 8. To'lov Tizimi (Payme)

**Oqim:**
1. O'qituvchi to'lov boshlaydi → POST `/api/payme/create-payment` (amount min 1000 so'm)
2. Server orderId (UUID) yaratadi, Payme URL generatsiya qiladi (base64 encoded params)
3. O'qituvchi Payme sahifasiga o'tadi, to'lov qiladi
4. Payme webhook → POST `/api/payme/callback` (Basic auth: Paycom:secretKey)
5. **RPC methodlari:**
   - `CheckPerformTransaction` — user mavjudmi, faolmi, summa to'g'rimi
   - `CreateTransaction` — tranzaksiya yaratadi (state=1)
   - `PerformTransaction` — to'lovni amalga oshiradi: Settings dan dailyPrice oladi, kunlarni hisoblaydi, user.balance va subscriptionEndDate yangilanadi, status=active (state=2)
   - `CancelTransaction` — bekor qilish/qaytarish (state=-1 yoki -2)
   - `CheckTransaction` — holat tekshirish
   - `GetStatement` — tranzaksiyalar tarixi
6. Muvaffaqiyatli to'lovdan keyin → Socket.IO orqali `subscription:update` broadcast

**Xato kodlari:** -31050 (user topilmadi), -31001 (noto'g'ri summa), -31051 (allaqachon to'langan), -31003 (tranzaksiya topilmadi), -31008 (bekor qilingan)

---

## 9. Realtime (Socket.IO)

**Server:** `lib/socket.js` → `initSocketServer(httpServer)`
**Path:** `/api/socket`, transport: websocket + polling, CORS enabled

**Autentifikatsiya:** handshake da token → `verifyToken()` → socket roomlarga qo'shiladi: `user:{userId}`, `role:{role}`

**Broadcast funksiyalari:**
- `emitToUser(userId, event, data)` — bitta foydalanuvchiga
- `emitToRole(role, event, data)` — barcha teacher/admin larga
- `emitToAll(event, data)` — hammaga

**Eventlar:**
| Event | Qachon | Kimga |
|-------|--------|-------|
| `student:update` | O'quvchi CRUD | O'qituvchiga |
| `lesson:update` | Dars CRUD | Teacher + Admin |
| `reward:update` | Sovg'a CRUD | Teacher + Admin |
| `progress:update` | Dars tugallash | O'qituvchiga |
| `dashboard:update` | Stats yangilash | O'qituvchiga |
| `subscription:update` | Obuna o'zgarishi | Foydalanuvchiga |

**Client hook:** `hooks/useSocket.js` — reconnection (max 5), ping/pong 30s, specialized hooks: useStudentUpdates, useLessonUpdates, useRewardUpdates, useProgressUpdates, useDashboardUpdates, useSubscriptionUpdates

---

## 10. Telegram Integratsiya

**Asosiy platforma** (`lib/telegram.js`):
- Ro'yxatdan o'tish bildirishnomasi (ism, telefon, rol, vaqt — O'zbekiston timezone)
- Kunlik hisobot (20:00 O'zbekiston vaqti): yangi o'quvchilar, o'qituvchilar, faol obunalar, trial, expired, jami
- Excel hisobot: 3 ta sheet (Teachers, Students, Statistics)

**Lead Bot** (`lead-bot/`) — alohida Node.js process, polling mode:
- `/start` → 2 bosqichli anketa: bola yoshi (2-4, 5-6, 7+) + qiziqish (ingliz tili, maktabga tayyorlov, ertaklar)
- Lead `leads.json` ga saqlanadi (telegram_id, first_name, username, child_age, interest, created_at)
- `/s` (faqat admin) → to'liq statistika (lead lar + platforma stats API dan)
- Video forward qilsa → file_id qaytaradi

---

## 11. Cron Jobs

1. **Daily Report** (`/api/cron/daily-report`) — har kuni 15:00 UTC (20:00 O'zbekiston). CRON_SECRET authorization. Oxirgi 24 soat statistikasi + Telegram xabar + Excel.
2. **Auto Renew** (`/api/cron/auto-renew-subscriptions`) — muddati tugagan obunalarni avtomatik yangilash.
3. **Vercel cron:** `vercel.json` da sozlangan.

---

## 12. Caching Strategiya

**Server-side** (`lib/cache.js`) — in-memory Map:
| Key pattern | TTL | Ma'lumot |
|-------------|-----|----------|
| `lessons:active` | 5 min | Faol darslar |
| `lesson:{id}` | 5 min | Bitta dars |
| `rewards:active` / `rewards:all` | 5 min | Sovg'alar |
| `students:{teacherId}` | 30 sek | O'qituvchi o'quvchilari |
| `dashboard:{userId}` | 30 sek | Dashboard stats |
| `admin:lessons` | 10 min | Admin darslar |
| `admin:users` | register da tozalanadi | Admin userlar |

**Client-side** (React Query — `lib/queries.js`):
| Hook | staleTime | refetchInterval |
|------|-----------|-----------------|
| useLessons | 3 min | 5 min |
| useStudents | 1 min | 2 min |
| useRewards | 3 min | 5 min |
| useDashboard | 30 sek | 1 min |
| useGameProgress | 10 sek | 30 sek |

Optimistic updates: useAddStudent, useUpdateStudent, useDeleteStudent (onMutate da cache yangilanadi, xatoda rollback).

---

## 13. Xavfsizlik

- **Rate limit:** login 20/15min, register 5/hour (IP bo'yicha, in-memory store, 5000 dan katta bo'lsa auto-clean)
- **Auth:** JWT (HttpOnly cookie + localStorage), Edge middleware (admin routelar), API middleware (to'liq verify)
- **Parol:** bcrypt hash (salt rounds: 10)
- **XSS:** register da name sanitize qilinadi
- **Input validation:** Zod schemalar, O'zbekiston telefon formati regex
- **Payme:** Basic auth signature verification
- **Security headers:** HSTS, X-Frame-Options: DENY, X-XSS-Protection, X-Content-Type-Options: nosniff, Referrer-Policy, Permissions-Policy
- **CORS:** Socket.IO faqat NEXT_PUBLIC_APP_URL dan

---

## 14. Validation Schemalari (Zod)

- **Telefon:** `/^(\+998)?[0-9]{9,12}$/`
- **Parol:** min 6, max 100
- **Ism:** min 2, max 100, trimmed
- **ObjectId:** 24 xonali hex
- **Student yoshi:** 5-9
- **Yulduz:** 1-5
- **Dars darajasi:** 1-10
- **Karta:** 16 xonali
- **To'lov:** 1,000 — 10,000,000 so'm
- **Obuna kunlari:** 1-365
- **Kunlik narx:** 100 — 100,000 so'm

---

## 15. Deploy

- **Production:** VPS server, pm2 process manager
- **Deploy script:** `deploy.sh` → git pull → npm install --production → next build → pm2 restart
- **Cron:** Vercel cron (daily-report 15:00 UTC)
- **Lead bot:** alohida pm2 process
- **Port:** 3007

---

## 16. Fayl Yuklash

- **Rasmlar:** POST `/api/upload/image` → `uploads/images/` (WebP format, timestamped filename)
- **Videolar:** POST `/api/upload/video` → `uploads/videos/` (500MB gacha, server actions)
- **Kitoblar:** POST `/api/upload/book` → `uploads/books/` (PDF)
- **Serve:** GET `/api/image/[filename]`, GET `/api/video/[filename]`, GET `/api/book/pdf`
- **Cache:** rasmlar 24 soat, videolar 24 soat, API 0 cache

---

## 17. PWA (Progressive Web App)

**manifest.json:**
- name: "Bolajon.uz - Bolalar uchun ingliz tili"
- short_name: "Bolajon"
- display: standalone, orientation: portrait-primary
- theme_color: #2b8cee, background_color: #ffffff
- lang: uz, categories: education, kids
- Iconlar: 72, 96, 128, 144, 152, 192, 384, 512 px (PNG, maskable any)

**PWAInstall komponenti:**
- `beforeinstallprompt` eventini ushlaydi
- Mobilda: yuqori o'ng burchak, desktopda: pastki markazda
- 8 sekunddan keyin avtomatik yashirinadi
- "Yopish" bosilsa 7 kun ko'rinmaydi (localStorage: `pwa-dismissed`)
- Allaqachon o'rnatilgan bo'lsa ko'rinmaydi (`display-mode: standalone`)
- Matn: "Ilovani o'rnating" / "Tezroq kirish uchun" / "O'rnatish" tugmasi

**Service Worker** (`public/sw.js`):
- Offline support va caching
- Push notification qo'llab-quvvatlash
- Notification matni: "Yangi xabar!"

---

## 18. SEO

**Metadata (app/layout.js):**
- title: "Bolajon.uz - Bolalar uchun ingliz tili | O'zbek bolalari uchun English"
- description: "5-9 yoshli bolalarga ingliz tilini o'yinlar va interaktiv video darslar orqali o'rgatish platformasi"
- keywords: ingliz tili, bolalar uchun ingliz, english for kids, uzbekistan, interaktiv darslar, bolajon
- robots: index, follow, googleBot (max-video-preview, max-image-preview: large)
- canonical: https://bolajoon.uz
- Google verification: mavjud

**Open Graph:**
- type: website, locale: uz_UZ
- image: https://bolajoon.uz/og-image.png (1200x630)

**Twitter Card:**
- card: summary_large_image
- image: https://bolajoon.uz/og-image.png

**Structured Data (JSON-LD):** 3 ta schema:
1. **EducationalOrganization** — name, url, logo, description, addressCountry: UZ
2. **WebSite** — name, url, inLanguage: uz, SearchAction
3. **Course** — "Bolalar uchun ingliz tili kursi", educationalLevel: Beginner, audience: Children 5-9

**Sitemap** (`app/sitemap.js`):
- `/` — priority 1, weekly
- `/login` — priority 0.8, monthly
- `/register` — priority 0.8, monthly

**robots.txt:**
- Allow: / (barcha crawlerlar)
- Disallow: /api/, /dashboard/, /admin/
- AI crawlerlar (GPTBot, ChatGPT-User, ClaudeBot, Anthropic-AI) — Allow
- Sitemap: https://bolajoon.uz/sitemap.xml

---

## 19. Xato va Muvaffaqiyat Xabarlari (O'zbek tilida)

### Auth xabarlari
| Xabar | Qachon |
|-------|--------|
| "Juda ko'p urinish. 15 daqiqadan so'ng qayta urinib ko'ring." | Login rate limit |
| "Juda ko'p urinish. 1 soatdan so'ng qayta urinib ko'ring." | Register rate limit |
| "Telefon raqam va parol kiritilishi shart" | Login — bo'sh field |
| "Ism, telefon raqam va parol kiritilishi shart" | Register — bo'sh field |
| "Parol kamida 6 ta belgidan iborat bo'lishi kerak" | Register — qisqa parol |
| "Telefon raqam yoki parol noto'g'ri" | Login — noto'g'ri credential |
| "Bu telefon raqam allaqachon ro'yxatdan o'tgan" | Register — dublikat |
| "Hisob bloklangan. Admin bilan bog'laning." | Login — nofaol akkaunt |
| "Kirish muvaffaqiyatli" | Login — success |
| "Ro'yxatdan o'tish muvaffaqiyatli" | Register — success |
| "Kirishda xatolik. Qaytadan urinib ko'ring." | Login — server xato |
| "Ro'yxatdan o'tishda xatolik. Qaytadan urinib ko'ring." | Register — server xato |
| "Obuna muddati tugagan. Davom ettirish uchun to'lov qiling." | Subscription expired |

### Validation xabarlari
| Xabar | Qachon |
|-------|--------|
| "Telefon raqam noto'g'ri formatda" | Telefon validatsiya |
| "Parol kamida 6 ta belgidan iborat bo'lishi kerak" | Parol min |
| "Parol juda uzun" | Parol max |
| "Ism kamida 2 ta belgidan iborat bo'lishi kerak" | Ism min |
| "Ism juda uzun" | Ism max |
| "Noto'g'ri ID format" | ObjectId xato |
| "Yosh butun son bo'lishi kerak" | Yosh validatsiya |
| "Yosh kamida 5 bo'lishi kerak" | Yosh min |
| "Yosh ko'pi bilan 9 bo'lishi kerak" | Yosh max |
| "Kamida 1 yulduz berish kerak" | Yulduz min |
| "Ko'pi bilan 5 yulduz berish mumkin" | Yulduz max |
| "Video URL noto'g'ri" | Video URL |
| "Narx kamida 1 yulduz bo'lishi kerak" | Sovg'a narx |
| "Minimal to'lov 1000 so'm" | To'lov min |
| "Maksimal to'lov 10,000,000 so'm" | To'lov max |
| "Karta raqami 16 ta raqamdan iborat bo'lishi kerak" | Karta validatsiya |
| "Validation xatosi" | Umumiy validatsiya |

### O'yin xabarlari
| Xabar | Qachon |
|-------|--------|
| "Ajoyib!" | O'yin yutilganda |
| "Yaxshi harakat!" | O'yin yutqazilganda |
| "Siz barcha savollarga to'g'ri javob berdingiz!" | Yutish tavsifi |
| "Qayta urinib ko'ring, siz albatta muvaffaqiyatga erishasiz!" | Yutqazish tavsifi |
| "To'g'ri javoblar" | Natija label |
| "Qayta urinish" | Restart tugma |
| "Keyingisi" | Keyingi tugma |

### Dars yakunlash xabarlari (yulduz bo'yicha)
| Yulduz | Xabar |
|--------|-------|
| 1 | "Yaxshi harakat! 💪" |
| 2 | "Yaxshi! 👍" |
| 3 | "Juda yaxshi! 😊" |
| 4 | "A'lo natija! 🌟" |
| 5 | "Zo'r! Mukammal! 🎉" |

### Modal va UI xabarlari
| Xabar | Qayerda |
|-------|---------|
| "Darsni yakunlash" | CompleteLessonModal sarlavha |
| "O'quvchini tanlang" | Dropdown placeholder |
| "Yulduz bering (1-5)" | Yulduz label |
| "Izoh (ixtiyoriy)" | Izoh label |
| "Izoh qo'shing..." | Izoh placeholder |
| "Obuna muddati tugadi" | SubscriptionModal sarlavha |
| "Obunani uzaytirish" | SubscriptionModal subtitle |
| "Obuna paketlari" | Paket sarlavha |
| "1 kun" / "1 hafta" / "1 oy" | Paket variantlari |
| "Kunlik narx:" | Narx label |
| "Tanlangan muddat:" | Muddat label |
| "Jami to'lov:" | Jami label |
| "Boshqa muddat (kun)" | Custom input label |
| "Minimal: 1 kun (500 so'm)" | Hint matn |
| "Karta raqami" / "Karta egasi" / "To'lov summasi" | To'lov fieldlari |
| "To'lovni amalga oshirgandan so'ng admin bilan bog'laning" | Ko'rsatma |
| "Sovg'a berish" | RedeemRewardModal sarlavha |
| "Yetarli yulduzga ega o'quvchi yo'q" | Xato holat |
| "Yangi balans:" | Balans label |
| "Bekor qilish" | Cancel tugma |
| "Tasdiqlash" | Confirm tugma |
| "Ha" | ConfirmModal tasdiqlash |
| "Yopish" | Close tugma |

### Boshqa xabarlar
| Xabar | Qachon |
|-------|--------|
| "Dars muvaffaqiyatli yakunlandi!" | Progress success |
| "Profil yangilandi" | Profil update success |
| "Yangi parollar mos kelmaydi" | Parol tasdiqlash xato |
| "Hozircha darslar yo'q" | Bo'sh darslar ro'yxati |
| "Xatolik yuz berdi" | Umumiy server xato |
| "Server bilan bog'lanishda xatolik" | Network xato |
| "PDF fayl topilmadi" | PDF yo'q |
| "Ilovani o'rnating" | PWA install prompt |
| "Tezroq kirish uchun" | PWA install subtitle |
| "O'rnatish" | PWA install tugma |
