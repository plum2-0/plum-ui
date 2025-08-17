"use client";

interface MobileMenuButtonProps {
  onClick: () => void;
  className?: string;
}

export default function MobileMenuButton({ onClick, className = "" }: MobileMenuButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-lg bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-colors md:hidden ${className}`}
      aria-label="Open menu"
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    </button>
  );
}