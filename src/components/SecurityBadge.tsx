'use client';

interface SecurityBadgeProps {
  level: 'cloud' | 'local';
  size?: 'sm' | 'md';
  onClick?: () => void;
}

export function SecurityBadge({ level, size = 'sm', onClick }: SecurityBadgeProps) {
  const isLocal = level === 'local';

  const sizeClasses = size === 'sm'
    ? 'px-2 py-0.5 text-[11px] gap-1'
    : 'px-2.5 py-1 text-xs gap-1.5';

  const Component = onClick ? 'button' : 'span';

  return (
    <Component
      onClick={onClick}
      className={`inline-flex items-center rounded-full font-medium transition-colors ${sizeClasses} ${
        isLocal
          ? 'bg-amber-50 text-amber-700 border border-amber-200'
          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
      } ${onClick ? 'cursor-pointer hover:opacity-80' : ''}`}
    >
      <svg className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        {isLocal ? (
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
        )}
      </svg>
      {isLocal ? 'Local' : 'Cloud'}
    </Component>
  );
}
