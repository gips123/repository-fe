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
    return roles.find(role => role.name === name);
  }, [roles]);

  return {
    roles,
    loading,
    error,
    fetchRoles,
    getRoleById,
    getRoleByName,
  };
}


