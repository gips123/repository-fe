'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api/client';
import type { Role } from '@/types';

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getRoles();
      setRoles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const getRoleById = useCallback((id: string): Role | undefined => {
    return roles.find(role => role.id === id);
  }, [roles]);

  const getRoleByName = useCallback((name: string): Role | undefined => {
    return roles.find(role => role.name.toLowerCase() === name.toLowerCase());
  }, [roles]);

  const createRole = useCallback(async (data: {
    name: string;
    description?: string;
    is_admin?: boolean;
    category?: string | null;
    color?: string | null;
    max_folder_depth?: number | null;
  }): Promise<Role> => {
    const newRole = await apiClient.createRole(data);
    setRoles(prev => [...prev, newRole]);
    return newRole;
  }, []);

  const updateRole = useCallback(async (id: string, data: Partial<{
    name: string;
    description: string;
    is_admin: boolean;
    is_active: boolean;
    category: string | null;
    color: string | null;
    max_folder_depth: number | null;
  }>): Promise<Role> => {
    const updated = await apiClient.updateRole(id, data);
    setRoles(prev => prev.map(r => r.id === id ? updated : r));
    return updated;
  }, []);

  const deleteRole = useCallback(async (id: string): Promise<void> => {
    await apiClient.deleteRole(id);
    setRoles(prev => prev.filter(r => r.id !== id));
  }, []);

  const toggleRoleActive = useCallback(async (id: string): Promise<Role> => {
    const updated = await apiClient.toggleRoleActive(id);
    setRoles(prev => prev.map(r => r.id === id ? updated : r));
    return updated;
  }, []);

  return {
    roles,
    loading,
    error,
    fetchRoles,
    getRoleById,
    getRoleByName,
    createRole,
    updateRole,
    deleteRole,
    toggleRoleActive,
  };
}
