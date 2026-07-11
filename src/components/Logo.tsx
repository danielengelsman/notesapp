/** The Bookstead mark: an open book whose pages form the gable roof of a
 *  homestead — a home built from your books. Single-weight, geometric. */
export function LogoMark({ size = 32, color = "#2E5E43" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      {/* roof = open book: two page slopes meeting at the spine */}
      <path
        d="M6 30 L32 12 L58 30"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* page lines under the roof */}
      <path d="M14 30 L32 18 L50 30" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
      {/* spine */}
      <path d="M32 12 L32 22" stroke={color} strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />
      {/* house body */}
      <path
        d="M12 34 V56 H52 V34"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* door */}
      <path d="M27 56 V44 a5 5 0 0 1 10 0 V56" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LogoWordmark({ height = 34, color = "#1B2A22", markColor = "#2E5E43" }: { height?: number; color?: string; markColor?: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: height * 0.28 }}>
      <LogoMark size={height} color={markColor} />
      <span
        style={{
          fontFamily: "Georgia, 'Iowan Old Style', 'Times New Roman', serif",
          fontWeight: 700,
          fontSize: height * 0.74,
          letterSpacing: "-0.02em",
          color,
          lineHeight: 1,
        }}
      >
        Bookstead
      </span>
    </span>
  );
}
