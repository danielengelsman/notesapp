'use client';

import { useState } from 'react';

interface CreateReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (text: string, dueDate: string) => Promise<void>;
}

export function CreateReminderModal({ isOpen, onClose, onCreate }: CreateReminderModalProps) {
  const [text, setText] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Default to tomorrow at 9am
  const defaultDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(9, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  })();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onCreate(text, dueDate || defaultDate);
      setText('');
      setDueDate('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create reminder');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-xl border border-stone-100 bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
          <h3 className="text-lg font-semibold text-stone-800">New Reminder</h3>
          <p className="mt-1 text-sm text-stone-500">Set a reminder with a due date.</p>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label htmlFor="reminder-text" className="block text-sm font-medium text-stone-700">
                What to remember
              </label>
              <input
                id="reminder-text"
                type="text"
                required
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-800 placeholder-stone-400 focus:border-[#2D6A4F] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
                placeholder="e.g. Review meeting notes"
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="reminder-date" className="block text-sm font-medium text-stone-700">
                Due date
              </label>
              <input
                id="reminder-date"
                type="datetime-local"
                value={dueDate || defaultDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-800 focus:border-[#2D6A4F] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#2D6A4F]"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border border-stone-200 px-4 py-2.5 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-lg bg-[#2D6A4F] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#245A42] disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
