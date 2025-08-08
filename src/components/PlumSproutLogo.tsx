// components/PlumSproutLogo.tsx
export function PlumSproutLogo({ className = "w-6 h-6" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      {/* Plum base */}
      <circle cx="12" cy="14" r="6" className="fill-farm-sage" />
      {/* Sprout leaf */}
      <path
        d="M12 8c2.5-4 6-4 6-4-1 3-4 5-6 4ZM12 8c-2.5-4-6-4-6-4 1 3 4 5 6 4Z"
        className="fill-[color:var(--color-sprout-accent)]"
      />
    </svg>
  );
}
