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
          <stop offset="0%" stopColor="#2196f3" />
          <stop offset="100%" stopColor="#00c853" />
        </linearGradient>
      </defs>

      {/* Stylized "N" formed by a stock trend line */}
      <polyline
        points="14,50 14,14 50,50 50,14"
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Small dot accents at the data points */}
      <circle cx="14" cy="50" r="3" fill="#2196f3" />
      <circle cx="50" cy="14" r="3" fill="#00c853" />
    </svg>
  );
}
