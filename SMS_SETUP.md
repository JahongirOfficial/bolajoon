# SMS Yuborish Sozlamalari

Admin panelga SMS yuborish funksiyasi qo'shildi. Bu funksiya orqali foydalanuvchilarga SMS xabar yuborishingiz mumkin.

## Xususiyatlar

- ✅ Foydalanuvchilarni tanlash (checkbox orqali)
- ✅ Filtrlash (Barchasi, O'qituvchilar, Faol, Trial)
- ✅ Xabar yozish (500 belgigacha)
- ✅ Bir vaqtning o'zida ko'p foydalanuvchilarga yuborish
- ✅ Yuborish natijalarini ko'rish

## SMS Provider Sozlash

### 1. Eskiz.uz (Tavsiya etiladi)

1. [Eskiz.uz](https://eskiz.uz) saytiga kiring
2. Ro'yxatdan o'ting va login qiling
3. API bo'limidan tokenni oling
4. `.env` faylga quyidagilarni qo'shing:

```env
SMS_API_URL=https://notify.eskiz.uz/api/message/sms/send
SMS_API_TOKEN=your_token_here
SMS_SENDER_ID=4546
```

### 2. Playmobile.uz

1. [Playmobile.uz](https://playmobile.uz) saytiga kiring
2. API dokumentatsiyasini o'qing
3. `app/api/admin/sms/send/route.js` faylida `sendSMS` funksiyasini o'zgartiring

### 3. Boshqa providerlar

`app/api/admin/sms/send/route.js` faylida `sendSMS` funksiyasini o'zingizning SMS provider API'siga moslashtiring.

## Foydalanish

1. Admin panelga kiring
2. "SMS Yuborish" bo'limiga o'ting
3. Foydalanuvchilarni tanlang
4. Xabar yozing
5. "SMS Yuborish" tugmasini bosing

## Muhim Eslatmalar

- SMS yuborish uchun SMS provider API tokenini sozlash kerak
- Token sozlanmagan bo'lsa, development rejimida xato bermaydi
- Production rejimida albatta SMS provider sozlang
- SMS narxlari provider'ga bog'liq

## Fayl Strukturasi

```
app/
├── admin/
│   └── sms/
│       └── page.js              # SMS yuborish sahifasi
└── api/
    └── admin/
        ├── sms/
        │   └── send/
        │       └── route.js     # SMS yuborish API
        └── users/
            └── route.js         # Foydalanuvchilar ro'yxati API
```

## API Endpoints

### GET /api/admin/users
Barcha foydalanuvchilarni olish (adminlar bundan mustasno)

### POST /api/admin/sms/send
SMS yuborish

Request body:
```json
{
  "userIds": ["userId1", "userId2"],
  "message": "Sizning xabaringiz"
}
```

Response:
```json
{
  "success": true,
  "sent": 10,
  "failed": 0,
  "total": 10,
  "results": [...]
}
```
