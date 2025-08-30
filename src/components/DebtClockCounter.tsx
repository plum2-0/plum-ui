"use client";

import { useEffect, useState, useRef } from "react";

// Custom SVG Icons that are absolutely fire
const DeathSkullSVG = ({ color }: { color: string }) => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 100 100"
    className="w-full h-full"
    style={{ filter: `drop-shadow(0 0 20px ${color})` }}
  >
    <defs>
      <linearGradient id="skull-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ff0000" stopOpacity="1">
          <animate attributeName="stop-color" values="#ff0000;#8b0000;#ff0000" dur="3s" repeatCount="indefinite" />
        </stop>
        <stop offset="100%" stopColor="#300000" stopOpacity="1" />
      </linearGradient>
      <filter id="distortion">
        <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" result="turbulence">
          <animate attributeName="baseFrequency" values="0.02;0.05;0.02" dur="4s" repeatCount="indefinite" />
        </feTurbulence>
        <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="3" />
      </filter>
    </defs>
    
    {/* Skull base with morphing animation */}
    <path
      d="M50 20 Q30 20 25 35 T25 60 Q25 75 35 80 L35 85 Q35 90 40 90 L60 90 Q65 90 65 85 L65 80 Q75 75 75 60 T70 35 Q65 20 50 20"
      fill="url(#skull-gradient)"
      filter="url(#distortion)"
      opacity="0.9"
    >
      <animate
        attributeName="d"
        values="M50 20 Q30 20 25 35 T25 60 Q25 75 35 80 L35 85 Q35 90 40 90 L60 90 Q65 90 65 85 L65 80 Q75 75 75 60 T70 35 Q65 20 50 20;
                M50 18 Q28 18 23 33 T23 58 Q23 73 33 78 L33 85 Q33 90 40 90 L60 90 Q67 90 67 85 L67 78 Q77 73 77 58 T72 33 Q67 18 50 18;
                M50 20 Q30 20 25 35 T25 60 Q25 75 35 80 L35 85 Q35 90 40 90 L60 90 Q65 90 65 85 L65 80 Q75 75 75 60 T70 35 Q65 20 50 20"
        dur="2s"
        repeatCount="indefinite"
      />
    </path>
    
    {/* Glowing eyes */}
    <circle cx="35" cy="45" r="8">
      <animate attributeName="r" values="8;10;8" dur="1.5s" repeatCount="indefinite" />
      <animate attributeName="fill" values="#ff0000;#ffffff;#ff0000" dur="2s" repeatCount="indefinite" />
    </circle>
    <circle cx="65" cy="45" r="8">
      <animate attributeName="r" values="8;10;8" dur="1.5s" repeatCount="indefinite" begin="0.2s" />
      <animate attributeName="fill" values="#ff0000;#ffffff;#ff0000" dur="2s" repeatCount="indefinite" begin="0.2s" />
    </circle>
    
    {/* Cracks */}
    <path
      d="M45 25 L48 30 L45 35 M55 25 L52 30 L55 35"
      stroke="#000"
      strokeWidth="1"
      fill="none"
      opacity="0.5"
    >
      <animate attributeName="opacity" values="0.5;1;0.5" dur="3s" repeatCount="indefinite" />
    </path>
  </svg>
);

const MoneyCrystalSVG = ({ color }: { color: string }) => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 100 100"
    className="w-full h-full"
    style={{ filter: `drop-shadow(0 0 30px ${color})` }}
  >
    <defs>
      <linearGradient id="crystal-gradient-main" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffed4e">
          <animate attributeName="stop-color" values="#ffed4e;#ffd700;#ffed4e" dur="3s" repeatCount="indefinite" />
        </stop>
        <stop offset="50%" stopColor="#ffd700" />
        <stop offset="100%" stopColor="#b8860b" />
      </linearGradient>
      <linearGradient id="crystal-gradient-light" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#ffed4e" stopOpacity="0.3" />
      </linearGradient>
      <filter id="crystal-glow">
        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
      <filter id="shine">
        <feSpecularLighting result="specOut" specularExponent="20" lighting-color="white">
          <fePointLight x="50" y="20" z="200">
            <animate attributeName="x" values="20;80;20" dur="4s" repeatCount="indefinite" />
          </fePointLight>
        </feSpecularLighting>
        <feComposite in="specOut" in2="SourceAlpha" operator="in" />
      </filter>
    </defs>
    
    <g transform="translate(50, 50)">
      {/* Outer rotating container */}
      <g filter="url(#crystal-glow)">
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 0 0"
          to="360 0 0"
          dur="15s"
          repeatCount="indefinite"
        />
        
        {/* Bottom crystal facet */}
        <path
          d="M0,35 L-20,15 L-15,0 L0,10 L15,0 L20,15 Z"
          fill="url(#crystal-gradient-main)"
          opacity="0.7"
        />
        
        {/* Middle crystal body */}
        <path
          d="M0,10 L-15,0 L-20,-15 L0,-25 L20,-15 L15,0 Z"
          fill="url(#crystal-gradient-main)"
          opacity="0.85"
        />
        
        {/* Top crystal point */}
        <path
          d="M0,-25 L-20,-15 L-10,-30 L0,-35 L10,-30 L20,-15 Z"
          fill="url(#crystal-gradient-light)"
          opacity="0.9"
          filter="url(#shine)"
        />
        
        {/* Central facet lines for depth */}
        <g stroke="#fff" strokeWidth="0.5" opacity="0.6">
          <path d="M0,-35 L0,35" />
          <path d="M-20,-15 L20,15" />
          <path d="M20,-15 L-20,15" />
          <path d="M-10,-30 L15,0" />
          <path d="M10,-30 L-15,0" />
        </g>
        
        {/* Inner glow effect */}
        <ellipse cx="0" cy="-5" rx="8" ry="12" fill="#fff" opacity="0.3" filter="url(#crystal-glow)">
          <animate attributeName="opacity" values="0.3;0.6;0.3" dur="2s" repeatCount="indefinite" />
        </ellipse>
      </g>
      
      {/* Floating money particles around crystal */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
        <g key={i} transform={`rotate(${angle})`}>
          <text
            x="0"
            y="-30"
            fontSize="8"
            fill="#ffd700"
            textAnchor="middle"
            opacity="0"
          >
            $
            <animateTransform
              attributeName="transform"
              type="rotate"
              from={`0 0 30`}
              to={`-${angle} 0 30`}
              dur="4s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0;1;0"
              dur="4s"
              begin={`${i * 0.5}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="y"
              values="-30;-45;-30"
              dur="4s"
              begin={`${i * 0.5}s`}
              repeatCount="indefinite"
            />
          </text>
        </g>
      ))}
      
      {/* Light refraction sparkles */}
      {[...Array(4)].map((_, i) => (
        <circle
          key={`sparkle-${i}`}
          r="1"
          fill="#fff"
          opacity="0"
        >
          <animate
            attributeName="opacity"
            values="0;1;0"
            dur="2s"
            begin={`${i * 0.5}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="cx"
            values={`${Math.cos(i * Math.PI / 2) * 25};${Math.cos(i * Math.PI / 2) * 15};${Math.cos(i * Math.PI / 2) * 25}`}
            dur="2s"
            begin={`${i * 0.5}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="cy"
            values={`${Math.sin(i * Math.PI / 2) * 25};${Math.sin(i * Math.PI / 2) * 15};${Math.sin(i * Math.PI / 2) * 25}`}
            dur="2s"
            begin={`${i * 0.5}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
    </g>
  </svg>
);

const RocketPortalSVG = ({ color }: { color: string }) => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 100 100"
    className="w-full h-full"
    style={{ filter: `drop-shadow(0 0 30px ${color})` }}
  >
    <defs>
      <radialGradient id="portal-gradient">
        <stop offset="0%" stopColor="#00ff00">
          <animate attributeName="stop-color" values="#00ff00;#00ffff;#00ff00" dur="3s" repeatCount="indefinite" />
        </stop>
        <stop offset="100%" stopColor="#001100" stopOpacity="0.3" />
      </radialGradient>
      <filter id="portal-distort">
        <feTurbulence type="turbulence" baseFrequency="0.01" numOctaves="2" result="turbulence">
          <animate attributeName="baseFrequency" values="0.01;0.03;0.01" dur="5s" repeatCount="indefinite" />
        </feTurbulence>
        <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="5" />
      </filter>
    </defs>
    
    {/* Swirling portal */}
    <g transform="translate(50, 50)">
      {/* Portal rings */}
      {[1, 2, 3].map((ring) => (
        <circle
          key={ring}
          r={ring * 12}
          fill="none"
          stroke="url(#portal-gradient)"
          strokeWidth="2"
          opacity={1 - ring * 0.2}
          filter="url(#portal-distort)"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from={`0 0 0`}
            to={`${ring % 2 === 0 ? 360 : -360} 0 0`}
            dur={`${2 * ring}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="r"
            values={`${ring * 12};${ring * 15};${ring * 12}`}
            dur="3s"
            repeatCount="indefinite"
          />
        </circle>
      ))}
      
      {/* Central vortex */}
      <path
        d="M0,0 Q-10,-20 0,-25 Q10,-20 0,0 Q10,20 0,25 Q-10,20 0,0"
        fill="#00ff00"
        opacity="0.8"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 0 0"
          to="360 0 0"
          dur="2s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="d"
          values="M0,0 Q-10,-20 0,-25 Q10,-20 0,0 Q10,20 0,25 Q-10,20 0,0;
                  M0,0 Q-15,-25 0,-30 Q15,-25 0,0 Q15,25 0,30 Q-15,25 0,0;
                  M0,0 Q-10,-20 0,-25 Q10,-20 0,0 Q10,20 0,25 Q-10,20 0,0"
          dur="2s"
          repeatCount="indefinite"
        />
      </path>
      
      {/* Energy bolts */}
      {[0, 60, 120, 180, 240, 300].map((angle, i) => (
        <line
          key={i}
          x1="0"
          y1="0"
          x2="40"
          y2="0"
          stroke="#00ff00"
          strokeWidth="1"
          opacity="0"
          transform={`rotate(${angle})`}
        >
          <animate
            attributeName="opacity"
            values="0;1;0"
            dur="1.5s"
            begin={`${i * 0.25}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="x2"
            values="0;40;0"
            dur="1.5s"
            begin={`${i * 0.25}s`}
            repeatCount="indefinite"
          />
        </line>
      ))}
    </g>
  </svg>
);

const TimeWarpSVG = ({ color }: { color: string }) => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 100 100"
    className="w-full h-full"
    style={{ filter: `drop-shadow(0 0 20px ${color})` }}
  >
    <defs>
      <linearGradient id="time-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4169e1">
          <animate attributeName="stop-color" values="#4169e1;#00bfff;#4169e1" dur="4s" repeatCount="indefinite" />
        </stop>
        <stop offset="100%" stopColor="#000080" />
      </linearGradient>
      <filter id="time-blur">
        <feGaussianBlur in="SourceGraphic" stdDeviation="0.5">
          <animate attributeName="stdDeviation" values="0.5;2;0.5" dur="3s" repeatCount="indefinite" />
        </feGaussianBlur>
      </filter>
    </defs>
    
    {/* Infinity time loop */}
    <g transform="translate(50, 50)">
      {/* Möbius strip effect */}
      <path
        d="M-30,0 Q-30,-20 -15,-20 Q0,-20 0,0 Q0,20 15,20 Q30,20 30,0 Q30,-20 15,-20 Q0,-20 0,0 Q0,20 -15,20 Q-30,20 -30,0"
        fill="none"
        stroke="url(#time-gradient)"
        strokeWidth="3"
        filter="url(#time-blur)"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 0 0"
          to="360 0 0"
          dur="8s"
          repeatCount="indefinite"
        />
      </path>
      
      {/* Time particles flowing through */}
      {[...Array(8)].map((_, i) => (
        <circle key={i} r="1.5" fill="#00bfff">
          <animateMotion
            path="M-30,0 Q-30,-20 -15,-20 Q0,-20 0,0 Q0,20 15,20 Q30,20 30,0 Q30,-20 15,-20 Q0,-20 0,0 Q0,20 -15,20 Q-30,20 -30,0"
            dur={`${4 + i * 0.5}s`}
            begin={`${i * 0.5}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="r"
            values="1.5;3;1.5"
            dur={`${4 + i * 0.5}s`}
            begin={`${i * 0.5}s`}
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0;1;0"
            dur={`${4 + i * 0.5}s`}
            begin={`${i * 0.5}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
      
      {/* Central clock hands */}
      <line x1="0" y1="0" x2="0" y2="-15" stroke="#4169e1" strokeWidth="2" opacity="0.8">
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 0 0"
          to="360 0 0"
          dur="3s"
          repeatCount="indefinite"
        />
      </line>
      <line x1="0" y1="0" x2="10" y2="0" stroke="#00bfff" strokeWidth="2" opacity="0.8">
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 0 0"
          to="360 0 0"
          dur="1s"
          repeatCount="indefinite"
        />
      </line>
    </g>
  </svg>
);

interface CounterProps {
  label: string;
  prefix?: string;
  suffix?: string;
  startValue: number;
  endValue: number;
  incrementSpeed?: number; // ms between increments
  incrementAmount?: number;
  emoji: string;
  color: string;
  glowColor: string;
  iconType: 'skull' | 'crystal' | 'portal' | 'time';
}

function AnimatedCounter({
  label,
  prefix = "",
  suffix = "",
  startValue,
  endValue,
  incrementSpeed = 50,
  incrementAmount = 1,
  emoji,
  color,
  glowColor,
  iconType,
}: CounterProps) {
  const [value, setValue] = useState(startValue);
  const [isSpinning, setIsSpinning] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Continuous spinning effect - never stops
    intervalRef.current = setInterval(() => {
      setValue((prev) => {
        const next = prev + incrementAmount;
        // Instead of stopping, continue incrementing past endValue
        return next;
      });
    }, incrementSpeed);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [incrementSpeed, incrementAmount]);

  // Format number with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const renderIcon = () => {
    switch (iconType) {
      case 'skull':
        return <DeathSkullSVG color={glowColor} />;
      case 'crystal':
        return <MoneyCrystalSVG color={glowColor} />;
      case 'portal':
        return <RocketPortalSVG color={glowColor} />;
      case 'time':
        return <TimeWarpSVG color={glowColor} />;
      default:
        return <span>{emoji}</span>;
    }
  };

  return (
    <div
      className={`glass-card rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 text-center transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 group flex flex-col justify-between min-h-[120px] sm:min-h-[140px] md:min-h-[160px]`}
      style={{
        boxShadow: `0 0 30px ${glowColor}, 0 8px 32px rgba(0, 0, 0, 0.3)`,
      }}
    >
      {/* Custom SVG Icon */}
      <div className="relative mb-1 sm:mb-2 h-12 sm:h-14 md:h-16 flex items-center justify-center">
        {/* Dynamic background glow */}
        <div 
          className="absolute inset-0 blur-2xl opacity-40"
          style={{
            background: `radial-gradient(circle, ${glowColor} 0%, transparent 60%)`,
            animation: 'pulse 4s ease-in-out infinite',
          }}
        />
        
        {/* SVG Icon Container */}
        <div className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 transform transition-transform hover:scale-110">
          {renderIcon()}
        </div>
      </div>

      {/* Label */}
      <div
        className={`text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-wider mb-1 sm:mb-2 ${color} leading-tight`}
      >
        {label}
      </div>

      {/* Counter Value with elegant animation */}
      <div
        className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white font-mono leading-tight relative`}
      >
        <span 
          className="inline-block transition-all duration-300 transform-gpu"
          style={{
            textShadow: `0 0 20px ${glowColor}, 0 0 40px ${glowColor}`,
            animation: isSpinning ? 'number-glow 2s ease-in-out infinite' : 'none',
          }}
        >
          {prefix}
          <span className="inline-block" style={{ animation: 'count-up 0.3s ease-out' }}>
            {formatNumber(value)}
          </span>
          {suffix}
        </span>
      </div>

      {/* Debt clock style spinner - always spinning fast */}
      <div className="mt-1 sm:mt-2 flex justify-center">
        <div 
          className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-t-transparent rounded-full"
          style={{
            borderColor: `${glowColor} transparent ${glowColor} ${glowColor}`,
            animation: 'spin 0.6s linear infinite',
            boxShadow: `0 0 10px ${glowColor}`,
          }}
        />
      </div>
    </div>
  );
}

// Add custom animations via style tag
const AnimationStyles = () => (
  <style jsx global>{`
    @keyframes pulse {
      0%, 100% { 
        transform: scale(1); 
        opacity: 0.4; 
      }
      50% { 
        transform: scale(1.3); 
        opacity: 0.6; 
      }
    }
    
    @keyframes number-glow {
      0%, 100% { 
        opacity: 1;
        filter: brightness(1);
      }
      50% { 
        opacity: 0.9;
        filter: brightness(1.2);
      }
    }
    
    @keyframes count-up {
      0% { 
        transform: translateY(10px);
        opacity: 0;
      }
      100% { 
        transform: translateY(0);
        opacity: 1;
      }
    }
    
    @keyframes spin {
      0% { 
        transform: rotate(0deg);
      }
      100% { 
        transform: rotate(360deg);
      }
    }
  `}</style>
);

export function DebtClockCounters() {
  const [showCounters, setShowCounters] = useState(false);

  useEffect(() => {
    // Delay showing counters for dramatic effect
    const timer = setTimeout(() => setShowCounters(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const counters = [
    {
      label: "Ideas Killed",
      emoji: "💀",
      iconType: 'skull' as const,
      startValue: 347,
      endValue: 999999,
      incrementSpeed: 500,  // Faster!
      incrementAmount: Math.floor(Math.random() * 3) + 1,
      suffix: "",
      color: "text-red-400",
      glowColor: "rgba(239, 68, 68, 0.5)",
    },
    {
      label: "Money Saved",
      emoji: "💰",
      iconType: 'crystal' as const,
      prefix: "$",
      startValue: 4200000,
      endValue: 999999999,
      incrementSpeed: 50,  // BRRRRR mode
      incrementAmount: Math.floor(Math.random() * 10000) + 5000,
      suffix: "",
      color: "text-yellow-400",
      glowColor: "rgba(250, 204, 21, 0.5)",
    },
    {
      label: "Winners Found",
      emoji: "🚀",
      iconType: 'portal' as const,
      startValue: 89,
      endValue: 999999,
      incrementSpeed: 1500,  // Moderate speed
      incrementAmount: 1,
      suffix: "",
      color: "text-green-400",
      glowColor: "rgba(34, 197, 94, 0.5)",
    },
    {
      label: "Hours Saved",
      emoji: "⏱️",
      iconType: 'time' as const,
      startValue: 127320,
      endValue: 999999999,
      incrementSpeed: 100,  // Fast counting
      incrementAmount: Math.floor(Math.random() * 100) + 50,
      suffix: "",
      color: "text-blue-400",
      glowColor: "rgba(59, 130, 246, 0.5)",
    },
  ];

  if (!showCounters) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6 max-w-6xl mx-auto">
        {counters.map((_, index) => (
          <div
            key={index}
            className="glass-card rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 min-h-[120px] sm:min-h-[140px] md:min-h-[160px] animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimationStyles />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6 max-w-6xl mx-auto">
        {counters.map((counter, index) => (
          <div
            key={counter.label}
            className="animate-fade-in w-full"
            style={{
              animationDelay: `${index * 100}ms`,
              animationFillMode: "both",
            }}
          >
            <AnimatedCounter {...counter} />
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="text-center mt-4">
        <p className="text-xs sm:text-sm text-white/50 italic font-light">
          <span className="text-white/70">*Numbers are not real</span>, but{" "}
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent font-bold not-italic uppercase tracking-wide animate-pulse">
              they could be if you join us
            </span>
            <span className="absolute -inset-1 bg-gradient-to-r from-yellow-400/20 via-orange-500/20 to-red-500/20 blur-sm rounded animate-pulse"></span>
          </span>
        </p>
      </div>
    </div>
  );
}
