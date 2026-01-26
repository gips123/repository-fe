# Setup Instructions

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env.local` file:**
   
   Copy file `env.example` ke `.env.local`:
   ```bash
   cp env.example .env.local
   ```
   
   Atau buat manual file `.env.local` dengan isi:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
   ```
   
   **Important:** Ganti URL jika backend Anda berjalan di port atau host yang berbeda.

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Backend Requirements

Pastikan backend NestJS sudah running di `http://localhost:3000` (atau sesuai konfigurasi Anda).

Backend harus memiliki:
- CORS enabled untuk origin frontend
- JWT authentication
- Semua endpoints sesuai dokumentasi di `FRONTEND-INTEGRATION.md`

## Default Login

Gunakan credentials dari backend untuk login. Biasanya:
- Email: `admin@example.com` (atau sesuai setup backend)
- Password: `admin123` (atau sesuai setup backend)

## Troubleshooting

### Port Already in Use
Jika port 3000 sudah digunakan, Next.js akan otomatis menggunakan port lain (3001, 3002, dll).

### CORS Error
Pastikan backend mengizinkan origin frontend di CORS settings:
```typescript
// Backend CORS config
app.enableCors({
  origin: 'http://localhost:3000', // atau origin frontend Anda
  credentials: true,
});
```

### API Connection Failed
1. Pastikan backend server running
2. Check `NEXT_PUBLIC_API_BASE_URL` di `.env.local`
3. Check browser console untuk error details

### Token Expired
Jika token expired, user akan otomatis di-redirect ke login page.

## Production Build

```bash
npm run build
npm start
```

Atau deploy ke Vercel/Netlify dengan environment variable `NEXT_PUBLIC_API_BASE_URL` set ke production API URL.

