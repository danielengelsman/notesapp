'use client';

interface CalendarEvent {
  label: string;
  type: 'reminder' | 'reminder-overdue' | 'note';
}

interface CalendarDayProps {
  day: number | null;
  isToday: boolean;
  events: CalendarEvent[];
}

export function CalendarDay({ day, isToday, events }: CalendarDayProps) {
  if (day === null) {
    return <div className="min-h-[72px]" />;
  }

  const maxVisible = 2;
  const visible = events.slice(0, maxVisible);
  const remaining = events.length - maxVisible;

  return (
    <div
      className={`min-h-[72px] rounded-lg border p-1.5 transition-colors ${
        isToday
          ? 'border-[#2D6A4F] bg-[#2D6A4F]/5'
          : 'border-stone-100 hover:border-stone-200'
      }`}
    >
      <span
        className={`mb-1 inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
          isToday
            ? 'bg-[#2D6A4F] text-white'
            : 'text-stone-600'
        }`}
      >
        {day}
      </span>

      <div className="space-y-0.5">
        {visible.map((event, i) => (
          <div
            key={i}
            className={`truncate rounded px-1 py-0.5 text-[10px] leading-tight ${
              event.type === 'reminder-overdue'
                ? 'bg-red-50 text-red-600'
                : event.type === 'reminder'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-blue-50 text-blue-600'
            }`}
          >
            {event.label}
          </div>
        ))}
        {remaining > 0 && (
          <p className="px-1 text-[10px] text-stone-400">+{remaining} more</p>
        )}
      </div>
    </div>
  );
}
