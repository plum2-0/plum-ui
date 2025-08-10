# PlumSprout Settings Section - Design Document

## 1. Overview

The Settings section will serve as the central configuration hub for PlumSprout users to manage their brand identity and social media integrations. This section will enable users to update brand information and connect various social media platforms for community monitoring and engagement.

## 2. Architecture Overview

### 2.1 Data Model Updates

#### Brand Model Enhancement (`@api/src/plum/models/brand.py`)
```python
class RedditSource:
    account_connected: bool
    username: str | None
    access_token: str | None
    refresh_token: str | None
    connected_subreddit: str | None  # NEW FIELD
    last_sync: datetime | None

class Sources:
    reddit: RedditSource | None
    linkedin: LinkedInSource | None  # Future
    facebook: FacebookSource | None  # Future
```

### 2.2 Component Structure
```
/settings
  ├── page.tsx                    # Main settings page
  ├── components/
  │   ├── BrandSettings.tsx       # Brand information form
  │   ├── SocialMediaManager.tsx  # Social media accounts overview
  │   ├── RedditConfig.tsx        # Reddit-specific configuration
  │   ├── LinkedInConfig.tsx      # LinkedIn configuration (disabled)
  │   └── FacebookConfig.tsx      # Facebook configuration (disabled)
```

## 3. User Interface Design

### 3.1 Settings Layout

The settings page will follow the glass-morphism design pattern established in the home page, with a sidebar navigation and main content area.

```
┌─────────────────────────────────────────────────┐
│  Settings                                       │
├─────────────┬───────────────────────────────────┤
│             │                                   │
│ ▸ Brand     │  [Main Content Area]              │
│ ▸ Social    │                                   │
│   Media     │                                   │
│ ▸ Team      │                                   │
│ ▸ Billing   │                                   │
│             │                                   │
└─────────────┴───────────────────────────────────┘
```

### 3.2 Brand Settings Section

**Purpose**: Allow users to update core brand information

**Fields**:
- Brand Name (required)
- Brand Description (textarea)
- Target Keywords (tag input)
- Brand Voice/Tone (dropdown or textarea)
- Brand Colors (color pickers)
- Logo Upload

**Visual Design**:
```
┌──────────────────────────────────────────┐
│ Brand Information                        │
├──────────────────────────────────────────┤
│ Brand Name*                              │
│ [___________________]                    │
│                                          │
│ Description                              │
│ [_____________________]                  │
│ [_____________________]                  │
│                                          │
│ Keywords                                 │
│ [+Add keyword] [tag1] [tag2]            │
│                                          │
│ [Save Changes]                           │
└──────────────────────────────────────────┘
```

### 3.3 Social Media Manager Section

**Purpose**: Overview and management of all social media connections

**Visual Design**:
```
┌──────────────────────────────────────────┐
│ Connected Accounts                       │
├──────────────────────────────────────────┤
│                                          │
│ ┌─────────────────────────────┐         │
│ │ 🔶 Reddit        [Connected] │         │
│ │ u/username                   │         │
│ │ → Manage                     │         │
│ └─────────────────────────────┘         │
│                                          │
│ ┌─────────────────────────────┐         │
│ │ 🔗 LinkedIn      [Coming Soon]│        │
│ │ Connect your LinkedIn        │         │
│ │ (Disabled)                   │         │
│ └─────────────────────────────┘         │
│                                          │
│ ┌─────────────────────────────┐         │
│ │ 📘 Facebook      [Coming Soon]│        │
│ │ Connect your Facebook        │         │
│ │ (Disabled)                   │         │
│ └─────────────────────────────┘         │
└──────────────────────────────────────────┘
```

### 3.4 Reddit Configuration Section

**Purpose**: Detailed Reddit account management and subreddit linking

#### State 1: No Reddit Account Connected
```
┌──────────────────────────────────────────┐
│ Reddit Configuration                     │
├──────────────────────────────────────────┤
│                                          │
│   ⚠️ No Reddit account connected         │
│                                          │
│   Connect your Reddit account to start   │
│   monitoring conversations about your    │
│   brand across Reddit communities.       │
│                                          │
│   [Connect Reddit Account] →             │
│                                          │
└──────────────────────────────────────────┘
```

#### State 2: Reddit Account Connected
```
┌──────────────────────────────────────────┐
│ Reddit Configuration                     │
├──────────────────────────────────────────┤
│ Connected as: u/username                 │
│ [Disconnect Account]                     │
│                                          │
│ ─────────────────────────────            │
│                                          │
│ Link Your Subreddit                      │
│ Select a subreddit you moderate:         │
│                                          │
│ ┌─────────────────────────────┐         │
│ │ ☐ r/mysubreddit1            │         │
│ │ ☐ r/mysubreddit2            │         │
│ │ ☐ r/mysubreddit3            │         │
│ └─────────────────────────────┘         │
│                                          │
│ Currently Linked: r/mysubreddit1 ✓      │
│                                          │
│ [Update Linked Subreddit]                │
└──────────────────────────────────────────┘
```

## 4. API Endpoints

### 4.1 Brand Management
- `GET /api/brands/{brand_id}` - Retrieve brand settings
- `PATCH /api/brands/{brand_id}` - Update brand information
- `POST /api/brands/{brand_id}/logo` - Upload brand logo

### 4.2 Social Media Integration

#### Existing Reddit Connection (NextAuth)
The Reddit OAuth connection is already implemented via NextAuth at:
- `@plum-ui/src/app/api/connections/reddit` - Handles Reddit OAuth flow

#### Additional Endpoints Needed
- `GET /api/brands/{brand_id}/sources` - Get all connected sources
- `DELETE /api/brands/{brand_id}/sources/reddit` - Disconnect Reddit
- `GET /api/brands/{brand_id}/sources/reddit/subreddits` - Fetch moderated subreddits (real-time from Reddit API)
- `POST /api/brands/{brand_id}/sources/reddit/link-subreddit` - Link a subreddit to brand

## 5. Technical Implementation

### 5.1 Reddit OAuth Flow
1. User clicks "Connect Reddit Account"
2. Redirect to existing NextAuth Reddit handler at `/api/connections/reddit`
3. OAuth flow with appropriate scopes:
   - `identity` - Access user info
   - `mysubreddits` - Access moderated subreddits
   - `read` - Read access to subreddits
   - `submit` - Post content (for future engagement features)
4. Handle callback and store tokens in brand.sources.reddit

### 5.2 Subreddit Fetching
When user accesses the Reddit Configuration section:
1. Check if Reddit account is connected
2. If connected, fetch moderated subreddits from Reddit API (not cached)
3. Display subreddits in multi-select list
4. Allow user to select and link one subreddit to their brand

## 6. User Experience Considerations

### 6.1 Loading States
- Show skeleton loaders while fetching subreddit lists from Reddit API
- Display progress indicators during OAuth flow
- Provide clear feedback on save operations

### 6.2 Error Handling
- Clear error messages for failed connections
- Graceful handling of expired tokens
- Validation feedback for brand information
- Handle case where user has no moderated subreddits

### 6.3 Accessibility
- Proper ARIA labels for all form elements
- Keyboard navigation support
- Screen reader friendly status messages
- Clear visual indicators for disabled states (LinkedIn/Facebook)