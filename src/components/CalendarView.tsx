'use client';

import { useState, useMemo } from 'react';
import { CalendarDay } from './CalendarDay';
import type { Reminder, DecryptedNote } from '@/types';

interface CalendarViewProps {
  reminders: Reminder[];
  notes: DecryptedNote[];
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function CalendarView({ reminders, notes }: CalendarViewProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  function goToday() {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  }

  // Build calendar grid
  const days = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const grid: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) grid.push(null);
    for (let d = 1; d <= daysInMonth; d++) grid.push(d);
    // Pad to full rows
    while (grid.length % 7 !== 0) grid.push(null);

    return grid;
  }, [viewYear, viewMonth]);

  // Build events map: day number -> events
  const eventsMap = useMemo(() => {
    const map: Record<number, { label: string; type: 'reminder' | 'reminder-overdue' | 'note' }[]> = {};

    for (const r of reminders) {
      const due = new Date(r.due_date);
      if (due.getFullYear() === viewYear && due.getMonth() === viewMonth) {
        const d = due.getDate();
        if (!map[d]) map[d] = [];
        const isOverdue = !r.completed && due < today && !sameDay(due, today);
        map[d].push({
          label: r.text,
          type: isOverdue ? 'reminder-overdue' : 'reminder',
        });
      }
    }

    for (const n of notes) {
      const created = new Date(n.created_at);
      if (created.getFullYear() === viewYear && created.getMonth() === viewMonth) {
        const d = created.getDate();
        if (!map[d]) map[d] = [];
        map[d].push({ label: n.title, type: 'note' });
      }
    }

    return map;
  }, [reminders, notes, viewYear, viewMonth, today]);

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-stone-800">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </h2>
          <p className="text-sm text-stone-400">
            {reminders.filter((r) => !r.completed).length} active reminders
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={goToday}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-[#2D6A4F] transition-colors hover:bg-[#2D6A4F]/10"
          >
            Today
          </button>
          <button
            onClick={prevMonth}
            className="rounded-lg p-1.5 text-stone-500 transition-colors hover:bg-stone-100"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button
            onClick={nextMonth}
            className="rounded-lg p-1.5 text-stone-500 transition-colors hover:bg-stone-100"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="mb-1 grid grid-cols-7 gap-1">
        {WEEKDAYS.map((day) => (
          <div key={day} className="py-1 text-center text-[11px] font-medium uppercase tracking-wider text-stone-400">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => (
          <CalendarDay
            key={i}
            day={day}
            isToday={
              day !== null &&
              viewYear === today.getFullYear() &&
              viewMonth === today.getMonth() &&
              day === today.getDate()
            }
            events={day !== null ? (eventsMap[day] || []) : []}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-4 text-[11px] text-stone-400">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" /> Reminder
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-red-400" /> Overdue
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-blue-400" /> Note
        </span>
      </div>
    </div>
  );
}
