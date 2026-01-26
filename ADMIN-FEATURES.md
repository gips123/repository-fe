# Admin Features - Frontend Implementation

Dokumentasi fitur admin yang sudah diimplementasikan di frontend sesuai dengan `ADMIN-WORKFLOW.md`.

## ✅ Fitur yang Sudah Diimplementasikan

### 1. Admin View untuk Folder Tree

**Lokasi:** Dashboard → Folder Tree Sidebar

**Fitur:**
- ✅ Checkbox "Admin View (All Folders)" untuk admin
- ✅ Toggle antara user view dan admin view
- ✅ Admin view menampilkan **SEMUA folder** termasuk yang belum ada permission
- ✅ User view hanya menampilkan folder yang punya permission

**Cara Menggunakan:**
1. Login sebagai admin
2. Di sidebar folder tree, centang checkbox "Admin View (All Folders)"
3. Semua folder akan muncul, termasuk yang belum ada permission
4. Uncheck untuk kembali ke user view

### 2. Create Folder (Admin)

**Lokasi:** Dashboard → Folder Tree → "+ New Folder"

**Fitur:**
- ✅ Admin bisa create root folder tanpa permission check
- ✅ Admin bisa create subfolder jika punya permission di parent
- ✅ Folder yang dibuat langsung muncul di admin view
- ✅ Folder baru **TIDAK muncul** di user view sampai permission di-assign

**Workflow:**
1. Admin create folder → Folder dibuat di database
2. Folder muncul di admin view (jika admin mode aktif)
3. Admin assign permission ke role/user
4. Folder baru muncul di user view untuk user/role yang punya permission

### 3. Permission Management

**Lokasi:** Permissions Page (Admin Only)

**Fitur:**
- ✅ Lihat semua permissions
- ✅ Filter by folder
- ✅ Create permission untuk role atau user
- ✅ Set permissions: read, create, update, delete
- ✅ Set expiration date (optional)
- ✅ Delete permission

**Cara Menggunakan:**
1. Buka halaman "Permissions" di top navigation
2. Pilih folder dari dropdown (menampilkan semua folder termasuk tanpa permission)
3. Klik "Create Permission"
4. Pilih role atau user
5. Set permissions yang diinginkan
6. Set expiration date (optional)
7. Save

### 4. User Management

**Lokasi:** Users Page (Admin Only)

**Fitur:**
- ✅ List semua users dengan pagination
- ✅ Create user baru
- ✅ Update user (name, password, role)
- ✅ Delete user
- ✅ Role selection menggunakan UUID dari API

## 🔄 Admin Workflow Lengkap

### Scenario: Buat Folder "Internal" untuk Role "dosen"

1. **Login sebagai Admin**
   - Login dengan credentials admin
   - Redirect ke dashboard

2. **Aktifkan Admin View**
   - Centang checkbox "Admin View (All Folders)" di sidebar
   - Semua folder akan terlihat

3. **Create Folder**
   - Klik "+ New Folder"
   - Masukkan nama: "Internal"
   - Klik "Create"
   - Folder dibuat dan muncul di admin view

4. **Assign Permission**
   - Buka halaman "Permissions"
   - Pilih folder "Internal" dari dropdown
   - Klik "Create Permission"
   - Pilih role "dosen" dari dropdown
   - Set permissions:
     - ✅ Can Read
     - ✅ Can Create
     - ❌ Can Update
     - ❌ Can Delete
   - Klik "Create"

5. **Verifikasi**
   - Uncheck "Admin View" untuk melihat user view
   - Folder "Internal" seharusnya tidak muncul (karena login sebagai admin)
   - Login sebagai user dengan role "dosen"
   - Folder "Internal" sekarang muncul di tree!

## 📋 Endpoint yang Digunakan

### Admin Only Endpoints

```typescript
// Get all folders (including without permissions)
GET /api/folders/admin/all

// Get all folders tree (including without permissions)
GET /api/folders/admin/tree

// Get all roles
GET /api/roles

// Get all users
GET /api/users?page=1&limit=10

// Create permission
POST /api/permissions
```

### Regular Endpoints (Permission-based)

```typescript
// Get accessible folders tree
GET /api/folders/tree

// Get accessible folders
GET /api/folders
```

## 🎯 Perbedaan Admin View vs User View

| Feature | Admin View | User View |
|---------|-----------|-----------|
| **Endpoint** | `/api/folders/admin/tree` | `/api/folders/tree` |
| **Folders Shown** | All folders (with/without permission) | Only folders with permission |
| **Access** | Admin only | All users |
| **Use Case** | Setup, management | Daily use |

## 💡 Tips untuk Admin

1. **Gunakan Admin View saat setup**
   - Lihat semua folder yang sudah dibuat
   - Identifikasi folder yang belum ada permission
   - Assign permission dengan mudah

2. **Workflow yang Efektif**
   ```
   Create Folder → Assign Permission → Test dengan User
   ```

3. **Permission Best Practices**
   - Assign permission ke role untuk multiple users
   - Assign ke user spesifik untuk special access
   - Set expiration date untuk temporary access
   - Review permissions secara berkala

4. **Troubleshooting**
   - Jika folder tidak muncul: Check permission sudah di-assign
   - Jika tidak bisa create: Pastikan login sebagai admin (untuk root folder)
   - Jika permission tidak bekerja: Check role user dan expiration date

## 🔍 Visual Indicators

- **Admin View Active**: Checkbox checked + text "Showing all folders including those without permissions"
- **Empty State**: 
  - Admin view: "No folders found. Create a folder to get started."
  - User view: "No accessible folders. Contact admin for access."

## 📝 Notes

- Admin view hanya tersedia untuk user dengan role "admin"
- Folder yang dibuat tanpa permission hanya muncul di admin view
- Permission harus di-assign setelah create folder agar user bisa akses
- Root folder (`parent_id: null`) bisa dibuat oleh admin tanpa permission check
- Subfolder memerlukan `can_create` permission di parent folder

---

**Selamat mengelola repository! 🚀**


