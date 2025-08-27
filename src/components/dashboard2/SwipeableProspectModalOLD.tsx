"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
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
import { glassStyles } from "@/lib/styles/glassMorphism";
import ProspectCard from "./ProspectCard";
import { LiquidButton } from "@/components/ui/LiquidButton";

// ============================================================================
// CONSTANTS & TYPES
// ============================================================================

export type SwipeDirection = "left" | "right";

export const SWIPE_CONFIG = {
  // Swipe detection thresholds
  DISTANCE_THRESHOLD: 100, // Minimum distance to trigger swipe
  VELOCITY_THRESHOLD: 500, // Minimum velocity to trigger swipe

  // Visual configuration
  MAX_ROTATION: 30, // Maximum rotation angle when dragging
  VISIBLE_CARDS: 3, // Number of cards visible in stack

  // Card stack offsets
  CARD_SCALE_OFFSET: 0.06, // Scale reduction per card in stack
  CARD_Y_OFFSET: -30, // Y-axis offset per card in stack

  // Drag behavior
  DRAG_ELASTIC: 0.2,
  DRAG_CONSTRAINTS: {
    left: -500,
    right: 500,
    top: -300,
    bottom: 300,
  },

  // Animation springs
  SPRING: {
    DRAG_TRANSITION: {
      type: "spring",
      stiffness: 400,
      damping: 30,
    },
    EXIT_TRANSITION: {
      type: "spring",
      stiffness: 200,
      damping: 30,
      duration: 0.5,
    },
    CARD_TRANSITION: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
    MODAL_TRANSITION: {
      type: "spring",
      stiffness: 260,
      damping: 20,
    },
  },

  // Exit animations
  EXIT_ANIMATION: {
    LEFT: {
      x: -1.5,
      y: 100,
      rotate: -45,
      opacity: 0,
      scale: 0.8,
    },
    RIGHT: {
      x: 1.5,
      y: -100,
      rotate: 45,
      opacity: 0,
      scale: 0.8,
    },
  },
} as const;

interface AnimationState {
  state: "idle" | "dragging" | "exiting";
  direction: SwipeDirection | null;
  startPosition: { x: number; y: number };
}

// ============================================================================
// HOOKS
// ============================================================================

// Hook: useCardStack - Manages card state and swipe logic
function useCardStack({
  posts,
  isOpen,
  onSwipe,
  onStackCompleted,
  onClose,
}: {
  posts: RedditPostUI[];
  isOpen: boolean;
  onSwipe?: (args: {
    direction: SwipeDirection;
    post: RedditPostUI;
  }) => void | Promise<void>;
  onStackCompleted?: () => void;
  onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitingPost, setExitingPost] = useState<RedditPostUI | null>(null);
  const [animationState, setAnimationState] = useState<AnimationState>({
    state: "idle",
    direction: null,
    startPosition: { x: 0, y: 0 },
  });

  const activeStack = posts.slice(currentIndex);
  const progress =
    posts.length > 0 ? ((currentIndex + 1) / posts.length) * 100 : 0;

  console.log(`[ACTIVE STACK] Current state:`, {
    currentIndex,
    stackSize: activeStack.length,
    topCard: activeStack[0]?.title?.substring(0, 30),
    secondCard: activeStack[1]?.title?.substring(0, 30),
    thirdCard: activeStack[2]?.title?.substring(0, 30),
  });

  const handleSwipe = useCallback(
    async (direction: SwipeDirection) => {
      console.log(`[HANDLE SWIPE START]`, {
        direction,
        currentIndex,
        totalPosts: posts.length,
        animationState: animationState.state,
      });

      if (animationState.state !== "idle" || currentIndex >= posts.length) {
        console.log(`[HANDLE SWIPE BLOCKED]`, {
          reason:
            animationState.state !== "idle" ? "not idle" : "no more posts",
        });
        return;
      }

      const currentPost = posts[currentIndex];

      console.log(`[SWIPE ANIMATION] Setting exit state for:`, {
        postId: currentPost.thing_id,
        postTitle: currentPost.title?.substring(0, 30),
        direction,
      });

      setExitingPost(currentPost);
      setAnimationState({
        state: "exiting",
        direction,
        startPosition: { x: 0, y: 0 },
      });

      if (onSwipe) {
        try {
          await onSwipe({ direction, post: currentPost });
        } catch (error) {
          console.error("Error in onSwipe:", error);
        }
      }

      // Wait for exit animation to complete
      setTimeout(() => {
        console.log(`[SWIPE COMPLETE] Exit animation done, advancing index`);

        setCurrentIndex((prev) => {
          const nextIndex = prev + 1;

          console.log(`[INDEX UPDATE]`, {
            previousIndex: prev,
            nextIndex,
            totalPosts: posts.length,
            isLastCard: nextIndex >= posts.length,
          });

          if (nextIndex >= posts.length) {
            // Defer these callbacks to avoid state updates during render
            setTimeout(() => {
              if (onStackCompleted) {
                console.log(`[STACK COMPLETED] Calling onStackCompleted`);
                onStackCompleted();
              }
            }, 0);
            setTimeout(() => {
              console.log(`[MODAL CLOSING] After 500ms delay`);
              onClose();
            }, 500);
          }

          return nextIndex;
        });

        setExitingPost(null);
        setAnimationState({
          state: "idle",
          direction: null,
          startPosition: { x: 0, y: 0 },
        });

        console.log(`[STATE RESET] Back to idle, exitingPost cleared`);
      }, 300); // Reduced to 300ms to make transition feel snappier
    },
    [
      currentIndex,
      posts,
      animationState.state,
      onSwipe,
      onStackCompleted,
      onClose,
    ]
  );

  const resetStack = useCallback(() => {
    setCurrentIndex(0);
    setExitingPost(null);
    setAnimationState({
      state: "idle",
      direction: null,
      startPosition: { x: 0, y: 0 },
    });
  }, []);

  useEffect(() => {
    if (isOpen && currentIndex === 0) {
      resetStack();
    }
  }, [isOpen, posts]);

  return {
    currentIndex,
    exitingPost,
    activeStack,
    progress,
    animationState,
    handleSwipe,
    resetStack,
  };
}

// Hook: useSwipeGesture - Manages drag and swipe gestures
function useSwipeGesture({
  onSwipe,
  enabled = true,
}: {
  onSwipe: (direction: SwipeDirection) => void;
  enabled?: boolean;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-30, 0, 30]);
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

  const handleDragEnd = useCallback(
    (event: any, info: PanInfo) => {
      if (!enabled) return;

      const swipeDistance = Math.abs(info.offset.x);
      const swipeVelocity = Math.abs(info.velocity.x);

      if (
        swipeDistance > SWIPE_CONFIG.DISTANCE_THRESHOLD ||
        swipeVelocity > SWIPE_CONFIG.VELOCITY_THRESHOLD
      ) {
        const direction = info.offset.x > 0 ? "right" : "left";
        onSwipe(direction);
      }
    },
    [enabled, onSwipe]
  );

  const resetPosition = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return {
    x,
    y,
    rotate,
    likeOpacity,
    nopeOpacity,
    handleDragEnd,
    resetPosition,
  };
}

// ============================================================================
// COMPONENTS
// ============================================================================

// Component: ProgressBar
function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="mb-6">
      <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
          style={{
            background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
          }}
        />
      </div>
    </div>
  );
}

// Component: SwipeIndicators
function SwipeIndicators({
  likeOpacity,
  nopeOpacity,
}: {
  likeOpacity: MotionValue<number>;
  nopeOpacity: MotionValue<number>;
}) {
  return (
    <>
      {/* LIKE indicator */}
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

      {/* NOPE indicator */}
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
    </>
  );
}

// Component: ActionButtons
function ActionButtons({
  onSwipe,
  disabled = false,
}: {
  onSwipe: (direction: SwipeDirection) => void;
  disabled?: boolean;
}) {
  return (
    <div className="mt-6 flex justify-center gap-6">
      <LiquidButton
        variant="danger"
        size="icon"
        onClick={() => onSwipe("left")}
        className="p-4 rounded-full"
        shimmer
        disabled={disabled}
      >
        <svg
          className="w-8 h-8"
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
      </LiquidButton>

      <LiquidButton
        variant="primary"
        size="icon"
        onClick={() => onSwipe("right")}
        className="p-4 rounded-full"
        shimmer
        disabled={disabled}
      >
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
            clipRule="evenodd"
          />
        </svg>
      </LiquidButton>
    </div>
  );
}

// Component: SwipeCard
function SwipeCard({
  post,
  isDraggable = false,
  isExiting = false,
  exitDirection = null,
  motionValues,
  onDragEnd,
  zIndex = 10,
}: {
  post: RedditPostUI;
  isDraggable?: boolean;
  isExiting?: boolean;
  exitDirection?: SwipeDirection | null;
  motionValues?: {
    x: MotionValue<number>;
    y: MotionValue<number>;
    rotate: MotionValue<number>;
    likeOpacity?: MotionValue<number>;
    nopeOpacity?: MotionValue<number>;
  };
  onDragEnd?: (event: any, info: PanInfo) => void;
  zIndex?: number;
}) {
  if (isExiting && exitDirection) {
    const exitConfig =
      exitDirection === "right"
        ? SWIPE_CONFIG.EXIT_ANIMATION.RIGHT
        : SWIPE_CONFIG.EXIT_ANIMATION.LEFT;

    return (
      <motion.div
        key={`exit-${post.thing_id}`}
        className="absolute inset-0"
        initial={{
          x: motionValues?.x?.get() || 0,
          y: motionValues?.y?.get() || 0,
          rotate: motionValues?.rotate?.get() || 0,
          scale: 1,
          opacity: 1,
        }}
        animate={{
          x: exitConfig.x * window.innerWidth,
          y: exitConfig.y,
          opacity: exitConfig.opacity,
          scale: exitConfig.scale,
          rotate: exitConfig.rotate,
        }}
        transition={SWIPE_CONFIG.SPRING.EXIT_TRANSITION}
        style={{ zIndex: zIndex + 1 }}
      >
        <ProspectCard post={post} className="h-full" />

        {/* Show indicator on exiting card */}
        {exitDirection === "right" && (
          <div className="absolute top-8 left-8 pointer-events-none">
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
          </div>
        )}

        {exitDirection === "left" && (
          <div className="absolute top-8 right-8 pointer-events-none">
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
          </div>
        )}
      </motion.div>
    );
  }

  if (isDraggable && motionValues) {
    return (
      <motion.div
        key={post.thing_id}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        layoutId={`card-${post.thing_id}`}
        style={{
          x: motionValues.x,
          y: motionValues.y,
          rotate: motionValues.rotate,
          zIndex,
        }}
        drag
        dragSnapToOrigin
        dragElastic={SWIPE_CONFIG.DRAG_ELASTIC}
        dragConstraints={SWIPE_CONFIG.DRAG_CONSTRAINTS}
        onDragEnd={onDragEnd}
        whileDrag={{
          cursor: "grabbing",
          scale: 1.05,
        }}
        animate={{
          scale: 1,
          opacity: 1,
        }}
        transition={SWIPE_CONFIG.SPRING.DRAG_TRANSITION}
      >
        <ProspectCard post={post} className="h-full" />
        {motionValues.likeOpacity && motionValues.nopeOpacity && (
          <SwipeIndicators
            likeOpacity={motionValues.likeOpacity}
            nopeOpacity={motionValues.nopeOpacity}
          />
        )}
      </motion.div>
    );
  }

  // Static background card
  return (
    <motion.div
      key={`bg-${post.thing_id}`}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex }}
    >
      <ProspectCard post={post} className="h-full" />
    </motion.div>
  );
}

// Component: CardStack
function CardStack({
  activeStack,
  currentIndex,
  exitingPost,
  animationState,
  motionValues,
  onDragEnd,
}: {
  activeStack: RedditPostUI[];
  currentIndex: number;
  exitingPost: RedditPostUI | null;
  animationState: AnimationState;
  motionValues?: {
    x: MotionValue<number>;
    y: MotionValue<number>;
    rotate: MotionValue<number>;
    likeOpacity: MotionValue<number>;
    nopeOpacity: MotionValue<number>;
  };
  onDragEnd?: (event: any, info: PanInfo) => void;
}) {
  // Calculate how many background cards to show
  const visibleBackgroundCards = Math.min(
    SWIPE_CONFIG.VISIBLE_CARDS - 1,
    activeStack.length - 1
  );

  return (
    <div
      className="relative flex"
      style={{
        height: "calc(85vh - 120px)",
        maxHeight: "900px",
        perspective: "1000px",
      }}
    >
      {/* Render all visible cards in unified stack */}
      {activeStack
        .slice(0, SWIPE_CONFIG.VISIBLE_CARDS + 1)
        .map((post, index) => {
          if (!post) return null;

          // Skip the top card if it's exiting
          if (index === 0 && animationState.state === "exiting") {
            return null;
          }

          // Calculate display position based on animation state
          let displayPosition = index;
          if (animationState.state === "exiting" && index > 0) {
            // During exit, cards slide up one position
            displayPosition = index - 1;
          }

          // Don't show cards beyond visible range
          if (displayPosition >= SWIPE_CONFIG.VISIBLE_CARDS) {
            return null;
          }

          const scale = 1 - displayPosition * SWIPE_CONFIG.CARD_SCALE_OFFSET;
          const yOffset = displayPosition * SWIPE_CONFIG.CARD_Y_OFFSET;
          const isTopCard =
            displayPosition === 0 && animationState.state !== "exiting";
          const isDraggable = isTopCard;
          const zIndex =
            SWIPE_CONFIG.VISIBLE_CARDS - displayPosition + (isTopCard ? 1 : 0);

          // Only the 4th card (index 3) fades in during exit animation
          const isNewlyEntering =
            index === 3 && animationState.state === "exiting";

          console.log(
            `[UNIFIED STACK] Card ${index} at position ${displayPosition}:`,
            {
              postId: post.thing_id,
              postTitle: post.title?.substring(0, 30),
              scale,
              yOffset,
              isTopCard,
              isDraggable,
              zIndex,
              isNewlyEntering,
              animState: animationState.state,
            }
          );

          return (
            <motion.div
              key={`card-${post.thing_id}`}
              className={`absolute inset-0 ${
                isDraggable ? "" : "pointer-events-none"
              }`}
              layoutId={`card-${post.thing_id}`}
              initial={
                isNewlyEntering
                  ? {
                      scale: 0.82,
                      y: 90,
                      opacity: 0,
                    }
                  : false
              }
              animate={{
                scale,
                y: yOffset,
                opacity: 1,
              }}
              transition={{
                ...SWIPE_CONFIG.SPRING.CARD_TRANSITION,
                opacity: { duration: 0.2 },
              }}
              style={{
                zIndex,
                transformStyle: "preserve-3d",
              }}
            >
              <SwipeCard
                post={post}
                isDraggable={isDraggable}
                motionValues={isDraggable ? motionValues : undefined}
                onDragEnd={isDraggable ? onDragEnd : undefined}
                zIndex={zIndex}
              />
            </motion.div>
          );
        })}

      {/* Exit animation card */}
      <AnimatePresence>
        {exitingPost && animationState.direction && (
          <SwipeCard
            key={`exit-${exitingPost.thing_id}`}
            post={exitingPost}
            isExiting
            exitDirection={animationState.direction}
            motionValues={motionValues}
            zIndex={SWIPE_CONFIG.VISIBLE_CARDS + 2}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface SwipeableProspectModalProps {
  isOpen: boolean;
  posts: RedditPostUI[];
  onSwipe?: (args: {
    direction: SwipeDirection;
    post: RedditPostUI;
  }) => void | Promise<void>;
  onClose: () => void;
  onStackCompleted?: () => void;
  standalone?: boolean;
}

export default function SwipeableProspectModalOLD({
  isOpen,
  posts,
  onSwipe,
  onClose,
  onStackCompleted,
  standalone = false,
}: SwipeableProspectModalProps) {
  const router = useRouter();

  // Use custom hooks for state management
  const {
    currentIndex,
    exitingPost,
    activeStack,
    progress,
    animationState,
    handleSwipe,
    resetStack,
  } = useCardStack({
    posts,
    isOpen,
    onSwipe,
    onStackCompleted,
    onClose,
  });

  // Use gesture hook for drag handling
  const {
    x,
    y,
    rotate,
    likeOpacity,
    nopeOpacity,
    handleDragEnd,
    resetPosition,
  } = useSwipeGesture({
    onSwipe: handleSwipe,
    enabled: animationState.state === "idle",
  });

  // Reset position when animation state changes
  useEffect(() => {
    if (animationState.state === "exiting") {
      resetPosition();
    }
  }, [animationState.state, resetPosition]);

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

  if (!isOpen || activeStack.length === 0) return null;

  const content = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={
            standalone
              ? "flex items-center justify-center min-h-screen p-4"
              : "fixed inset-0 z-50 flex items-center justify-center p-4"
          }
          onClick={() => !standalone && router.push("/dashboard/engage")}
        >
          {/* Backdrop with enhanced liquid blur - only show if not standalone */}
          {!standalone && (
            <div
              className="absolute inset-0"
              style={{
                ...glassStyles.dark,
              }}
            />
          )}

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={SWIPE_CONFIG.SPRING.MODAL_TRANSITION}
            className={
              standalone ? "w-full max-w-lg" : "relative z-10 w-full max-w-lg"
            }
            onClick={(e) => !standalone && e.stopPropagation()}
          >
            {/* Progress Bar */}
            <ProgressBar progress={progress} />

            {/* Card Stack */}
            <CardStack
              activeStack={activeStack}
              currentIndex={currentIndex}
              exitingPost={exitingPost}
              animationState={animationState}
              motionValues={{
                x,
                y,
                rotate,
                likeOpacity,
                nopeOpacity,
              }}
              onDragEnd={handleDragEnd}
            />

            {/* Action Buttons */}
            <ActionButtons
              onSwipe={handleSwipe}
              disabled={animationState.state !== "idle"}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // If standalone, render directly. Otherwise, use portal for modal behavior
  return standalone ? content : createPortal(content, document.body);
}
