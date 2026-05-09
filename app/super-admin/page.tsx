'use client';

import { useState } from 'react';
import { Shield, Users } from 'lucide-react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DynamicRoleManager } from '@/app/super-admin/components/DynamicRoleManager';
import { RoleManagement } from '@/app/super-admin/components/RoleManagement';

type Tab = 'roles' | 'assign';

function SuperAdminContent() {
  const [activeTab, setActiveTab] = useState<Tab>('roles');

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Tab Bar */}
      <div className="flex shrink-0 gap-1 border-b border-gray-200 bg-white px-6 pt-4">
        <button
          onClick={() => setActiveTab('roles')}
          className={`flex items-center gap-2 rounded-t-lg border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
            activeTab === 'roles'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Shield className="h-4 w-4" />
          Kelola Role
        </button>
        <button
          onClick={() => setActiveTab('assign')}
          className={`flex items-center gap-2 rounded-t-lg border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
            activeTab === 'assign'
              ? 'border-orange-600 text-orange-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Users className="h-4 w-4" />
          Assign Role ke User
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'roles' ? <DynamicRoleManager /> : <RoleManagement />}
      </div>
    </div>
  );
}

export default function SuperAdminPage() {
  return (
    <ProtectedRoute requireAdmin>
      <SuperAdminContent />
    </ProtectedRoute>
  );
}
