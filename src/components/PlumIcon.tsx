export function PlumIcon() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <defs>
        <linearGradient id="plumGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="45" r="30" fill="url(#plumGradient)" />
      <ellipse cx="50" cy="75" rx="15" ry="20" fill="url(#plumGradient)" opacity="0.8" />
      <path d="M50 15 Q55 10 60 12 Q58 15 55 17 L50 20 Z" fill="#34D399" />
    </svg>
  )
}