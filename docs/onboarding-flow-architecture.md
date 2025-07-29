# Plum 2.0 Onboarding Flow Architecture

## Overview
A comprehensive 4-step wizard for onboarding users, connecting OAuth accounts, and configuring Reddit-to-Discord automation. This document outlines the technical implementation plan for building a seamless onboarding experience.

## Architecture Principles
- **Modular OAuth System**: Base user account via OAuth (Google/GitHub/Microsoft) with ability to connect multiple source/destination platforms
- **Progressive Disclosure**: Each step builds on the previous, showing only what's needed
- **Data Convergence**: All user data converges in Firebase with proper correlation between services
- **Security First**: Encrypted tokens, proper scopes, and validated permissions

## Step 1: User Authentication (Base Account)

### OAuth Provider Options
1. **Google (Primary)**
   - Most universal, widely adopted
   - Clean permission model
   - Reliable API

2. **GitHub**
   - Developer-friendly
   - Good for technical users

3. **Microsoft**
   - Enterprise users
   - Azure AD integration

### Why OAuth for Base Account
- No password management overhead
- Trusted identity providers
- Easy to add multiple source/destination accounts later
- Single sign-on experience
- Industry standard security

### Technical Implementation
```typescript
// NextAuth.js configuration
providers: [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    authorization: {
      params: {
        prompt: "consent",
        access_type: "offline",
        response_type: "code"
      }
    }
  })
]
```

### User Flow
1. User clicks "Sign in with Google"
2. Redirect to Google OAuth consent
3. Callback creates/updates Firebase user
4. JWT session established
5. Redirect to onboarding step 2

## Step 2: Reddit OAuth Integration (Source Account)

### Purpose
- Connect user's Reddit account for content monitoring
- Store refresh tokens for long-term access
- Validate subreddit access permissions

### Reddit OAuth Scopes Required
- `identity` - Access username
- `read` - Read posts and comments
- `mysubreddits` - Access user's subreddit list

### Data Stored
```javascript
{
  platform: 'reddit',
  accountId: 'reddit_user_id',
  username: 'reddit_username',
  accessToken: encrypted_token,
  refreshToken: encrypted_refresh,
  expiresAt: timestamp,
  scopes: ['identity', 'read', 'mysubreddits'],
  connectedAt: timestamp
}
```

### Implementation Notes
- Use Reddit's OAuth2 flow
- Store encrypted tokens in Firestore
- Implement token refresh mechanism
- Validate user has access to selected subreddits

## Step 3: Discord Bot Connection (Destination)

### Bot Setup Flow
1. **Generate Invitation URL**
   ```javascript
   const permissions = [
     'SEND_MESSAGES',
     'EMBED_LINKS',
     'ATTACH_FILES',
     'READ_MESSAGE_HISTORY',
     'ADD_REACTIONS'
   ];
   const inviteUrl = generateBotInvite(clientId, permissions);
   ```

2. **User Adds Bot**
   - User clicks custom invite link
   - Selects Discord server
   - Approves permissions

3. **Bot Confirmation**
   - Bot sends webhook to our API on join
   - Includes server ID, channels, and permissions
   - Links to Firebase user via state parameter

4. **Store Correlation**
   ```javascript
   // Critical correlation data
   {
     serverId: 'discord_server_id',
     serverName: 'My Server',
     firebaseUserId: 'user_uid',
     botId: 'bot_instance_id',
     permissions: permission_integer,
     channels: [
       { id: 'channel_id', name: 'general', canPost: true }
     ]
   }
   ```

### Security Considerations
- Use state parameter to prevent CSRF
- Validate bot has required permissions
- Store minimal necessary data
- Implement bot health checks

## Step 4: Configuration Wizard

### Components

#### Subreddit Selector
- Multi-select interface
- Real-time validation via Reddit API
- Show subreddit preview (icon, member count)
- Warn if subreddit is private/quarantined

#### Keyword Manager
- Add/edit/delete keywords
- Support for regex patterns
- Case sensitivity toggle
- Negative keywords (exclusions)
- Keyword grouping

#### AI Prompt Builder
- Template library
- Variable insertion ({{subreddit}}, {{keyword}})
- Tone selection (professional, casual, informative)
- Preview generated responses

#### Channel Mapper
- Drag-and-drop interface
- Map subreddits → Discord channels
- Default channel fallback
- Channel permission validation

### Configuration Schema
```javascript
{
  name: "Tech News Monitor",
  sourceConnection: "reddit_connection_id",
  destinationConnection: "discord_connection_id",
  active: true,
  configuration: {
    subreddits: ["technology", "programming", "webdev"],
    keywords: [
      { term: "AI", isRegex: false, caseSensitive: false },
      { term: "\\bmachine learning\\b", isRegex: true, caseSensitive: false }
    ],
    aiPrompt: "Summarize this Reddit post professionally...",
    channelMappings: {
      "technology": "tech-news-channel-id",
      "programming": "dev-channel-id",
      "default": "general-channel-id"
    },
    postingSchedule: {
      timezone: "America/New_York",
      quietHours: { start: 0, end: 6 },
      maxPostsPerHour: 5
    }
  }
}
```

## Firebase Data Model

### Collections Structure (Current Implementation)

#### Projects Collection (Main Entity)
```javascript
projects/{projectId}: {
  users: [{
    user_id: string,
    google_auth: {
      auth_token: string
    },
    created_at: timestamp,
    updated_at: timestamp
  }],
  source: {
    reddit: {
      oauth_token: string,
      oauth_token_expires_at: number,
      refresh_token: string,
      subreddits: string[],
      keywords: string[]
    }
  },
  destination: {
    discord: {
      server_id: string,
      channel_id: string,
      bot_token: string
    }
  },
  created_at: timestamp,
  updated_at: timestamp,
  status: string // default: "active"
}
```

#### Subreddits Collection
```javascript
subreddits/{subredditId}: {
  id: string,
  project_id: string,
  name: string,
  active: boolean,
  created_at: timestamp
}
```

### Planned Collections (Not Yet Implemented)

#### OAuth Connections
```javascript
// Current implementation (Google Auth integrated into User/Project models)
projects/{projectId}: {
  project_id: string,
  users: User[],
  destination: Destination,
  source: Source,
  created_at: timestamp,
  updated_at: timestamp,
  status: string // default: "active"
}

users/{userId}: {
  user_id: string,
  google_auth: {
    auth_token: string // Google authentication token
  },
  created_at: timestamp,
  updated_at: timestamp
}

// Planned for future implementation - Extended OAuth support
users/{userId}/connections/{connectionId}: {
  platform: 'reddit' | 'discord' | 'slack' | 'gmail' | 'google',
  accountId: string,
  username: string,
  displayName: string,
  accessToken: encrypted,
  refreshToken: encrypted,
  expiresAt: timestamp,
  scopes: string[],
  connectedAt: timestamp,
  lastRefresh: timestamp,
  metadata: object // Platform-specific data
}
```

#### Discord Bot Instances
```javascript
// Planned for future implementation
discord_bots/{botId}: {
  serverId: string,
  serverName: string,
  ownerId: string,
  firebaseUserId: string,
  permissions: number,
  channels: ChannelArray,
  addedAt: timestamp,
  lastHealthCheck: timestamp,
  status: 'active' | 'inactive' | 'error'
}
```

### Security Rules
```javascript
// Users can only read/write their own data
match /users/{userId} {
  allow read, write: if request.auth.uid == userId;

  match /connections/{connectionId} {
    allow read, write: if request.auth.uid == userId;
  }

  match /projects/{projectId} {
    allow read, write: if request.auth.uid == userId;
  }
}

// Discord bots linked to authenticated users
match /discord_bots/{botId} {
  allow read: if request.auth.uid == resource.data.firebaseUserId;
  allow write: if false; // Only backend can write
}
```

## Technical Stack

### Frontend
- **Next.js 14** - App router, server components
- **NextAuth.js** - OAuth authentication
- **Firebase SDK** - Firestore, Auth
- **React Query (TanStack Query)** - Data fetching, caching
- **Zustand** - Wizard state management
- **React Hook Form + Zod** - Form validation
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible components

### Backend API Routes

#### Currently Implemented Endpoints
```
GET    /health                      - Health check endpoint
GET    /dashboard/{user_id}         - Get project data by user ID
POST   /reddit/configs              - Update Reddit configuration
```

#### Planned Endpoints (Not Yet Implemented)
```
# Authentication
POST   /api/auth/[provider]          - Initiate OAuth flow
GET    /api/auth/callback/[provider] - Handle OAuth callback
POST   /api/auth/logout              - Clear session

# User Management
GET    /api/user/profile             - Get user data
PUT    /api/user/onboarding          - Update onboarding status

# Connection Management
POST   /api/connections              - Add new connection
DELETE /api/connections/[id]         - Remove connection
POST   /api/connections/refresh      - Refresh OAuth tokens

# Reddit Integration
GET    /api/reddit/subreddits        - Search/validate subreddits
GET    /api/reddit/user/subreddits   - Get user's subreddits

# Discord Integration
POST   /api/discord/bot-webhook      - Bot join confirmation
GET    /api/discord/servers          - List user's servers
GET    /api/discord/channels/[serverId] - Get server channels

# Project Management
POST   /api/projects                 - Create project
PUT    /api/projects/[id]            - Update project
DELETE /api/projects/[id]            - Delete project
POST   /api/projects/[id]/test       - Test configuration

# Additional Endpoints (Commented in code)
GET    /projects                     - List all projects
GET    /projects/{project_id}        - Get specific project
GET    /keywords                     - List keywords
POST   /keywords                     - Create keyword
DELETE /keywords/{keyword_id}        - Delete keyword
GET    /messages                     - List messages
GET    /messages/{message_id}        - Get specific message
```

### Environment Variables
```bash
# Public (exposed to browser)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_DISCORD_CLIENT_ID=
NEXT_PUBLIC_REDDIT_CLIENT_ID=

# Server-only
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

REDDIT_CLIENT_SECRET=

DISCORD_CLIENT_SECRET=
DISCORD_BOT_TOKEN=

ENCRYPTION_KEY=
```

## State Management

### Onboarding Wizard State (Zustand)
```typescript
interface OnboardingState {
  currentStep: number;
  completedSteps: number[];
  formData: {
    selectedSubreddits: string[];
    keywords: Keyword[];
    aiPrompt: string;
    channelMappings: Record<string, string>;
  };
  connections: {
    reddit?: Connection;
    discord?: Connection;
  };

  // Actions
  nextStep: () => void;
  previousStep: () => void;
  updateFormData: (data: Partial<FormData>) => void;
  setConnection: (platform: string, connection: Connection) => void;
}
```

### Auth Context
```typescript
interface AuthContextValue {
  user: User | null;
  loading: boolean;
  error: Error | null;
  signIn: (provider: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}
```

## Security Best Practices

1. **Token Storage**
   - Encrypt OAuth tokens before storing in Firestore
   - Use Firebase Admin SDK for server-side operations
   - Implement token rotation for refresh tokens

2. **API Security**
   - Validate all inputs with Zod schemas
   - Rate limit endpoints (especially OAuth callbacks)
   - CSRF protection via state parameter
   - Verify Discord webhook signatures

3. **Data Access**
   - Firebase Security Rules for client access
   - Server-side validation for all writes
   - Principle of least privilege for bot permissions

4. **Error Handling**
   - Never expose internal errors to client
   - Log errors with context for debugging
   - Graceful fallbacks for failed OAuth flows

## Implementation Phases

### Phase 1: Authentication Foundation (Week 1)
- [ ] Set up NextAuth.js with Google provider
- [ ] Configure Firebase Auth integration
- [ ] Build login/logout UI components
- [ ] Implement session management
- [ ] Add auth middleware for protected routes

### Phase 2: OAuth Connections (Week 2)
- [ ] Reddit OAuth implementation
- [ ] Token encryption/decryption service
- [ ] Connection management UI
- [ ] Token refresh mechanism
- [ ] Connection status indicators

### Phase 3: Discord Integration (Week 3)
- [ ] Discord bot service setup
- [ ] Bot invitation flow
- [ ] Webhook endpoint for bot joins
- [ ] Server/channel fetching APIs
- [ ] Permission validation

### Phase 4: Configuration Wizard (Week 4)
- [ ] Wizard component framework
- [ ] Subreddit selector with validation
- [ ] Keyword manager interface
- [ ] AI prompt builder
- [ ] Channel mapping UI
- [ ] Review and activate screen

### Phase 5: Testing & Polish (Week 5)
- [ ] End-to-end testing
- [ ] Error boundary implementations
- [ ] Loading states and skeletons
- [ ] Accessibility audit
- [ ] Performance optimization
- [ ] Documentation

## Success Metrics
- Time to complete onboarding < 5 minutes
- 0% token exposure in client
- 100% of OAuth flows handle errors gracefully
- All forms validate in < 100ms
- Bot confirmation success rate > 95%

## Future Enhancements
- Additional OAuth providers (Twitter, LinkedIn)
- Bulk import from CSV
- Onboarding templates
- A/B testing different flows
- Progressive web app support
- Multi-language support