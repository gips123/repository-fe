'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api/client';
import type { User, Role, UserRole } from '@/types';

const ACTIVE_ROLE_KEY = 'active_role';

// Deduplicate role list by role_id; pastikan hanya satu primary (users.role_id)
function deduplicateRoles(roles: UserRole[], user: User): UserRole[] {
  const roleMap = new Map<string, UserRole>();

  for (const ur of roles) {
    if (!roleMap.has(ur.role_id)) {
      roleMap.set(ur.role_id, ur);
    }
  }

  // Pastikan role utama (users.role_id) selalu ada
  if (user.role && !roleMap.has(user.role_id)) {
    roleMap.set(user.role_id, {
      id: `primary-${user.role_id}`,
      user_id: user.id,
      role_id: user.role_id,
      role: user.role,
      is_primary: true,
      assigned_at: user.created_at,
      expires_at: null,
    });
  }

  // Susun: primary di depan, sisanya is_primary = false
  const result: UserRole[] = [];
  const primary = roleMap.get(user.role_id);
  if (primary) result.push({ ...primary, is_primary: true });

  for (const [roleId, ur] of roleMap) {
    if (roleId !== user.role_id) {
      result.push({ ...ur, is_primary: false });
    }
  }

  return result;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  logout: () => void;
  // Multi-role
  activeRole: Role | null;
  allRoles: UserRole[];
  switchRole: (roleId: string) => Promise<void>;
  loadingRoles: boolean;
  // Derived permission flags (dynamic, not hardcoded)
  isAdmin: boolean;
  isSuperAdmin: boolean;
  canCreateFolder: boolean;
  hasRole: (roleName: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, loading, login: baseLogin, logout: baseLogout } = useAuth();
  const [activeRole, setActiveRole] = useState<Role | null>(null);
  const [allRoles, setAllRoles] = useState<UserRole[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  // Load user's roles whenever the user changes
  useEffect(() => {
    if (!user) {
      setAllRoles([]);
      setActiveRole(null);
      return;
    }

    const savedRoleId = typeof window !== 'undefined' ? localStorage.getItem(ACTIVE_ROLE_KEY) : null;

    // Selalu mulai dari role default login
    setActiveRole(user.role ?? null);

    // Selalu fetch fresh dari API — jangan pakai user.roles dari localStorage (bisa stale)
    setLoadingRoles(true);
    apiClient.getMyRoles()
      .then(roles => {
        const clean = deduplicateRoles(roles, user);
        setAllRoles(clean);
        if (savedRoleId) {
          const saved = clean.find(ur => ur.role_id === savedRoleId);
          if (saved) setActiveRole(saved.role);
        }
      })
      .catch(() => {
        // Fallback: hanya role default jika endpoint belum tersedia
        if (user.role) {
          setAllRoles([{
            id: `primary-${user.role_id}`,
            user_id: user.id,
            role_id: user.role_id,
            role: user.role,
            is_primary: true,
            assigned_at: user.created_at,
            expires_at: null,
          }]);
        }
      })
      .finally(() => setLoadingRoles(false));
  }, [user]);

  const switchRole = useCallback(async (roleId: string) => {
    if (!user) return;

    // Optimistically update to the selected role from known roles
    const found = allRoles.find(ur => ur.role_id === roleId);
    if (found) {
      setActiveRole(found.role);
      if (typeof window !== 'undefined') {
        localStorage.setItem(ACTIVE_ROLE_KEY, roleId);
      }
    }

    try {
      const response = await apiClient.switchActiveRole(roleId);
      // If the backend returns a new token (re-issued JWT with new role claim), persist it
      if (response.access_token && typeof window !== 'undefined') {
        localStorage.setItem('token', response.access_token);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      if (response.active_role) {
        setActiveRole(response.active_role);
        if (typeof window !== 'undefined') {
          localStorage.setItem(ACTIVE_ROLE_KEY, response.active_role.id);
        }
      }
    } catch {
      // Backend switch-role not implemented yet — client-side switch still applied above
    }
  }, [user, allRoles]);

  const login = useCallback(async (email: string, password: string) => {
    // Clear stale active role on new login
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ACTIVE_ROLE_KEY);
    }
    return baseLogin(email, password);
  }, [baseLogin]);

  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ACTIVE_ROLE_KEY);
    }
    setActiveRole(null);
    setAllRoles([]);
    baseLogout();
  }, [baseLogout]);

  // Fallback ke nama untuk kompatibilitas mundur dengan backend yang belum mengembalikan is_admin
  const activeRoleName = activeRole?.name?.toLowerCase() ?? '';
  const isAdmin = !!(activeRole?.is_admin) ||
    activeRoleName === 'admin' ||
    activeRoleName === 'super admin' ||
    activeRoleName === 'superadmin';
  const isSuperAdmin = !!(activeRole?.is_admin && activeRole?.is_system) ||
    activeRoleName === 'super admin' ||
    activeRoleName === 'superadmin';

  const hasRole = useCallback((roleName: string): boolean => {
    return allRoles.some(ur => ur.role.name.toLowerCase() === roleName.toLowerCase());
  }, [allRoles]);

  // Admin dan role non-dasar bisa membuat folder
  const canCreateFolder = isAdmin || (
    !!activeRole &&
    activeRoleName !== 'dosen' &&
    activeRoleName !== 'tendik' &&
    !!user
  );

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      activeRole,
      allRoles,
      switchRole,
      loadingRoles,
      isAdmin,
      isSuperAdmin,
      canCreateFolder,
      hasRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
