export function PlumLogo({ className = "h-10 w-auto" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 120 40" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="plumLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
      </defs>
      <g>
        {/* Plum shape */}
        <circle cx="20" cy="18" r="12" fill="url(#plumLogoGradient)" />
        <ellipse cx="20" cy="30" rx="6" ry="8" fill="url(#plumLogoGradient)" opacity="0.8" />
        <path d="M20 6 Q22 4 24 5 Q23 6.5 22 7.5 L20 8 Z" fill="#34D399" />
        
        {/* Text */}
        <text x="45" y="26" fontFamily="Arial, sans-serif" fontSize="24" fontWeight="bold" fill="url(#plumLogoGradient)">Plum</text>
      </g>
    </svg>
  )
}