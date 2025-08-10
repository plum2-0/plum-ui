# Reddit Agent Dashboard - UI Design Specification

## Design System Overview

### Visual Theme: Liquid Glass
- **Primary Background**: Deep gradient from `#0F0F23` to `#1A0B2E` to `#2D1B3D`
- **Glass Effects**: Semi-transparent cards with `backdrop-filter: blur(20px)` and `rgba(255, 255, 255, 0.08)` backgrounds
- **Accent Colors**: 
  - Purple gradient: `#A855F7` to `#8B5CF6`
  - Green gradient: `#22C55E` to `#10B981`
  - Orange/Red for urgency: `#F97316` to `#EF4444`
- **Floating Orbs**: Animated background elements with radial gradients
- **Border Style**: 1px solid `rgba(255, 255, 255, 0.2)`
- **Typography**: 
  - Headings: Bold, tracking-wide, white with drop shadows
  - Body: Medium weight, `rgba(255, 255, 255, 0.9)`

---

## Screen 1: Main Dashboard View

### Layout Structure
```
┌──────────────────────────────────────────────────────────────┐
│                    Summary Statistics Bar                      │
├─────────────────────────────────────┬────────────────────────┤
│                                     │                        │
│     AI Initiatives Panel            │    Timeline View       │
│         (70% width)                 │     (30% width)        │
│                                     │                        │
│  ┌─────────────────────────────┐   │  ┌──────────────────┐  │
│  │  Initiative Card 1          │   │  │  Aug 10          │  │
│  └─────────────────────────────┘   │  │  • 5:00 PM Post  │  │
│                                     │  │  • 6:30 PM Like  │  │
│  ┌─────────────────────────────┐   │  │                  │  │
│  │  Initiative Card 2          │   │  │  Aug 11          │  │
│  └─────────────────────────────┘   │  │  • 8:00 AM Posts │  │
│                                     │  │                  │  │
│  ┌─────────────────────────────┐   │  │  Aug 12          │  │
│  │  Initiative Card 3          │   │  │  • Comments      │  │
│  └─────────────────────────────┘   │  └──────────────────┘  │
│                                     │                        │
└─────────────────────────────────────┴────────────────────────┘
```

### Component Specifications

#### 1. Summary Statistics Bar
- **Height**: 120px
- **Style**: Glass card with subtle glow effect
- **Metrics Display**:
  ```
  ┌─────────────┬─────────────┬─────────────┬─────────────┬─────────────┐
  │ Today's     │ Weekly      │ Success     │ Karma       │ Pending     │
  │ Engagements │ Growth      │ Rate        │ Gained      │ Actions     │
  │    247      │   +23%      │   87%       │  +1,234     │     8       │
  └─────────────┴─────────────┴─────────────┴─────────────┴─────────────┘
  ```
- **Interactive**: Each metric pulses with subtle animation on hover
- **Colors**: Green for positive metrics, purple for neutral, orange for pending

#### 2. AI Initiatives Panel
- **Container**: Glass card with inner padding of 24px
- **Header**: "AI Suggested Actions" with filter chips (All, Posts, Comments, Likes)
- **Initiative Cards**:
  - **Spacing**: 16px between cards
  - **Card Structure**:
    ```
    ┌──────────────────────────────────────────────────────┐
    │ [Icon] [Type Badge]              [Time Badge]        │
    │                                                       │
    │ Title: "Post about How to Handle Chronic Headaches"  │
    │ Target: r/health                                     │
    │ Confidence: ████████░░ 85%                          │
    │                                                       │
    │ [Review] [Schedule] [Edit] [Dismiss]                 │
    └──────────────────────────────────────────────────────┘
    ```
  - **Hover Effect**: Card lifts with shadow and shimmer animation
  - **Status Indicators**:
    - Green pulse dot for high-confidence suggestions
    - Orange pulse for time-sensitive
    - Purple for standard priority

#### 3. Timeline View
- **Style**: Vertical scrolling glass panel with time markers
- **Time Grouping**: By day with collapsible sections
- **Event Items**:
  ```
  ┌────────────────────────────┐
  │ 5:00 PM                    │
  │ 📝 Post to r/migraine      │
  │ Status: Scheduled          │
  │ [View] [Edit]              │
  └────────────────────────────┘
  ```
- **Visual Differentiation**:
  - **Completed**: Opacity 60%, green checkmark overlay
  - **Scheduled**: Full opacity with animated border glow
  - **In Progress**: Orange pulsing indicator
  - **Failed**: Red tint with retry option

### Image Generator Prompt for Main Dashboard
```
Create a modern web dashboard UI mockup with a dark liquid glass aesthetic. The background should be a deep gradient from midnight purple to dark indigo with floating, blurred glass orbs. The layout has three main sections: 1) A top statistics bar showing 5 metric cards with glowing numbers and percentage changes, styled as frosted glass panels with subtle purple and green accent glows. 2) A main content area (left 70%) displaying AI suggestion cards, each with semi-transparent glass styling, containing Reddit post previews with action buttons. Cards should have subtle hover effects indicated. 3) A right sidebar (30%) showing a vertical timeline with scheduled Reddit activities grouped by date, using glass card styling with time stamps and status indicators. The entire interface should have a futuristic, premium feel with liquid glass effects, soft shadows, and subtle animations indicated through motion blur on some elements. Color palette: deep purples (#A855F7), vibrant greens (#22C55E), with white text and subtle orange accents for urgency.
```

---

## Screen 2: Initiative Detail View

### Layout Structure
```
┌──────────────────────────────────────────────────────────────┐
│ ← Back to Dashboard          Initiative Details              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────┬─────────────────────────────┐ │
│  │                          │                             │ │
│  │    Content Editor        │     Preview Panel           │ │
│  │                          │                             │ │
│  │  Title: [___________]    │   ┌───────────────────┐    │ │
│  │                          │   │                   │    │ │
│  │  Content:                │   │  Reddit Preview   │    │ │
│  │  ┌──────────────────┐    │   │                   │    │ │
│  │  │                  │    │   │  Shows how post   │    │ │
│  │  │  Text editor     │    │   │  will appear      │    │ │
│  │  │                  │    │   │                   │    │ │
│  │  └──────────────────┘    │   └───────────────────┘    │ │
│  │                          │                             │ │
│  │  Subreddit: [_______]    │     AI Confidence: 85%     │ │
│  │  Schedule: [_________]   │     Expected Karma: ~150    │ │
│  │                          │     Best Time: 5:00 PM     │ │
│  └──────────────────────────┴─────────────────────────────┘ │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ [Cancel]  [Save Draft]  [Schedule]  [Post Now]       │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

### Component Specifications

#### 1. Header Bar
- **Style**: Glass header with back navigation
- **Breadcrumb**: Dashboard > Initiative > Edit
- **Status Badge**: Shows current status (Draft, Scheduled, Posted)

#### 2. Content Editor Panel
- **Input Fields**:
  - Title: Glass input field with character counter
  - Content: Rich text editor with markdown support
  - Subreddit: Dropdown with search functionality
  - Schedule: DateTime picker with timezone display
- **Validation**: Real-time validation with subtle error states

#### 3. Preview Panel
- **Reddit Post Preview**: Live preview styled like actual Reddit post
- **AI Insights Card**:
  - Confidence score with visual bar
  - Predicted engagement metrics
  - Optimal posting time suggestion
  - Related trending topics

#### 4. Action Bar
- **Button Styles**:
  - Primary (Post Now/Schedule): Green gradient with glow
  - Secondary (Save Draft): Purple glass
  - Tertiary (Cancel): Transparent with border

### Image Generator Prompt for Initiative Detail View
```
Create a detailed view UI mockup for editing a Reddit post within a dark liquid glass dashboard. Split-screen layout with left side showing a content editor with frosted glass input fields for title, content (rich text editor area), subreddit selection, and scheduling. Right side displays a Reddit-style post preview card and AI insights panel showing confidence metrics, predicted karma, and optimal posting time. Bottom action bar with glowing gradient buttons for Cancel, Save Draft, Schedule, and Post Now. The entire interface maintains the liquid glass aesthetic with deep purple-indigo gradient background, floating glass orbs, and semi-transparent panels with backdrop blur effects. Include subtle animations indicated through glow effects and shimmer overlays. Color scheme: deep purples, bright greens for CTAs, white text on glass surfaces.
```

---

## Screen 3: Manual Initiative Creation

### Layout Structure
```
┌──────────────────────────────────────────────────────────────┐
│              Create New Initiative                            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Initiative Type Selection:                                  │
│  ┌─────────┬─────────┬─────────┬─────────┐                │
│  │  Post   │ Comment │  Like   │ Follow  │                │
│  └─────────┴─────────┴─────────┴─────────┘                │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                                                      │   │
│  │  Form Fields (Dynamic based on type selected)       │   │
│  │                                                      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Batch Actions (if applicable)                       │   │
│  │  • Target multiple subreddits                        │   │
│  │  • Set recurring schedule                            │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Component Specifications

#### 1. Initiative Type Selector
- **Style**: Tab-like glass cards with icon and label
- **Selected State**: Glowing border with lifted shadow
- **Icons**: 
  - Post: 📝
  - Comment: 💬
  - Like: ❤️
  - Follow: 👤

#### 2. Dynamic Form Fields
- **For Posts**: Title, Content, Subreddit, Flair, Schedule
- **For Comments**: Target Post URL, Comment Text, Schedule
- **For Likes**: Subreddit/Search Terms, Quantity, Time Range
- **For Follows**: User List or Subreddit Members, Quantity

#### 3. Batch Actions Panel
- **Multi-targeting**: Add multiple subreddits with tags
- **Recurring Options**: Daily, Weekly, Custom pattern
- **A/B Testing**: Create variations for testing

### Image Generator Prompt for Manual Initiative Creation
```
Create a UI mockup for a manual content creation screen within a dark liquid glass dashboard. Top section shows 4 selectable card types (Post, Comment, Like, Follow) as glowing glass tabs with icons. Main area contains a dynamic form with frosted glass input fields that change based on selection. Include fields for content creation, targeting options, and scheduling. Bottom section shows batch action options with toggle switches and multi-select components. Maintain the liquid glass theme with deep purple-indigo gradient background, floating translucent orbs, and glass morphism effects on all interactive elements. Action buttons at bottom with green gradient for primary action. Purple and green accent glows throughout. Dark theme with white text.
```

---

## Interactive States & Animations

### Hover Effects
- **Cards**: Lift 4px with increased shadow and subtle shimmer
- **Buttons**: Glow intensifies, slight scale to 1.05
- **Timeline Items**: Border glow appears, background lightens

### Loading States
- **Skeleton Screens**: Pulsing glass cards with gradient animation
- **Spinners**: Rotating gradient circles with blur trail

### Transitions
- **Page Changes**: Fade with 300ms duration
- **Card Appearances**: Slide up with stagger effect
- **Modal/Panel Opens**: Scale and fade from center

### Success/Error States
- **Success**: Green pulse animation with checkmark
- **Error**: Red shake animation with error icon
- **Warning**: Orange glow with warning triangle

---

## Responsive Breakpoints

### Desktop (1440px+)
- Full layout as specified
- Timeline fixed to right side
- 3-column grid for initiative cards

### Tablet (768px - 1439px)
- Timeline becomes collapsible drawer
- 2-column grid for initiative cards
- Stacked layout for detail views

### Mobile (< 768px)
- Single column layout
- Timeline as separate tab/view
- Simplified statistics bar (horizontal scroll)
- Full-screen modals for editing

---

## Technical Implementation Notes

### Glass Effect CSS
```css
.glass-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}
```

### Animation Specifications
- Use CSS animations for floating orbs
- Framer Motion for page transitions
- React Spring for micro-interactions
- GPU-accelerated transforms only

### Performance Considerations
- Lazy load timeline items
- Virtual scrolling for long lists
- Debounce search inputs
- Optimistic UI updates for better perceived performance