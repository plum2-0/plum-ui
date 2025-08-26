"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface PopoverProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  openOnHover?: boolean;
}

export function Popover({
  trigger,
  children,
  className,
  contentClassName,
  align = "start",
  side = "bottom",
  openOnHover = true,
}: PopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function onDocClick(event: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [isOpen]);

  const hoverHandlers = openOnHover
    ? {
        onMouseEnter: () => setIsOpen(true),
        onMouseLeave: () => setIsOpen(false),
      }
    : {};

  const clickHandlers = openOnHover
    ? {}
    : {
        onClick: () => setIsOpen((prev) => !prev),
      };

  const sideClasses = {
    top: "bottom-full mb-2",
    right: "left-full ml-2",
    bottom: "top-full mt-2",
    left: "right-full mr-2",
  } as const;

  const alignClasses = {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0",
  } as const;

  const caretSideBorder = {
    top: "border-t-white/20",
    right: "border-r-white/20",
    bottom: "border-b-white/20",
    left: "border-l-white/20",
  } as const;

  function renderCaret() {
    // Simple caret that matches the previous style
    const base = "absolute w-0 h-0 border-4 border-transparent";
    switch (side) {
      case "top":
        return (
          <div
            className={cn(base, "top-full left-4 mt-1", caretSideBorder.top)}
          />
        );
      case "right":
        return (
          <div
            className={cn(base, "right-full top-4 mr-1", caretSideBorder.right)}
          />
        );
      case "bottom":
        return (
          <div
            className={cn(
              base,
              "bottom-full left-4 -mb-1",
              caretSideBorder.bottom
            )}
          />
        );
      case "left":
        return (
          <div
            className={cn(base, "left-full top-4 ml-1", caretSideBorder.left)}
          />
        );
      default:
        return null;
    }
  }

  return (
    <div ref={containerRef} className={cn("relative inline-block", className)}>
      <div className="inline-flex" {...hoverHandlers} {...clickHandlers}>
        {trigger}
      </div>
      <div
        className={cn(
          "absolute z-50 pointer-events-none opacity-0 scale-95 transition-all duration-300",
          sideClasses[side],
          alignClasses[align],
          isOpen && "opacity-100 scale-100"
        )}
      >
        <div className="relative">
          <div
            className={cn(
              "relative bg-black/80 backdrop-blur-xl border border-white/20 text-white text-xs rounded-lg px-3 py-2 w-64 shadow-2xl",
              "before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-purple-500/20 before:to-pink-500/20",
              contentClassName
            )}
          >
            <div className="relative pointer-events-auto">{children}</div>
          </div>
          {renderCaret()}
        </div>
      </div>
    </div>
  );
}

export default Popover;
