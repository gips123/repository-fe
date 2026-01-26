'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { PermissionManagement } from '@/components/PermissionManagement';

function PermissionsContent() {
  return <PermissionManagement />;
}

export default function PermissionsPage() {
  return (
    <ProtectedRoute requireAdmin>
      <PermissionsContent />
    </ProtectedRoute>
  );
}


