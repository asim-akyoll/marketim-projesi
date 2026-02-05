# 🚀 Marketim Production Deployment Guide

## Hazırlık
✅ Kod GitHub'a push edildi
✅ Database Neon PostgreSQL hazır
✅ Cloudinary hesabı aktif

---

## 1️⃣ Backend Deployment (Render)

### Adım 1: Render'a Giriş Yap
1. https://render.com adresine git
2. GitHub hesabınla giriş yap

### Adım 2: Web Service Oluştur
1. **Dashboard** → **New +** → **Web Service**
2. Repository'yi seç: `asim-akyoll/marketim-projesi`
3. **Root Directory:** `backend-node`

### Adım 3: Build Settings
- **Name:** `marketim-backend` (veya istediğin isim)
- **Region:** Frankfurt (Türkiye'ye en yakın)
- **Branch:** `main`
- **Runtime:** Node
- **Build Command:** `npm install && npx prisma generate`
- **Start Command:** `npm start`

### Adım 4: Environment Variables
**Environment** sekmesinden şu değişkenleri ekle:

```
DATABASE_URL=postgresql://neondb_owner:npg_qsjmf2tzI3Eb@ep-green-voice-aiz8xfr4-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require

JWT_SECRET=cfC0BcML40IuB7qoTgb7mVq+TH7LAjH5IMtRE5XiV2s=

CLOUDINARY_CLOUD_NAME=dqi2art8n
CLOUDINARY_API_KEY=864131951668958
CLOUDINARY_API_SECRET=utaIjKocxcpXlk4RKJeZXboxYbo

NODE_ENV=production
```

### Adım 5: Deploy
1. **Create Web Service** butonuna bas
2. Deployment başlayacak (5-10 dakika)
3. Deploy bitince URL'i kopyala: `https://marketim-backend-xxxx.onrender.com`

### Adım 6: Database Migration
Render Dashboard'da Shell açıp çalıştır:
```bash
npx prisma migrate deploy
```

---

## 2️⃣ Frontend Deployment (Vercel)

### Adım 1: Vercel'e Giriş Yap
1. https://vercel.com adresine git
2. GitHub hesabınla giriş yap

### Adım 2: Import Project
1. **Add New** → **Project**
2. Repository'yi seç: `asim-akyoll/marketim-projesi`
3. **Root Directory:** `marketim-frontend`

### Adım 3: Build Settings
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### Adım 4: Environment Variables
**Environment Variables** bölümünden ekle:

```
VITE_API_URL=https://marketim-backend-xxxx.onrender.com
```

⚠️ **ÖNEMLİİ:** `xxxx` kısmına Render'dan aldığın backend URL'i yaz!

### Adım 5: Deploy
1. **Deploy** butonuna bas
2. Deployment başlayacak (2-3 dakika)
3. Deploy bitince siteniz canlı: `https://marketim-projesi.vercel.app`

---

## 3️⃣ Son Kontroller

### Backend Kontrolü
1. Render URL'ini tarayıcıda aç: `https://marketim-backend-xxxx.onrender.com`
2. Şunu görmeli: "Marketim Backend (Node.js) is Running! 🚀"

### Frontend Kontrolü
1. Vercel URL'ini aç: `https://marketim-projesi.vercel.app`
2. Giriş yap testi yap
3. Admin panel kontrol et
4. Ürün ekleme/resim yükleme test et

### Database Kontrolü
Render Shell'de:
```bash
npx prisma studio
```

---

## ⚠️ Bilinen Sorunlar

### 1. Cold Start (Render Free Plan)
- İlk istek 15-30 saniye sürebilir
- Çözüm: Paid plan ($7/ay) veya Uptime Robot kullan

### 2. CORS Hatası
- Frontend → Backend bağlanamıyorsa
- `VITE_API_URL` environment variable'ı kontrol et

### 3. Database Bağlantı Hatası
- `DATABASE_URL` doğru mu kontrol et
- Neon PostgreSQL'de IP whitelist var mı bak

---

## 🎉 Deployment Tamamlandı!

Site canlıda! 🚀

**Frontend:** https://marketim-projesi.vercel.app
**Backend:** https://marketim-backend-xxxx.onrender.com
**Admin Panel:** https://marketim-projesi.vercel.app/admin

---

## 📝 Güncelleme Nasıl Yapılır?

1. Kod değişikliği yap
2. `git add .`
3. `git commit -m "mesaj"`
4. `git push`
5. Render ve Vercel **otomatik** yeniden deploy eder!
