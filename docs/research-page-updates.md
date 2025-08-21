********# Implementation Plan: Single Discover Page Consolidation

## Confirmed Decisions

Based on user clarifications, these key decisions are confirmed:

1. **MetricState Behavior**: Shows aggregated/rollup metrics across all prospects, not changing per individual prospect selection
2. **Default Prospect Selection**: Automatically select the first prospect when users land on the discover page
3. **Posts Display Component**: Reuse the existing `RedditEngageSection` component for displaying Reddit posts in the PostsView
4. **Styling Approach**: Use existing glass panel styles from the codebase (GlassPanel components) to maintain visual consistency

## Overview
This plan outlines the refactoring of the Plum dashboard to consolidate all prospect viewing functionality onto a single discover page, eliminating the need for separate use-case subpages and creating a more streamlined user experience.

## Current State Analysis
- **Discover Page**: `/app/dashboard/discover/page.tsx` shows BrandSummary and OverviewInsights
- **Use-Case Pages**: `/app/dashboard/use-case/[id]/page.tsx` shows individual prospect details with UseCaseInsightsPage and RedditEngageSection
- **Navigation Pattern**: Users click prospects in sidebar to navigate to separate pages
- **Components**: BrandSummary, OverviewInsights, UseCaseInsights, UseCaseInsightsPage, RedditEngageSection

## Target Architecture

### Component Hierarchy
```
DiscoverPage
├── BrandSummary (Enhanced)
│   ├── Clickable Brand Name
│   ├── Expandable Keywords Section
│   └── MetricState Component (moved from elsewhere)
├── OverviewInsights (Unchanged)
└── ProspectView (New Component)
    ├── FutureDataAnalysis (Placeholder)
    ├── ProspectControls
    │   ├── ProspectSelector (Dropdown)
    │   └── ViewToggle (Segmented Control)
    └── DynamicContent
        ├── ResearchView (UseCaseInsights content)
        └── PostsView (RedditEngageSection content)
```

## Implementation Tasks

### Phase 1: Component Updates

#### Task 1.1: Enhance BrandSummary Component
**File**: `/plum-ui/src/components/dashboard2/BrandSummary.tsx`

**Changes Required**:
- Remove "Visit Website" button
- Make brand name clickable to navigate to website
- Add expandable "Top 5 Keywords (+N More)" section
- Integrate MetricState component displaying **aggregated/rollup metrics across all prospects**
- Add keywords expansion functionality

**MetricState Behavior**: The MetricState component will show rollup data aggregated across all prospects and will **NOT** change when individual prospects are selected. This provides users with consistent overview-level metrics at all times.

**New Props Interface**:
```typescript
interface BrandSummaryProps {
  brandData: Brand;
  metricState?: MetricStateData; // New optional prop
}
```

#### Task 1.2: Create ProspectView Component
**File**: `/plum-ui/src/components/dashboard2/ProspectView.tsx`

**Component Structure**:
```typescript
interface ProspectViewProps {
  prospects: Prospect[];
  brandId: string;
  selectedProspect: Prospect | null;
  onProspectSelect: (prospect: Prospect | null) => void;
}
```

**Sub-components to create**:
1. **FutureDataAnalysis**: Glass card placeholder for time series data
2. **ProspectSelector**: Liquid glass dropdown for prospect selection
3. **ViewToggle**: Segmented control for Research/Posts views
4. **DynamicContent**: Container that switches between ResearchView and PostsView

#### Task 1.3: Create ProspectSelector Component
**File**: `/plum-ui/src/components/dashboard2/ProspectSelector.tsx`

**Features**:
- Beautiful liquid glass morphic dropdown
- Search functionality within prospects
- Avatar/icon for each prospect
- Visual indicators for unread content

#### Task 1.4: Create ViewToggle Component
**File**: `/plum-ui/src/components/dashboard2/ViewToggle.tsx`

**Features**:
- Glass morphic segmented control
- Smooth sliding animation between states
- "Research" and "Posts" options

#### Task 1.5: Create ResearchView Component
**File**: `/plum-ui/src/components/dashboard2/ResearchView.tsx`

**Purpose**:
- Consolidate UseCaseInsights functionality
- Display keywords, subreddits, solutions/opportunities, demographics, competitors
- Reuse existing logic from UseCaseInsightsComponent

#### Task 1.6: Create PostsView Component
**File**: `/plum-ui/src/components/dashboard2/PostsView.tsx`

**Purpose**:
- **Reuse existing RedditEngageSection component** for displaying Reddit posts
- Show sourced Reddit posts for selected prospect
- Maintain existing pagination and filtering functionality
- Wrap RedditEngageSection with appropriate container styling

**Implementation Approach**:
```typescript
import { RedditEngageSection } from '../RedditEngageSection';

const PostsView: React.FC<PostsViewProps> = ({ prospect, brandId }) => {
  return (
    <div className="posts-view-container">
      <RedditEngageSection
        prospect={prospect}
        brandId={brandId}
        // ... other required props
      />
    </div>
  );
};
```

### Phase 2: State Management

#### Task 2.1: Update Discover Page State
**File**: `/app/dashboard/discover/page.tsx`

**New State Variables**:
```typescript
const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
const [currentView, setCurrentView] = useState<'research' | 'posts'>('research');
```

**State Management Approach**:
- **Auto-select first prospect**: When users land on the discover page, automatically select the first prospect in the list
- Use URL query parameters to persist selected prospect and view
- Implement proper state synchronization with sidebar selection
- Handle browser back/forward navigation

**Default Selection Logic**:
```typescript
// Initialize with first prospect when component mounts
useEffect(() => {
  if (brandData?.prospects?.length > 0 && !selectedProspect) {
    setSelectedProspect(brandData.prospects[0]);
  }
}, [brandData?.prospects, selectedProspect]);
```

#### Task 2.2: Remove Use-Case Page Navigation
**Changes Required**:
- Update DashboardSidebar to not navigate on prospect selection
- Modify handleUseCaseSelect to update local state instead
- Remove router.push calls to use-case pages

### Phase 3: Data Flow Updates

#### Task 3.1: Props Interface Updates
**Components requiring new props**:

1. **DiscoverPage**:
```typescript
// No new props, internal state management
```

2. **ProspectView**:
```typescript
interface ProspectViewProps {
  prospects: Prospect[];
  brandId: string;
  selectedProspect: Prospect | null;
  onProspectSelect: (prospect: Prospect | null) => void;
}
```

3. **DashboardSidebar** (if modifications needed):
```typescript
interface DashboardSidebarProps {
  // Existing props...
  onUseCaseSelect: (useCase: Prospect | null) => void; // Modified behavior
  inlineSelection?: boolean; // New prop to disable navigation
}
```

#### Task 3.2: Data Fetching Strategy
- Leverage existing `useBrandQuery` hook
- No additional API calls required
- Optimize data passing to child components

### Phase 4: UI/UX Implementation

#### Task 4.1: Future Data Analysis Placeholder
**Component**: `FutureDataAnalysis`
**Styling**:
- **Use existing GlassPanel component** for consistent styling
- Large glass card with significant height (40% of viewport)
- Centered "FUTURE DATA ANALYSIS" placeholder text
- Subtle animations/gradients to indicate future functionality
- Responsive design for mobile

#### Task 4.2: Glass Morphism Controls
**ProspectSelector Styling**:
- **Leverage existing GlassPanel components** for consistency
- Glass morphism with backdrop blur matching current implementation
- Smooth dropdown animation
- Search integration with filtering
- Beautiful hover states consistent with codebase patterns

**ViewToggle Styling**:
- **Utilize existing glass panel styles** from codebase
- Segmented control with sliding indicator
- Glass morphism consistent with current design system
- Smooth transitions between states

#### Task 4.3: Dynamic Content Transitions
- Smooth fade transitions between Research and Posts views
- **Consistent glass panel styling using existing GlassPanel components**
- Maintain scroll position when switching views
- Ensure visual consistency with current dashboard components

### Phase 5: Integration & Testing

#### Task 5.1: Discover Page Integration
**File**: `/app/dashboard/discover/page.tsx`

**Updated Structure**:
```jsx
return (
  <div className="h-full flex overflow-hidden">
    <DashboardSidebar
      brandName={brandData.name}
      prospects={brandData.prospects}
      selectedUseCase={selectedProspect}
      onUseCaseSelect={handleProspectSelect}
      inlineSelection={true} // Disable navigation
      // ... other props
    />

    <main className="flex-1 min-h-0 overflow-y-auto w-full">
      <div className="p-6">
        <div className="max-w-5xl mx-auto space-y-8">
          <BrandSummary
            brandData={brandData}
            metricState={metricState}
          />

          <OverviewInsights
            prospects={brandData?.prospects || []}
            brandId={brandData?.id || ""}
            prospectFunnelData={prospectFunnelData}
            isLoading={false}
          />

          <ProspectView
            prospects={brandData?.prospects || []}
            brandId={brandData?.id || ""}
            selectedProspect={selectedProspect}
            onProspectSelect={handleProspectSelect}
          />
        </div>
      </div>
    </main>
  </div>
);
```

#### Task 5.2: URL State Management
- Implement query parameter synchronization
- Handle browser navigation properly
- Maintain deep linking capability

#### Task 5.3: Remove Obsolete Files
**Files to remove after migration**:
- `/app/dashboard/use-case/[id]/page.tsx`
- `/components/dashboard2/UseCaseInsightsPage.tsx` (functionality moved)

## Props Interfaces

### New Component Interfaces

```typescript
// ProspectView.tsx
interface ProspectViewProps {
  prospects: Prospect[];
  brandId: string;
  selectedProspect: Prospect | null;
  onProspectSelect: (prospect: Prospect | null) => void;
}

// ProspectSelector.tsx
interface ProspectSelectorProps {
  prospects: Prospect[];
  selectedProspect: Prospect | null;
  onSelect: (prospect: Prospect | null) => void;
  placeholder?: string;
}

// ViewToggle.tsx
interface ViewToggleProps {
  value: 'research' | 'posts';
  onChange: (value: 'research' | 'posts') => void;
  options: Array<{
    key: 'research' | 'posts';
    label: string;
    icon?: ReactNode;
  }>;
}

// ResearchView.tsx
interface ResearchViewProps {
  prospect: Prospect;
}

// PostsView.tsx
interface PostsViewProps {
  prospect: Prospect;
  brandId: string;
}

// Enhanced BrandSummary.tsx
interface BrandSummaryProps {
  brandData: Brand;
  metricState?: {
    // Rollup/aggregated metrics across ALL prospects (not per-prospect)
    totalPotentialCustomers: number;
    totalCompetitorMentions: number;
    totalPosts: number;
  };
}
```

## Potential Challenges & Solutions

### Challenge 1: State Synchronization
**Issue**: Keeping sidebar selection in sync with main content
**Solution**: Use centralized state management with proper event handlers

### Challenge 2: Performance with Large Prospect Lists
**Issue**: Rendering performance with many prospects
**Solution**:
- Implement virtualization for ProspectSelector
- Lazy load prospect data
- Memoize expensive computations

### Challenge 3: Responsive Design
**Issue**: Complex layout on mobile devices
**Solution**:
- Collapsible sidebar on mobile
- Stack ProspectView components vertically
- Adjust FutureDataAnalysis height for mobile

### Challenge 4: Maintaining Existing Functionality
**Issue**: Ensuring all existing features continue to work
**Solution**:
- Reuse existing components where possible
- Maintain same API contracts
- Comprehensive testing of all user flows

## Testing Strategy

### Unit Tests
- Test each new component individually
- Mock props and verify rendering
- Test state changes and event handlers

### Integration Tests
- Test discover page with full component tree
- Verify prospect selection flows
- Test view switching functionality

### E2E Tests
- Test complete user journey through prospect selection
- Verify URL state persistence
- Test responsive behavior

### Live Data Testing
**Critical**: All integration tests must be run against live/staging data to ensure:
- Real prospect data renders correctly
- API responses work with new component structure
- Edge cases with missing/null data are handled
- Performance with actual data volumes

## Risks & Mitigation

### Risk 1: Breaking Existing Functionality
**Mitigation**: Thorough testing, feature flags for gradual rollout

### Risk 2: Performance Degradation
**Mitigation**: Performance profiling, lazy loading, code splitting

### Risk 3: Complex State Management
**Mitigation**: Clear state flow documentation, proper TypeScript typing

### Risk 4: Mobile Experience
**Mitigation**: Early mobile testing, responsive design reviews

## Implementation Timeline

### Week 1: Foundation
- Tasks 1.1-1.2: BrandSummary enhancement and ProspectView creation
- Set up component structure and basic layout

### Week 2: Core Components
- Tasks 1.3-1.6: Create ProspectSelector, ViewToggle, ResearchView, PostsView
- Implement glass morphism styling

### Week 3: Integration
- Tasks 2.1-2.2: State management and navigation updates
- Task 5.1: Discover page integration

### Week 4: Polish & Testing
- Tasks 4.1-4.3: UI/UX refinements and animations
- Tasks 5.2-5.3: URL management and cleanup
- Comprehensive testing with live data

## Success Metrics

1. **User Experience**: Single-page navigation eliminates page reloads
2. **Performance**: Faster prospect switching without full page navigations
3. **Code Quality**: Reduced component complexity and better reusability
4. **Maintainability**: Centralized prospect viewing logic
5. **Future-Ready**: Architecture supports time series data integration

This implementation plan provides a clear roadmap for consolidating the dashboard functionality while maintaining all existing features and preparing for future enhancements.