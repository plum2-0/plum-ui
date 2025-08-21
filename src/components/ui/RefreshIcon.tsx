import React from 'react';
import { motion } from 'framer-motion';

export const RefreshIcon: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <motion.svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      initial={{ rotate: 0 }}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        ease: "easeInOut",
      }}
    >
      <defs>
        <linearGradient id="refreshGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="50%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      <path
        d="M4 4v5h5M20 20v-5h-5"
        stroke="url(#refreshGradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.938 8.5A8 8 0 0118.433 16M20.062 15.5A8 8 0 015.567 8"
        stroke="url(#refreshGradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </motion.svg>
  );
};