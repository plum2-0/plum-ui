# 🌾 Plum 2.0 Farming Theme Style Guide

## Theme Inspiration
**"I Somehow Got Strong By Raising Skills Related To Farming"**
A lighthearted shōnen aesthetic where Reddit engagement feels like cultivating a magical farm that accidentally becomes legendary.

## Core Design Principles

### 1. Visual Hierarchy as Growth Stages
- **Seeds** (pending) → **Sprouts** (in progress) → **Harvest** (completed)
- Each interaction level represents farming progression
- Skills and features "level up" through cultivation

### 2. Warm, Optimistic Energy
- Golden hour lighting throughout
- Soft, approachable rounded corners
- Particle effects for achievements (golden sparkles, growth animations)

## Color Palette

### Primary Colors
```css
farm: {
  soil:  '#704214',  /* Rich earth - borders, grounding elements */
  leaf:  '#4CAF60',  /* Fresh growth - CTAs, success states */
  wheat: '#F5D36D',  /* Golden harvest - highlights, achievements */
  sky:   '#8FD4FF',  /* Clear day - backgrounds, spacious feeling */
  night: '#24301E',  /* Evening rest - text, depth */
  magic: '#50FFC4',  /* Legendary glow - special effects, OP moments */
}
```

### Extended Palette
```css
extended: {
  sage:   '#7FB069',  /* Herbs - secondary actions */
  mint:   '#9CFF88',  /* Fresh - hover states */
  sunset: '#FF9F45',  /* Dusk - warnings, time-sensitive */
  bloom:  '#FFB7C5',  /* Flowers - celebrations */
  storm:  '#6B7C93',  /* Weather - disabled states */
}
```

### Gradient Schemes
```css
gradients: {
  dawn:    'from-farm-sky via-farm-wheat to-white',
  midday:  'from-blue-400 via-farm-sky to-farm-wheat',
  sunset:  'from-orange-300 via-farm-wheat to-pink-200',
  harvest: 'from-farm-wheat via-yellow-200 to-white',
}
```

## Typography

### Font Families
- **Headings**: 'Cinzel', serif - Epic, storybook quality for titles
- **Body**: 'Nunito', sans-serif - Friendly, readable for content
- **Accents**: 'Kalam', cursive - Handwritten notes, personal touches

### Font Sizes & Usage
```css
text-xs:   0.75rem  /* Skill requirements, metadata */
text-sm:   0.875rem /* Secondary info, timestamps */
text-base: 1rem     /* Body text, descriptions */
text-lg:   1.125rem /* Subheadings, important stats */
text-xl:   1.25rem  /* Section headers */
text-2xl:  1.5rem   /* Page titles */
text-3xl:  1.875rem /* Hero text */
```

## Component Patterns

### Cards (Quest Panels)
```css
.card-farm {
  @apply bg-white/70 backdrop-blur-md 
         border border-farm-sage/30
         rounded-2xl p-6 shadow-lg
         hover:shadow-farm transition-all;
}
```

### Buttons (Action Seeds)
```css
/* Primary - Plant/Harvest Actions */
.btn-primary {
  @apply bg-farm-leaf text-white 
         hover:bg-farm-magic shadow-farm
         transition-all duration-200;
}

/* Secondary - Tool Selection */
.btn-secondary {
  @apply border-2 border-farm-sage text-farm-sage
         hover:bg-farm-sage hover:text-white;
}

/* Skill Badges */
.badge-skill {
  @apply bg-farm-wheat/90 text-farm-soil
         rounded-full px-3 py-1 text-xs font-bold;
}
```

### Layout Patterns

#### Dashboard Structure
```
┌─────────────────────────────────────┐
│ Header (Farm Status Bar)            │ glass-morphism overlay
├────────┬────────────────────────────┤
│ Skills │ Main Field (Content)       │
│ Panel  │                            │ sky gradient background
│        │ • Quest Cards              │
│        │ • Harvest Reports          │
│        │ • Growth Metrics           │
└────────┴────────────────────────────┘
```

#### Responsive Breakpoints
- Mobile: Stack skills above content
- Tablet: Side-by-side with collapsible skills
- Desktop: Full layout with expanded details

## Interactive States

### Hover Effects
- **Cards**: Subtle lift with glow (`shadow-farm`)
- **Buttons**: Color shift to magic green
- **Skills**: Pulse animation suggesting growth

### Loading States
```css
@keyframes grow {
  0%   { height: 0; opacity: 0; }
  50%  { opacity: 1; }
  100% { height: 100%; opacity: 1; }
}
```

### Success Animations
- Golden particle burst
- "Level Up" text float
- Harvest complete shimmer

## Iconography

### Skill Icons
- 🌱 Beginner (seed)
- 🌿 Intermediate (sprout)
- 🌾 Advanced (wheat)
- ✨ Legendary (magical)

### Status Indicators
- 🟢 Growing (active)
- 🟡 Ready to harvest (pending action)
- 🔵 Watering needed (requires input)
- ⚪ Dormant (inactive)

## Spacing System

Using Tailwind's spacing scale with farming context:
```
p-1: Seed spacing (0.25rem)
p-2: Sprout spacing (0.5rem)
p-4: Plant spacing (1rem)
p-6: Row spacing (1.5rem)
p-8: Field spacing (2rem)
```

## Animation Guidelines

### Micro-interactions
- **Button clicks**: Quick "plant" animation (scale down then up)
- **Card hover**: Gentle float upward
- **Progress bars**: Smooth growth from left to right
- **Notifications**: Slide in from top with bounce

### Page Transitions
- **Route changes**: Fade with slight vertical movement
- **Modal opens**: Grow from center
- **Sidebar toggle**: Slide with momentum

## Accessibility

### Color Contrast
- Minimum 4.5:1 for normal text
- 3:1 for large text and UI components
- Test all color combinations for WCAG AA compliance

### Focus States
```css
.focus-farm {
  @apply outline-none ring-2 ring-farm-magic ring-offset-2;
}
```

### Motion Preferences
```css
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; }
}
```

## Implementation Checklist

### Phase 1: Foundation ✅
- [x] Create this style guide
- [ ] Configure Tailwind with farm colors
- [ ] Set up font imports
- [ ] Create base component classes

### Phase 2: Containers
- [ ] Sky gradient backgrounds
- [ ] Glass-morphism overlays
- [ ] Layout grid system

### Phase 3: Components
- [ ] Transform cards to quest panels
- [ ] Restyle buttons as action seeds
- [ ] Create skill badge system
- [ ] Design harvest notifications

### Phase 4: Polish
- [ ] Add growth animations
- [ ] Implement particle effects
- [ ] Create loading states
- [ ] Add sound effects (optional)

## Usage Examples

### Quest Card
```jsx
<div className="card-farm hover:shadow-farm transition-all">
  <div className="flex items-start justify-between mb-4">
    <h3 className="font-heading text-lg text-farm-night">Daily Quest</h3>
    <span className="badge-skill">+50 XP</span>
  </div>
  <p className="text-farm-soil">Engage with 3 Reddit posts about your product.</p>
  <button className="btn-primary mt-4">
    🌱 Start Quest
  </button>
</div>
```

### Skill Progress
```jsx
<div className="bg-farm-wheat/20 rounded-full p-1">
  <div className="bg-gradient-to-r from-farm-leaf to-farm-magic rounded-full h-2 w-3/4"></div>
</div>
```

## Seasonal Variations (Future)

### Spring Theme
- Emphasis on greens and pastels
- Growth and new beginnings

### Summer Theme
- Bright, vibrant colors
- Peak harvest energy

### Autumn Theme
- Warm oranges and golds
- Harvest celebration

### Winter Theme
- Cool blues with warm accents
- Planning and preparation

---

*"Your Reddit presence isn't just growing—it's becoming legendary, one post at a time."* 🌾✨