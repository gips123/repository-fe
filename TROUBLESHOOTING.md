# Troubleshooting Guide

Panduan troubleshooting untuk masalah umum di frontend.

## 🔴 Error 403 Forbidden - File Upload

### Gejala
```
POST http://localhost:3000/api/files/upload/xxx 403 (Forbidden)
```

### Penyebab
User tidak memiliki permission `can_create` di folder tersebut.

### Solusi

#### 1. Check Permission di Folder
- Pastikan user/role memiliki permission `can_create: true` di folder tersebut
- Admin bisa check di halaman "Permissions"

#### 2. Assign Permission (Admin)
1. Buka halaman "Permissions"
2. Filter atau pilih folder yang ingin di-upload
3. Check apakah ada permission untuk user/role Anda
4. Jika belum ada, create permission dengan:
   - `can_read: true`
   - `can_create: true` ← **PENTING untuk upload**
   - `can_update: false` (optional)
   - `can_delete: false` (optional)

#### 3. Check Role User
- Pastikan user memiliki role yang benar
- Check di halaman "Users" (admin only)
- Verify role user di profile

#### 4. Test dengan Admin
- Login sebagai admin
- Admin biasanya punya full access
- Jika admin juga error 403, kemungkinan masalah di backend

### Debugging Steps

1. **Check Browser Console**
   - Buka DevTools → Console
   - Lihat error message lengkap
   - Check apakah token terkirim

2. **Check Network Tab**
   - Buka DevTools → Network
   - Cari request upload yang failed
   - Check Request Headers:
     - `Authorization: Bearer <token>` harus ada
   - Check Response:
     - Status: 403
     - Response body biasanya berisi error message

3. **Check Permission di Backend**
   ```bash
   # Get permissions for folder
   GET /api/permissions?folderId=<folder-id>
   Authorization: Bearer <token>
   ```

4. **Test dengan Postman**
   - Gunakan Postman collection
   - Test upload dengan token yang sama
   - Compare request headers

### Common Issues

#### Issue 1: Permission belum di-assign
**Solution:** Assign permission dengan `can_create: true`

#### Issue 2: Permission expired
**Solution:** Check `expires_at` di permission, create permission baru jika perlu

#### Issue 3: Wrong role
**Solution:** User harus punya role yang sesuai dengan permission yang di-assign

#### Issue 4: Token expired
**Solution:** Login ulang untuk mendapatkan token baru

## 🔴 Error 401 Unauthorized

### Penyebab
- Token expired atau invalid
- Token tidak terkirim

### Solusi
1. Login ulang
2. Check localStorage untuk token
3. Clear localStorage dan login ulang

## 🔴 Error 404 Not Found

### Penyebab
- Folder ID tidak valid
- Endpoint salah

### Solusi
1. Pastikan folder ID valid
2. Check folder masih ada di tree
3. Refresh folder tree

## 🔴 CORS Error

### Penyebab
Backend tidak mengizinkan origin frontend

### Solusi
Update backend CORS settings:
```typescript
app.enableCors({
  origin: 'http://localhost:3000', // atau origin frontend Anda
  credentials: true,
});
```

## 🔴 Network Error

### Penyebab
- Backend server tidak running
- URL API salah
- Network connectivity issue

### Solusi
1. Pastikan backend server running
2. Check `NEXT_PUBLIC_API_BASE_URL` di `.env.local`
3. Test koneksi ke backend

## 📋 Checklist untuk Upload File

Sebelum upload file, pastikan:

- [ ] User sudah login
- [ ] Token valid (tidak expired)
- [ ] Folder dipilih (folderId tidak null)
- [ ] User punya permission `can_create` di folder tersebut
- [ ] Permission belum expired (jika ada expiration date)
- [ ] Backend server running
- [ ] CORS sudah dikonfigurasi dengan benar

## 🛠️ Debug Commands

### Check Token
```javascript
// Di browser console
localStorage.getItem('token')
```

### Check User Info
```javascript
// Di browser console
JSON.parse(localStorage.getItem('user'))
```

### Test API Endpoint
```bash
# Test upload dengan curl
curl -X POST http://localhost:3000/api/files/upload/<folder-id> \
  -H "Authorization: Bearer <token>" \
  -F "file=@/path/to/file.pdf"
```

## 💡 Tips

1. **Gunakan Browser DevTools**
   - Network tab untuk melihat request/response
   - Console untuk error messages
   - Application tab untuk check localStorage

2. **Test dengan Postman**
   - Gunakan Postman collection untuk test API
   - Compare request headers dengan frontend

3. **Check Backend Logs**
   - Lihat backend console untuk error details
   - Check permission validation logic

4. **Verify Permission**
   - Gunakan admin view untuk check semua folders
   - Check permissions di halaman Permissions

---

**Jika masalah masih terjadi, check:**
1. Backend logs untuk detail error
2. Network tab untuk request/response details
3. Browser console untuk frontend errors


