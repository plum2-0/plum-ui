# ProspectProfiles Feature Specification

## Executive Summary
Implementation of a Facebook Messenger-style inbox for viewing and managing ProspectProfiles - Reddit users who have engaged with or been targeted for brand outreach. This feature will be prominently displayed on the dashboard, providing marketers with an intuitive interface to view prospect conversations, engagement metrics, and manage outreach efforts.

## Architecture Overview

### Data Flow
```
API Endpoint (/api/brand/{brand_id}/prospect/profiles)
    ↓
useProspectProfilesQuery Hook (with mocked data)
    ↓
ProspectProfilesInbox Component (List View)
    ↓
ProspectProfileDetail Component (Detail View)
```

## Implementation Components

### 1. Data Hook: `useProspectProfilesQuery`
**Location**: `/plum-ui/src/hooks/api/useProspectProfilesQuery.ts`

#### Specification with Mocked Data:
```typescript
export interface ProspectProfile {
  id?: string;
  name: string;
  profile_image?: string;
  prospect_source?: string;
  prospect_source_id?: string;
  active_convo?: Conversation;
  // Mocked fields for enhanced UI
  lastMessageTime?: number;
  unreadCount?: number;
  engagementScore?: number;
  sentiment?: 'positive' | 'neutral' | 'negative';
  tags?: string[];
}

export interface Conversation {
  id?: string;
  reddit_conversations: RedditPost[];
}

export interface RedditPost {
  thing_id: string;
  title?: string;
  content: string;
  author: string;
  subreddit: string;
  permalink: string;
  created_utc: number;
  score: number;
  upvotes?: number;
  downvotes?: number;
  reply_count?: number;
  status: 'IGNORE' | 'REPLY' | 'PENDING' | 'SUGGESTED_REPLY';
  suggested_agent_reply?: string;
  insert_timestamp?: string;
}

export const PROSPECT_PROFILES_QUERY_KEY = ["prospect-profiles"] as const;

// Mock data generator for development
const generateMockProfiles = (): ProspectProfile[] => {
  return [
    {
      id: "mock-1",
      name: "tech_enthusiast_42",
      prospect_source: "REDDIT",
      prospect_source_id: "t3_mock1",
      lastMessageTime: Date.now() - 3600000, // 1 hour ago
      unreadCount: 2,
      engagementScore: 85,
      sentiment: 'positive',
      tags: ['High Value', 'Tech Savvy'],
      active_convo: {
        id: "convo-1",
        reddit_conversations: [
          {
            thing_id: "t3_mock1",
            content: "Looking for recommendations on productivity tools...",
            author: "tech_enthusiast_42",
            subreddit: "productivity",
            permalink: "/r/productivity/comments/mock1",
            created_utc: Date.now() / 1000 - 7200,
            score: 45,
            upvotes: 50,
            downvotes: 5,
            reply_count: 12,
            status: 'PENDING'
          }
        ]
      }
    },
    // Add more mock profiles...
  ];
};

export function useProspectProfilesQuery() {
  const { data: session } = useSession();
  
  return useQuery<ProspectProfile[]>({
    queryKey: [...PROSPECT_PROFILES_QUERY_KEY, session?.user?.brandId],
    queryFn: async () => {
      const brandId = session?.user?.brandId;
      if (!brandId) throw new Error("No brand ID");
      
      // TODO: Replace with actual API call when ready
      // For now, return mock data for development
      return generateMockProfiles();
      
      /* Future implementation:
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await fetch(
        `${backendUrl}/api/brand/${brandId}/prospect/profiles`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": "Plum-UI/1.0",
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch prospect profiles: ${response.statusText}`);
      }
      
      return response.json();
      */
    },
    enabled: !!session?.user?.brandId,
    refetchInterval: 30000, // Poll every 30 seconds for updates
    refetchOnWindowFocus: true,
  });
}
```

### 2. Main Component: `ProspectProfilesInbox`
**Location**: `/plum-ui/src/components/dashboard/ProspectProfilesInbox.tsx`

#### Component Structure:
```typescript
interface ProspectProfilesInboxProps {
  onProfileSelect: (profile: ProspectProfile) => void;
  selectedProfileId?: string;
}
```

#### Visual Design - Liquid Glass Messenger Style:

##### Container Layout:
- **Dimensions**: Fixed height (calc(100vh - header)) with vertical scroll
- **Background**: Multi-layer glass effect
  ```css
  Outer layer: rgba(255, 255, 255, 0.03) with blur(30px)
  Inner layer: rgba(255, 255, 255, 0.05) with blur(20px)
  Border: 1px solid rgba(255, 255, 255, 0.1)
  ```

##### List Header:
- **Title**: "Prospect Conversations" in font-heading
- **Search Bar**: Glass input with backdrop-blur(15px)
- **Filter Chips**: LiquidBadge components for status filters (All, Unread, Replied, Pending)
- **Sort Dropdown**: Glass dropdown for sorting (Recent, Engagement, Unread)

##### Profile List Items:
Each item styled as a glass card with hover effects:

```
┌─────────────────────────────────────────┐
│ [Avatar] │ Name & Status Badge          │
│          │ @reddit_username              │
│          │ r/subreddit                   │
│          │ ┌─────────────────────────┐   │
│          │ │ Last message preview... │   │
│          │ └─────────────────────────┘   │
│          │ 💬 3 replies • Status: Pending │
└─────────────────────────────────────────┘
```

##### Item Components:
1. **Avatar Section** (Left):
   - Circular gradient avatar (48x48px)
   - Reddit logo overlay indicator

2. **Content Section** (Center):
   - **Name Line**: Username in font-heading, white
   - **Metadata Line**: Subreddit in white/60
   - **Message Preview**: 2 lines max, white/80, truncated with ellipsis
   - **Engagement Metrics**: Using LiquidBadge components
     - Reply count badge
     - Status badge (PENDING = warning, REPLIED = success, etc.)

3. **Action Section** (Right):
   - Unread indicator (pulsing blue dot)
   - Quick action buttons (visible on hover):
     - Reply icon
     - Mark as read icon
     - Archive icon

##### Visual Effects:
- **Hover State**: 
  - Background: rgba(255, 255, 255, 0.08)
  - Transform: translateX(4px)
  - Box-shadow: 0 0 20px rgba(120, 232, 161, 0.2)
  
- **Selected State**:
  - Background: rgba(168, 85, 247, 0.15)
  - Left border: 3px solid #78E8A1
  
- **Unread State**:
  - Font-weight: 600
  - Subtle glow effect
  - Blue accent dot

### 3. Detail View Component: `ProspectProfileDetail`
**Location**: `/plum-ui/src/components/dashboard/ProspectProfileDetail.tsx`

#### Component Structure:
```typescript
interface ProspectProfileDetailProps {
  profile: ProspectProfile;
  onClose?: () => void;
  agents: Agent[];
  isLoadingAgents: boolean;
}
```

#### Visual Design - Full Conversation View:

##### Layout Structure:
```
┌──────────────────────────────────────────────┐
│              HEADER SECTION                  │
│  Profile Info | Engagement Stats | Actions   │
├──────────────────────────────────────────────┤
│                                              │
│           CONVERSATION THREAD                │
│         (Scrollable Message Area)            │
│                                              │
├──────────────────────────────────────────────┤
│     SIMPLIFIED AGENT REPLY COMPONENT         │
└──────────────────────────────────────────────┘
```

##### Header Section (GlassCard with ultra blur):
1. **Profile Information**:
   - Large avatar (80x80px) with gradient border
   - Username as heading
   - Active subreddit badge
   - Member since / First contact date

2. **Engagement Analytics** (Key marketer insights):
   - **Engagement Score**: Visual meter showing overall engagement (mocked)
   - **Activity Timeline**: Mini sparkline chart of interaction frequency (mocked)
   - **Key Topics**: Tag cloud of discussed topics (mocked)
   - **Sentiment**: Color-coded sentiment indicator (mocked)

3. **Action Buttons** (LiquidButton components):
   - Mark as Priority
   - Add Notes
   - Export Conversation
   - Archive

##### Conversation Thread Section:
Styled similar to Facebook Messenger with enhancements:

1. **Message Bubbles**:
   - **Prospect Messages** (Left aligned):
     ```css
     Background: rgba(255, 255, 255, 0.08)
     Border-left: 3px solid #FF4500 (Reddit orange)
     ```
   - **Brand/Agent Messages** (Right aligned):
     ```css
     Background: rgba(120, 232, 161, 0.15)
     Border-right: 3px solid #78E8A1
     ```

2. **Message Content**:
   - Username and timestamp header
   - Message body with proper formatting
   - Engagement metrics (upvotes) as small badges
   - Thread context indicator (↳ In reply to...)
   - Status indicator (Pending, Sent, Read)

3. **Special Elements**:
   - **Suggested Reply Cards**: 
     - Yellow-tinted glass card
     - "AI Suggested" badge
     - One-click apply button
   - **Context Cards**:
     - Original post that started conversation
     - Highlighted with different glass tint

##### Reply Composer Section:
Using the existing `SimplifiedAgentReply` component:
```typescript
<SimplifiedAgentReply
  agents={agents}
  isLoadingAgents={isLoadingAgents}
  isGenerating={isGenerating}
  onGenerateWithAgent={handleGenerateWithAgent}
  customReply={customReply}
  setCustomReply={setCustomReply}
  submitPostAction={handleSubmitPostAction}
  replySent={replySent}
  isSubmittingAction={isSubmittingAction}
  post={currentPost}
/>
```

The SimplifiedAgentReply component provides:
- AI agent integration with avatar and suggestion capabilities
- Multi-line glass textarea with auto-resize
- Draft persistence across redirects
- Reddit authentication check before submission
- Loading states and error handling
- Beautiful gradient buttons with shimmer effects

### 4. Integration with Dashboard
**Location**: `/plum-ui/src/app/dashboard/page.tsx`

#### Modified Dashboard Layout:
```tsx
<div className="h-full flex overflow-hidden">
  <DashboardSidebar ... />
  
  <main className="flex-1 flex">
    {/* Prospect Profiles Inbox - 30% width */}
    <div className="w-[30%] min-w-[320px] border-r border-white/10">
      <ProspectProfilesInbox
        onProfileSelect={handleProfileSelect}
        selectedProfileId={selectedProfile?.id}
      />
    </div>
    
    {/* Detail View - 70% width */}
    <div className="flex-1">
      {selectedProfile ? (
        <ProspectProfileDetail
          profile={selectedProfile}
          agents={agents}
          isLoadingAgents={isLoadingAgents}
        />
      ) : (
        <EmptyStateComponent />
      )}
    </div>
  </main>
</div>
```

## Marketer-Centric Features

### Key Information Display:
1. **Engagement Velocity**: How quickly the prospect responds (mocked)
2. **Conversation Depth**: Number of back-and-forth exchanges
3. **Topic Affinity**: What subjects resonate with this prospect (mocked)
4. **Platform Presence**: Active subreddits and posting patterns
5. **Response Quality**: Length and thoughtfulness of responses
6. **Conversion Potential**: AI-scored likelihood of positive outcome (mocked)

### Quick Actions for Marketers:
1. **Smart Reply Suggestions**: Via SimplifiedAgentReply component
2. **Template Library**: Quick access to proven response templates
3. **Prospect Notes**: Private notes about the prospect
4. **Tag System**: Categorize prospects (Hot Lead, Influencer, etc.)
5. **Follow-up Reminders**: Set reminders for future engagement

## Technical Implementation Details

### State Management:
- Use React Query for server state
- Local state for UI interactions (selected profile, filters)
- Optimistic updates for reply actions
- Session storage for draft persistence (via SimplifiedAgentReply)

### Performance Optimizations:
1. **Virtual scrolling** for long prospect lists
2. **Message pagination** for conversations with many messages
3. **Image lazy loading** for profile images
4. **Debounced search** in the prospect list
5. **Memoization** of expensive computations (engagement scores)

### Animations (using Framer Motion):
1. **List Item Animations**:
   - Stagger fade-in on initial load
   - Smooth slide transitions on selection
   
2. **Message Animations**:
   - Slide up and fade in for new messages
   - Typing indicator animation
   
3. **Glass Effects**:
   - Subtle shimmer on hover
   - Depth perception with layered blur

## Error Handling:
1. **Loading States**: Skeleton screens with glass shimmer effect
2. **Error Messages**: Toast notifications using glass cards
3. **Offline Support**: Cache last fetched data, show offline indicator
4. **Retry Logic**: Automatic retry with exponential backoff

## Dependencies:
- @tanstack/react-query: Server state management
- framer-motion: Animations
- next-auth: Authentication
- Existing UI components: GlassCard, LiquidBadge, LiquidButton, SimplifiedAgentReply

This specification provides a complete blueprint for implementing the ProspectProfiles feature with a beautiful, functional, and marketer-friendly interface that adheres to the existing Plum UI design language while leveraging existing components like SimplifiedAgentReply.