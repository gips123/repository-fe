# Admin Workflow - Campus Repository System

Panduan lengkap alur kerja Admin untuk mengelola folder dan permissions.

## 🎯 Konsep Dasar

1. **Folder bisa dibuat tanpa permission** - Admin bisa create folder kapan saja
2. **Folder tanpa permission tidak muncul di tree** - User biasa hanya lihat folder yang punya permission
3. **Admin perlu assign permission** - Setelah create folder, admin assign permission ke role/user
4. **Setelah permission di-assign** - Folder baru muncul di tree untuk user/role yang punya permission

## 📋 Alur Lengkap Admin

### Step 1: Login sebagai Admin

```bash
POST /api/auth/login
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "admin@example.com",
    "role": {
      "name": "admin"
    }
  }
}
```

### Step 2: Lihat Semua Roles (Optional)

Untuk mengetahui role_id yang akan digunakan:

```bash
GET /api/roles
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": "uuid-1",
    "name": "admin",
    "description": "Administrator with full access"
  },
  {
    "id": "uuid-2",
    "name": "dosen",
    "description": "Dosen/Lecturer"
  },
  {
    "id": "uuid-3",
    "name": "tendik",
    "description": "Tenaga Kependidikan/Staff"
  },
  {
    "id": "uuid-4",
    "name": "wd1",
    "description": "Wakil Dekan 1"
  },
  {
    "id": "uuid-5",
    "name": "wd2",
    "description": "Wakil Dekan 2"
  },
  {
    "id": "uuid-6",
    "name": "wd3",
    "description": "Wakil Dekan 3"
  }
]
```

**Simpan role_id** yang akan digunakan (misalnya dosen: `uuid-2`)

### Step 3: Create Folder

Admin bisa create folder tanpa permission check (khusus root folder):

```bash
POST /api/folders
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Internal",
  "parent_id": null
}
```

**Response:**
```json
{
  "id": "folder-uuid-123",
  "name": "Internal",
  "parent_id": null,
  "created_at": "2024-01-26T...",
  "updated_at": "2024-01-26T..."
}
```

**⚠️ Catatan:** Folder ini belum muncul di tree karena belum ada permission!

### Step 4: Lihat Semua Folder (Admin Only)

Untuk melihat folder yang baru dibuat (termasuk yang belum ada permission):

```bash
GET /api/folders/admin/all
Authorization: Bearer <token>
```

**Atau lihat tree lengkap:**

```bash
GET /api/folders/admin/tree
Authorization: Bearer <token>
```

Ini akan menampilkan **SEMUA folder**, termasuk yang belum ada permission.

### Step 5: Assign Permission ke Folder

Setelah folder dibuat, assign permission ke role atau user:

#### A. Assign ke Role (Semua user dengan role tersebut)

```bash
POST /api/permissions
Authorization: Bearer <token>
Content-Type: application/json

{
  "folder_id": "folder-uuid-123",
  "role_id": "uuid-2",
  "can_read": true,
  "can_create": true,
  "can_update": false,
  "can_delete": false,
  "expires_at": null
}
```

**Response:**
```json
{
  "id": "permission-uuid",
  "folder_id": "folder-uuid-123",
  "role_id": "uuid-2",
  "user_id": null,
  "can_read": true,
  "can_create": true,
  "can_update": false,
  "can_delete": false,
  "expires_at": null
}
```

#### B. Assign ke User Spesifik

```bash
POST /api/permissions
Authorization: Bearer <token>
Content-Type: application/json

{
  "folder_id": "folder-uuid-123",
  "user_id": "user-uuid-456",
  "can_read": true,
  "can_create": true,
  "can_update": true,
  "can_delete": true,
  "expires_at": "2024-12-31T23:59:59.000Z"
}
```

### Step 6: Verifikasi

Setelah permission di-assign, folder akan muncul di tree untuk user/role yang punya permission:

```bash
# Login sebagai user dengan role dosen
POST /api/auth/login
{
  "email": "dosen@example.com",
  "password": "dosen123"
}

# Lihat folder tree
GET /api/folders/tree
Authorization: Bearer <token-dosen>
```

Folder "Internal" sekarang akan muncul!

## 🔄 Workflow Diagram

```
1. Admin Login
   ↓
2. Create Folder (tanpa permission)
   ↓
3. Folder dibuat di database (tapi belum muncul di tree)
   ↓
4. Admin assign permission ke role/user
   ↓
5. Permission tersimpan
   ↓
6. User dengan permission bisa lihat folder di tree
```

## 📝 Contoh Lengkap

### Scenario: Buat folder "Internal" untuk role "dosen"

```bash
# 1. Login
POST /api/auth/login
Body: {"email": "admin@example.com", "password": "admin123"}
→ Simpan token

# 2. Get role_id untuk "dosen"
GET /api/roles
→ Cari role dengan name "dosen", copy id-nya (misal: "abc-123")

# 3. Create folder
POST /api/folders
Body: {"name": "Internal", "parent_id": null}
→ Simpan folder_id (misal: "folder-xyz")

# 4. Assign permission
POST /api/permissions
Body: {
  "folder_id": "folder-xyz",
  "role_id": "abc-123",
  "can_read": true,
  "can_create": true,
  "can_update": false,
  "can_delete": false
}

# 5. Test - Login sebagai dosen
POST /api/auth/login
Body: {"email": "dosen@example.com", "password": "dosen123"}

# 6. Lihat tree
GET /api/folders/tree
→ Folder "Internal" sekarang muncul!
```

## 🎯 Endpoint Khusus Admin

### 1. Lihat Semua Folder (Termasuk yang belum ada permission)

```bash
GET /api/folders/admin/all
```

### 2. Lihat Tree Semua Folder

```bash
GET /api/folders/admin/tree
```

### 3. List Semua Roles

```bash
GET /api/roles
```

### 4. List Semua Users

```bash
GET /api/users?page=1&limit=10
```

### 5. Create Permission

```bash
POST /api/permissions
```

## ⚠️ Troubleshooting

### Folder tidak muncul setelah create?

**Penyebab:** Folder belum ada permission

**Solusi:**
1. Assign permission ke role/user
2. Pastikan permission `can_read: true`
3. Check expiration date (jika ada)

### Tidak bisa create folder?

**Penyebab:** 
- Jika root folder (`parent_id: null`): Admin bisa create tanpa permission
- Jika subfolder: Perlu permission `can_create` di parent folder

**Solusi:**
- Untuk root folder: Pastikan login sebagai admin
- Untuk subfolder: Assign permission `can_create` dulu ke parent folder

### Permission tidak bekerja?

**Check:**
1. Permission sudah di-assign? → `GET /api/permissions?folderId=xxx`
2. User punya role yang benar? → `GET /api/users/role`
3. Permission belum expired? → Check `expires_at`
4. Permission `can_read: true`? → Check permission details

## 💡 Tips

1. **Gunakan `/api/folders/admin/tree`** untuk melihat semua folder saat setup
2. **Simpan folder_id** setelah create folder untuk assign permission
3. **Simpan role_id** dari `/api/roles` untuk assign permission ke role
4. **Test dengan user berbeda** setelah assign permission
5. **Gunakan Postman collection** untuk memudahkan testing

## 📚 Related Endpoints

- `GET /api/folders/tree` - Tree folder yang accessible (user biasa)
- `GET /api/folders/admin/tree` - Tree semua folder (admin only)
- `GET /api/folders` - List folder accessible
- `GET /api/folders/admin/all` - List semua folder (admin only)
- `POST /api/folders` - Create folder
- `POST /api/permissions` - Assign permission (admin only)
- `GET /api/permissions` - List permissions (admin only)

---

**Selamat mengelola repository! 🚀**

