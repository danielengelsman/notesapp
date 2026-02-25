'use client';

import { useState } from 'react';
import type { Reminder } from '@/types';
import { ReminderCard } from './ReminderCard';
import { CreateReminderModal } from './CreateReminderModal';

type FilterTab = 'all' | 'active' | 'completed';

interface ReminderListProps {
  reminders: Reminder[];
  loading: boolean;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
  onCreate: (text: string, dueDate: string) => Promise<void>;
}

export function ReminderList({ reminders, loading, onToggle, onDelete, onCreate }: ReminderListProps) {
  const [filter, setFilter] = useState<FilterTab>('all');
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = reminders.filter((r) => {
    if (filter === 'active') return !r.completed;
    if (filter === 'completed') return r.completed;
    return true;
  });

  const activeCount = reminders.filter((r) => !r.completed).length;

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active' },
    { key: 'completed', label: 'Done' },
  ];

  return (
    <>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-stone-800">Reminders</h2>
          <p className="text-sm text-stone-400">
            {activeCount} active {activeCount === 1 ? 'reminder' : 'reminders'}
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-[#2D6A4F] px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#245A42]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span className="hidden sm:inline">New Reminder</span>
        </button>
      </div>

      {/* Filter tabs */}
      <div className="mb-4 flex gap-1 rounded-lg bg-stone-100 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === tab.key
                ? 'bg-white text-stone-800 shadow-sm'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-stone-200 border-t-[#2D6A4F]" />
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center py-16">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-stone-100">
            <svg className="h-7 w-7 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm text-stone-500">
            {filter === 'completed' ? 'No completed reminders' : filter === 'active' ? 'All caught up!' : 'No reminders yet'}
          </p>
          {filter !== 'completed' && (
            <button
              onClick={() => setModalOpen(true)}
              className="mt-2 text-sm font-medium text-[#2D6A4F] hover:underline"
            >
              Create a reminder
            </button>
          )}
        </div>
      )}

      {/* Reminder list */}
      <div className="space-y-2">
        {filtered.map((reminder) => (
          <ReminderCard
            key={reminder.id}
            reminder={reminder}
            onToggle={onToggle}
            onDelete={onDelete}
          />
        ))}
      </div>

      {/* Create modal */}
      <CreateReminderModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={onCreate}
      />
    </>
  );
}
