# Updated Onboarding Flow with Reddit Post Review

## Overview

The onboarding flow has been updated to automatically redirect users to the Reddit Post Review page once they have completed their configuration.

## Flow Diagram

```
1. User Sign Up/Sign In
   ↓
2. Project Creation (/onboarding)
   ↓
3. Reddit OAuth Connection (/onboarding/reddit)
   ↓
4. Configuration (/onboarding/configure)
   - Add subreddits
   - Define topics
   - Create AI prompt
   ↓
5. Reddit Post Review (/projects/[projectId]/review) ← NEW!
   - Review matched posts
   - Take actions on AI responses
```

## Implementation Details

### 1. **Onboarding State API**
The `/api/onboarding/state` endpoint now checks for complete configuration:
- Has Reddit OAuth token
- Has at least one subreddit
- Has at least one topic
- Has a prompt configured

When all conditions are met:
- `hasCompleteConfig: true`
- `currentStep: 4`
- `redirectTo: "/projects/[projectId]/review"`

### 2. **Auto-Redirect Logic**
Users are automatically redirected to the review page when:
- They complete the configuration step
- They visit `/demo` with a complete configuration
- They visit any onboarding page with a complete configuration

### 3. **Configure Page Update**
The "Complete Setup" button now redirects to:
```javascript
window.location.href = `/projects/${projectId}/review`;
```

### 4. **Demo Page Enhancement**
The demo page now:
- Checks authentication status
- Fetches onboarding state
- Auto-redirects to review page if configuration is complete
- Falls back to demo project ID if no active project

## Testing the Flow

1. **New User Flow**:
   ```bash
   npm run dev
   # Visit http://localhost:3000
   # Complete onboarding steps
   # Automatically land on review page
   ```

2. **Returning User with Complete Config**:
   ```bash
   # Visit http://localhost:3000/demo
   # Auto-redirects to /projects/[projectId]/review
   ```

3. **Demo Mode** (not authenticated):
   ```bash
   # Visit http://localhost:3000/demo
   # Click "Try Demo" → /projects/demo-project-123/review
   ```

## Benefits

1. **Seamless Experience**: Users immediately see the value of the product
2. **No Dead Ends**: No confusion about what to do after configuration
3. **Action-Oriented**: Users can start reviewing posts right away
4. **Smart Routing**: Returning users go directly to their work

## Future Enhancements

1. **Dashboard**: Add a proper dashboard with analytics
2. **Multiple Projects**: Support project switching
3. **Notifications**: Badge for pending post count
4. **Quick Actions**: Keyboard shortcuts for power users