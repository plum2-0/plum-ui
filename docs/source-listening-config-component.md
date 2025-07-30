# Source Listening Configuration Component

## Overview
A comprehensive configuration interface that allows users to set up Reddit content monitoring by selecting subreddits, defining topics of interest, and crafting personalized response prompts. This component serves as the core configuration step in the onboarding flow.

## Component **Structure**

### Layout Hierarchy
```
┌─────────────────────────────────────────────────────────────┐
│                    Configuration Header                     │
│                "Configure Your Reddit Listening"           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📋 Subreddit Selection Section                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  "Select Subreddits to Monitor"                    │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │  [+ Add Subreddit] [r/technology] [×]      │   │   │
│  │  │  [r/programming] [×] [r/webdev] [×]        │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  🎯 Topic Configuration Section                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  "What topics do you want to talk to others about" │   │
│  │  "Plum will listen to the subreddits and talk to   │   │
│  │   others about the topics listed below"            │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │  [+ Add Topic] [AI] [×] [Machine Learning] │   │   │
│  │  │  [Web Development] [×] [React] [×]         │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  💬 Prompt Configuration Section                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  "What do you want to say to people when these     │   │
│  │   topics come up"                                   │   │
│  │  ┌─────────────────────────────────────────────┐   │   │
│  │  │  ┌─────────────────────────────────────┐   │   │   │
│  │  │  │                                     │   │   │   │
│  │  │  │  [Large TextArea for prompt]        │   │   │   │
│  │  │  │                                     │   │   │   │
│  │  │  │                                     │   │   │   │
│  │  │  └─────────────────────────────────────┘   │   │   │
│  │  └─────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [Previous Step]              [Save & Continue]            │
└─────────────────────────────────────────────────────────────┘
```

## API Routes

### Subreddit Management

#### Add Subreddit to Project
```http
POST /api/projects/{projectId}/subreddits
Content-Type: application/json

{
  "subreddit": "technology"
}

Response: 200 OK
{
  "success": true,
  "subreddits": ["technology", "programming", "webdev"],
  "message": "Subreddit added successfully"
}
```

#### Remove Subreddit from Project
```http
DELETE /api/projects/{projectId}/subreddits/{subredditName}

Response: 200 OK
{
  "success": true,
  "subreddits": ["programming", "webdev"],
  "message": "Subreddit removed successfully"
}
```

#### Get Project Subreddits
```http
GET /api/projects/{projectId}/subreddits

Response: 200 OK
{
  "success": true,
  "subreddits": ["technology", "programming", "webdev"]
}
```

### Configuration Management

#### Create New Configuration
```http
POST /api/projects/{projectId}/configs
Content-Type: application/json

{
  "name": "Tech Discussion Config",
  "topics": ["AI", "Machine Learning"],
  "prompt": "I'd love to discuss this topic further..."
}

Response: 201 Created
{
  "success": true,
  "configId": "config_12345",
  "config": {
    "topics": ["AI", "Machine Learning"],
    "prompt": "I'd love to discuss this topic further..."
  }
}
```

#### Update Configuration Topics
```http
PUT /api/projects/{projectId}/configs/{configId}/topics
Content-Type: application/json

{
  "topics": ["AI", "Machine Learning", "Web Development"]
}

Response: 200 OK
{
  "success": true,
  "topics": ["AI", "Machine Learning", "Web Development"]
}
```

#### Update Configuration Prompt
```http
PUT /api/projects/{projectId}/configs/{configId}/prompt
Content-Type: application/json

{
  "prompt": "Updated prompt text here..."
}

Response: 200 OK
{
  "success": true,
  "prompt": "Updated prompt text here..."
}
```

#### Get Configuration
```http
GET /api/projects/{projectId}/configs/{configId}

Response: 200 OK
{
  "success": true,
  "config": {
    "topics": ["AI", "Machine Learning"],
    "prompt": "I'd love to discuss this topic further..."
  }
}
```

#### Delete Configuration
```http
DELETE /api/projects/{projectId}/configs/{configId}

Response: 200 OK
{
  "success": true,
  "message": "Configuration deleted successfully"
}
```

## Component Implementation Details

### 1. Subreddit Selection Section

#### Visual Design
- **Header**: "Select Subreddits to Monitor"
- **Input Method**: Search-as-you-type with Reddit API validation
- **Display**: Pill-based tags with remove buttons
- **Validation**: Real-time subreddit existence checking
- **Feedback**: Loading states, error messages for invalid subreddits

#### User Interactions
```typescript
// Add subreddit flow
1. User types in search field
2. Debounced API call validates subreddit exists
3. On Enter/Click: POST /api/projects/{projectId}/subreddits
4. Update local state and UI
5. Clear input field

// Remove subreddit flow
1. User clicks [×] on subreddit pill
2. DELETE /api/projects/{projectId}/subreddits/{subredditName}
3. Update local state and UI
4. Show confirmation toast
```

#### Technical Implementation
```typescript
interface SubredditSectionProps {
  projectId: string;
  initialSubreddits: string[];
  onSubredditsChange: (subreddits: string[]) => void;
}

const SubredditSection: React.FC<SubredditSectionProps> = ({
  projectId,
  initialSubreddits,
  onSubredditsChange
}) => {
  const [subreddits, setSubreddits] = useState(initialSubreddits);
  const [inputValue, setInputValue] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const addSubreddit = async (subredditName: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/subreddits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subreddit: subredditName })
      });

      const data = await response.json();
      setSubreddits(data.subreddits);
      onSubredditsChange(data.subreddits);
      setInputValue('');
    } catch (error) {
      // Handle error
    }
  };

  const removeSubreddit = async (subredditName: string) => {
    try {
      const response = await fetch(
        `/api/projects/${projectId}/subreddits/${subredditName}`,
        { method: 'DELETE' }
      );

      const data = await response.json();
      setSubreddits(data.subreddits);
      onSubredditsChange(data.subreddits);
    } catch (error) {
      // Handle error
    }
  };

  // Component JSX...
};
```

### 2. Topic Configuration Section

#### Visual Design
- **Header**: "What topics do you want to talk to others about"
- **Subtext**: "Plum will listen to the subreddits and talk to others about the topics listed below"
- **Input Method**: Simple text input with add button
- **Display**: Pill-based tags with remove buttons
- **Styling**: Prominent call-to-action styling

#### User Interactions
```typescript
// Add topic flow
1. User types topic in input field
2. On Enter/Click Add: PUT /api/projects/{projectId}/configs/{configId}/topics
3. Update local state and UI
4. Clear input field

// Remove topic flow
1. User clicks [×] on topic pill
2. PUT /api/projects/{projectId}/configs/{configId}/topics (with updated array)
3. Update local state and UI
```

#### Technical Implementation
```typescript
interface TopicSectionProps {
  projectId: string;
  configId: string;
  initialTopics: string[];
  onTopicsChange: (topics: string[]) => void;
}

const TopicSection: React.FC<TopicSectionProps> = ({
  projectId,
  configId,
  initialTopics,
  onTopicsChange
}) => {
  const [topics, setTopics] = useState(initialTopics);
  const [inputValue, setInputValue] = useState('');

  const updateTopics = async (newTopics: string[]) => {
    try {
      const response = await fetch(
        `/api/projects/${projectId}/configs/${configId}/topics`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topics: newTopics })
        }
      );

      const data = await response.json();
      setTopics(data.topics);
      onTopicsChange(data.topics);
    } catch (error) {
      // Handle error
    }
  };

  const addTopic = () => {
    if (inputValue.trim() && !topics.includes(inputValue.trim())) {
      const newTopics = [...topics, inputValue.trim()];
      updateTopics(newTopics);
      setInputValue('');
    }
  };

  const removeTopic = (topicToRemove: string) => {
    const newTopics = topics.filter(topic => topic !== topicToRemove);
    updateTopics(newTopics);
  };

  // Component JSX...
};
```

### 3. Prompt Configuration Section

#### Visual Design
- **Header**: "What do you want to say to people when these topics come up"
- **Input**: Large textarea (8-10 rows)
- **Behavior**: Auto-saves on blur
- **Feedback**: Save indicator, character count
- **Placeholder**: Helpful example text

#### User Interactions
```typescript
// Prompt update flow
1. User types in textarea
2. On blur event: PUT /api/projects/{projectId}/configs/{configId}/prompt
3. Show save indicator
4. Handle errors gracefully
```

#### Technical Implementation
```typescript
interface PromptSectionProps {
  projectId: string;
  configId: string;
  initialPrompt: string;
  onPromptChange: (prompt: string) => void;
}

const PromptSection: React.FC<PromptSectionProps> = ({
  projectId,
  configId,
  initialPrompt,
  onPromptChange
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const updatePrompt = async (newPrompt: string) => {
    setIsSaving(true);
    try {
      const response = await fetch(
        `/api/projects/${projectId}/configs/${configId}/prompt`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: newPrompt })
        }
      );

      const data = await response.json();
      onPromptChange(data.prompt);
      setLastSaved(new Date());
    } catch (error) {
      // Handle error
    } finally {
      setIsSaving(false);
    }
  };

  const handleBlur = () => {
    if (prompt !== initialPrompt) {
      updatePrompt(prompt);
    }
  };

  // Component JSX with textarea...
};
```

## State Management

### Component State Structure
```typescript
interface SourceConfigurationState {
  projectId: string;
  configId: string;
  subreddits: string[];
  topics: string[];
  prompt: string;
  isLoading: boolean;
  errors: {
    subreddits?: string;
    topics?: string;
    prompt?: string;
  };
}
```

### Data Flow
```mermaid
graph TD
    A[Component Mount] --> B[Load Initial Data]
    B --> C[Render UI]

    C --> D[User Adds Subreddit]
    D --> E[POST /api/projects/{id}/subreddits]
    E --> F[Update Local State]
    F --> C

    C --> G[User Adds Topic]
    G --> H[PUT /api/projects/{id}/configs/{id}/topics]
    H --> I[Update Local State]
    I --> C

    C --> J[User Edits Prompt]
    J --> K[Textarea Blur Event]
    K --> L[PUT /api/projects/{id}/configs/{id}/prompt]
    L --> M[Update Local State]
    M --> C
```

## Error Handling

### Validation Rules
- **Subreddits**: Must exist on Reddit, no duplicates
- **Topics**: No empty strings, no duplicates, max 50 characters each
- **Prompt**: Max 2000 characters, no HTML/script tags

### Error States
```typescript
interface ErrorHandling {
  subreddit: {
    notFound: "Subreddit not found on Reddit";
    duplicate: "Subreddit already added";
    networkError: "Unable to validate subreddit";
  };
  topic: {
    empty: "Topic cannot be empty";
    duplicate: "Topic already added";
    tooLong: "Topic must be under 50 characters";
  };
  prompt: {
    tooLong: "Prompt must be under 2000 characters";
    invalidContent: "Invalid characters detected";
  };
}
```

## Accessibility Features

### Keyboard Navigation
- Tab order: Subreddit input → Add button → Subreddit pills → Topic input → Topic pills → Prompt textarea
- Enter key: Submits current input field
- Escape key: Clears current input field
- Arrow keys: Navigate between pills

### Screen Reader Support
- ARIA labels for all interactive elements
- Live regions for dynamic content updates
- Semantic HTML structure
- Focus management after add/remove operations

### Visual Indicators
- Loading spinners for async operations
- Success/error toast notifications
- Clear visual hierarchy with proper contrast
- Responsive design for mobile devices

## Performance Considerations

### Debouncing and Throttling
- Subreddit validation: 300ms debounce
- Prompt auto-save: 1000ms debounce
- API call deduplication

### Optimistic Updates
- Immediate UI updates before API confirmation
- Rollback mechanism for failed operations
- Loading states for better perceived performance

### Caching Strategy
- Cache validated subreddits for session
- Persist form state in localStorage
- Background sync for offline editing

## Testing Strategy

### Unit Tests
- Component rendering with different props
- User interaction simulations
- API call mocking and error scenarios
- Form validation logic

### Integration Tests
- End-to-end configuration flow
- API endpoint testing
- Database state verification
- Error recovery flows

### Accessibility Tests
- Screen reader compatibility
- Keyboard navigation
- Color contrast validation
- Focus management testing