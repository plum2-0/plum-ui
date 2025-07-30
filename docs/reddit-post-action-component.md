**# Reddit Post Action Component - Implementation Plan

## Overview

This component will allow users to review Reddit posts that have been processed by the matcher service, view LLM-generated responses, and take actions (REPLY, IGNORE, EDIT, PENDING) on each post. The component will display posts in context with their conversation thread and provide an interface for managing user responses.

## Component Architecture

### Core Component: `RedditPostActionManager`
- **Location**: `plum-ui/src/components/RedditPostActionManager.tsx`
- **Purpose**: Main container component that orchestrates the post review workflow
- **State Management**: React Query for data fetching, local state for UI interactions

### Sub-Components

#### 1. `RedditPostCard`
- **Purpose**: Display individual Reddit post with metadata and context
- **Features**:
  - Post title, author, subreddit, timestamp
  - Post content (truncated with expand option)
  - Post metrics (score, comments, upvote ratio)
  - Parent comment context (if applicable)
  - Confidence score and matched topics from matcher service

#### 2. `LLMResponsePanel`
- **Purpose**: Display and allow editing of LLM-generated responses
- **Features**:
  - Read-only view of suggested response
  - Edit mode with textarea for response modification
  - Character count and formatting helpers
  - Save/cancel functionality for edits

#### 3. `ActionButtonGroup`
- **Purpose**: Action buttons for user decisions
- **Features**:
  - REPLY button (green) - posts response to Reddit
  - EDIT button (blue) - allows response modification
  - IGNORE button (gray) - marks post as ignored
  - PENDING button (yellow) - keeps for later review

#### 4. `PostContextThread`
- **Purpose**: Show conversation context for better decision-making
- **Features**:
  - Original post content
  - Parent comment (if post is a comment reply)
  - Basic thread structure
  - Links to full Reddit thread

## Data Models

### Frontend Types

```typescript
// src/types/reddit.ts
interface RedditPost {
  title: string;
  author: string;
  subreddit: string;
  created_utc: number;
  time_ago: string;
  score: number;
  upvote_ratio: number;
  comment_count: number;
  link_flair: string;
  domain: string;
  url: string;
  thumbnail: string;
  permalink: string;
  is_self: boolean;
  is_video: boolean;
  post_id: string;
  user_action: 'reply' | 'ignore' | 'edit' | 'pending';
  llm_response: string;
  // Additional fields for UI
  confidence_score?: number;
  matched_topics?: string[];
  parent_comment?: RedditComment;
}

interface RedditComment {
  id: string;
  author: string;
  body: string;
  created_utc: number;
  score: number;
  parent_id: string;
  permalink: string;
}

interface PostActionRequest {
  post_id: string;
  action: 'reply' | 'ignore' | 'edit' | 'pending';
  edited_response?: string;
}

interface PostActionResponse {
  success: boolean;
  message: string;
  updated_post?: RedditPost;
}
```

## API Routes

### Frontend API Routes (Next.js)

#### 1. Get Reddit Posts
```
GET /api/projects/[projectId]/reddit-posts
```
- **Purpose**: Fetch Reddit posts that have been processed by matcher service
- **Query Parameters**:
  - `status?`: Filter by user_action status
  - `limit?`: Number of posts to return (default: 20)
  - `offset?`: Pagination offset
- **Response**:
```json
{
  "success": true,
  "posts": [RedditPost[]],
  "total_count": number,
  "has_more": boolean
}
```

#### 2. Update Post Action
```
POST /api/projects/[projectId]/reddit-posts/[postId]/action
```
- **Purpose**: Update the user action for a specific post
- **Request Body**:
```json
{
  "action": "reply" | "ignore" | "edit" | "pending",
  "edited_response": "optional edited response text"
}
```
- **Response**:
```json
{
  "success": true,
  "message": "Action updated successfully",
  "updated_post": RedditPost
}
```

### Backend API Integration

The frontend will call the existing backend API:
- **Source**: `/admin/reddit/posts/project/{project_id}` (existing)
- **New Endpoint Needed**: Backend endpoint for updating post actions

## UI/UX Design

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│                     Reddit Post Review                      │
├─────────────────────────────────────────────────────────────┤
│ Filter: [All] [Pending] [Reviewed]     [20 items] [Refresh] │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ POST CARD                                               │ │
│ │ ┌─────────────────┐ ┌─────────────────────────────────┐ │ │
│ │ │ Post Context    │ │ LLM Response                    │ │ │
│ │ │ - Title         │ │ ┌─────────────────────────────┐ │ │ │
│ │ │ - Author        │ │ │ "Here's a helpful response  │ │ │ │
│ │ │ - Subreddit     │ │ │  to your question about..." │ │ │ │
│ │ │ - Content       │ │ │                             │ │ │ │
│ │ │ - Parent Comment│ │ │ [Edit] [Character Count]    │ │ │ │
│ │ │ - Metrics       │ │ └─────────────────────────────┘ │ │ │
│ │ └─────────────────┘ └─────────────────────────────────┘ │ │
│ │                                                         │ │
│ │ Action: [REPLY] [EDIT] [IGNORE] [PENDING]              │ │
│ │ Status: ● Pending Review   Confidence: 85%             │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ [More posts...]                                             │
│                                                             │
│ [Load More] [Jump to Top]                                   │
└─────────────────────────────────────────────────────────────┘
```

### Color Scheme & States

#### Action Button Colors
- **REPLY**: `bg-green-600 hover:bg-green-700` (Primary CTA)
- **EDIT**: `bg-blue-600 hover:bg-blue-700` (Secondary action)
- **IGNORE**: `bg-gray-500 hover:bg-gray-600` (Neutral)
- **PENDING**: `bg-yellow-500 hover:bg-yellow-600` (Warning)

#### Status Indicators
- **Pending**: Orange dot with "Pending Review"
- **Replied**: Green dot with "Response Sent"
- **Ignored**: Gray dot with "Ignored"
- **Edited**: Blue dot with "Response Edited"

### Responsive Behavior
- **Desktop**: Side-by-side layout (post context | LLM response)
- **Tablet**: Stacked layout with collapsible sections
- **Mobile**: Single column with accordion-style expansion

## Implementation Phases

### Phase 1: Core Component Setup (1-2 days)
- [ ] Create basic component structure
- [ ] Set up TypeScript interfaces
- [ ] Implement basic layout with mock data
- [ ] Add Tailwind styling for responsive design

### Phase 2: API Integration (1-2 days)
- [ ] Create frontend API routes
- [ ] Implement React Query hooks for data fetching
- [ ] Add error handling and loading states
- [ ] Connect to existing backend API

### Phase 3: User Actions & State Management (2-3 days)
- [ ] Implement action button functionality
- [ ] Add response editing capability
- [ ] Handle optimistic updates
- [ ] Add confirmation dialogs for destructive actions

### Phase 4: UI Polish & UX Enhancements (1-2 days)
- [ ] Add pagination/infinite scroll
- [ ] Implement keyboard shortcuts
- [ ] Add batch actions (select multiple posts)
- [ ] Polish animations and transitions

### Phase 5: Testing & Documentation (1 day)
- [ ] Write unit tests for components
- [ ] Add integration tests for API routes
- [ ] Update component documentation
- [ ] Add accessibility features

## File Structure

```
plum-ui/src/
├── components/
│   ├── reddit/
│   │   ├── RedditPostActionManager.tsx      # Main container
│   │   ├── RedditPostCard.tsx               # Individual post display
│   │   ├── LLMResponsePanel.tsx             # Response viewing/editing
│   │   ├── ActionButtonGroup.tsx            # Action buttons
│   │   ├── PostContextThread.tsx            # Conversation context
│   │   └── index.ts                         # Exports
├── hooks/
│   ├── useRedditPosts.ts                    # Data fetching hook
│   ├── usePostActions.ts                    # Action handling hook
│   └── usePagination.ts                     # Pagination logic
├── types/
│   └── reddit.ts                            # TypeScript interfaces
├── app/api/projects/[projectId]/
│   └── reddit-posts/
│       ├── route.ts                         # GET posts endpoint
│       └── [postId]/action/
│           └── route.ts                     # POST action endpoint
└── app/projects/[projectId]/
    └── review/
        └── page.tsx                         # Review page route
```

## Usage Example

### Page Route Implementation
```typescript
// app/projects/[projectId]/review/page.tsx
import { RedditPostActionManager } from '@/components/reddit';

export default function ReviewPage({
  params
}: {
  params: { projectId: string }
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Review Reddit Posts
        </h1>
        <p className="text-gray-600 mt-2">
          Review and take action on posts matched by your AI configuration.
        </p>
      </div>

      <RedditPostActionManager projectId={params.projectId} />
    </div>
  );
}
```

### Component Usage
```typescript
// components/reddit/RedditPostActionManager.tsx
export function RedditPostActionManager({ projectId }: { projectId: string }) {
  const { data: posts, isLoading, error } = useRedditPosts(projectId);
  const { updatePostAction } = usePostActions(projectId);

  const handleAction = async (postId: string, action: UserAction, editedResponse?: string) => {
    await updatePostAction({ postId, action, editedResponse });
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="space-y-6">
      {posts?.map(post => (
        <RedditPostCard
          key={post.post_id}
          post={post}
          onAction={handleAction}
        />
      ))}
    </div>
  );
}
```

## Integration Points

### Navigation
- Add route to main navigation: `/projects/[projectId]/review`
- Add button in project dashboard: "Review Posts"
- Consider adding notification badge for pending posts

### Existing Components
- Leverage existing `SourceListeningConfig` patterns for API calls
- Use similar loading/error patterns as other project components
- Integrate with existing authentication and authorization

### Backend Dependencies
- Requires posts from matcher service to have `llm_response` populated
- May need backend endpoint to update `user_action` field
- Consider adding audit trail for action history

## Future Enhancements

### Batch Operations
- Select multiple posts for bulk actions
- Bulk ignore low-confidence matches
- Bulk approve high-confidence matches

### Advanced Filtering
- Filter by confidence score range
- Filter by specific topics matched
- Filter by subreddit or time range

### Analytics Dashboard
- Track response rates and effectiveness
- Monitor confidence score accuracy
- Show user action patterns

### Response Templates
- Save commonly used response templates
- Auto-suggest responses based on similar posts
- A/B test different response approaches

## Success Metrics

- **User Efficiency**: Time to review and action posts
- **Accuracy**: Percentage of AI responses used without editing
- **Engagement**: Click-through rates on actions taken
- **Quality**: User satisfaction with the review process

This component will significantly improve the user experience for managing Reddit engagement by providing a streamlined interface for reviewing and acting on AI-matched content.**