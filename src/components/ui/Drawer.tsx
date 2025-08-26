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

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
  height?: "sm" | "md" | "lg" | "full";
}

const heightMap = {
  sm: "40vh",
  md: "60vh",
  lg: "80vh",
  full: "95vh",
};

export function Drawer({
  isOpen,
  onClose,
  children,
  title,
  className,
  height = "lg",
}: DrawerProps) {
  const dragY = useMotionValue(0);
  const opacity = useTransform(dragY, [0, 300], [1, 0]);
  const scale = useTransform(dragY, [0, 300], [1, 0.95]);
  const portalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const portal = document.getElementById("drawer-portal");
      if (!portal) {
        const newPortal = document.createElement("div");
        newPortal.id = "drawer-portal";
        document.body.appendChild(newPortal);
      }
      portalRef.current = document.getElementById(
        "drawer-portal"
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
    if (info.offset.y > 100 || info.velocity.y > 500) {
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

          {/* Drawer */}
          <motion.div
            className={cn(
              "fixed bottom-0 left-0 right-0 z-[9999]",
              "rounded-t-3xl overflow-hidden",
              className
            )}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 300,
            }}
            drag="y"
            dragDirectionLock
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={handleDragEnd}
            style={{
              height: heightMap[height],
              ...glassStyles.ultra,
              opacity,
              scale,
            }}
          >
            {/* Drag Handle */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 rounded-full bg-white/20" />

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
                  <h2 className="text-lg font-semibold bg-gradient-to-r from-purple-400 via-green-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
                    {title}
                  </h2>
                </div>
              )}

              {/* Body */}
              <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-4">
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