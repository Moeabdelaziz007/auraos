# User History Tracking System

## Overview

The User History Tracking System for AuraOS provides comprehensive analytics and behavior tracking for all user interactions. This system automatically collects, stores, and analyzes user actions to provide insights into user behavior, engagement patterns, and system performance.

## Features

### 📊 Comprehensive Tracking
- **Page Navigation**: Automatic tracking of page views, time spent, and navigation patterns
- **User Interactions**: Clicks, form interactions, content engagement, and social actions
- **AI Interactions**: Chat messages, agent interactions, and AI-powered features
- **Error Tracking**: Automatic error capture with context and stack traces
- **Session Management**: Complete session tracking with device and location information

### 🔍 Advanced Analytics
- **Real-time Dashboards**: Live analytics with multiple views (Overview, Behavior, Sessions, History)
- **User Insights**: Most used features, top pages, device breakdown, and engagement metrics
- **Performance Metrics**: Error rates, session duration, and retention analysis
- **Export Functionality**: Export analytics data for external analysis

### 🛠️ Developer-Friendly
- **Easy Integration**: Simple hooks and components for tracking any user action
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Flexible API**: Multiple tracking methods for different use cases
- **Batch Processing**: Efficient data storage with automatic buffering

## Architecture

### Core Components

1. **UserHistoryService**: Core service for tracking and managing user history
2. **React Hooks**: Easy-to-use hooks for component integration
3. **Analytics Components**: Pre-built dashboards and visualization components
4. **Firestore Integration**: Secure, scalable data storage with real-time updates

### Data Structure

```typescript
interface UserHistory {
  id: string;
  userId: string;
  action: UserAction;
  timestamp: Date;
  sessionId: string;
  metadata?: Record<string, any>;
  duration?: number;
  success: boolean;
  errorMessage?: string;
}

interface UserAction {
  type: ActionType;
  category: ActionCategory;
  description: string;
  target?: string;
  targetType?: string;
  details?: Record<string, any>;
}
```

## Quick Start

### 1. Basic Setup

The system is automatically initialized when a user logs in. No additional setup required!

### 2. Track User Actions

```typescript
import { useUserHistory } from '@/hooks/use-user-history';

function MyComponent() {
  const { trackContentInteraction } = useUserHistory();

  const handleClick = () => {
    trackContentInteraction('click', 'button', 'my-button', {
      component: 'MyComponent',
      action: 'demo'
    });
  };

  return <button onClick={handleClick}>Click me</button>;
}
```

### 3. Track Page Navigation

```typescript
import { usePageTracking } from '@/hooks/use-user-history';

function MyPage() {
  usePageTracking('My Page'); // Automatically tracks page views
  return <div>My Page Content</div>;
}
```

### 4. Track Form Interactions

```typescript
import { useFormTracking } from '@/hooks/use-user-history';

function MyForm() {
  const { trackFormStart, trackFieldFocus, trackFormSubmit } = useFormTracking('my-form');

  const handleSubmit = (data) => {
    trackFormSubmit(true, data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input onFocus={() => trackFieldFocus('email')} />
      <button type="submit">Submit</button>
    </form>
  );
}
```

## Available Hooks

### useUserHistory()
Main hook for tracking user actions.

```typescript
const {
  isInitialized,
  currentSession,
  error,
  trackNavigation,
  trackContentInteraction,
  trackAIInteraction,
  trackSocialInteraction,
  trackWorkflowInteraction,
  trackError
} = useUserHistory();
```

### usePageTracking(pageName)
Automatically tracks page views and navigation.

```typescript
function MyPage() {
  usePageTracking('My Page');
  return <div>Page content</div>;
}
```

### useInteractionTracking(componentName)
Tracks component-level interactions.

```typescript
const { trackClick, trackView, trackCreate, trackUpdate, trackDelete } = 
  useInteractionTracking('MyComponent');
```

### useFormTracking(formName)
Tracks form interactions and submissions.

```typescript
const { trackFormStart, trackFieldFocus, trackFormSubmit, trackFormAbandon } = 
  useFormTracking('my-form');
```

### useUserHistoryData(options)
Retrieves and manages user history data.

```typescript
const { history, loading, error, hasMore, loadMore, refresh } = 
  useUserHistoryData({ limit: 50, actionType: 'click' });
```

### useUserSessions()
Manages user session data.

```typescript
const { sessions, loading, error, refresh } = useUserSessions();
```

### useUserAnalytics(period)
Generates and manages user analytics.

```typescript
const { analytics, loading, error, refresh } = useUserAnalytics('monthly');
```

## Analytics Dashboard

The analytics dashboard provides comprehensive insights into user behavior:

### Overview Tab
- Total actions and sessions
- Average session duration
- Error rates and retention metrics
- Most used features and top pages

### Behavior Tab
- Action type distribution
- Category breakdown
- Hourly activity patterns
- User engagement trends

### Sessions Tab
- Session history and details
- Device and browser information
- Session duration analysis
- Activity patterns

### History Tab
- Complete action history
- Filterable by category and type
- Search functionality
- Detailed action metadata

## Data Export

Export analytics data in JSON format for external analysis:

```typescript
const { analytics, sessions, history } = useUserAnalytics();
// Export functionality is built into the dashboard
```

## Security & Privacy

### Data Protection
- All data is stored securely in Firestore
- User data is isolated per user ID
- Sensitive information is not tracked
- GDPR-compliant data handling

### Access Control
- Users can only access their own data
- Admin access for system analytics
- Secure authentication required
- Data retention policies implemented

## Performance

### Optimization Features
- **Batch Processing**: Actions are buffered and sent in batches
- **Offline Support**: Works offline and syncs when online
- **Lazy Loading**: Analytics are generated on-demand
- **Efficient Queries**: Optimized Firestore queries with proper indexing

### Scalability
- Handles thousands of actions per user
- Efficient data compression
- Automatic cleanup of old data
- Horizontal scaling support

## Configuration

### Environment Variables
```env
# Firebase configuration (already set up)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
```

### Firestore Rules
The system includes recommended Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User history - users can only access their own data
    match /userHistory/{historyId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    
    // User sessions - users can only access their own sessions
    match /userSessions/{sessionId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
  }
}
```

## Troubleshooting

### Common Issues

1. **Tracking not working**: Ensure user is authenticated
2. **Analytics not loading**: Check Firestore permissions
3. **Performance issues**: Verify Firestore indexes are created
4. **Data not appearing**: Check network connection and Firestore rules

### Debug Mode

Enable debug logging:

```typescript
// In development, the system logs all tracking events
console.log('User history tracking:', action);
```

## Best Practices

### Do's
- ✅ Track meaningful user actions
- ✅ Use descriptive action names and categories
- ✅ Include relevant metadata
- ✅ Test tracking in development
- ✅ Monitor analytics regularly

### Don'ts
- ❌ Track sensitive information
- ❌ Over-track trivial actions
- ❌ Ignore performance implications
- ❌ Forget to handle errors
- ❌ Skip data validation

## Examples

See the example component at `/src/components/examples/user-history-example.tsx` for a complete demonstration of the tracking system.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the example components
3. Check Firestore console for data
4. Verify network connectivity

## Future Enhancements

- Real-time notifications for analytics
- Machine learning insights
- Advanced visualization options
- API for external analytics tools
- Custom dashboard builder
