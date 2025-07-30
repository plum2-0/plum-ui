# Reddit Post Action Components

This directory contains components for reviewing and taking actions on Reddit posts that have been processed by the backend matcher service.

## Components

### RedditPostActionManager
The main container component that manages the post review workflow.
- Fetches posts from the API
- Handles filtering (All, Pending, Reviewed)
- Manages pagination
- Coordinates actions on posts

### RedditPostCard
Displays an individual Reddit post with its metadata and AI-generated response.
- Shows post context and metrics
- Displays AI response
- Allows editing of responses
- Handles action state

### ActionButtonGroup
Renders the action buttons for each post.
- REPLY: Post the response to Reddit
- EDIT: Enable response editing mode
- IGNORE: Mark the post as ignored
- PENDING: Keep for later review

### LLMResponsePanel
Manages the display and editing of AI-generated responses.
- Read-only view of responses
- Edit mode with character counting
- Save/cancel functionality

### PostContextThread
Shows the Reddit post in its conversational context.
- Post metadata (title, author, subreddit, etc.)
- Parent comment (if applicable)
- Post metrics and matched topics
- Links to original Reddit thread

## Usage

```tsx
import { RedditPostActionManager } from '@/components/reddit';

// In your page component
<RedditPostActionManager projectId={projectId} />
```

## API Integration

The components integrate with these API endpoints:
- `GET /api/projects/[projectId]/reddit-posts` - Fetch posts
- `POST /api/projects/[projectId]/reddit-posts/[postId]/action` - Update post actions

## Backend Requirements

The implementation expects:
1. Backend matcher service provides posts with `llm_response` field
2. Backend API endpoint exists at `/admin/reddit/posts/project/{project_id}`
3. Backend can handle post action updates

## Environment Variables

To connect to the backend service, set:
```
BACKEND_API_URL=http://your-backend-url:8001
```