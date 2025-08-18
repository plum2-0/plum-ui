import React from "react";

interface SecondaryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function SecondaryButton({
  children,
  className = "",
  ...props
}: SecondaryButtonProps) {
  return (
    <button
      className={`px-4 py-2 text-white/60 hover:text-white border border-white/20 hover:border-white/40 rounded-lg transition-all font-body text-sm bg-white/5 hover:bg-white/10 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}