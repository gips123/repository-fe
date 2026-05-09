'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';
import { useFolderContext } from '@/context/FolderContext';
import { FolderTree } from '@/components/FolderTree';
import { NotificationBell } from '@/components/NotificationBell';
import { GlobalSearch } from '@/components/GlobalSearch';
import { RoleSwitcher } from '@/components/RoleSwitcher';

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout, activeRole } = useAuthContext();
  const router = useRouter();
  const { selectedFolderId, setSelectedFolderId } = useFolderContext();

  const [sidebarWidth, setSidebarWidth] = useState(288); // Default 288px (w-72)
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const startResizing = useCallback((e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault(); // Prevent text selection while dragging
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (isResizing) {
      const newWidth = e.clientX;
      if (newWidth >= 200 && newWidth <= 800) {
        setSidebarWidth(newWidth);
      }
    }
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className={`flex h-screen bg-gray-50 ${isResizing ? 'cursor-col-resize select-none' : ''}`}>
      {/* Sidebar - Resizable */}
      <div 
        ref={sidebarRef}
        className="relative shrink-0 border-r border-gray-200 bg-white shadow-lg flex flex-col"
        style={{ width: sidebarWidth }}
      >
        <div className="flex-1 overflow-hidden">
          <FolderTree
            selectedFolderId={selectedFolderId}
            onFolderSelect={setSelectedFolderId}
          />
        </div>
        {/* Resizer Handle */}
        <div 
          className="absolute top-0 right-0 h-full w-2 cursor-col-resize hover:bg-orange-500/30 active:bg-orange-500/50 transition-colors z-20"
          onMouseDown={startResizing}
          title="Drag to resize"
        />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-gray-200 bg-white shadow-sm">
          <div className="border-gray-200 flex items-center justify-start gap-4 px-6 py-4">
              <GlobalSearch />
          </div>

          <div className="flex items-center justify-end gap-4 px-6 py-4">
            <div className="flex items-center gap-6">
              <RoleSwitcher />
              <div className="flex items-center gap-3 rounded-lg bg-gray-100 px-4 py-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-sm">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-black leading-tight">{user.name}</p>
                    {activeRole?.name && (
                      <span
                        className="rounded-md px-2 py-0.5 text-xs font-medium text-white"
                        style={{
                          backgroundColor: activeRole.is_system
                            ? '#ea580c'
                            : (activeRole.color ?? '#ea580c'),
                        }}
                      >
                        {activeRole.name.toLowerCase().startsWith('wd') && activeRole.name.length <= 3
                          ? activeRole.name.toUpperCase()
                          : activeRole.name.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 leading-tight">{user.email}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-gray-100 px-2 py-1"><NotificationBell /></div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  logout();
                  router.push('/login');
                }}
                className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
}

