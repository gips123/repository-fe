# Frontend Integration Guide

Dokumentasi lengkap untuk integrasi frontend dengan Campus Repository System Backend API.

## Base URL

```
http://localhost:3000/api
```

Production: Ganti dengan URL production server Anda.

---

## Authentication Flow

### 1. Login

**Endpoint:** `POST /api/auth/login`

**Request:**
```typescript
{
  email: string;
  password: string;
}
```

**Response:**
```typescript
{
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: {
      id: string;
      name: string;
      description: string;
    }
  }
}
```

**Example:**
```typescript
const response = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const data = await response.json();
localStorage.setItem('token', data.access_token);
localStorage.setItem('user', JSON.stringify(data.user));
```

### 2. Using Token

Setelah login, simpan token dan gunakan di setiap request:

```typescript
const token = localStorage.getItem('token');

fetch('http://localhost:3000/api/users/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### 3. Logout

Hapus token dari storage:

```typescript
localStorage.removeItem('token');
localStorage.removeItem('user');
```

---

## TypeScript Interfaces

```typescript
// User Types
interface User {
  id: string;
  email: string;
  name: string;
  role_id: string;
  role: Role;
  created_at: string;
  updated_at: string;
}

interface Role {
  id: string;
  name: 'admin' | 'wd1' | 'wd2' | 'wd3' | 'dosen' | 'tendik';
  description: string;
}

// Folder Types
interface Folder {
  id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  parent?: Folder;
  children?: Folder[];
}

interface FolderTreeNode extends Folder {
  children?: FolderTreeNode[];
}

// File Types
interface File {
  id: string;
  name: string;
  path: string;
  mime_type: string;
  size: number;
  folder_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  folder?: Folder;
}

// Permission Types
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
  created_at: string;
  updated_at: string;
  folder?: Folder;
  user?: User | null;
  role?: Role | null;
}

// API Response Types
interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Error Response
interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
}
```

---

## API Client Example (TypeScript/React)

```typescript
// api/client.ts
const API_BASE_URL = 'http://localhost:3000/api';

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string) {
    return this.request<{
      access_token: string;
      user: User;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Users
  async getProfile(): Promise<User> {
    return this.request<User>('/users/profile');
  }

  async getUserRole() {
    return this.request<{ role: Role; role_id: string }>('/users/role');
  }

  async getUsers(page = 1, limit = 10) {
    return this.request<PaginatedResponse<User>>(
      `/users?page=${page}&limit=${limit}`
    );
  }

  async createUser(userData: {
    email: string;
    password: string;
    name: string;
    role_id?: string;
  }) {
    return this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, userData: Partial<{
    name: string;
    password: string;
    role_id: string;
  }>) {
    return this.request<User>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string) {
    return this.request<{ message: string }>(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Folders
  async getFolderTree(): Promise<FolderTreeNode[]> {
    return this.request<FolderTreeNode[]>('/folders/tree');
  }

  async getFolders(): Promise<Folder[]> {
    return this.request<Folder[]>('/folders');
  }

  async getFolder(id: string): Promise<Folder> {
    return this.request<Folder>(`/folders/${id}`);
  }

  async createFolder(data: { name: string; parent_id?: string | null }) {
    return this.request<Folder>('/folders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateFolder(id: string, data: { name?: string }) {
    return this.request<Folder>(`/folders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteFolder(id: string) {
    return this.request<{ message: string }>(`/folders/${id}`, {
      method: 'DELETE',
    });
  }

  // Files
  async uploadFile(folderId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const token = this.getToken();
    const response = await fetch(
      `${API_BASE_URL}/files/upload/${folderId}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Upload failed');
    }

    return response.json();
  }

  async getFiles(folderId: string): Promise<File[]> {
    return this.request<File[]>(`/files/folder/${folderId}`);
  }

  async getFile(id: string): Promise<File> {
    return this.request<File>(`/files/${id}`);
  }

  async downloadFile(id: string): Promise<Blob> {
    const token = this.getToken();
    const response = await fetch(
      `${API_BASE_URL}/files/${id}/download`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Download failed');
    }

    return response.blob();
  }

  async deleteFile(id: string) {
    return this.request<{ message: string }>(`/files/${id}`, {
      method: 'DELETE',
    });
  }

  // Permissions (Admin only)
  async getPermissions(folderId?: string): Promise<FolderPermission[]> {
    const query = folderId ? `?folderId=${folderId}` : '';
    return this.request<FolderPermission[]>(`/permissions${query}`);
  }

  async createPermission(data: {
    folder_id: string;
    user_id?: string | null;
    role_id?: string | null;
    can_read?: boolean;
    can_create?: boolean;
    can_update?: boolean;
    can_delete?: boolean;
    expires_at?: string | null;
  }) {
    return this.request<FolderPermission>('/permissions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePermission(
    id: string,
    data: Partial<{
      can_read: boolean;
      can_create: boolean;
      can_update: boolean;
      can_delete: boolean;
      expires_at: string | null;
    }>
  ) {
    return this.request<FolderPermission>(`/permissions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deletePermission(id: string) {
    return this.request<{ message: string }>(`/permissions/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();
```

---

## React Hooks Example

```typescript
// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      // Verify token is still valid
      apiClient.getProfile()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiClient.login(email, password);
    localStorage.setItem('token', response.access_token);
    localStorage.setItem('user', JSON.stringify(response.user));
    setUser(response.user);
    return response;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return { user, loading, login, logout };
}

// hooks/useFolders.ts
import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';

export function useFolders() {
  const [folders, setFolders] = useState<FolderTreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFolders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getFolderTree();
      setFolders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch folders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  const createFolder = async (name: string, parentId?: string) => {
    try {
      const newFolder = await apiClient.createFolder({
        name,
        parent_id: parentId || null,
      });
      await fetchFolders(); // Refresh tree
      return newFolder;
    } catch (err) {
      throw err;
    }
  };

  const deleteFolder = async (id: string) => {
    try {
      await apiClient.deleteFolder(id);
      await fetchFolders(); // Refresh tree
    } catch (err) {
      throw err;
    }
  };

  return {
    folders,
    loading,
    error,
    createFolder,
    deleteFolder,
    refresh: fetchFolders,
  };
}

// hooks/useFiles.ts
import { useState } from 'react';
import { apiClient } from '../api/client';

export function useFiles(folderId: string) {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getFiles(folderId);
      setFiles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch files');
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file: File) => {
    try {
      setLoading(true);
      const newFile = await apiClient.uploadFile(folderId, file);
      await fetchFiles(); // Refresh list
      return newFile;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteFile = async (id: string) => {
    try {
      await apiClient.deleteFile(id);
      await fetchFiles(); // Refresh list
    } catch (err) {
      throw err;
    }
  };

  const downloadFile = async (id: string, filename: string) => {
    try {
      const blob = await apiClient.downloadFile(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      throw err;
    }
  };

  return {
    files,
    loading,
    error,
    fetchFiles,
    uploadFile,
    deleteFile,
    downloadFile,
  };
}
```

---

## React Component Examples

### Login Component

```typescript
// components/Login.tsx
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(email, password);
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      {error && <div className="error">{error}</div>}
      <button type="submit">Login</button>
    </form>
  );
}
```

### Folder Tree Component

```typescript
// components/FolderTree.tsx
import { useFolders } from '../hooks/useFolders';
import { FolderTreeNode } from '../types';

function FolderItem({ folder }: { folder: FolderTreeNode }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <div onClick={() => setExpanded(!expanded)}>
        {folder.children && folder.children.length > 0 && (
          <span>{expanded ? '▼' : '▶'}</span>
        )}
        <span>{folder.name}</span>
      </div>
      {expanded && folder.children && (
        <div style={{ marginLeft: '20px' }}>
          {folder.children.map((child) => (
            <FolderItem key={child.id} folder={child} />
          ))}
        </div>
      )}
    </div>
  );
}

export function FolderTree() {
  const { folders, loading, error } = useFolders();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {folders.map((folder) => (
        <FolderItem key={folder.id} folder={folder} />
      ))}
    </div>
  );
}
```

### File Upload Component

```typescript
// components/FileUpload.tsx
import { useState } from 'react';
import { useFiles } from '../hooks/useFiles';

export function FileUpload({ folderId }: { folderId: string }) {
  const [uploading, setUploading] = useState(false);
  const { uploadFile } = useFiles(folderId);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      await uploadFile(file);
      alert('File uploaded successfully');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={handleFileChange}
        disabled={uploading}
      />
      {uploading && <span>Uploading...</span>}
    </div>
  );
}
```

---

## Error Handling

```typescript
// utils/errorHandler.ts
export function handleApiError(error: unknown): string {
  if (error instanceof Error) {
    // Check if it's a network error
    if (error.message.includes('fetch')) {
      return 'Network error. Please check your connection.';
    }
    return error.message;
  }
  
  if (typeof error === 'object' && error !== null) {
    const apiError = error as { message?: string | string[] };
    if (apiError.message) {
      if (Array.isArray(apiError.message)) {
        return apiError.message.join(', ');
      }
      return apiError.message;
    }
  }
  
  return 'An unexpected error occurred';
}

// Usage
try {
  await apiClient.createFolder({ name: 'New Folder' });
} catch (error) {
  const message = handleApiError(error);
  console.error(message);
  // Show to user
}
```

---

## Axios Alternative

Jika menggunakan Axios:

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired, logout
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Usage
const folders = await api.get('/folders/tree');
const newFolder = await api.post('/folders', { name: 'New Folder' });
```

---

## Important Notes

1. **Token Storage**: Simpan token di `localStorage` atau `sessionStorage`
2. **Token Expiry**: Token berlaku 24 jam (default), handle 401 errors
3. **File Upload**: Gunakan `FormData`, jangan JSON
4. **CORS**: Pastikan backend mengizinkan origin frontend Anda
5. **Error Messages**: Backend mengembalikan array untuk validation errors
6. **Permissions**: Check permission sebelum show/hide UI elements
7. **Tree Structure**: Folder tree sudah dalam format recursive, siap untuk render

---

## Environment Variables

```typescript
// .env
VITE_API_BASE_URL=http://localhost:3000/api
// atau
REACT_APP_API_BASE_URL=http://localhost:3000/api
```

```typescript
// config.ts
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
```

---

## Testing API

Gunakan tools seperti:
- Postman
- Insomnia
- Thunder Client (VS Code)
- curl

Contoh curl:
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Get folders tree
curl -X GET http://localhost:3000/api/folders/tree \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Support

Untuk pertanyaan atau issues, hubungi backend team atau lihat dokumentasi API lengkap di `API.md`.

