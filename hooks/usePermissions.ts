'use client';

import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api/client';
import type { FolderPermission } from '@/types';

export function usePermissions() {
  const [permissions, setPermissions] = useState<FolderPermission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = useCallback(async (folderId?: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getPermissions(folderId);
      setPermissions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch permissions');
    } finally {
      setLoading(false);
    }
  }, []);

  const createPermission = useCallback(async (data: {
    folder_id: string;
    user_id?: string | null;
    role_id?: string | null;
    can_read?: boolean;
    can_create?: boolean;
    can_update?: boolean;
    can_delete?: boolean;
    expires_at?: string | null;
  }) => {
    try {
      const newPermission = await apiClient.createPermission(data);
      return newPermission;
    } catch (err) {
      throw err;
    }
  }, []);

  const updatePermission = useCallback(async (
    id: string,
    data: Partial<{
      can_read: boolean;
      can_create: boolean;
      can_update: boolean;
      can_delete: boolean;
      expires_at: string | null;
    }>
  ) => {
    try {
      const updatedPermission = await apiClient.updatePermission(id, data);
      return updatedPermission;
    } catch (err) {
      throw err;
    }
  }, []);

  const deletePermission = useCallback(async (id: string) => {
    try {
      await apiClient.deletePermission(id);
    } catch (err) {
      throw err;
    }
  }, []);

  return {
    permissions,
    loading,
    error,
    fetchPermissions,
    createPermission,
    updatePermission,
    deletePermission,
  };
}


