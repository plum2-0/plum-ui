"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  motion,
  AnimatePresence,
  PanInfo,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { RedditPost } from "@/types/brand";
import ProspectCard from "./ProspectCard";

interface SwipeableProspectModalProps {
  isOpen: boolean;
  posts: RedditPost[];
  onClose: () => void;
  onLike: (post: RedditPost) => void;
  onIgnore: (post: RedditPost) => void;
  onStackCompleted?: () => void;
}

const SWIPE_THRESHOLD = 100;
const MAX_ROTATION = 30; // Increased rotation for better visual feedback
const VISIBLE_CARDS = 3; // Number of cards visible in the stack

export default function SwipeableProspectModal({
  isOpen,
  posts,
  onClose,
  onLike,
  onIgnore,
  onStackCompleted,
}: SwipeableProspectModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(
    null
  );
  const [isAnimating, setIsAnimating] = useState(false);

  // Motion values for drag
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Transform x position to rotation
  const rotate = useTransform(
    x,
    [-300, 0, 300],
    [-MAX_ROTATION, 0, MAX_ROTATION]
  );

  // Transform x position to opacity for indicators
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

  // Dynamic transforms for background cards based on top card movement
  const dragProgress = useTransform(x, [-300, 0, 300], [1, 0, 1]);
  
  // Scale and opacity for second card
  const secondCardScale = useTransform(dragProgress, [0, 1], [1, 0.95]);
  const secondCardOpacity = useTransform(dragProgress, [0, 1], [1, 0.6]);
  
  // Scale and opacity for third card
  const thirdCardScale = useTransform(dragProgress, [0, 1], [0.95, 0.9]);
  const thirdCardOpacity = useTransform(dragProgress, [0, 1], [0.5, 0.3]);

  const currentPost = posts[currentIndex];
  const hasNext = currentIndex < posts.length - 1;
  const progress =
    posts.length > 0 ? ((currentIndex + 1) / posts.length) * 100 : 0;

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setExitDirection(null);
      setIsAnimating(false);
      x.set(0);
      y.set(0);
    }
  }, [isOpen, x, y]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
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

  const handleSwipe = useCallback(
    (direction: "left" | "right") => {
      if (!currentPost || isAnimating) return;

      setIsAnimating(true);
      setExitDirection(direction);

      // Call the appropriate callback
      if (direction === "right") {
        onLike(currentPost);
      } else {
        onIgnore(currentPost);
      }

      // Smooth transition to next card
      if (hasNext) {
        // Allow exit animation to start, then update index
        setTimeout(() => {
          setCurrentIndex((prev) => prev + 1);
          setExitDirection(null);
          // Reset motion values for the new top card
          x.set(0);
          y.set(0);
        }, 200);  // Delay to let exit animation start properly
        
        // Clear animation flag after transition completes
        setTimeout(() => {
          setIsAnimating(false);
        }, 800);  // Match the longer animation duration
      } else {
        // Last card: allow exit animation, then signal completion and close
        setTimeout(() => {
          onStackCompleted?.();
          onClose();
          setExitDirection(null);
          setIsAnimating(false);
          x.set(0);
          y.set(0);
        }, 750);  // Match the longer animation duration
      }
    },
    [
      currentPost,
      hasNext,
      onLike,
      onIgnore,
      onStackCompleted,
      onClose,
      isAnimating,
      x,
      y,
    ]
  );

  const handleDragEnd = (_: any, info: PanInfo) => {
    const swipeVelocity = info.velocity.x;
    const swipeDistance = info.offset.x;

    // Check if we should trigger a swipe based on velocity OR distance
    const shouldSwipe =
      Math.abs(swipeVelocity) > 500 ||
      Math.abs(swipeDistance) > SWIPE_THRESHOLD;

    if (shouldSwipe) {
      const direction = swipeDistance > 0 ? "right" : "left";
      handleSwipe(direction);
    }
    // Card will automatically spring back due to drag constraints
  };

  if (!isOpen || posts.length === 0) return null;

  const cardVariants = {
    initial: {
      scale: 1,
      opacity: 0,
      y: 20,
    },
    animate: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        opacity: { duration: 0.2 },
      },
    },
    exit: (custom: "left" | "right" | null) => {
      const exitX =
        custom === "left"
          ? -(window.innerWidth + 400)  // Ensure card goes fully off screen
          : custom === "right"
          ? window.innerWidth + 400  // Ensure card goes fully off screen
          : 0;
      const exitRotate = 
        custom === "left"
          ? -60  // More dramatic rotation
          : custom === "right"
          ? 60  // More dramatic rotation
          : 0;
      return {
        x: exitX,
        y: custom ? -50 + Math.random() * 100 : 0,  // Slight upward motion
        rotate: exitRotate,
        opacity: 0,
        transition: {
          duration: 0.7,  // Slightly longer for complete animation
          ease: [0.25, 0.1, 0.25, 1],  // Custom easing for natural motion
          opacity: { duration: 0.4 },  // Fade out faster than movement
        },
      };
    },
  } as const;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop with blur */}
          <div
            className="absolute inset-0"
            style={{
              background: "rgba(0, 0, 0, 0.8)",
              backdropFilter: "blur(30px)",
            }}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Progress Bar */}
            <div className="mb-4">
              <div
                className="h-1 rounded-full overflow-hidden"
                style={{
                  background: "rgba(255, 255, 255, 0.1)",
                }}
              >
                <motion.div
                  className="h-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ type: "spring", damping: 20 }}
                  style={{
                    background: "linear-gradient(90deg, #22c55e, #a855f7)",
                  }}
                />
              </div>
              <div className="mt-2 text-center text-white/60 text-sm">
                {currentIndex + 1} of {posts.length} prospects
              </div>
            </div>

            {/* Card Stack */}
            <div className="relative" style={{ height: "600px", perspective: "1000px" }}>
              {/* Render background cards first (in reverse order for proper stacking) */}
              {[...Array(Math.min(VISIBLE_CARDS - 1, posts.length - currentIndex - 1))].map((_, idx) => {
                const cardIndex = VISIBLE_CARDS - 1 - idx;
                const postIndex = currentIndex + cardIndex;
                
                if (postIndex >= posts.length) return null;
                
                const post = posts[postIndex];
                const offset = cardIndex * 8;
                const baseScale = 1 - (cardIndex * 0.05);
                const baseOpacity = 1 - (cardIndex * 0.3);
                
                return (
                  <motion.div
                    key={`bg-${post.thing_id}`}
                    className="absolute inset-0 pointer-events-none"
                    initial={{ 
                      scale: baseScale - 0.05,
                      y: offset + 10,
                      opacity: 0
                    }}
                    animate={{ 
                      scale: cardIndex === 1 ? secondCardScale : thirdCardScale,
                      y: offset,
                      opacity: cardIndex === 1 ? secondCardOpacity : thirdCardOpacity,
                      rotateX: cardIndex * 2, // Slight tilt for depth
                    }}
                    transition={{
                      scale: { type: "spring", stiffness: 300, damping: 30 },
                      opacity: { duration: 0.2 },
                      y: { type: "spring", stiffness: 300, damping: 30 }
                    }}
                    style={{ 
                      zIndex: VISIBLE_CARDS - cardIndex,
                      transformStyle: "preserve-3d"
                    }}
                  >
                    <ProspectCard post={post} className="h-full" />
                  </motion.div>
                );
              })}

              {/* Active draggable card */}
              <AnimatePresence mode="popLayout" custom={exitDirection}>
                {currentPost && (
                  <motion.div
                    key={currentPost.thing_id}
                    className="absolute inset-0 cursor-grab active:cursor-grabbing"
                    style={{
                      x,
                      y,
                      rotate,
                      zIndex: VISIBLE_CARDS + 1,
                    }}
                    drag
                    dragSnapToOrigin={true}
                    dragElastic={0.2}
                    dragConstraints={{
                      top: -50,
                      bottom: 50,
                      left: -1000,
                      right: 1000,
                    }}
                    onDragEnd={handleDragEnd}
                    whileDrag={{
                      cursor: "grabbing",
                      scale: 1.05,
                    }}
                    variants={cardVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    custom={exitDirection}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                    }}
                  >
                    <ProspectCard
                      post={currentPost}
                      className="h-full overflow-y-auto"
                    />

                    {/* Like Indicator */}
                    <motion.div
                      className="absolute top-8 left-8 pointer-events-none"
                      style={{ opacity: likeOpacity }}
                    >
                      <div
                        className="p-4 rounded-full"
                        style={{
                          background: "rgba(34, 197, 94, 0.2)",
                          border: "3px solid #22c55e",
                          boxShadow: "0 0 20px rgba(34, 197, 94, 0.5)",
                        }}
                      >
                        <svg
                          className="w-12 h-12 text-emerald-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </motion.div>

                    {/* Ignore Indicator */}
                    <motion.div
                      className="absolute top-8 right-8 pointer-events-none"
                      style={{ opacity: nopeOpacity }}
                    >
                      <div
                        className="p-4 rounded-full"
                        style={{
                          background: "rgba(239, 68, 68, 0.2)",
                          border: "3px solid #ef4444",
                          boxShadow: "0 0 20px rgba(239, 68, 68, 0.5)",
                        }}
                      >
                        <svg
                          className="w-12 h-12 text-red-400"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={3}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={() => handleSwipe("left")}
                className="p-4 rounded-full transition-all hover:scale-110"
                style={{
                  background: "rgba(239, 68, 68, 0.2)",
                  border: "2px solid rgba(239, 68, 68, 0.5)",
                }}
              >
                <svg
                  className="w-8 h-8 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <button
                onClick={() => handleSwipe("right")}
                className="p-4 rounded-full transition-all hover:scale-110"
                style={{
                  background: "rgba(34, 197, 94, 0.2)",
                  border: "2px solid rgba(34, 197, 94, 0.5)",
                }}
              >
                <svg
                  className="w-8 h-8 text-emerald-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute -top-12 right-0 p-2 rounded-full text-white/60 hover:text-white transition-colors"
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(10px)",
              }}
            >
              <svg
                className="w-6 h-6"
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
