# Plum 2.0 App Structure Refactoring Plan

## Overview
Major restructuring to unify all features into a single main home page with improved navigation and user experience.

## Current State Analysis

### Current Routing Structure
- `/dashboard` - Research section (use case insights)
- `/dashboard/engage` - Engage section (agents + Reddit posts)
- `/dashboard/team/[id]` - Individual agent detail pages
- `/dashboard/settings` - Settings page

### Current Navigation
- **Top Nav**: Logo, Sign Out, Invite buttons
- **Side Nav**: Research (expandable with use cases), Engage, Settings
- **Main Content**: Section-specific content based on route

### Current Data Flow
- Use Cases → Market Insights (per use case)
- Agents → Conversations → Reddit engagement
- Reddit Posts → Filtering → Engagement actions

## Target State Vision

### New Structure
- **Single Main Page** (`/dashboard`) with all features unified
- **Side Nav**: 
  - Problem Space (use cases) at top
  - Logo/Sign Out/Invite/Settings at bottom
- **Main Content**:
  - Market Insights (collapsible, localStorage state)
  - Engage Data (Reddit posts below Market Insights)
  - Active Conversations (toggle view)

### Key Changes
1. Remove `/dashboard/engage` route entirely
2. Remove top navigation bar
3. Move top nav items to bottom of sidebar
4. Market Insights become collapsible section
5. Engage data moves below Market Insights
6. Active conversations toggle with agent detail view
7. Team agents section moves to settings page

## Implementation Phases

### Phase 1: Side Navigation Restructure
**Goal**: Move top nav to bottom of sidebar, remove top nav entirely

**Files to Modify**:
- `src/app/dashboard/layout.tsx` - Remove top nav
- `src/components/dashboard2/DashboardSidebar.tsx` - Add bottom section
- `src/components/TopNav.tsx` - Extract reusable components

**Components to Create**:
- `SidebarBottomSection.tsx` - Logo, sign out, invite, settings

**Tasks**:
- [ ] Extract sign out functionality from top nav
- [ ] Extract invite functionality from top nav  
- [ ] Add settings gear icon to sidebar bottom
- [ ] Style bottom section of sidebar
- [ ] Remove TopNav from dashboard layout
- [ ] Test navigation functionality

### Phase 2: Main Content Restructure
**Goal**: Collapse all routes to single main page with Market Insights section

**Files to Modify**:
- `src/app/dashboard/page.tsx` - Become unified main page
- `src/app/dashboard/engage/page.tsx` - Extract components for reuse
- Remove: `src/app/dashboard/engage/` directory entirely

**Components to Create**:
- `MarketInsightsSection.tsx` - Collapsible insights (from current research)
- `RedditEngageSection.tsx` - Reddit posts (from current engage)
- `ActiveConversationsToggle.tsx` - Toggle for conversations view

**State Management**:
- localStorage for Market Insights collapsed state per use case
- Use case filtering for both Market Insights and Reddit posts

**Tasks**:
- [ ] Create MarketInsightsSection with collapse functionality
- [ ] Extract Reddit posts components from engage page
- [ ] Implement localStorage state management
- [ ] Add use case filtering to unified view
- [ ] Style sections with proper spacing
- [ ] Remove engage route and update routing

### Phase 3: Active Conversations Feature
**Goal**: Extract agent conversation components and create toggle view

**Files to Modify**:
- `src/app/dashboard/team/[id]/page.tsx` - Extract conversation components
- Keep individual agent pages for deep linking

**Components to Create**:
- `AgentConversationsList.tsx` - List of agents with active conversations
- `ConversationDetailView.tsx` - Detailed conversation view
- `ConversationsToggle.tsx` - Toggle between list and detail

**Tasks**:
- [ ] Extract conversation components from team page
- [ ] Create conversations list component
- [ ] Implement toggle between list and detail views
- [ ] Add filtering for "active" conversations only
- [ ] Integrate into main page layout

### Phase 4: Settings Page Updates
**Goal**: Move team agents section to settings page

**Files to Modify**:
- `src/app/dashboard/settings/page.tsx` - Add team management section
- `src/app/dashboard/engage/page.tsx` - Remove team agents section

**Components to Move**:
- Team agents horizontal scroll list
- Agent creation functionality
- Agent management actions

**Tasks**:
- [ ] Extract team agents components from engage page
- [ ] Add team management section to settings
- [ ] Update navigation to settings for team management
- [ ] Test agent creation and management in settings

### Phase 5: State Management & Testing
**Goal**: Implement localStorage state and ensure everything works

**State to Manage**:
- Market Insights collapsed state (per use case title in localStorage)
- Active conversation selection
- Use case filtering

**Testing Requirements**:
- [ ] All original functionality preserved
- [ ] Navigation works correctly
- [ ] State persists across sessions
- [ ] Integration tests pass

## Technical Considerations

### Routing Changes
- Remove `/dashboard/engage` route entirely
- Keep `/dashboard/team/[id]` for deep linking but make accessible via toggle
- All main functionality on `/dashboard`

### State Management Strategy
```typescript
// localStorage keys
const MARKET_INSIGHTS_STATE = 'market-insights-collapsed-{useCaseTitle}'
const LAST_SELECTED_USE_CASE = 'last-selected-use-case'
```

### Component Architecture
```
Dashboard Page
├── MarketInsightsSection (collapsible)
├── RedditEngageSection
└── ActiveConversationsToggle
    ├── ConversationsList
    └── ConversationDetailView

Sidebar
├── Problem Space (Use Cases)
└── Bottom Section
    ├── Logo
    ├── Settings
    ├── Invite
    └── Sign Out
```

### Data Flow Updates
1. Use case selection filters both Market Insights and Reddit posts
2. Market Insights collapse state stored per use case
3. Active conversations filtered from all agent conversations
4. Team management moved to settings page

## Risk Mitigation

### Potential Issues
- Complex component extraction might break existing functionality
- State management could become complex with multiple sections
- Routing changes might break bookmarks/deep links

### Mitigation Strategies
- Implement changes incrementally, testing each phase
- Keep original components until new ones are proven working
- Maintain team/[id] routes for backward compatibility
- Use feature flags if needed for gradual rollout

## Success Criteria
- [ ] All features accessible from single main page
- [ ] Navigation simplified and intuitive
- [ ] Market Insights collapsible with state persistence
- [ ] Active conversations easily accessible
- [ ] Team management properly located in settings
- [ ] All tests passing
- [ ] No broken functionality from original app

## Notes
- This refactoring maintains all existing functionality while improving UX
- Focus on incremental changes to avoid breaking the app
- Each phase should be testable independently
- Preserve data integrity throughout the process