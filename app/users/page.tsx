'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { UserManagement } from '@/components/UserManagement';

function UsersContent() {
  return <UserManagement />;
}

export default function UsersPage() {
  return (
    <ProtectedRoute requireAdmin>
      <UsersContent />
    </ProtectedRoute>
  );
}


