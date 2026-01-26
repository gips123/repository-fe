# API Compatibility & Integration Guide

Dokumen ini menjelaskan kompatibilitas frontend dengan backend API berdasarkan Postman collection.

## ✅ Endpoint Compatibility

Semua endpoint di frontend sudah sesuai dengan Postman collection:

### Authentication
- ✅ `POST /api/auth/login` - Login dengan email & password
- ✅ Token disimpan di localStorage sebagai `token`
- ✅ User info disimpan sebagai `user`

### Users
- ✅ `GET /api/users/profile` - Get current user profile
- ✅ `GET /api/users/role` - Get current user role
- ✅ `GET /api/users?page=1&limit=10` - List users dengan pagination
- ✅ `POST /api/users` - Create user (admin only)
- ✅ `PATCH /api/users/:id` - Update user (admin only)
- ✅ `DELETE /api/users/:id` - Delete user (admin only)

### Roles
- ✅ `GET /api/roles` - Get all roles (untuk mendapatkan role UUID)

### Folders
- ✅ `GET /api/folders/tree` - Get folder tree (recursive, permission-based)
- ✅ `GET /api/folders` - List accessible folders
- ✅ `GET /api/folders/:id` - Get folder details
- ✅ `POST /api/folders` - Create folder
- ✅ `PATCH /api/folders/:id` - Update folder
- ✅ `DELETE /api/folders/:id` - Delete folder
- ✅ `GET /api/folders/admin/all` - Get all folders (admin only, including without permissions)
- ✅ `GET /api/folders/admin/tree` - Get all folders tree (admin only, including without permissions)

### Files
- ✅ `POST /api/files/upload/:folderId` - Upload file (multipart/form-data)
- ✅ `GET /api/files/folder/:folderId` - List files in folder
- ✅ `GET /api/files/:id` - Get file details
- ✅ `GET /api/files/:id/download` - Download file
- ✅ `DELETE /api/files/:id` - Delete file

### Permissions
- ✅ `GET /api/permissions?folderId=xxx` - List permissions (admin)
- ✅ `POST /api/permissions` - Create permission (admin)
- ✅ `PATCH /api/permissions/:id` - Update permission (admin)
- ✅ `DELETE /api/permissions/:id` - Delete permission (admin)

## 🔧 Improvements Made

### 1. Enhanced Error Handling
- Proper handling untuk JSON dan non-JSON error responses
- Automatic token cleanup pada 401 errors
- Better error messages dengan status codes

### 2. FormData Upload
- Correct handling untuk file upload tanpa Content-Type header
- Browser akan otomatis set boundary untuk multipart/form-data

### 3. Response Handling
- Support untuk empty responses (204 No Content)
- Proper JSON parsing dengan fallback
- Handle berbagai content types

### 4. Authentication
- Bearer token di setiap request
- Automatic redirect ke login pada 401
- Token validation sebelum requests

### 5. Logging
- Development mode logging untuk debugging
- Error logging untuk troubleshooting

## 📋 Request/Response Format

### Login Request
```typescript
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

### Login Response
```typescript
{
  "access_token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "name": "Admin User",
    "role": {
      "id": "uuid",
      "name": "admin",
      "description": "Administrator"
    }
  }
}
```

### Authenticated Request
```typescript
GET /api/folders/tree
Authorization: Bearer jwt_token_here
```

### File Upload
```typescript
POST /api/files/upload/:folderId
Authorization: Bearer jwt_token_here
Content-Type: multipart/form-data (auto-set by browser)

FormData:
  file: [File object]
```

## 🐛 Troubleshooting

### CORS Errors
Jika mendapat CORS error, pastikan backend mengizinkan origin frontend:
```typescript
// Backend CORS config
app.enableCors({
  origin: 'http://localhost:3000', // atau origin frontend Anda
  credentials: true,
});
```

### 401 Unauthorized
- Token expired atau invalid
- Frontend akan otomatis clear token dan redirect ke login
- Check browser console untuk detail error

### Network Errors
- Pastikan backend server running
- Check `NEXT_PUBLIC_API_BASE_URL` di `.env.local`
- Verify network connectivity

### File Upload Issues
- Pastikan folder memiliki CREATE permission
- Check file size limits di backend
- Verify file type restrictions (jika ada)

## 🔍 Debugging

### Enable API Logging
API logging otomatis aktif di development mode. Check browser console untuk:
- Request URLs dan methods
- Error messages dan status codes
- Response data

### Browser DevTools
1. Open Network tab
2. Filter by "api" atau "localhost:3000"
3. Check request headers (Authorization, Content-Type)
4. Check response status dan body

### Common Issues

**Issue:** Request fails dengan 401
**Solution:** Token expired, login ulang

**Issue:** File upload fails
**Solution:** 
- Check folder permissions
- Verify file size tidak melebihi limit
- Check Content-Type header (seharusnya multipart/form-data)

**Issue:** CORS error
**Solution:** Update backend CORS settings untuk allow frontend origin

## 📝 Environment Variables

Pastikan `.env.local` sudah di-set dengan benar:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

Ganti dengan URL production saat deploy:
```env
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api
```

## ✅ Testing Checklist

- [ ] Login berhasil dan token tersimpan
- [ ] Folder tree bisa di-load
- [ ] Create folder berhasil
- [ ] Upload file berhasil
- [ ] Download file berhasil
- [ ] Delete file/folder berhasil
- [ ] User management (admin) berfungsi
- [ ] Permission management (admin) berfungsi
- [ ] Error handling bekerja dengan baik
- [ ] Auto logout pada token expired

## 🚀 Next Steps

1. Test semua endpoints dengan Postman collection
2. Verify response format sesuai dengan types di frontend
3. Test error scenarios (401, 403, 404, 500)
4. Test file upload dengan berbagai file types dan sizes
5. Verify permission-based access control

