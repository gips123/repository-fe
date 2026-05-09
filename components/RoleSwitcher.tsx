'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';
import toast from 'react-hot-toast';

function roleDisplayName(name: string): string {
  return name
    .split(' ')
    .map(w =>
      w.toLowerCase().startsWith('wd') && w.length <= 3
        ? w.toUpperCase()
        : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
    )
    .join(' ');
}

export function RoleSwitcher() {
  const { activeRole, allRoles, switchRole, loadingRoles } = useAuthContext();
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Deduplicate by role_id, primary di atas, skip entry tanpa role_id
  const uniqueRoles = useMemo(() => {
    const seen = new Set<string>();
    return [...allRoles]
      .filter(ur => !!ur?.role_id && !!ur?.role)          // skip entry invalid
      .sort((a, b) => (a.is_primary ? -1 : b.is_primary ? 1 : 0))
      .filter(ur => {
        if (seen.has(ur.role_id)) return false;
        seen.add(ur.role_id);
        return true;
      });
  }, [allRoles]);

  // Semua hooks HARUS dipanggil sebelum return kondisional (Rules of Hooks)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Setelah semua hooks selesai, baru boleh return null
  if (!uniqueRoles || uniqueRoles.length <= 1) return null;

  const handleSwitch = async (roleId: string) => {
    if (roleId === activeRole?.id || switching) return;
    setOpen(false);
    setSwitching(true);
    try {
      await switchRole(roleId);
      toast.success('Role berhasil diganti');
    } catch {
      toast.error('Gagal mengganti role');
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        disabled={switching || loadingRoles}
        className="flex items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700 transition-all hover:bg-orange-100 disabled:opacity-60"
        title="Ganti role aktif"
      >
        {switching || loadingRoles ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <RefreshCw className="h-3.5 w-3.5" />
        )}
        <span>Ganti Role</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1.5 w-56 rounded-xl border border-gray-200 bg-white py-1.5 shadow-xl">
          <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Role Tersedia
          </p>
          {uniqueRoles.map(ur => {
            const isActive = !!(activeRole && ur.role_id === activeRole.id);
            return (
              <button
                key={ur.role_id}
                onClick={() => handleSwitch(ur.role_id)}
                disabled={isActive}
                className={`flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm transition-colors ${
                  isActive
                    ? 'bg-orange-50 font-semibold text-orange-700 cursor-default'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{roleDisplayName(ur.role.name)}</span>
                  {ur.is_primary && (
                    <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
                      Utama
                    </span>
                  )}
                </div>
                {isActive && <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-orange-500" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
