"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  motion,
  AnimatePresence,
  PanInfo,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { glassStyles } from "@/lib/styles/glassMorphism";
import { liquidGradients } from "@/lib/styles/gradients";

interface RightSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
  width?: string;
}

export function RightSidePanel({
  isOpen,
  onClose,
  children,
  title,
  className,
  width = "450px",
}: RightSidePanelProps) {
  const dragX = useMotionValue(0);
  const opacity = useTransform(dragX, [0, 200], [1, 0]);
  const portalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const portal = document.getElementById("right-panel-portal");
      if (!portal) {
        const newPortal = document.createElement("div");
        newPortal.id = "right-panel-portal";
        document.body.appendChild(newPortal);
      }
      portalRef.current = document.getElementById(
        "right-panel-portal"
      ) as HTMLDivElement;
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (info.offset.x > 100 || info.velocity.x > 500) {
      onClose();
    }
  };

  if (!portalRef.current) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[9998]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              background: "rgba(0, 0, 0, 0.6)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          />

          {/* Right Panel */}
          <motion.div
            className={cn(
              "fixed top-0 right-0 bottom-0 z-[9999]",
              "overflow-hidden shadow-2xl",
              className
            )}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 300,
            }}
            drag="x"
            dragDirectionLock
            dragConstraints={{ left: 0 }}
            dragElastic={{ left: 0, right: 0.5 }}
            onDragEnd={handleDragEnd}
            style={{
              width,
              ...glassStyles.ultra,
              opacity,
              borderLeft: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            {/* Liquid gradient overlay */}
            <div
              className="absolute inset-0 opacity-30 pointer-events-none"
              style={{
                background: liquidGradients.purpleGreenSubtle,
              }}
            />

            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ x: "-100%" }}
              animate={{ x: "200%" }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatDelay: 2,
                ease: "linear",
              }}
              style={{
                background: liquidGradients.shimmer,
                opacity: 0.1,
              }}
            />

            {/* Content */}
            <div className="relative h-full flex flex-col">
              {/* Header */}
              {title && (
                <div className="px-6 py-4 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold bg-gradient-to-r from-purple-400 via-green-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
                      {title}
                    </h2>
                    <button
                      onClick={onClose}
                      className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <svg
                        className="w-5 h-5 text-white/60"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Body */}
              <div className="flex-1 overflow-y-auto overscroll-contain">
                {children}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    portalRef.current
  );
}