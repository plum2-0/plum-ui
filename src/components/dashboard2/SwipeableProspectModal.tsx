"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  PanInfo,
  useAnimation,
  MotionValue,
} from "framer-motion";
import { RedditPostUI } from "@/types/brand";
import ProspectCard from "./ProspectCard";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface SwipeState {
  currentIndex: number;
  isDragging: boolean;
  dragOffset: { x: number; y: number };
  rotation: number;
  swipeDirection: "left" | "right" | null;
  isAnimating: boolean;
  preloadedCards: number[]; // indices of cards to keep rendered
}

interface SwipeableProspectModalProps {
  isOpen: boolean;
  posts: RedditPostUI[];
  onSwipe?: (data: {
    direction: "left" | "right";
    post: RedditPostUI;
  }) => void | Promise<void>;
  onClose: () => void;
  onStackCompleted?: () => void;
  showActionButtons?: boolean;
  swipeThreshold?: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SWIPE_CONFIG = {
  // Swipe thresholds
  DISTANCE_THRESHOLD: 80,  // Lower threshold for easier swiping
  VELOCITY_THRESHOLD: 300,  // Lower velocity threshold

  // Visual configuration
  MAX_ROTATION: 25,
  STAMP_OPACITY_START: 30,  // Show stamps earlier
  STAMP_OPACITY_FULL: 100,  // Full opacity at lower distance

  // Card stack
  VISIBLE_CARDS: 3,
  CARD_SCALE_OFFSET: 0.05,
  CARD_Y_OFFSET: 10,

  // Animation durations (ms)
  EXIT_DURATION: 300,
  NEXT_CARD_DURATION: 250,
  THIRD_CARD_DURATION: 200,
  NEW_CARD_DURATION: 150,
  SNAP_BACK_DURATION: 200,

  // Exit animation targets
  EXIT_X_DISTANCE: 400,
  EXIT_Y_DISTANCE: 100,
  EXIT_ROTATION: 45,
  EXIT_SCALE: 0.8,
};

// ============================================================================
// COMPONENTS
// ============================================================================

// Component: SwipeStamp
function SwipeStamp({
  type,
  opacity,
}: {
  type: "like" | "nope";
  opacity: number | MotionValue<number>;
}) {
  const isLike = type === "like";

  return (
    <motion.div
      className="absolute top-8 pointer-events-none"
      style={{
        [isLike ? "right" : "left"]: "32px",
        opacity,
        transform: "rotate(-15deg)",
      }}
    >
      <div
        className="px-6 py-3 rounded-xl font-bold text-2xl uppercase tracking-wider"
        style={{
          color: isLike ? "#22c55e" : "#ef4444",
          border: `4px solid ${isLike ? "#22c55e" : "#ef4444"}`,
          backgroundColor: isLike ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
          boxShadow: `0 4px 20px ${isLike ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
        }}
      >
        {isLike ? "LIKE" : "NOPE"}
      </div>
    </motion.div>
  );
}

// Component: ActionButtons
function ActionButtons({
  onSwipe,
  disabled,
}: {
  onSwipe: (direction: "left" | "right") => void;
  disabled: boolean;
}) {
  return (
    <div className="flex justify-center gap-8 mt-8">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onSwipe("left")}
        disabled={disabled}
        className="w-16 h-16 rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        style={{
          background: "linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1))",
          border: "2px solid rgba(239, 68, 68, 0.4)",
          boxShadow: "0 4px 16px rgba(239, 68, 68, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        }}
      >
        <svg
          className="w-8 h-8 text-red-400"
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
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onSwipe("right")}
        disabled={disabled}
        className="w-16 h-16 rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        style={{
          background: "linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(34, 197, 94, 0.1))",
          border: "2px solid rgba(34, 197, 94, 0.4)",
          boxShadow: "0 4px 16px rgba(34, 197, 94, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
        }}
      >
        <svg
          className="w-8 h-8 text-emerald-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
        </svg>
      </motion.button>
    </div>
  );
}

// Component: ProgressIndicator
function ProgressIndicator({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  const progress = ((current + 1) / total) * 100;

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-white/60">
          {current + 1} of {total}
        </span>
        <span className="text-sm text-white/60">
          {Math.round(progress)}%
        </span>
      </div>
      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          style={{
            background: "linear-gradient(90deg, #8b5cf6, #3b82f6)",
          }}
        />
      </div>
    </div>
  );
}

// Component: CardStack
function CardStack({
  posts,
  currentIndex,
  isAnimating,
  swipeDirection,
  onDrag,
  onDragEnd,
  onAnimationComplete,
}: {
  posts: RedditPostUI[];
  currentIndex: number;
  isAnimating: boolean;
  swipeDirection: "left" | "right" | null;
  onDrag: (event: any, info: PanInfo) => void;
  onDragEnd: (event: any, info: PanInfo) => void;
  onAnimationComplete: () => void;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-SWIPE_CONFIG.MAX_ROTATION, 0, SWIPE_CONFIG.MAX_ROTATION]);

  // Reset motion values when animation completes and new card becomes top
  useEffect(() => {
    // Only reset when we're not animating and we have a new top card
    if (!isAnimating && !swipeDirection) {
      console.log(`[Motion Reset] Resetting x and y to 0 for new top card at index ${currentIndex}`);
      x.set(0);
      y.set(0);
    }
  }, [currentIndex, isAnimating, swipeDirection, x, y]);

  // DEBUG: Log motion value states
  useEffect(() => {
    console.log(`[CardStack Re-render] currentIndex=${currentIndex}, isAnimating=${isAnimating}, swipeDirection=${swipeDirection}`);
    console.log(`[MotionValues] x=${x.get()}, y=${y.get()}, rotate=${rotate.get()}`);

    // Monitor motion value changes
    const unsubX = x.on("change", (latest) => {
      console.log(`[X Changed] value=${latest}, currentIndex=${currentIndex}, isAnimating=${isAnimating}`);
    });
    const unsubY = y.on("change", (latest) => {
      console.log(`[Y Changed] value=${latest}, currentIndex=${currentIndex}, isAnimating=${isAnimating}`);
    });

    return () => {
      unsubX();
      unsubY();
    };
  }, [currentIndex, isAnimating, swipeDirection]);

  // Calculate stamp opacity based on drag distance
  const likeOpacity = useTransform(x, [SWIPE_CONFIG.STAMP_OPACITY_START, SWIPE_CONFIG.STAMP_OPACITY_FULL], [0, 1]);
  const nopeOpacity = useTransform(x, [-SWIPE_CONFIG.STAMP_OPACITY_FULL, -SWIPE_CONFIG.STAMP_OPACITY_START], [1, 0]);

  // Get the cards to display - using currentIndex to slice from full posts array
  const visiblePosts = posts.slice(currentIndex, Math.min(currentIndex + SWIPE_CONFIG.VISIBLE_CARDS + 1, posts.length));

  return (
    <div
      className="relative"
      style={{
        height: "600px",
        perspective: "1000px",
      }}
    >
      <AnimatePresence mode="popLayout">
        {visiblePosts.map((post, index) => {
          const isTop = index === 0 && !isAnimating;
          const isExiting = index === 0 && isAnimating && swipeDirection;
          const cardIndex = index;
          const absoluteIndex = currentIndex + index;  // Use absolute index for keys

          // DEBUG: Log card state
          console.log(`[Card ${absoluteIndex}] isTop=${isTop}, isExiting=${isExiting}, cardIndex=${cardIndex}, post=${post?.thing_id.slice(0, 8)}`);

          // Calculate positioning for stack effect
          const scale = 1 - cardIndex * SWIPE_CONFIG.CARD_SCALE_OFFSET;
          const yOffset = cardIndex * SWIPE_CONFIG.CARD_Y_OFFSET;
          const zIndex = SWIPE_CONFIG.VISIBLE_CARDS - cardIndex;

          // Shadow intensity based on position
          const shadowOpacity = 0.3 - cardIndex * 0.1;
          const shadowBlur = 40 - cardIndex * 10;

          if (isExiting && swipeDirection) {
            // Exit animation for swiped card
            return (
              <motion.div
                key={`card-${absoluteIndex}-exit`}
                className="absolute inset-0"
                initial={{
                  x: x.get(),
                  y: y.get(),
                  rotate: rotate.get(),
                  scale: 1,
                }}
                animate={{
                  x: swipeDirection === "right" ? SWIPE_CONFIG.EXIT_X_DISTANCE : -SWIPE_CONFIG.EXIT_X_DISTANCE,
                  y: swipeDirection === "right" ? -SWIPE_CONFIG.EXIT_Y_DISTANCE : SWIPE_CONFIG.EXIT_Y_DISTANCE,
                  rotate: swipeDirection === "right" ? SWIPE_CONFIG.EXIT_ROTATION : -SWIPE_CONFIG.EXIT_ROTATION,
                  opacity: 0,
                  scale: SWIPE_CONFIG.EXIT_SCALE,
                }}
                transition={{
                  duration: SWIPE_CONFIG.EXIT_DURATION / 1000,
                  ease: "easeOut",
                }}
                onAnimationComplete={() => {
                  console.log(`[EXIT Animation Complete] Card ${absoluteIndex}, x=${x.get()}, y=${y.get()}`);
                  onAnimationComplete();
                }}
                style={{ zIndex: zIndex + 10 }}
              >
                <ProspectCard post={post} className="h-full" />
                <SwipeStamp
                  type={swipeDirection === "right" ? "like" : "nope"}
                  opacity={1}
                />
              </motion.div>
            );
          }

          if (isTop) {
            // Top draggable card
            console.log(`[TOP CARD] Creating draggable card ${absoluteIndex}, key=card-${absoluteIndex}, x=${x.get()}, y=${y.get()}`);
            return (
              <motion.div
                key={`card-${absoluteIndex}`}
                className="absolute inset-0 cursor-grab active:cursor-grabbing"
                initial={{
                  x: 0,
                  y: 0,
                  rotate: 0,
                }}
                style={{
                  x,
                  y,
                  rotate,
                  zIndex,
                  boxShadow: `0 ${shadowBlur}px ${shadowBlur * 2}px rgba(0, 0, 0, ${shadowOpacity})`,
                }}
                drag={!isAnimating}
                dragSnapToOrigin={true}
                dragElastic={0.2}
                dragConstraints={{
                  left: -300,
                  right: 300,
                  top: -200,
                  bottom: 200,
                }}
                onDrag={(event, info) => {
                  onDrag(event, info);
                }}
                onDragEnd={(event, info) => {
                  onDragEnd(event, info);
                  // Reset motion values when snap back occurs
                  if (Math.abs(info.offset.x) < SWIPE_CONFIG.DISTANCE_THRESHOLD) {
                    setTimeout(() => {
                      x.set(0);
                      y.set(0);
                    }, 50);
                  }
                }}
                whileDrag={{
                  scale: 1.05,
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 30,
                }}
              >
                <ProspectCard post={post} className="h-full" />
                <SwipeStamp type="like" opacity={likeOpacity} />
                <SwipeStamp type="nope" opacity={nopeOpacity} />
              </motion.div>
            );
          }

          // Background cards with scaling animation
          const targetScale = isAnimating ? scale + SWIPE_CONFIG.CARD_SCALE_OFFSET : scale;
          const targetY = isAnimating ? yOffset - SWIPE_CONFIG.CARD_Y_OFFSET : yOffset;

          return (
            <motion.div
              key={`card-${absoluteIndex}`}
              className="absolute inset-0 pointer-events-none"
              initial={cardIndex === SWIPE_CONFIG.VISIBLE_CARDS ? {
                scale: scale - SWIPE_CONFIG.CARD_SCALE_OFFSET,
                y: yOffset + SWIPE_CONFIG.CARD_Y_OFFSET,
                opacity: 0,
              } : false}
              animate={{
                scale: targetScale,
                y: targetY,
                opacity: 1,
              }}
              transition={{
                duration: (cardIndex === 1 ? SWIPE_CONFIG.NEXT_CARD_DURATION :
                          cardIndex === 2 ? SWIPE_CONFIG.THIRD_CARD_DURATION :
                          SWIPE_CONFIG.NEW_CARD_DURATION) / 1000,
                ease: "easeOut",
              }}
              style={{
                zIndex,
                boxShadow: `0 ${shadowBlur}px ${shadowBlur * 2}px rgba(0, 0, 0, ${shadowOpacity})`,
              }}
            >
              <ProspectCard post={post} className="h-full" />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SwipeableProspectModal({
  isOpen,
  posts,
  onSwipe,
  onClose,
  onStackCompleted,
  showActionButtons = true,
  swipeThreshold = SWIPE_CONFIG.DISTANCE_THRESHOLD,
}: SwipeableProspectModalProps) {
  const [state, setState] = useState<SwipeState>({
    currentIndex: 0,
    isDragging: false,
    dragOffset: { x: 0, y: 0 },
    rotation: 0,
    swipeDirection: null,
    isAnimating: false,
    preloadedCards: [0, 1, 2, 3],
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setState({
        currentIndex: 0,
        isDragging: false,
        dragOffset: { x: 0, y: 0 },
        rotation: 0,
        swipeDirection: null,
        isAnimating: false,
        preloadedCards: [0, 1, 2, 3],
      });
    }
  }, [isOpen]);

  // Handle drag events
  const handleDrag = useCallback((event: any, info: PanInfo) => {
    setState(prev => ({
      ...prev,
      isDragging: true,
      dragOffset: info.offset,
      rotation: info.offset.x * 0.15,
    }));
  }, []);

  // Execute swipe animation and callbacks
  const executeSwipe = useCallback(async (direction: "left" | "right") => {
    if (state.isAnimating || state.currentIndex >= posts.length) return;

    const currentPost = posts[state.currentIndex];

    setState(prev => ({
      ...prev,
      isAnimating: true,
      swipeDirection: direction,
    }));

    // Call onSwipe callback
    if (onSwipe) {
      try {
        await onSwipe({ direction, post: currentPost });
      } catch (error) {
        console.error("Error in onSwipe:", error);
      }
    }
  }, [state.currentIndex, state.isAnimating, posts, onSwipe]);

  // Handle drag end - determine if swipe occurred
  const handleDragEnd = useCallback((event: any, info: PanInfo) => {
    const swipeDistance = Math.abs(info.offset.x);
    const swipeVelocity = Math.abs(info.velocity.x);

    if (swipeDistance > swipeThreshold || swipeVelocity > SWIPE_CONFIG.VELOCITY_THRESHOLD) {
      const direction = info.offset.x > 0 ? "right" : "left";
      executeSwipe(direction);
    } else {
      // Snap back
      setState(prev => ({
        ...prev,
        isDragging: false,
        dragOffset: { x: 0, y: 0 },
        rotation: 0,
      }));
    }
  }, [swipeThreshold, executeSwipe]);

  // Handle animation completion
  const handleAnimationComplete = useCallback(() => {
    console.log(`[handleAnimationComplete] Called, currentIndex=${state.currentIndex}`);
    setState(prev => {
      const nextIndex = prev.currentIndex + 1;
      const isComplete = nextIndex >= posts.length;

      console.log(`[State Transition] currentIndex ${prev.currentIndex} -> ${nextIndex}, isAnimating: true -> false`);

      if (isComplete) {
        setTimeout(() => {
          onStackCompleted?.();
          onClose();
        }, 200);
      }

      return {
        ...prev,
        currentIndex: nextIndex,
        isAnimating: false,
        swipeDirection: null,
        dragOffset: { x: 0, y: 0 },
        rotation: 0,
        preloadedCards: [nextIndex, nextIndex + 1, nextIndex + 2, nextIndex + 3],
      };
    });
  }, [posts.length, onStackCompleted, onClose, state.currentIndex]);

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

  if (!mounted || !isOpen || posts.length === 0) return null;

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
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{
              background: "rgba(0, 0, 0, 0.7)",
              backdropFilter: "blur(20px)",
            }}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 25,
            }}
            className="relative z-10 w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute -top-12 right-0 p-2 rounded-full transition-all hover:bg-white/10"
            >
              <svg
                className="w-6 h-6 text-white/60 hover:text-white"
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

            {/* Progress Indicator */}
            <ProgressIndicator
              current={state.currentIndex}
              total={posts.length}
            />

            {/* Card Stack */}
            {state.currentIndex < posts.length && (
              <CardStack
                posts={posts}
                currentIndex={state.currentIndex}
                isAnimating={state.isAnimating}
                swipeDirection={state.swipeDirection}
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
                onAnimationComplete={handleAnimationComplete}
              />
            )}

            {/* Action Buttons */}
            {showActionButtons && (
              <ActionButtons
                onSwipe={executeSwipe}
                disabled={state.isAnimating}
              />
            )}

            {/* Instructions */}
            <div className="mt-6 text-center">
              <p className="text-sm text-white/40">
                Swipe right to save • Swipe left to skip
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}