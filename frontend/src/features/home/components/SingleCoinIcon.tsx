interface SingleCoinIconProps {
  size?: number
  className?: string
}

export function SingleCoinIcon({ size = 20, className = '' }: SingleCoinIconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        {/* Outer metallic gold gradient */}
        <linearGradient id="singleCoinOuter" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>

        {/* Inner coin face gradient */}
        <linearGradient id="singleCoinFace" x1="4" y1="4" x2="20" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#92400E" />
        </linearGradient>

        {/* Center sparkle emblem gradient */}
        <linearGradient id="singleCoinStar" x1="7" y1="7" x2="17" y2="17" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#FEF08A" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>

        {/* Subtle drop shadow glow filter */}
        <filter id="singleCoinGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="1.2" floodColor="#F59E0B" floodOpacity="0.6" />
        </filter>
      </defs>

      {/* Outer Coin Body (Crisp Metallic Rim) */}
      <circle cx="12" cy="12" r="9.5" fill="url(#singleCoinOuter)" stroke="#FDE047" strokeWidth="0.6" />

      {/* Inner Recessed Coin Face */}
      <circle cx="12" cy="12" r="7.5" fill="url(#singleCoinFace)" stroke="#FDE047" strokeWidth="0.6" strokeOpacity="0.7" />

      {/* Decorative Milled Ring */}
      <circle cx="12" cy="12" r="6.6" stroke="#FDE68A" strokeWidth="0.5" strokeDasharray="1.2 1" strokeOpacity="0.5" fill="none" />

      {/* Center 4-Point Sparkle Star Emblem */}
      <path 
        d="M12 6.5C12 9.2 10 11.2 7.3 12C10 12.8 12 14.8 12 17.5C12 14.8 14 12.8 16.7 12C14 11.2 12 9.2 12 6.5Z" 
        fill="url(#singleCoinStar)" 
      />

      {/* Specular Highlight Sheen */}
      <circle cx="9" cy="8.5" r="0.9" fill="#FFFFFF" fillOpacity="0.85" />
    </svg>
  );
}

export default SingleCoinIcon;
