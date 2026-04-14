import { useId } from 'react';

/**
 * HAY-M Brand Mark — Concept F: Infinity Loop
 * Teal gradient infinity symbol on dark navy background.
 * Usage: <HaymLogo size={36} />
 */
export default function HaymLogo({ size = 36 }) {
  const uid = useId().replace(/:/g, '');
  const bgId   = `${uid}-bg`;
  const tealId = `${uid}-teal`;
  const r      = Math.round(size * 0.232); // border-radius ≈ iOS icon ratio

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 56"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', borderRadius: r, flexShrink: 0 }}
    >
      <defs>
        <linearGradient id={bgId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"   stopColor="#1A3560" />
          <stop offset="100%" stopColor="#0A1628" />
        </linearGradient>
        <linearGradient id={tealId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#009E78" />
          <stop offset="50%"  stopColor="#00D4A1" />
          <stop offset="100%" stopColor="#009E78" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width="56" height="56" rx="13" fill={`url(#${bgId})`} />

      {/* Infinity loop */}
      <path
        d="M28,28
           C28,18 20,12 13,12
           C6,12 4,18 4,23
           C4,28 6,34 13,34
           C20,34 28,24 28,28
           C28,32 36,22 43,22
           C50,22 52,28 52,33
           C52,38 50,44 43,44
           C36,44 28,38 28,28Z"
        fill="none"
        stroke={`url(#${tealId})`}
        strokeWidth="4.5"
        strokeLinecap="round"
      />

      {/* Glowing dots at tips */}
      <circle cx="13" cy="23" r="2.5" fill="#00D4A1" />
      <circle cx="43" cy="33" r="2.5" fill="#00D4A1" />
    </svg>
  );
}
