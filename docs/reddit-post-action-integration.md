# Reddit Post Action Component - Integration Guide

## Overview

The Reddit Post Action component has been successfully implemented. This guide explains how to integrate it into your application.

## Access the Review Page

The review page is available at:
```
/projects/[projectId]/review
```

## Adding Navigation

To add navigation to the review page from your project dashboard or other pages:

```tsx
import Link from 'next/link';

// In your component
<Link 
  href={`/projects/${projectId}/review`}
  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
>
  Review Reddit Posts
</Link>
```

## Backend Integration

The component currently uses mock data. To integrate with your backend:

1. **Update the API routes** in:
   - `/api/projects/[projectId]/reddit-posts/route.ts`
   - `/api/projects/[projectId]/reddit-posts/[postId]/action/route.ts`

2. **Set the backend URL** environment variable:
   ```env
   BACKEND_API_URL=http://localhost:8001
   ```

3. **Replace the mock data calls** with actual backend API calls:
   ```typescript
   // In the API route
   const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:8001';
   const response = await fetch(`${backendUrl}/admin/reddit/posts/project/${projectId}`);
   const data = await response.json();
   ```

## Features Implemented

✅ **Core Functionality**
- View Reddit posts matched by the backend
- Display AI-generated responses
- Take actions: REPLY, EDIT, IGNORE, PENDING
- Edit responses before replying
- Filter posts by status (All, Pending, Reviewed)

✅ **UI/UX**
- Responsive design for desktop, tablet, and mobile
- Loading states and error handling
- Character count for Reddit's comment limit
- Pagination with "Load More" functionality
- Refresh button to get latest posts

✅ **Architecture**
- TypeScript interfaces for type safety
- React Query for efficient data fetching
- Optimistic updates for better UX
- Component-based architecture for maintainability

## Next Steps

1. **Backend Integration**: Connect to the real backend API endpoints
2. **Authentication**: Ensure proper user authentication and project access
3. **Notifications**: Add a badge for pending posts count
4. **Batch Actions**: Implement bulk operations for multiple posts
5. **Analytics**: Track user actions and response effectiveness

## Testing

Run the component tests:
```bash
npm test ActionButtonGroup.test.tsx
```

## Component Structure

```
src/components/reddit/
├── RedditPostActionManager.tsx    # Main container
├── RedditPostCard.tsx              # Individual post display
├── LLMResponsePanel.tsx            # Response viewing/editing
├── ActionButtonGroup.tsx           # Action buttons
├── PostContextThread.tsx           # Conversation context
├── index.ts                        # Exports
└── README.md                       # Component documentation
```

## Customization

The components use Tailwind CSS for styling. You can customize:
- Colors in `ActionButtonGroup.tsx`
- Layout in `RedditPostCard.tsx`
- Responsive breakpoints throughout

## Performance Considerations

- Posts are fetched in batches of 20
- React Query caches data for 30 seconds
- Optimistic updates provide instant feedback
- Virtual scrolling can be added for very large lists