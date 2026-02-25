'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { clearMasterKey } from '@/lib/encryption/keyManager';
import type { ViewType } from '@/types';

interface SidebarProps {
  folders: string[];
  activeFolder: string;
  onFolderChange: (folder: string) => void;
  noteCounts: Record<string, number>;
  totalNotes: number;
  isOpen: boolean;
  onClose: () => void;
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  reminderCount: number;
}

const FOLDER_ICONS: Record<string, string> = {
  'All Notes': 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
  Personal: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  Work: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  Ideas: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
  Archive: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4',
};

const VIEW_ITEMS: { key: ViewType; label: string; icon: string }[] = [
  {
    key: 'notes',
    label: 'Notes',
    icon: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z',
  },
  {
    key: 'reminders',
    label: 'Reminders',
    icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    key: 'calendar',
    label: 'Calendar',
    icon: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5',
  },
];

export function Sidebar({
  folders,
  activeFolder,
  onFolderChange,
  noteCounts,
  totalNotes,
  isOpen,
  onClose,
  activeView,
  onViewChange,
  reminderCount,
}: SidebarProps) {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    clearMasterKey();
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  }

  const allFolders = ['All Notes', ...folders];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-30 flex h-full w-64 flex-col border-r border-stone-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 border-b border-stone-100 px-5 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2D6A4F]">
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <span className="text-base font-semibold text-stone-800">SecureNotes</span>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3">
          {/* Views */}
          <p className="mb-2 px-2 text-[11px] font-medium uppercase tracking-wider text-stone-400">
            Views
          </p>
          <ul className="mb-4 space-y-0.5">
            {VIEW_ITEMS.map((item) => {
              const isActive = activeView === item.key;
              const count = item.key === 'notes' ? totalNotes : item.key === 'reminders' ? reminderCount : 0;

              return (
                <li key={item.key}>
                  <button
                    onClick={() => {
                      onViewChange(item.key);
                      onClose();
                    }}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                      isActive
                        ? 'bg-[#2D6A4F]/10 font-medium text-[#2D6A4F]'
                        : 'text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                    </svg>
                    <span className="flex-1 text-left">{item.label}</span>
                    {count > 0 && (
                      <span className={`text-xs ${isActive ? 'text-[#2D6A4F]/70' : 'text-stone-400'}`}>
                        {count}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Folders — only show in notes view */}
          {activeView === 'notes' && (
            <>
              <p className="mb-2 px-2 text-[11px] font-medium uppercase tracking-wider text-stone-400">
                Folders
              </p>
              <ul className="space-y-0.5">
                {allFolders.map((folder) => {
                  const isActive = activeFolder === folder;
                  const count = folder === 'All Notes' ? totalNotes : (noteCounts[folder] || 0);
                  const iconPath = FOLDER_ICONS[folder] || FOLDER_ICONS['Personal'];

                  return (
                    <li key={folder}>
                      <button
                        onClick={() => {
                          onFolderChange(folder);
                          onClose();
                        }}
                        className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                          isActive
                            ? 'bg-[#2D6A4F]/10 font-medium text-[#2D6A4F]'
                            : 'text-stone-600 hover:bg-stone-50'
                        }`}
                      >
                        <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
                        </svg>
                        <span className="flex-1 text-left">{folder}</span>
                        {count > 0 && (
                          <span className={`text-xs ${isActive ? 'text-[#2D6A4F]/70' : 'text-stone-400'}`}>
                            {count}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </nav>

        {/* User / Sign out */}
        <div className="border-t border-stone-100 px-3 py-3">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-stone-500 transition-colors hover:bg-stone-50 hover:text-stone-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
