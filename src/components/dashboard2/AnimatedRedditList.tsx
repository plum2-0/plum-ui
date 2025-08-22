"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedRedditListProps {
  children: ReactNode[];
  className?: string;
}

export default function AnimatedRedditList({ 
  children, 
  className = "space-y-4" 
}: AnimatedRedditListProps) {
  return (
    <AnimatePresence mode="wait">
      <div className={className}>
        {children.map((child, index) => (
          <motion.div
            key={index}
            initial={{ 
              opacity: 0, 
              y: -50,
              scale: 0.95,
              rotateX: -15
            }}
            animate={{ 
              opacity: 1, 
              y: 0,
              scale: 1,
              rotateX: 0
            }}
            exit={{ 
              opacity: 0, 
              y: 100,
              scale: 0.9,
              rotateX: 15
            }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 15,
              delay: index * 0.08,
              opacity: { duration: 0.3 },
              scale: { duration: 0.4 }
            }}
            style={{
              transformPerspective: 1000,
              transformStyle: "preserve-3d"
            }}
            whileHover={{
              y: -5,
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
          >
            {child}
          </motion.div>
        ))}
      </div>
    </AnimatePresence>
  );
}