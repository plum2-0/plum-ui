"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LiquidGlassCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  glowColor?: string;
}

export default function LiquidGlassCard({
  children,
  className,
  title,
  subtitle,
  glowColor = "rgba(139, 92, 246, 0.3)",
}: LiquidGlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={cn("relative", className)}
      style={{
        filter: "drop-shadow(0 20px 40px rgba(0, 0, 0, 0.3))",
      }}
    >
      {/* Neumorphic background layers */}
      <div className="absolute inset-0 rounded-3xl overflow-hidden">
        {/* Liquid gradient animation */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              "radial-gradient(ellipse at top left, rgba(139, 92, 246, 0.1) 0%, transparent 40%)",
              "radial-gradient(ellipse at bottom right, rgba(59, 130, 246, 0.1) 0%, transparent 40%)",
              "radial-gradient(ellipse at top right, rgba(236, 72, 153, 0.1) 0%, transparent 40%)",
              "radial-gradient(ellipse at top left, rgba(139, 92, 246, 0.1) 0%, transparent 40%)",
            ],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Glass morphism with stronger blur */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%)",
            backdropFilter: "blur(80px) saturate(1.3)",
            WebkitBackdropFilter: "blur(80px) saturate(1.3)",
          }}
        />
        
        {/* Neumorphic inner shadow */}
        <div
          className="absolute inset-0"
          style={{
            boxShadow: "inset 0 2px 20px rgba(255, 255, 255, 0.05), inset 0 -2px 20px rgba(0, 0, 0, 0.2)",
          }}
        />
      </div>
      
      {/* Ultra-thin border */}
      <div
        className="absolute inset-0 rounded-3xl"
        style={{
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)",
          padding: "0.5px",
        }}
      >
        <div
          className="w-full h-full rounded-3xl"
          style={{
            background: "rgba(0, 0, 0, 0.6)",
          }}
        />
      </div>
      
      {/* Content container */}
      <div className="relative z-10 p-8">
        {/* Header */}
        {(title || subtitle) && (
          <div className="mb-6">
            {title && (
              <motion.h3
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-lg font-heading font-semibold text-white/70 mb-1 tracking-wide"
              >
                {title}
              </motion.h3>
            )}
            {subtitle && (
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-xs font-body text-white/40 font-light"
              >
                {subtitle}
              </motion.p>
            )}
          </div>
        )}
        
        {/* Chart content with fade in */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          {children}
        </motion.div>
      </div>
      
      {/* Subtle top highlight */}
      <div
        className="absolute top-0 left-[20%] right-[20%] h-[0.5px]"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%)",
        }}
      />
    </motion.div>
  );
}