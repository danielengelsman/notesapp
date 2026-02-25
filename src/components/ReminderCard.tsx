'use client';

import type { Reminder } from '@/types';

interface ReminderCardProps {
  reminder: Reminder;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
}

function formatDueDate(dateStr: string): { label: string; isOverdue: boolean } {
  const due = new Date(dateStr);
  const now = new Date();
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / 86400000);

  if (diffDays < 0) return { label: `${Math.abs(diffDays)}d overdue`, isOverdue: true };
  if (diffDays === 0) return { label: 'Today', isOverdue: false };
  if (diffDays === 1) return { label: 'Tomorrow', isOverdue: false };
  if (diffDays <= 7) return { label: `In ${diffDays} days`, isOverdue: false };

  return {
    label: due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    isOverdue: false,
  };
}

export function ReminderCard({ reminder, onToggle, onDelete }: ReminderCardProps) {
  const { label, isOverdue } = formatDueDate(reminder.due_date);

  return (
    <div className="group flex items-start gap-3 rounded-lg border border-stone-100 bg-white px-4 py-3 transition-colors hover:border-stone-200">
      {/* Checkbox */}
      <button
        onClick={() => onToggle(reminder.id, !reminder.completed)}
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          reminder.completed
            ? 'border-[#2D6A4F] bg-[#2D6A4F]'
            : 'border-stone-300 hover:border-[#2D6A4F]'
        }`}
      >
        {reminder.completed && (
          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${
          reminder.completed ? 'text-stone-400 line-through' : 'text-stone-800'
        }`}>
          {reminder.text}
        </p>
        <p className={`mt-0.5 text-xs ${
          reminder.completed
            ? 'text-stone-300'
            : isOverdue
              ? 'text-red-500 font-medium'
              : 'text-stone-400'
        }`}>
          {label}
        </p>
      </div>

      {/* Delete button — visible on hover */}
      <button
        onClick={() => onDelete(reminder.id)}
        className="mt-0.5 shrink-0 rounded-md p-1 text-stone-300 opacity-0 transition-opacity hover:bg-stone-50 hover:text-red-500 group-hover:opacity-100"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
      </button>
    </div>
  );
}
