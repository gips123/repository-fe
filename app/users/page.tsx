'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { UserManagement } from '@/app/users/components/UserManagement';

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


