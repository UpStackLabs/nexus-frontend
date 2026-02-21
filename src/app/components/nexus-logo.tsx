export function NexusLogo({ size = 28 }: { size?: number }) {
  const id = 'nexus-grad';
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      style={{ display: 'block', flexShrink: 0 }}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#c41e3a" />
          <stop offset="100%" stopColor="#9c27b0" />
        </linearGradient>
      </defs>

      {/* Three ascending chart bars */}
      <rect x="8" y="38" width="12" height="20" rx="2" fill={`url(#${id})`} opacity="0.6" />
      <rect x="26" y="24" width="12" height="34" rx="2" fill={`url(#${id})`} opacity="0.8" />
      <rect x="44" y="8" width="12" height="50" rx="2" fill={`url(#${id})`} />
    </svg>
  );
}
