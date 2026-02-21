export function NexusLogo({ size = 28 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      style={{ display: 'block', flexShrink: 0 }}
    >
      {/* Network nodes — connected AI/market graph */}
      {/* Center hub (AI brain / nexus point) */}
      <circle cx="32" cy="28" r="6" fill="none" stroke="#c42020" strokeWidth="1.8" />
      <circle cx="32" cy="28" r="2.5" fill="#c42020" />

      {/* Connection lines to outer nodes */}
      <line x1="32" y1="34" x2="18" y2="48" stroke="#c42020" strokeWidth="1" opacity="0.5" />
      <line x1="32" y1="34" x2="46" y2="48" stroke="#c42020" strokeWidth="1" opacity="0.5" />
      <line x1="26" y1="26" x2="12" y2="20" stroke="#c42020" strokeWidth="1" opacity="0.5" />
      <line x1="38" y1="26" x2="52" y2="20" stroke="#c42020" strokeWidth="1" opacity="0.5" />
      <line x1="32" y1="22" x2="32" y2="10" stroke="#c42020" strokeWidth="1" opacity="0.5" />

      {/* Outer nodes (market endpoints) */}
      <circle cx="18" cy="48" r="3" fill="none" stroke="#c42020" strokeWidth="1.2" opacity="0.7" />
      <circle cx="18" cy="48" r="1.2" fill="#c42020" opacity="0.6" />

      <circle cx="46" cy="48" r="3" fill="none" stroke="#c42020" strokeWidth="1.2" opacity="0.7" />
      <circle cx="46" cy="48" r="1.2" fill="#c42020" opacity="0.6" />

      <circle cx="12" cy="20" r="3" fill="none" stroke="#c42020" strokeWidth="1.2" opacity="0.7" />
      <circle cx="12" cy="20" r="1.2" fill="#c42020" opacity="0.6" />

      <circle cx="52" cy="20" r="3" fill="none" stroke="#c42020" strokeWidth="1.2" opacity="0.7" />
      <circle cx="52" cy="20" r="1.2" fill="#c42020" opacity="0.6" />

      <circle cx="32" cy="10" r="3" fill="none" stroke="#c42020" strokeWidth="1.2" opacity="0.7" />
      <circle cx="32" cy="10" r="1.2" fill="#c42020" opacity="0.6" />

      {/* Subtle stock pulse line through the center */}
      <polyline
        points="6,38 14,36 20,40 26,32 32,36 38,28 44,34 50,30 58,32"
        fill="none"
        stroke="#c42020"
        strokeWidth="1.2"
        opacity="0.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
