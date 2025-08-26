"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface PopoverWithPortalProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  openOnHover?: boolean;
}

export function PopoverWithPortal({
  trigger,
  children,
  className,
  contentClassName,
  align = "start",
  side = "bottom",
  openOnHover = true,
}: PopoverWithPortalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

  // Create portal container
  useEffect(() => {
    if (typeof window !== "undefined") {
      let portal = document.getElementById("popover-portal");
      if (!portal) {
        portal = document.createElement("div");
        portal.id = "popover-portal";
        portal.style.position = "absolute";
        portal.style.top = "0";
        portal.style.left = "0";
        portal.style.zIndex = "9999";
        document.body.appendChild(portal);
      }
      setPortalContainer(portal);
    }
  }, []);

  // Calculate position
  useEffect(() => {
    if (!isOpen || !triggerRef.current || !contentRef.current) return;

    const updatePosition = () => {
      const triggerRect = triggerRef.current!.getBoundingClientRect();
      const contentRect = contentRef.current!.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;
      
      let top = 0;
      let left = 0;

      // Calculate vertical position based on side
      switch (side) {
        case "top":
          top = triggerRect.top + scrollY - contentRect.height - 8;
          break;
        case "bottom":
          top = triggerRect.bottom + scrollY + 8;
          break;
        case "left":
          top = triggerRect.top + scrollY + (triggerRect.height - contentRect.height) / 2;
          break;
        case "right":
          top = triggerRect.top + scrollY + (triggerRect.height - contentRect.height) / 2;
          break;
      }

      // Calculate horizontal position based on side and align
      if (side === "top" || side === "bottom") {
        switch (align) {
          case "start":
            left = triggerRect.left + scrollX;
            break;
          case "center":
            left = triggerRect.left + scrollX + (triggerRect.width - contentRect.width) / 2;
            break;
          case "end":
            left = triggerRect.right + scrollX - contentRect.width;
            break;
        }
      } else {
        // For left/right sides
        switch (side) {
          case "left":
            left = triggerRect.left + scrollX - contentRect.width - 8;
            break;
          case "right":
            left = triggerRect.right + scrollX + 8;
            break;
        }
      }

      // Ensure the popover stays within viewport
      const padding = 10;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Horizontal bounds
      if (left < padding) {
        left = padding;
      } else if (left + contentRect.width > viewportWidth - padding) {
        left = viewportWidth - contentRect.width - padding;
      }

      // Vertical bounds
      if (top < scrollY + padding) {
        top = scrollY + padding;
      } else if (top + contentRect.height > scrollY + viewportHeight - padding) {
        top = scrollY + viewportHeight - contentRect.height - padding;
      }

      setPosition({ top, left });
    };

    updatePosition();
    
    // Update position on scroll/resize
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, side, align]);

  // Click outside handler
  useEffect(() => {
    if (!isOpen) return;
    
    function handleClickOutside(event: MouseEvent) {
      if (
        triggerRef.current && 
        !triggerRef.current.contains(event.target as Node) &&
        contentRef.current &&
        !contentRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const hoverHandlers = openOnHover
    ? {
        onMouseEnter: () => setIsOpen(true),
        onMouseLeave: (e: React.MouseEvent) => {
          // Check if we're moving to the content
          const relatedTarget = e.relatedTarget as HTMLElement;
          if (contentRef.current?.contains(relatedTarget)) return;
          setIsOpen(false);
        },
      }
    : {};

  const clickHandlers = openOnHover
    ? {}
    : {
        onClick: () => setIsOpen((prev) => !prev),
      };

  const contentHoverHandlers = openOnHover
    ? {
        onMouseEnter: () => setIsOpen(true),
        onMouseLeave: () => setIsOpen(false),
      }
    : {};

  return (
    <>
      <div ref={triggerRef} className={cn("inline-block", className)} {...hoverHandlers} {...clickHandlers}>
        {trigger}
      </div>
      
      {portalContainer && isOpen && createPortal(
        <div
          ref={contentRef}
          className={cn(
            "absolute transition-all duration-200",
            isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"
          )}
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            pointerEvents: isOpen ? "auto" : "none",
          }}
          {...contentHoverHandlers}
        >
          <div
            className={cn(
              "bg-black/90 backdrop-blur-xl border border-white/20 text-white text-xs rounded-lg px-3 py-2 shadow-2xl",
              "before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-br before:from-purple-500/20 before:to-pink-500/20",
              contentClassName
            )}
          >
            <div className="relative z-10">{children}</div>
          </div>
        </div>,
        portalContainer
      )}
    </>
  );
}

export default PopoverWithPortal;