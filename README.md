# Campus Repository System - Frontend

Frontend application untuk Campus Repository System yang terintegrasi dengan backend NestJS API.

## Tech Stack

- **Next.js 16** - React framework dengan App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Hooks** - State management

## Features

1. **Authentication**
   - Login dengan email & password
   - JWT token management
   - Auto logout jika token expired
   - Protected routes

2. **Dashboard**
   - Folder tree navigation (hierarchical)
   - File management (upload, download, delete)
   - Drag & drop file upload
   - Real-time folder/file updates

3. **Folder Management**
   - Create folder (dengan parent support)
   - Delete folder
   - Navigate folder tree
   - Permission-based access

4. **File Management**
   - Upload files (multiple files support)
   - Download files
   - Delete files
   - File info display (size, type, date)

5. **User Management (Admin Only)**
   - List users dengan pagination
   - Create user
   - Update user
   - Delete user
   - Assign role

6. **Permission Management (Admin Only)**
   - Assign permissions ke folder
   - Set permissions: read, create, update, delete
   - Set expiration date

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy file `env.example` ke `.env.local`:

```bash
cp env.example .env.local
```

Atau buat manual file `.env.local` dengan isi:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

**Note:** Ganti dengan URL backend API Anda jika berbeda.

### 3. Run Development Server

```bash
npm run dev
```

Aplikasi akan berjalan di [http://localhost:3000](http://localhost:3000)

### 4. Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
repository/
├── app/                    # Next.js App Router pages
│   ├── dashboard/          # Dashboard page
│   ├── login/              # Login page
│   ├── users/              # User management (admin)
│   ├── permissions/        # Permission management (admin)
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page (redirect)
├── components/             # React components
│   ├── Login.tsx
│   ├── FolderTree.tsx
│   ├── FileList.tsx
│   ├── FileUpload.tsx
│   ├── UserManagement.tsx
│   ├── PermissionManagement.tsx
│   ├── ProtectedRoute.tsx
│   └── Layout.tsx
├── context/                # React Context
│   └── AuthContext.tsx
├── hooks/                  # Custom hooks
│   ├── useAuth.ts
│   ├── useFolders.ts
│   ├── useFiles.ts
│   ├── useUsers.ts
│   └── usePermissions.ts
├── lib/                    # Utilities & API client
│   ├── api/
│   │   └── client.ts       # API client
│   └── utils/
│       ├── errorHandler.ts
│       └── formatters.ts
└── types/                  # TypeScript types
    └── index.ts
```

## API Integration

Frontend terintegrasi dengan backend API di `http://localhost:3000/api` (default).

Semua API calls menggunakan:
- **Base URL**: `NEXT_PUBLIC_API_BASE_URL` dari environment variable
- **Authentication**: JWT Bearer Token (disimpan di localStorage)
- **Error Handling**: Automatic token refresh & error messages

Lihat `FRONTEND-INTEGRATION.md` untuk dokumentasi lengkap API.

## Usage

### Login

1. Buka aplikasi di browser
2. Masukkan email dan password
3. Setelah login, akan redirect ke dashboard

### Dashboard

- **Sidebar kiri**: Folder tree (expandable/collapsible)
- **Main area**: File list dan upload area
- **Top bar**: Navigation menu dan user info

### Create Folder

1. Klik "New Folder" di sidebar
2. Masukkan nama folder
3. Folder akan muncul di tree

### Upload File

1. Pilih folder dari tree
2. Drag & drop file atau klik "Choose Files"
3. File akan terupload dan muncul di list

### User Management (Admin)

1. Klik "Users" di top bar
2. Lihat list users dengan pagination
3. Create/Edit/Delete users

### Permission Management (Admin)

1. Klik "Permissions" di top bar
2. Filter by folder (optional)
3. Create/Delete permissions

## Development

### Code Style

- TypeScript strict mode
- Functional components dengan hooks
- Custom hooks untuk reusable logic
- Error handling dengan user-friendly messages

### Adding New Features

1. **API Endpoint**: Tambah method di `lib/api/client.ts`
2. **Hook**: Buat custom hook di `hooks/` jika perlu
3. **Component**: Buat component di `components/`
4. **Page**: Buat page di `app/` untuk routing

## Troubleshooting

### CORS Error

Pastikan backend mengizinkan origin frontend di CORS settings.

### 401 Unauthorized

Token expired atau invalid. User akan otomatis di-redirect ke login.

### API Connection Error

1. Pastikan backend server running
2. Check `NEXT_PUBLIC_API_BASE_URL` di `.env.local`
3. Check network tab di browser DevTools

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL | `http://localhost:3000/api` |

## License

Private project - Campus Repository System
