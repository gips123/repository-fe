// Role Types
export interface Role {
  id: string;
  name: string;
  description: string;
  is_admin: boolean;
  is_active: boolean;
  is_system: boolean;
  category: string | null;
  color: string | null;
  max_folder_depth?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  role: Role;
  is_primary: boolean;
  assigned_at: string;
  expires_at: string | null;
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  role_id: string;
  role: Role;
  roles?: UserRole[];
  max_folder_depth?: number | null;
  created_at: string;
  updated_at: string;
}

// Folder Types
export interface Folder {
  id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  parent?: Folder;
  children?: Folder[];
  owner?: User;
  owner_id?: string;
  owner_name?: string;
  owner_role?: string;
  permissions?: FolderPermission[];
}

export interface FolderTreeNode extends Folder {
  children?: FolderTreeNode[];
}

// File Types
export interface File {
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
  owner_id?: string;
  owner_name?: string;
  owner_email?: string;
  owner_role?: string;
  can_read?: boolean;
  can_download?: boolean;
  can_create?: boolean;
  can_update?: boolean;
  can_delete?: boolean;
}

// Permission Types
export interface FolderPermission {
  id: string;
  folder_id: string;
  user_id: string | null;
  role_id: string | null;
  can_read: boolean;
  can_create: boolean;
  can_update: boolean;
  can_delete: boolean;
  can_download?: boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  folder?: Folder;
  user?: User | null;
  role?: Role | null;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Error Response
export interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
}

// Login Response
export interface LoginResponse {
  access_token: string;
  user: User;
}

// Role assignment payload
export interface AssignRolePayload {
  role_id: string;
  is_primary?: boolean;
  expires_at?: string | null;
}

// Switch role response
export interface SwitchRoleResponse {
  access_token?: string;
  user: User;
  active_role: Role;
}
