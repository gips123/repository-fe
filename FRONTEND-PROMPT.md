# Prompt untuk Frontend Developer

Copy prompt ini dan kirim ke frontend developer atau AI assistant untuk integrasi:

---

## PROMPT: Integrasi Frontend dengan Campus Repository Backend API

Saya membutuhkan bantuan untuk membuat frontend application yang terintegrasi dengan backend API Campus Repository System. Berikut detailnya:

### Backend API Information

**Base URL:** `http://localhost:3000/api`

**Authentication:** JWT Bearer Token
- Login endpoint: `POST /api/auth/login`
- Setelah login, simpan token dan gunakan di header: `Authorization: Bearer <token>`
- Token berlaku 24 jam

### Main Features yang Perlu Diimplementasikan:

1. **Authentication**
   - Login page dengan email & password
   - Token management (simpan di localStorage)
   - Auto logout jika token expired (401 error)
   - Protected routes

2. **Dashboard/Home**
   - Tampilkan folder tree di sidebar (recursive/hierarchical)
   - Hanya tampilkan folder yang user punya READ permission
   - Endpoint: `GET /api/folders/tree` (sudah dalam format tree)

3. **Folder Management**
   - Create folder (dengan parent_id support)
   - Rename folder
   - Delete folder
   - Navigate folder (click folder untuk lihat isinya)
   - Permission check: hanya show actions jika user punya permission

4. **File Management**
   - Upload file ke folder (drag & drop atau file picker)
   - List files dalam folder
   - Download file
   - Delete file
   - Show file info (name, size, mime type, upload date)

5. **User Management (Admin Only)**
   - List users (pagination)
   - Create user
   - Update user
   - Delete user
   - Assign role ke user

6. **Permission Management (Admin Only)**
   - Assign permission ke folder (role atau user)
   - Set permissions: read, create, update, delete
   - Set expiration date (optional)

### API Endpoints Summary:

**Auth:**
- `POST /api/auth/login` - Login

**Users:**
- `GET /api/users/profile` - Get current user
- `GET /api/users/role` - Get user role
- `GET /api/users` - List users (admin)
- `POST /api/users` - Create user (admin)
- `PATCH /api/users/:id` - Update user (admin)
- `DELETE /api/users/:id` - Delete user (admin)

**Folders:**
- `GET /api/folders/tree` - Get folder tree (recursive)
- `GET /api/folders` - List accessible folders
- `GET /api/folders/:id` - Get folder details
- `POST /api/folders` - Create folder
- `PATCH /api/folders/:id` - Update folder
- `DELETE /api/folders/:id` - Delete folder

**Files:**
- `POST /api/files/upload/:folderId` - Upload file (multipart/form-data)
- `GET /api/files/folder/:folderId` - List files in folder
- `GET /api/files/:id` - Get file details
- `GET /api/files/:id/download` - Download file
- `DELETE /api/files/:id` - Delete file

**Permissions:**
- `GET /api/permissions` - List permissions (admin)
- `POST /api/permissions` - Create permission (admin)
- `PATCH /api/permissions/:id` - Update permission (admin)
- `DELETE /api/permissions/:id` - Delete permission (admin)

### Technical Requirements:

1. **Tech Stack (pilih salah satu):**
   - React + TypeScript + Vite
   - Next.js + TypeScript
   - Vue 3 + TypeScript + Vite
   - Atau framework lain sesuai preferensi

2. **State Management:**
   - React Query / TanStack Query untuk API calls
   - Zustand / Redux untuk global state (optional)
   - Context API untuk auth state

3. **UI Library (optional):**
   - Tailwind CSS
   - Material UI
   - Ant Design
   - Shadcn/ui
   - Atau custom CSS

4. **File Structure:**
   ```
   src/
   ├── api/          # API client & types
   ├── components/   # React components
   ├── hooks/        # Custom hooks
   ├── pages/        # Page components
   ├── utils/        # Utilities
   └── types/        # TypeScript types
   ```

5. **Features:**
   - Responsive design (mobile-friendly)
   - Loading states
   - Error handling dengan user-friendly messages
   - Form validation
   - File upload progress indicator
   - Folder tree dengan expand/collapse
   - Breadcrumb navigation

### TypeScript Interfaces yang Dibutuhkan:

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role_id: string;
  role: Role;
}

interface Role {
  id: string;
  name: 'admin' | 'wd1' | 'wd2' | 'wd3' | 'dosen' | 'tendik';
  description: string;
}

interface Folder {
  id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  children?: Folder[];
}

interface File {
  id: string;
  name: string;
  path: string;
  mime_type: string;
  size: number;
  folder_id: string;
  created_at: string;
}

interface FolderPermission {
  id: string;
  folder_id: string;
  user_id: string | null;
  role_id: string | null;
  can_read: boolean;
  can_create: boolean;
  can_update: boolean;
  can_delete: boolean;
  expires_at: string | null;
}
```

### Error Handling:

Backend mengembalikan error dalam format:
```typescript
{
  statusCode: number;
  message: string | string[];  // Array untuk validation errors
  error: string;
}
```

Common status codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (no permission)
- `404` - Not Found
- `409` - Conflict (duplicate)

### Special Notes:

1. **Folder Tree**: Endpoint `/api/folders/tree` sudah return dalam format recursive tree, langsung bisa di-render
2. **Permissions**: Check permission sebelum show/hide UI buttons/actions
3. **File Upload**: Gunakan `FormData` untuk upload, bukan JSON
4. **Token**: Simpan di localStorage, refresh jika 401
5. **CORS**: Backend sudah support CORS, pastikan origin frontend di-allow

### Design Requirements:

1. **Layout:**
   - Sidebar kiri: Folder tree
   - Main content: Files list atau folder contents
   - Top bar: User info, logout button
   - Breadcrumb untuk navigation

2. **Folder Tree:**
   - Expandable/collapsible
   - Show folder icon
   - Highlight current folder
   - Context menu (right-click) untuk actions

3. **File List:**
   - Grid atau list view
   - Show file icon based on mime type
   - File size format (KB, MB, GB)
   - Upload date
   - Actions: download, delete

4. **Upload:**
   - Drag & drop area
   - Progress bar
   - Multiple file upload support
   - File type validation (optional)

### Deliverables:

1. Complete frontend application dengan semua features
2. Clean, readable, maintainable code
3. TypeScript types untuk semua API responses
4. Error handling yang proper
5. Loading states
6. Responsive design
7. README dengan setup instructions

### Questions/Clarifications:

Jika ada yang kurang jelas, silakan tanyakan. Dokumentasi lengkap ada di file `FRONTEND-INTEGRATION.md` dan `API.md`.

---

**Silakan buatkan frontend application sesuai requirements di atas. Gunakan best practices dan modern patterns.**

