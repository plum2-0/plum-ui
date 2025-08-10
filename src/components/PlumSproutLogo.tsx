// components/PlumSproutLogo.tsx
export function PlumSproutLogo({ className = "w-6 h-6" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Purple to Green Gradient for Plum */}
        <linearGradient id="plumGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="50%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#22C55E" />
        </linearGradient>
        
        {/* Green Gradient for Sprout */}
        <linearGradient id="sproutGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#34D399" />
        </linearGradient>
        
        {/* White Glow Filter */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        
        {/* Glass Effect Filter */}
        <filter id="glass" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1"/>
          <feOffset dx="0" dy="1" result="offset"/>
          <feFlood floodColor="#ffffff" floodOpacity="0.2"/>
          <feComposite in2="offset" operator="in"/>
        </filter>
      </defs>
      
      {/* Main Plum Body with Glass Effect */}
      <circle 
        cx="16" 
        cy="18" 
        r="8" 
        fill="url(#plumGradient)" 
        filter="url(#glass)"
        opacity="0.9"
      />
      
      {/* Plum Highlight (Glass Shine) */}
      <ellipse 
        cx="13" 
        cy="15" 
        rx="3" 
        ry="4" 
        fill="rgba(255, 255, 255, 0.3)"
        opacity="0.8"
      />
      
      {/* Sprout Leaves with Glow */}
      <g filter="url(#glow)">
        {/* Left Leaf */}
        <path
          d="M16 10 C14 6, 10 6, 8 8 C10 10, 14 12, 16 10 Z"
          fill="url(#sproutGradient)"
          opacity="0.9"
        />
        
        {/* Right Leaf */}
        <path
          d="M16 10 C18 6, 22 6, 24 8 C22 10, 18 12, 16 10 Z"
          fill="url(#sproutGradient)"
          opacity="0.9"
        />
      </g>
      
      {/* Subtle Stem */}
      <line 
        x1="16" 
        y1="10" 
        x2="16" 
        y2="14" 
        stroke="url(#sproutGradient)" 
        strokeWidth="2" 
        opacity="0.7"
      />
      
      {/* Glass Reflection Highlight */}
      <path
        d="M12 12 Q16 8, 20 12 Q16 10, 12 12"
        fill="rgba(255, 255, 255, 0.4)"
        opacity="0.6"
      />
    </svg>
  );
}
