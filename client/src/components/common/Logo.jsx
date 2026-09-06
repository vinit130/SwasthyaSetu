import React from 'react';

/**
 * SwasthyaSetu Unified Brand Logo
 * Combines Healthcare Cross + Rural Bridge (Setu) + Continuum Pulse
 */
export default function Logo({
  size = 'md',
  showWordmark = true,
  showTagline = false,
  variant = 'default', // 'default' | 'white'
  className = '',
}) {
  const sizeMap = {
    sm: { mark: 'w-7 h-7', text: 'text-base', tag: 'text-[9px]', gap: 'gap-2' },
    md: { mark: 'w-9 h-9', text: 'text-xl', tag: 'text-[10px]', gap: 'gap-2.5' },
    lg: { mark: 'w-11 h-11', text: 'text-2xl', tag: 'text-xs', gap: 'gap-3' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;
  const isWhite = variant === 'white';

  return (
    <div className={`inline-flex items-center ${currentSize.gap} select-none ${className}`}>
      {/* Mark Vector */}
      <div className={`${currentSize.mark} shrink-0 rounded-xl overflow-hidden shadow-xs`}>
        <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
          <defs>
            <linearGradient id="mark-teal-grad" x1="2" y1="2" x2="44" y2="44" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0f766e" />
              <stop offset="100%" stopColor="#0d9488" />
            </linearGradient>
            <linearGradient id="mark-emerald-grad" x1="12" y1="28" x2="36" y2="44" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#14b8a6" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>

          {/* Background Card */}
          <rect width="48" height="48" rx="12" fill="url(#mark-teal-grad)" />

          {/* Bridge Arch Pathway (Setu) */}
          <path
            d="M8 35 C16 23, 32 23, 40 35"
            stroke="#ffffff"
            strokeOpacity="0.4"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M10 37 C18 27, 30 27, 38 37"
            stroke="url(#mark-emerald-grad)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Healthcare Medical Cross with Heartbeat Wave (Swasthya) */}
          <rect x="21.5" y="10" width="5" height="18" rx="2.5" fill="#ffffff" />
          <path
            d="M12 19 L19 19 L21.5 13 L24 24 L26.5 17 L29 19 L36 19"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="24" cy="31" r="2.5" fill="#ffffff" />
        </svg>
      </div>

      {/* Wordmark Text */}
      {showWordmark && (
        <div className="flex flex-col">
          <span className={`font-extrabold tracking-tight leading-tight ${currentSize.text}`}>
            <span className={isWhite ? 'text-white' : 'text-slate-900'}>Swasthya</span>
            <span className={isWhite ? 'text-teal-300' : 'text-teal-600'}>Setu</span>
          </span>
          {showTagline && (
            <span
              className={`font-semibold uppercase tracking-wider ${currentSize.tag} ${
                isWhite ? 'text-teal-100' : 'text-slate-500'
              }`}
            >
              Rural Healthcare Continuum
            </span>
          )}
        </div>
      )}
    </div>
  );
}
