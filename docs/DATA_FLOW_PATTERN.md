# Dashboard Data Flow Pattern

## Overview

This document outlines the standardized data flow pattern implemented across the ACS Next.js dashboard to ensure consistency and maintainability.

## Data Flow Architecture

```
Data Source → Process Data → Conversation (containing Thread and Message) ← Used by Components
```

### 1. Data Sources
- **API Endpoints**: `/api/lcp/get_all_threads`, `/api/usage/stats`
- **Database Operations**: Direct database queries for user-specific data
- **External Services**: Third-party integrations

### 2. Centralized Processing
All raw data is processed through the `processThreadsResponse` function in `lib/utils/api.ts`, which ensures:
- Consistent `Conversation` object structure
- Proper date handling and timezone conversion
- Type safety and validation
- Error handling and fallbacks

### 3. Conversation Structure
The canonical data structure that all components use:

```typescript
interface Conversation {
  thread: Thread;      // Thread metadata and status
  messages: Message[];  // Array of messages in the conversation
}
```

## Implementation Details

### Centralized Processing Function

```typescript
// lib/utils/api.ts
export function processThreadsResponse(responseData: any[]): Conversation[] {
  // Ensures all data follows the Conversation structure
  // Handles date parsing, type validation, and error cases
  // Returns properly typed Conversation objects
}
```

### Data Flow in Components

#### 1. Dashboard Page
```typescript
// app/dashboard/page.tsx
function DashboardContent() {
  const { data, loading, error } = useDashboardData(); // Uses centralized processing
  return <DashboardLayout data={data} />; // Passes processed Conversation objects
}
```

#### 2. Dashboard Layout
```typescript
// components/features/dashboard/DashboardLayout.tsx
export function DashboardLayout({ data }: { data: DashboardData }) {
  return (
    <div>
      <DashboardMetrics data={data.metrics} />
      <RecentConversations conversations={data.conversations} /> {/* Processed Conversation[] */}
      <DashboardCharts data={data.analytics} />
    </div>
  );
}
```

#### 3. Individual Components
```typescript
// components/features/dashboard/RecentConversations.tsx
export function RecentConversations({ conversations }: { conversations: Conversation[] }) {
  // All conversations are guaranteed to be properly processed
  return conversations.map(conversation => (
    <ConversationCard key={conversation.thread.conversation_id} conversation={conversation} />
  ));
}
```

## Benefits of This Pattern

### 1. Consistency
- All components receive data in the same format
- No need for individual data processing in components
- Consistent error handling and validation

### 2. Maintainability
- Single source of truth for data processing logic
- Easy to update data transformation rules
- Centralized type definitions

### 3. Performance
- Data is processed once at the source
- Components receive ready-to-use data
- Reduced redundant processing

### 4. Type Safety
- Strong TypeScript typing throughout the flow
- Compile-time validation of data structure
- IntelliSense support for all data properties

## Migration Guide

### Before (Inconsistent Processing)
```typescript
// ❌ Each component processed data differently
function OldComponent() {
  const { data } = useApi('/api/threads');
  const processedData = data.map(item => ({
    // Manual processing logic
    id: item.thread?.conversation_id || item.id,
    messages: item.messages?.map(msg => ({
      // Inconsistent message processing
      timestamp: new Date(msg.timestamp),
      // ... more manual processing
    }))
  }));
}
```

### After (Centralized Processing)
```typescript
// ✅ All components use processed Conversation objects
function NewComponent() {
  const { data } = useDashboardData(); // Already processed
  return data.conversations.map(conversation => (
    <ConversationCard 
      key={conversation.thread.conversation_id}
      conversation={conversation} // Guaranteed to be properly processed
    />
  ));
}
```

## Best Practices

### 1. Always Use Processed Data
```typescript
// ✅ Good: Use processed Conversation objects
const conversations = processThreadsResponse(rawData);
conversations.forEach(conv => {
  // conv.thread and conv.messages are guaranteed to be properly formatted
  console.log(conv.thread.conversation_id);
  console.log(conv.messages[0]?.localDate); // Always a valid Date object
});

// ❌ Bad: Process data in components
const rawData = await fetch('/api/threads');
rawData.forEach(item => {
  // Manual processing leads to inconsistencies
  const date = new Date(item.timestamp); // May fail
});
```

### 2. Leverage Type Safety
```typescript
// ✅ Good: Use proper types
function Component({ conversations }: { conversations: Conversation[] }) {
  return conversations.map(conv => (
    <div key={conversation.thread.conversation_id}>
      {conversation.thread.lead_name}
    </div>
  ));
}

// ❌ Bad: Use any types
function Component({ data }: { data: any[] }) {
  return data.map(item => (
    <div key={item.id}>
      {item.name} // May not exist
    </div>
  ));
}
```

### 3. Handle Edge Cases Centrally
```typescript
// ✅ Good: Handle edge cases in processing function
export function processThreadsResponse(data: any[]): Conversation[] {
  if (!Array.isArray(data)) return [];
  
  return data
    .filter(item => item && typeof item === 'object')
    .map(item => {
      // Centralized error handling and validation
      if (!item.thread) return null;
      // ... processing logic
    })
    .filter((conv): conv is Conversation => conv !== null);
}
```

## File Structure

```
lib/
├── utils/
│   └── api.ts                    # Centralized processing functions
├── api/
│   └── client.ts                 # API client with centralized methods
hooks/
├── useDashboardData.ts           # Main dashboard data hook
├── useConversations.ts           # Conversations context hook
types/
├── conversation.ts               # Canonical Conversation types
├── dashboard.ts                  # Dashboard-specific types
components/
├── features/
│   └── dashboard/                # Components using processed data
```

## Testing

### Unit Tests for Processing
```typescript
// __tests__/lib/utils/api.test.ts
describe('processThreadsResponse', () => {
  it('should process raw data into Conversation objects', () => {
    const rawData = [/* test data */];
    const result = processThreadsResponse(rawData);
    
    expect(result).toBeInstanceOf(Array);
    expect(result[0]).toHaveProperty('thread');
    expect(result[0]).toHaveProperty('messages');
    expect(result[0].thread).toHaveProperty('conversation_id');
  });
});
```

### Integration Tests for Components
```typescript
// __tests__/components/features/dashboard/RecentConversations.test.tsx
describe('RecentConversations', () => {
  it('should render conversations using processed data', () => {
    const conversations = [/* processed Conversation objects */];
    render(<RecentConversations conversations={conversations} />);
    
    expect(screen.getByText(conversations[0].thread.lead_name)).toBeInTheDocument();
  });
});
```

## Conclusion

This centralized data flow pattern ensures that all dashboard components work with consistently processed data, reducing bugs, improving maintainability, and providing a better developer experience. All new components should follow this pattern and use the processed `Conversation` objects rather than implementing their own data processing logic. 