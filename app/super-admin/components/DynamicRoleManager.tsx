'use client';

import { useState } from 'react';
import {
  Shield, Plus, Pencil, Trash2, ToggleLeft, ToggleRight,
  AlertCircle, Loader2, Lock,
} from 'lucide-react';
import { useRoles } from '@/hooks/useRoles';
import { handleApiError } from '@/lib/utils/errorHandler';
import type { Role } from '@/types';
import toast from 'react-hot-toast';

interface RoleFormData {
  name: string;
  description: string;
}

const emptyForm = (): RoleFormData => ({ name: '', description: '' });

export function DynamicRoleManager() {
  const { roles, loading, error, createRole, updateRole, deleteRole, toggleRoleActive } = useRoles();

  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [form, setForm] = useState<RoleFormData>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Role | null>(null);

  const openCreate = () => {
    setEditingRole(null);
    setForm(emptyForm());
    setShowForm(true);
  };

  const openEdit = (role: Role) => {
    setEditingRole(role);
    setForm({ name: role.name, description: role.description ?? '' });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingRole(null);
    setForm(emptyForm());
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Nama role wajib diisi'); return; }
    setSaving(true);
    try {
      const payload = { name: form.name.trim(), description: form.description.trim() };
      if (editingRole) {
        await updateRole(editingRole.id, payload);
        toast.success(`Role "${form.name}" berhasil diperbarui`);
      } else {
        await createRole(payload);
        toast.success(`Role "${form.name}" berhasil dibuat`);
      }
      closeForm();
    } catch (err) {
      toast.error(handleApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (role: Role) => {
    if (role.is_system) { toast.error('Role sistem tidak dapat dinonaktifkan'); return; }
    setTogglingId(role.id);
    try {
      await toggleRoleActive(role.id);
      toast.success(role.is_active !== false ? `Role "${role.name}" dinonaktifkan` : `Role "${role.name}" diaktifkan`);
    } catch (err) {
      toast.error(handleApiError(err));
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (role: Role) => {
    setDeletingId(role.id);
    try {
      await deleteRole(role.id);
      toast.success(`Role "${role.name}" dihapus`);
      setConfirmDelete(null);
    } catch (err) {
      toast.error(handleApiError(err));
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center gap-2 text-gray-500">
        <Loader2 className="h-5 w-5 animate-spin" /> Memuat data role...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-40 items-center justify-center gap-2 text-red-600">
        <AlertCircle className="h-5 w-5" /> {error}
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 shadow-lg">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kelola Role</h1>
            <p className="text-sm text-gray-500">Tambah, edit, atau nonaktifkan role secara dinamis</p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:from-purple-700 hover:to-purple-800 hover:shadow-lg"
        >
          <Plus className="h-4 w-4" />
          Tambah Role Baru
        </button>
      </div>

      {/* Role Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Nama Role</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Deskripsi</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
              <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {roles.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500">
                  Belum ada role. Tambahkan role baru untuk memulai.
                </td>
              </tr>
            )}
            {roles.map(role => (
              <tr key={role.id} className={`transition-colors hover:bg-gray-50 ${!role.is_active ? 'opacity-60' : ''}`}>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 capitalize">{role.name}</span>
                    {role.is_system && (
                      <span title="Role sistem">
                        <Lock className="h-3.5 w-3.5 text-gray-400" />
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                  {role.description || <span className="italic text-gray-300">—</span>}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <button
                    onClick={() => handleToggleActive(role)}
                    disabled={!!togglingId || role.is_system}
                    title={role.is_system ? 'Role sistem tidak dapat diubah' : (role.is_active ? 'Nonaktifkan' : 'Aktifkan')}
                    className="flex items-center gap-1.5 text-sm font-medium transition-colors disabled:opacity-40"
                  >
                    {togglingId === role.id ? (
                      <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                    ) : role.is_active ? (
                      <>
                        <ToggleRight className="h-5 w-5 text-green-500" />
                        <span className="text-green-600">Aktif</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-400">Nonaktif</span>
                      </>
                    )}
                  </button>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEdit(role)}
                      className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition-all hover:bg-blue-100"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </button>
                    {!role.is_system && (
                      <button
                        onClick={() => setConfirmDelete(role)}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition-all hover:bg-red-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Hapus
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-700">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {editingRole ? 'Edit Role' : 'Tambah Role Baru'}
                </h3>
                <p className="text-sm text-gray-500">
                  {editingRole ? `Memperbarui role "${editingRole.name}"` : 'Buat role baru untuk sistem'}
                </p>
              </div>
            </div>

            {/* Name */}
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              Nama Role <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="contoh: Ketua Jurusan"
              required
              disabled={editingRole?.is_system}
              className="mb-4 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100 disabled:bg-gray-50 disabled:text-gray-400"
            />

            {/* Description */}
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              Deskripsi
            </label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Deskripsi singkat tentang role ini"
              rows={3}
              className="mb-6 w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
            />

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:from-purple-700 hover:to-purple-800 disabled:opacity-50"
              >
                {saving
                  ? <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Menyimpan...</span>
                  : editingRole ? 'Simpan Perubahan' : 'Buat Role'}
              </button>
              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Hapus Role</h3>
                <p className="text-sm text-gray-500">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>
            <p className="mb-6 text-sm text-gray-700">
              Yakin ingin menghapus role <span className="font-semibold">"{confirmDelete.name}"</span>?
              Semua user yang memiliki role ini akan kehilangan assignment tersebut.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={deletingId === confirmDelete.id}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-red-700 disabled:opacity-50"
              >
                {deletingId === confirmDelete.id ? 'Menghapus...' : 'Hapus Role'}
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
