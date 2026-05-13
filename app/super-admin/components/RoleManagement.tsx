'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Shield, Search, Users, ChevronDown, ChevronUp, UserPlus,
  Eye, EyeOff, Filter, Plus, X, Loader2,
} from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { useRoles } from '@/hooks/useRoles';
import { apiClient } from '@/lib/api/client';
import { handleApiError } from '@/lib/utils/errorHandler';
import type { User, Role, UserRole } from '@/types';
import toast from 'react-hot-toast';

function RoleBadge({ role, small = false }: { role: Role; small?: boolean }) {
  return (
    <span className={`inline-flex items-center rounded-full border border-gray-200 bg-gray-100 px-2.5 py-0.5 font-semibold capitalize text-gray-700 ${small ? 'text-[11px]' : 'text-xs'}`}>
      {role.name}
    </span>
  );
}

export function RoleManagement() {
  const { users, loading, error, fetchUsers, createUser } = useUsers();
  const { roles, loading: rolesLoading } = useRoles();

  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'name' | 'role'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string | null>(null);

  // Multi-role assignment panel
  const [showMultiRolePanel, setShowMultiRolePanel] = useState(false);
  const [multiRoleUser, setMultiRoleUser] = useState<User | null>(null);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loadingUserRoles, setLoadingUserRoles] = useState(false);
  const [addingRoleId, setAddingRoleId] = useState('');
  const [addingRole, setAddingRole] = useState(false);
  const [removingRoleId, setRemovingRoleId] = useState<string | null>(null);

  // Add User Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newUserForm, setNewUserForm] = useState({ name: '', email: '', password: '', role_id: '' });

  useEffect(() => { fetchUsers(page, 50); }, [page, fetchUsers]);

  const filteredUsers = useMemo(() => {
    if (!users?.data) return [];
    let result = users.data;
    if (selectedRoleFilter) result = result.filter(u => (u.role?.name || '') === selectedRoleFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role?.name?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [users, searchQuery, selectedRoleFilter]);

  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      const cmp = sortField === 'name'
        ? a.name.localeCompare(b.name)
        : (a.role?.name || '').localeCompare(b.role?.name || '');
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filteredUsers, sortField, sortDir]);

  const roleStats = useMemo(() => {
    if (!users?.data) return [];
    const counts: Record<string, number> = {};
    users.data.forEach(u => {
      const name = u.role?.name || 'unknown';
      counts[name] = (counts[name] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [users]);

  const toggleSort = (field: 'name' | 'role') => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const SortIcon = ({ field }: { field: 'name' | 'role' }) => {
    if (sortField !== field) return <ChevronDown className="ml-1 h-3 w-3 opacity-30" />;
    return sortDir === 'asc' ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />;
  };

  // ─── Multi-role panel ────────────────────────────────────────────────────
  const openMultiRolePanel = useCallback(async (user: User) => {
    setMultiRoleUser(user);
    setShowMultiRolePanel(true);
    setLoadingUserRoles(true);
    try {
      // Fetch fresh dari API
      const data = await apiClient.getUserRoles(user.id);
      // Deduplicate dan pastikan primary selalu ada
      const seen = new Set<string>();
      const deduped = data.filter(ur => {
        if (!ur?.role_id || seen.has(ur.role_id)) return false;
        seen.add(ur.role_id);
        return true;
      });
      setUserRoles(deduped);
    } catch {
      // Fallback: pakai user.roles dari tabel jika tersedia, atau hanya role default
      const fallback = user.roles && user.roles.length > 0
        ? user.roles
        : user.role ? [{
            id: `primary-${user.role_id}`,
            user_id: user.id,
            role_id: user.role_id,
            role: user.role,
            is_primary: true,
            assigned_at: user.created_at,
            expires_at: null,
          }] : [];
      setUserRoles(fallback);
    } finally {
      setLoadingUserRoles(false);
    }
  }, []);

  const handleAssignRole = async () => {
    if (!multiRoleUser || !addingRoleId) return;
    setAddingRole(true);
    try {
      const newUserRole = await apiClient.assignRoleToUser(multiRoleUser.id, { role_id: addingRoleId });
      setUserRoles(prev => [...prev, newUserRole]);
      setAddingRoleId('');
      toast.success('Role berhasil ditambahkan');
      // Refresh tabel agar kolom "Role Tambahan" ikut update
      fetchUsers(page, 50);
    } catch (err) { toast.error(handleApiError(err)); }
    finally { setAddingRole(false); }
  };

  const handleRemoveRole = async (roleId: string, isPrimary: boolean) => {
    if (!multiRoleUser) return;
    if (isPrimary) {
      toast.error('Role default tidak dapat dihapus');
      return;
    }
    setRemovingRoleId(roleId);
    try {
      await apiClient.removeRoleFromUser(multiRoleUser.id, roleId);
      setUserRoles(prev => prev.filter(ur => ur.role_id !== roleId));
      toast.success('Role berhasil dicopot');
      // Refresh tabel agar kolom "Role Tambahan" ikut update
      fetchUsers(page, 50);
    } catch (err) { toast.error(handleApiError(err)); }
    finally { setRemovingRoleId(null); }
  };

  const closeMultiRolePanel = () => {
    setShowMultiRolePanel(false);
    setMultiRoleUser(null);
    setUserRoles([]);
    setAddingRoleId('');
  };

  // Role yang belum dimiliki user (untuk dropdown tambah)
  const unassignedRoles = useMemo(() =>
    roles.filter(r =>
      r.is_active !== false &&
      r.id !== multiRoleUser?.role_id &&
      !userRoles.some(ur => ur.role_id === r.id)
    ),
    [roles, userRoles, multiRoleUser]
  );

  // ─── Create User ─────────────────────────────────────────────────────────
  const handleCreateUser = async (e?: { preventDefault: () => void }) => {
    if (e) e.preventDefault();
    if (!newUserForm.name || !newUserForm.email || !newUserForm.password) {
      toast.error('Nama, Email, dan Password wajib diisi');
      return;
    }
    setCreating(true);
    try {
      await createUser({ ...newUserForm, role_id: newUserForm.role_id || undefined });
      toast.success(`Pengguna ${newUserForm.name} berhasil ditambahkan`);
      setShowAddModal(false);
      setNewUserForm({ name: '', email: '', password: '', role_id: '' });
      fetchUsers(page, 50);
    } catch (err) { toast.error(handleApiError(err)); }
    finally { setCreating(false); }
  };

  if (loading && !users) return (
    <div className="flex h-full items-center justify-center text-gray-500">Memuat data pengguna...</div>
  );
  if (error) return (
    <div className="flex h-full items-center justify-center text-red-600">Error: {error}</div>
  );

  return (
    <div className="h-full overflow-y-auto p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Assign Role ke User</h1>
            <p className="text-sm text-gray-500">Tambahkan role tambahan ke setiap pengguna</p>
          </div>
        </div>
        <button
          onClick={() => {
            setShowAddModal(true);
            if (roles.length > 0) setNewUserForm(f => ({ ...f, role_id: roles[0].id }));
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-orange-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:from-orange-700 hover:to-orange-800"
        >
          <UserPlus className="h-4 w-4" />
          Tambah User
        </button>
      </div>

      {/* Role Filter Cards */}
      <div className="mb-6">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-600">
          <Filter className="h-4 w-4" />
          Filter by Role
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedRoleFilter(null)}
            className={`rounded-xl border p-3 text-left shadow-sm transition-all hover:shadow-md ${selectedRoleFilter === null ? 'border-purple-400 bg-purple-50 ring-2 ring-purple-300' : 'border-gray-100 bg-white'}`}
          >
            <div className="text-xl font-bold text-gray-900">{users?.data?.length || 0}</div>
            <div className="text-xs text-gray-500">Semua</div>
          </button>
          {roleStats.map(stat => {
            const roleObj = roles.find(r => r.name === stat.name);
            return (
              <button
                key={stat.name}
                onClick={() => setSelectedRoleFilter(selectedRoleFilter === stat.name ? null : stat.name)}
                className={`rounded-xl border p-3 text-left shadow-sm transition-all hover:shadow-md ${selectedRoleFilter === stat.name ? 'border-purple-400 bg-purple-50 ring-2 ring-purple-300' : 'border-gray-100 bg-white'}`}
              >
                <div className="mb-1">
                  {roleObj
                    ? <RoleBadge role={roleObj} small />
                    : <span className="text-xs text-gray-500 capitalize">{stat.name}</span>}
                </div>
                <div className="text-xl font-bold text-gray-900">{stat.count}</div>
                <div className="text-xs text-gray-500">pengguna</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search */}
      <div className="mb-4 relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Cari berdasarkan nama, email, atau role..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 shadow-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="cursor-pointer px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500" onClick={() => toggleSort('name')}>
                  <div className="flex items-center">Nama<SortIcon field="name" /></div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Email</th>
                <th className="cursor-pointer px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500" onClick={() => toggleSort('role')}>
                  <div className="flex items-center">Role Default<SortIcon field="role" /></div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Role Tambahan</th>
                <th className="relative px-6 py-3"><span className="sr-only">Aksi</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {sortedUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                    <Users className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                    {searchQuery ? 'Tidak ada pengguna yang cocok.' : 'Belum ada pengguna.'}
                  </td>
                </tr>
              ) : sortedUsers.map(user => (
                <tr key={user.id} className="transition-colors hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-xs font-bold text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{user.name}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{user.email}</td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {user.role
                      ? <RoleBadge role={user.role} />
                      : <span className="text-xs text-gray-400">—</span>}
                  </td>
                  <td className="px-6 py-4">
                    {user.roles && user.roles.filter(ur => !ur.is_primary).length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {user.roles.filter(ur => !ur.is_primary).map(ur => (
                          ur.role
                            ? <RoleBadge key={ur.role_id} role={ur.role} small />
                            : <span key={ur.role_id} className="text-xs text-gray-400 italic">—</span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-300 italic">—</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <button
                      onClick={() => openMultiRolePanel(user)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition-all hover:bg-blue-100"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Multi-Role
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {users && users.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
            Sebelumnya
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">Halaman {page} dari {users.totalPages}</span>
          <button onClick={() => setPage(p => Math.min(users.totalPages, p + 1))} disabled={page === users.totalPages}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
            Selanjutnya
          </button>
        </div>
      )}

      {/* ─── Multi-Role Panel ────────────────────────────────────────────── */}
      {showMultiRolePanel && multiRoleUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            {/* Header panel */}
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Multi-Role</h3>
                  <p className="text-sm text-gray-500">{multiRoleUser.name}</p>
                </div>
              </div>
              <button
                onClick={closeMultiRolePanel}
                className="rounded-lg border border-gray-200 p-1.5 text-gray-400 hover:bg-gray-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Role default (tidak bisa dihapus) */}
            <div className="mb-4 rounded-xl border border-orange-100 bg-orange-50 px-4 py-3">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-orange-500">Role Default</p>
              <span className="text-sm font-semibold text-gray-800 capitalize">
                {multiRoleUser.role?.name ?? '—'}
              </span>
            </div>

            {/* Role tambahan yang dimiliki */}
            <div className="mb-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Role Tambahan</p>
              {loadingUserRoles ? (
                <div className="flex items-center gap-2 py-3 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" /> Memuat...
                </div>
              ) : (
                <>
                  {userRoles.filter(ur => !ur.is_primary).length === 0 ? (
                    <p className="py-2 text-sm text-gray-400 italic">Belum ada role tambahan.</p>
                  ) : (
                    <div className="space-y-2 max-h-44 overflow-y-auto">
                      {userRoles.filter(ur => !ur.is_primary).map(ur => (
                        <div key={ur.role_id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5">
                          <span className="text-sm font-medium text-gray-900 capitalize">{ur.role?.name || 'Unknown Role'}</span>
                          <button
                            onClick={() => handleRemoveRole(ur.role_id, false)}
                            disabled={removingRoleId === ur.role_id}
                            className="rounded-md border border-red-200 bg-red-50 p-1 text-red-500 hover:bg-red-100 disabled:opacity-40"
                          >
                            {removingRoleId === ur.role_id
                              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              : <X className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Tambah role baru */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Tambah Role</p>
              <div className="flex gap-2">
                <select
                  value={addingRoleId}
                  onChange={e => setAddingRoleId(e.target.value)}
                  className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  disabled={rolesLoading || unassignedRoles.length === 0}
                >
                  <option value="" disabled>
                    {unassignedRoles.length === 0 ? 'Semua role sudah ditetapkan' : 'Pilih role tambahan...'}
                  </option>
                  {unassignedRoles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
                <button
                  onClick={handleAssignRole}
                  disabled={!addingRoleId || addingRole}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {addingRole ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Tambah
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Add User Modal ──────────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/30 backdrop-blur-sm">
          <form onSubmit={handleCreateUser} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500">
                <UserPlus className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Tambah Pengguna Baru</h3>
                <p className="text-sm text-gray-500">Buat akun pengguna baru</p>
              </div>
            </div>

            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-gray-500">Nama Lengkap *</label>
            <input
              type="text" required value={newUserForm.name}
              onChange={e => setNewUserForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Masukkan nama lengkap"
              className="mb-4 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
            />

            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-gray-500">Email *</label>
            <input
              type="email" required value={newUserForm.email}
              onChange={e => setNewUserForm(f => ({ ...f, email: e.target.value }))}
              placeholder="user@upnvj.ac.id"
              className="mb-4 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
            />

            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-gray-500">Password *</label>
            <div className="relative mb-4">
              <input
                type={showPassword ? 'text' : 'password'} required value={newUserForm.password}
                onChange={e => setNewUserForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Masukkan password"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 pr-10 text-sm text-gray-900 shadow-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
              />
              <button type="button" onClick={() => setShowPassword(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-gray-500">Role Default *</label>
            <select
              required value={newUserForm.role_id}
              onChange={e => setNewUserForm(f => ({ ...f, role_id: e.target.value }))}
              disabled={rolesLoading}
              className="mb-6 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
            >
              <option value="" disabled hidden>Pilih role default...</option>
              {roles.filter(r => r.is_active !== false).map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={creating || !newUserForm.name || !newUserForm.email || !newUserForm.password}
                className="flex-1 rounded-xl bg-gradient-to-r from-orange-600 to-orange-700 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:from-orange-700 hover:to-orange-800 disabled:opacity-50"
              >
                {creating ? 'Menyimpan...' : 'Tambah Pengguna'}
              </button>
              <button
                type="button"
                onClick={() => { setShowAddModal(false); setNewUserForm({ name: '', email: '', password: '', role_id: '' }); setShowPassword(false); }}
                className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
