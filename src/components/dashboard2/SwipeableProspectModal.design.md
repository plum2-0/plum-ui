# SwipeableProspectModal Design Document

## Overview
A Tinder-like card swipe experience for reviewing Reddit prospects, with smooth animations, visual feedback, and attention to UX details.

## Core Architecture

### 1. State Management
```typescript
interface SwipeState {
  currentIndex: number
  isDragging: boolean
  dragOffset: { x: number, y: number }
  rotation: number
  swipeDirection: 'left' | 'right' | null
  isAnimating: boolean
  preloadedCards: number[] // indices of cards to keep rendered
}
```

### 2. Component Structure
```
SwipeableProspectModal
├── CardStack
│   ├── ActiveCard (top card, draggable)
│   ├── NextCard (visible behind)
│   ├── ThirdCard (slightly visible for depth)
│   └── PreloadCard (invisible, for smooth transitions)
├── SwipeIndicators
│   ├── LikeStamp (heart, fades in on right swipe)
│   └── NopeStamp (X, fades in on left swipe)
├── ActionButtons (optional manual controls)
└── ProgressIndicator
```

## Animation Coordination Strategy

### Phase 1: Drag Interaction
- **User drags card**: Card follows finger/mouse position
- **Rotation calculation**: Based on horizontal drag distance
  - Max rotation: ±25 degrees
  - Formula: `rotation = (dragX / screenWidth) * 50`
- **Stamp opacity**: Progressive fade-in based on drag distance
  - Threshold: 30px to start showing (lowered from 50px for earlier feedback)
  - Full opacity at: 100px (lowered from 150px for quicker visual confirmation)

### Phase 2: Release Decision Point
**Swipe Threshold**: 80px or velocity > 300px/s

> **Learning**: Initial thresholds (120px/500px) were too high for comfortable swiping. Users struggled to trigger swipes, with cards consistently snapping back. Lowered to 80px/300px for better UX.

#### If Below Threshold:
- Spring animation back to center
- Rotation returns to 0
- Stamps fade out
- Duration: 200ms

#### If Above Threshold:
- Card continues in swipe direction
- Exit animation triggers
- Next card scales up simultaneously

### Phase 3: Card Exit & Stack Update
**Parallel Animations** (crucial for smooth handoff):

1. **Exiting Card** (duration: 300ms):
   - Translate X: ±400px (off screen)
   - Translate Y: ±100px (slight arc)
   - Rotation: ±45 degrees
   - Opacity: 0 (fade during last 100ms)
   - Scale: 0.8

2. **Next Card → Active** (duration: 250ms):
   - Scale: 0.95 → 1.0
   - Y position: 10px → 0px
   - Shadow: subtle → prominent
   - Z-index update after animation

3. **Third Card → Next** (duration: 200ms):
   - Scale: 0.9 → 0.95
   - Y position: 20px → 10px
   - Opacity: 0.8 → 1.0

4. **New Third Card** (duration: 150ms):
   - Fade in from opacity 0
   - Scale: 0.85 → 0.9
   - Y position: 30px → 20px

## Implementation Details

### 1. Gesture Handling

> **Critical Learning**: Stamp opacity must use Framer Motion's `MotionValue` objects, not regular state. Direct state updates caused stamps to persist after drag release.

```typescript
// Using framer-motion for gestures with MotionValues
const x = useMotionValue(0);
const rotate = useTransform(x, [-200, 0, 200], [-25, 0, 25]);

// Stamp opacity MUST use transforms for proper cleanup
const likeOpacity = useTransform(
  x,
  [0, 30, 130],
  [0, 0, 1]
);
const nopeOpacity = useTransform(
  x,
  [-130, -30, 0],
  [1, 0, 0]
);
```

### 2. Animation Timing Coordination
```typescript
const executeSwipe = async (direction: 'left' | 'right') => {
  // 1. Start exit animation
  setIsAnimating(true)
  
  // 2. Trigger parallel animations
  Promise.all([
    animateCardExit(direction),    // 300ms
    animateNextCardUp(),            // 250ms
    animateThirdCardUp(),           // 200ms
    preloadNewCard()                // Async
  ])
  
  // 3. After shortest animation (200ms), update indices
  setTimeout(() => {
    setCurrentIndex(prev => prev + 1)
  }, 200)
  
  // 4. After longest animation (300ms), reset state
  setTimeout(() => {
    setIsAnimating(false)
    onSwipe({ direction, post: posts[currentIndex] })
  }, 300)
}
```

### 3. Visual Polish Details

#### Card Shadows
- Active card: `0 20px 40px rgba(0,0,0,0.3)`
- Next card: `0 10px 20px rgba(0,0,0,0.2)`
- Third card: `0 5px 10px rgba(0,0,0,0.1)`

#### Tilt Physics
- Card tilts toward drag direction
- 3D perspective: `perspective(1000px)`
- Slight Y-axis rotation for depth

#### Stamp Design
- Like: Green heart, slight pulse animation
- Nope: Red X, slight shake animation
- Border appears first, then fills in
- 45-degree angle stamp rotation

### 4. Performance Optimizations

1. **Card Preloading**
   - Keep 4 cards in DOM (current + 3)
   - Lazy load card content
   - Use CSS transforms (GPU accelerated)

2. **Animation Batching**
   - Single RAF for all animations
   - Use `will-change` sparingly
   - Debounce rapid swipes

3. **Memory Management**
   - Remove cards from DOM after index - 2
   - Cancel pending animations on unmount
   - Clean up event listeners

## Props Interface
```typescript
interface SwipeableProspectModalProps {
  isOpen: boolean
  posts: RedditPostUI[]
  onSwipe?: (data: {
    direction: 'left' | 'right'
    post: RedditPostUI
  }) => void | Promise<void>
  onClose: () => void
  onStackCompleted?: () => void
  showActionButtons?: boolean
  swipeThreshold?: number
}
```

## Edge Cases & Error Handling

1. **Rapid Swiping**: Queue animations, prevent overlap
2. **Last Card**: Special handling, maybe disable swipe
3. **Empty Stack**: Show empty state
4. **Mid-animation Close**: Gracefully cancel all animations
5. **Touch vs Mouse**: Unified gesture system
6. **Screen Rotation**: Recalculate boundaries
7. **Index Management**: 
   - **Critical Issue Found**: Double-slicing the posts array causes ghost cards
   - **Solution**: Pass full array with currentIndex, slice only in CardStack
   - **Key Strategy**: Use absolute indices for React keys to prevent DOM recycling

## Testing Considerations

1. **Animation Timing**: Mock timers for testing
2. **Gesture Simulation**: Test drag thresholds
3. **State Consistency**: Ensure index updates correctly
4. **Memory Leaks**: Test rapid mount/unmount
5. **Accessibility**: Keyboard navigation support

## Implementation Lessons Learned

### Key Discoveries
1. **Swipe Thresholds**: User testing revealed 120px/500px too high; 80px/300px provides better UX
2. **MotionValue Requirements**: Stamps must use Framer Motion transforms, not React state
3. **Index Management**: Avoid double-slicing arrays; use absolute indices for keys
4. **Visual Feedback Timing**: Earlier stamp appearance (30px) improves user confidence

### Common Pitfalls to Avoid
- Don't slice the posts array multiple times (parent + child)
- Don't use regular state for drag-dependent values
- Don't use relative indices for React keys in animated lists
- Don't set thresholds too high for mobile/touch interfaces

### Successful Patterns
- Use `useMotionValue` and `useTransform` for all drag-related values
- Pass full data arrays with indices rather than pre-sliced arrays
- Lower thresholds for better mobile UX
- Use absolute indices (`currentIndex + index`) for stable keys

## Next Steps

✅ ~~Create base component structure~~
✅ ~~Implement gesture handling with framer-motion~~
✅ ~~Build animation coordination system~~
✅ ~~Add visual polish (stamps, shadows)~~
✅ ~~Optimize performance~~
6. Add accessibility features
7. Write comprehensive tests