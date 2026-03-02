# Kitobcha Boshqaruvi Tizimi

## Umumiy ma'lumot

Admin panelga **Kitobcha boshqaruvi** bo'limi qo'shildi. Bu orqali admin Bolajon darsligini (PDF) yuklashi va yangilashi mumkin.

## 🎨 Yangi xususiyat: Flipbook animatsiyasi!

Kitobchani endi 2 xil ko'rish rejimida ko'rish mumkin:

### 1. 📖 Flipbook rejimi (Yangi!)
- Haqiqiy kitob kabi varaqlanish animatsiyasi
- Smooth sahifa o'tish effekti
- Zoom in/out (50% - 200%)
- To'liq ekran rejimi
- Sahifa navigatsiyasi (oldingi/keyingi)
- Responsive dizayn

### 2. 📄 Oddiy rejim
- Standart PDF viewer
- Tez yuklash
- Oddiy navigatsiya

## Xususiyatlar

### 1. Admin Panel - Kitobcha bo'limi (`/admin/book`)

**Imkoniyatlar:**
- Joriy kitobchani ko'rish
- Yangi PDF yuklash
- Mavjud PDF ni yuklab olish
- PDF ni brauzerda ochish

**Cheklovlar:**
- Faqat PDF format
- Maksimal hajm: 50MB
- Faqat admin foydalanuvchilar

### 2. Fayl joylashuvi

**Papka:** `public/book/`
**Fayl nomi:** `bolajon-darslik.pdf` (doim bir xil nom)

### 3. Yangilash jarayoni

1. Admin `/admin/book` sahifasiga kiradi
2. "PDF fayl tanlash" tugmasini bosadi
3. Kompyuterdan PDF faylni tanlaydi
4. Fayl avtomatik yuklanadi va eski faylni almashtiradi
5. Barcha foydalanuvchilar darhol yangi kitobchani ko'radi

## API Endpoints

### POST /api/upload/book
Yangi PDF kitobchani yuklash

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Body:**
```
pdf: File (PDF format, max 50MB)
```

**Response:**
```json
{
  "success": true,
  "message": "Kitobcha muvaffaqiyatli yuklandi",
  "filename": "bolajon-darslik.pdf",
  "url": "/book/bolajon-darslik.pdf",
  "size": 1234567
}
```

## Foydalanuvchi tomonida

Foydalanuvchilar kitobchani 2 joydan ko'rishlari mumkin:

1. **Dashboard** - `/dashboard`
   - "Kitobni yuklab olish" tugmasi

2. **Kitobcha sahifasi** - `/dashboard/book`
   - **Flipbook rejimi** (default):
     - Haqiqiy kitob kabi varaqlanish
     - Sahifa navigatsiyasi (◀ ▶)
     - Zoom boshqaruvi (🔍)
     - To'liq ekran (⛶)
     - Smooth animatsiya
   - **Oddiy rejim**:
     - Standart PDF viewer
     - Tez yuklash
   - Yuklab olish imkoniyati
   - Bosmaxona variantini sotib olish

## Flipbook xususiyatlari

### Boshqarish tugmalari:

**Navigatsiya:**
- ◀ Oldingi sahifa
- ▶ Keyingi sahifa
- Sahifa raqami ko'rsatkichi

**Zoom:**
- 🔍- Kichraytirish (50% gacha)
- 🔍+ Kattalashtiris (200% gacha)
- Foiz ko'rsatkichi

**Ekran:**
- ⛶ To'liq ekran rejimi
- ⊡ Oddiy ekran rejimi

### Animatsiya effektlari:

- **Page flip**: 0.6s smooth transition
- **3D effect**: rotateY animation
- **Fade effect**: opacity transition
- **Scale effect**: zoom animation

### Texnik tafsilotlar:

**Kutubxonalar:**
- `react-pdf` - PDF rendering
- `pdfjs-dist` - PDF.js worker
- Custom CSS animations

**Performance:**
- Lazy loading
- Dynamic import (SSR disabled)
- Optimized rendering
- Responsive design

## Texnik tafsilotlar

### Fayl yuklash jarayoni

1. **Validatsiya:**
   - Fayl turi: PDF
   - Hajm: ≤ 50MB
   - Faqat admin huquqi

2. **Saqlash:**
   - Eski fayl o'chiriladi (agar mavjud bo'lsa)
   - Yangi fayl `public/book/bolajon-darslik.pdf` ga saqlanadi
   - Fayl nomi doim bir xil (cache muammosi yo'q)

3. **Xavfsizlik:**
   - Faqat admin foydalanuvchilar yuklashi mumkin
   - Fayl turi va hajmi tekshiriladi
   - Server-side validatsiya

### Sidebar yangilanishi

**Fayl:** `components/admin/AdminSidebar.js`

Yangi menu item qo'shildi:
```javascript
{ href: '/admin/book', icon: BookOpen, label: 'Kitobcha' }
```

## Foydalanish bo'yicha ko'rsatmalar

### Admin uchun:

1. Admin panelga kiring
2. Chap menuda "Kitobcha" ni bosing
3. Joriy kitobchani ko'ring (agar mavjud bo'lsa)
4. Yangi PDF yuklash uchun:
   - "PDF fayl tanlash" tugmasini bosing
   - Kompyuterdan PDF faylni tanlang
   - Fayl avtomatik yuklanadi
5. Muvaffaqiyatli yuklangandan keyin barcha foydalanuvchilar yangi kitobchani ko'radi

### Foydalanuvchilar uchun:

1. Dashboard ga kiring
2. "Kitobni yuklab olish" tugmasini bosing yoki
3. `/dashboard/book` sahifasiga o'ting
4. Kitobchani brauzerda o'qing yoki yuklab oling

## Xatoliklarni bartaraf etish

### "Fayl yuklanmadi" xatosi
- Internetni tekshiring
- Fayl hajmini tekshiring (50MB dan kam bo'lishi kerak)
- Fayl formatini tekshiring (faqat PDF)

### "Kitobcha ko'rinmayapti" muammosi
- Sahifani yangilang (F5)
- Cache ni tozalang (Ctrl+Shift+R)
- Brauzer konsolini tekshiring

### "Ruxsat yo'q" xatosi
- Admin huquqiga ega ekanligingizni tekshiring
- Qayta login qiling

## Kelajakda qo'shilishi mumkin bo'lgan xususiyatlar

- [ ] Kitobcha versiyalarini saqlash (tarix)
- [ ] Ko'p tilli kitobchalar (O'zbek, Rus, Ingliz)
- [ ] Kitobcha statistikasi (necha marta yuklab olingan)
- [ ] Kitobcha sharhlari va reytingi
- [ ] Kitobcha bo'limlari (alohida PDF lar)

## Muhim eslatmalar

⚠️ **Diqqat:**
- Yangi PDF yuklanganda eski fayl o'chiriladi
- Fayl nomi doim `bolajon-darslik.pdf` bo'ladi
- Barcha foydalanuvchilar bir xil PDF ni ko'radi
- PDF hajmi katta bo'lsa, yuklash vaqti ko'proq bo'ladi

✅ **Afzalliklar:**
- Oson boshqarish
- Avtomatik yangilanish
- Xavfsiz yuklash
- Foydalanuvchilar uchun qulay
