export function NexusLogo({ size = 28 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      style={{ display: 'block', flexShrink: 0 }}
    >
      {/* Globe wireframe */}
      {/* Outer sphere */}
      <circle cx="32" cy="32" r="26" fill="none" stroke="#c42020" strokeWidth="1.5" opacity="0.7" />

      {/* Latitude lines */}
      <ellipse cx="32" cy="32" rx="26" ry="10" fill="none" stroke="#c42020" strokeWidth="0.7" opacity="0.3" />
      <ellipse cx="32" cy="32" rx="26" ry="18" fill="none" stroke="#c42020" strokeWidth="0.7" opacity="0.25" />

      {/* Longitude lines */}
      <ellipse cx="32" cy="32" rx="10" ry="26" fill="none" stroke="#c42020" strokeWidth="0.7" opacity="0.3" />
      <ellipse cx="32" cy="32" rx="18" ry="26" fill="none" stroke="#c42020" strokeWidth="0.7" opacity="0.25" />

      {/* Crosshair lines */}
      <line x1="32" y1="2" x2="32" y2="62" stroke="#c42020" strokeWidth="0.5" opacity="0.2" />
      <line x1="2" y1="32" x2="62" y2="32" stroke="#c42020" strokeWidth="0.5" opacity="0.2" />

      {/* Shockwave rings emanating from epicenter */}
      <circle cx="32" cy="32" r="8" fill="none" stroke="#c42020" strokeWidth="1.2" opacity="0.5" strokeDasharray="2 2" />
      <circle cx="32" cy="32" r="15" fill="none" stroke="#c42020" strokeWidth="0.8" opacity="0.3" strokeDasharray="3 3" />
      <circle cx="32" cy="32" r="21" fill="none" stroke="#c42020" strokeWidth="0.6" opacity="0.2" strokeDasharray="4 4" />

      {/* Epicenter core */}
      <circle cx="32" cy="32" r="3" fill="#c42020" opacity="0.9" />
      <circle cx="32" cy="32" r="1.5" fill="#ff4444" opacity="0.8" />

      {/* Corner brackets (targeting overlay) */}
      {/* Top-left */}
      <path d="M8,14 L8,8 L14,8" fill="none" stroke="#c42020" strokeWidth="1.2" opacity="0.5" />
      {/* Top-right */}
      <path d="M50,8 L56,8 L56,14" fill="none" stroke="#c42020" strokeWidth="1.2" opacity="0.5" />
      {/* Bottom-left */}
      <path d="M8,50 L8,56 L14,56" fill="none" stroke="#c42020" strokeWidth="1.2" opacity="0.5" />
      {/* Bottom-right */}
      <path d="M50,56 L56,56 L56,50" fill="none" stroke="#c42020" strokeWidth="1.2" opacity="0.5" />

      {/* Diagonal shock arcs */}
      <line x1="32" y1="32" x2="12" y2="14" stroke="#c42020" strokeWidth="0.6" opacity="0.25" />
      <line x1="32" y1="32" x2="50" y2="18" stroke="#c42020" strokeWidth="0.6" opacity="0.25" />
      <line x1="32" y1="32" x2="48" y2="50" stroke="#c42020" strokeWidth="0.6" opacity="0.25" />
      <line x1="32" y1="32" x2="14" y2="48" stroke="#c42020" strokeWidth="0.6" opacity="0.25" />

      {/* Small impact dots at arc endpoints */}
      <circle cx="12" cy="14" r="1.5" fill="#c42020" opacity="0.4" />
      <circle cx="50" cy="18" r="1.5" fill="#c42020" opacity="0.4" />
      <circle cx="48" cy="50" r="1.5" fill="#c42020" opacity="0.4" />
      <circle cx="14" cy="48" r="1.5" fill="#c42020" opacity="0.4" />
    </svg>
  );
}
