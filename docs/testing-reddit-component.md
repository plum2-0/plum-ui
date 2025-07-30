# Testing the Reddit Post Action Component

## Quick Start

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Access the demo page**:
   Navigate to http://localhost:3000/demo

3. **Click "Try Demo"** on the Reddit Post Review card

## What You Can Test

### 1. **View Reddit Posts**
The component displays realistic test data including:
- Programming questions from r/learnmachinelearning, r/reactjs, r/nextjs
- Relationship advice posts from r/relationship_advice
- Web development discussions from r/webdev

### 2. **Filter Posts**
- **All**: Shows all posts
- **Pending**: Shows only posts awaiting review (first 3 posts)
- **Reviewed**: Shows posts that have been actioned

### 3. **Take Actions on Posts**
Each post has 4 action buttons:
- **REPLY** (Green): Mark the AI response as ready to post
- **EDIT** (Blue): Edit the AI-generated response before posting
- **IGNORE** (Gray): Skip this post
- **PENDING** (Yellow): Keep for later review

### 4. **Edit Responses**
1. Click the **EDIT** button
2. Modify the AI-generated response in the text area
3. Monitor the character count (Reddit limit: 10,000)
4. Click **Save** to apply changes or **Cancel** to discard

### 5. **View Post Context**
Each post shows:
- Post title and metadata
- Author and subreddit information
- Post metrics (score, upvotes, comments)
- Matched topics and confidence score
- Parent comment (when applicable)
- Link to view on Reddit

### 6. **Pagination**
- Posts load 20 at a time
- Click "Load More" to fetch additional posts
- Use the scroll-to-top button for easy navigation

## Test Data Features

The mock data includes:
- **Varied confidence scores**: 85-95% to test threshold displays
- **Different post ages**: 1-48 hours ago
- **Parent comments**: ~30% of posts have parent context
- **Multiple topics**: Machine Learning, Web Development, React, TypeScript, etc.
- **Realistic AI responses**: Detailed, helpful responses for each post type

## Direct Access

You can also directly navigate to:
```
http://localhost:3000/projects/demo-project-123/review
```

## Notes

- This is mock data - no real Reddit posts are affected
- Actions are optimistically updated in the UI
- The backend integration is stubbed for demo purposes
- Authentication is bypassed for the demo project ID

## Customization

To test with different data:
1. Edit `/api/projects/[projectId]/reddit-posts/route.ts`
2. Modify the `postTemplates` array with your test scenarios
3. Refresh the page to see new data