"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PlumSproutLoaderProps {
  show?: boolean;
}

export function PlumSproutLoader({ show = true }: PlumSproutLoaderProps) {
  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div 
          className="flex flex-col items-center justify-center gap-4"
          initial={{ scale: 0, opacity: 0, rotate: -180 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          exit={{ scale: 0, opacity: 0, rotate: 180 }}
          transition={{
            duration: 0.5,
            ease: [0.34, 1.56, 0.64, 1], // Custom spring-like easing
          }}
        >
          <div className="relative w-24 h-24">
            {/* Plum/Sprout animation */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
          {/* Main plum circle */}
          <div className="relative w-20 h-20">
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 shadow-2xl"
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            
            {/* Happy face */}
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Eyes */}
              <div className="absolute top-6 left-6 w-2 h-2 bg-white rounded-full animate-pulse" />
              <div className="absolute top-6 right-6 w-2 h-2 bg-white rounded-full animate-pulse" />
              
              {/* Smile */}
              <motion.div
                className="absolute bottom-5 left-1/2 -translate-x-1/2"
                animate={{
                  scaleX: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <svg width="30" height="15" viewBox="0 0 30 15" fill="none">
                  <path
                    d="M5 5 Q15 12, 25 5"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </motion.div>
            </div>
            
            {/* Sprout leaves */}
            <motion.div
              className="absolute -top-3 left-1/2 -translate-x-1/2"
              animate={{
                rotate: [-5, 5, -5],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <svg width="30" height="20" viewBox="0 0 30 20" fill="none">
                <path
                  d="M15 15 Q10 5, 5 8 Q10 10, 15 15"
                  fill="url(#leafGradient1)"
                />
                <path
                  d="M15 15 Q20 5, 25 8 Q20 10, 15 15"
                  fill="url(#leafGradient2)"
                />
                <defs>
                  <linearGradient id="leafGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#86efac" />
                    <stop offset="100%" stopColor="#22c55e" />
                  </linearGradient>
                  <linearGradient id="leafGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#86efac" />
                    <stop offset="100%" stopColor="#22c55e" />
                  </linearGradient>
                </defs>
              </svg>
            </motion.div>
          </div>
        </motion.div>

        {/* Bouncing dots below */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {[0, 0.2, 0.4].map((delay, i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-purple-400 rounded-full"
              animate={{
                y: [0, -8, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
          </div>
          
          <motion.p
            className="text-white/60 text-sm font-medium mt-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: [0.5, 1, 0.5],
              y: 0,
            }}
            transition={{
              opacity: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              },
              y: {
                duration: 0.3,
                delay: 0.2,
              },
            }}
          >
            Loading profile...
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}