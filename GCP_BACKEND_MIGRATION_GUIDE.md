# GCP Backend Migration Guide

## Overview

This document outlines the complete migration from AWS backend to GCP backend for the ACS frontend application. The migration involves updating API endpoints, authentication flow, database operations, and configuration settings.

## 🎯 Key Changes Summary

### 1. **API Gateway Configuration**
- **From**: AWS API Gateway
- **To**: GCP API Gateway
- **Environment Variable**: `NEXT_PUBLIC_GCP_API_GATEWAY_URL`

### 2. **Authentication Flow**
- **From**: AWS Cognito + Session Cookies
- **To**: GCP Identity Platform + JWT Tokens
- **Changes**: 
  - Remove session cookie handling
  - Add JWT token management
  - Update authorization headers

### 3. **Database Operations**
- **From**: AWS DynamoDB
- **To**: GCP Firestore
- **Parameter Changes**:
  - `table_name` → `collection_name`
  - `index_name` → (removed, not used in Firestore)
  - `attribute_name` → `key_name`
  - `attribute_value` → `key_value`

### 4. **Response Format**
- **From**: Direct data responses
- **To**: Standardized GCP format with `success`, `data`, `error` fields

## 📋 Detailed Migration Steps

### Step 1: Environment Configuration

#### Update Environment Variables
```bash
# Add to your .env.local file
NEXT_PUBLIC_GCP_API_GATEWAY_URL=https://your-gcp-api-gateway-url.com
```

#### Update Configuration File
```typescript
// lib/config/local-api-config.ts
export const config = {
  // ... existing config
  API_URL: process.env.NEXT_PUBLIC_GCP_API_GATEWAY_URL || process.env.NEXT_PUBLIC_API_URL || '/api',
};
```

### Step 2: API Client Updates

#### Authentication Token Management
```typescript
// lib/api/client.ts
export class ApiClient {
  private authToken: string | null = null;

  setAuthToken(token: string): void {
    this.authToken = token;
  }

  removeAuthToken(): void {
    this.authToken = null;
  }

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }
    return headers;
  }
}
```

#### Updated Request Method
```typescript
async request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  // ... existing retry logic
  
  const response = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      ...this.defaultHeaders,
      ...this.getAuthHeaders(), // Add JWT token
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    credentials: 'include',
    signal: AbortSignal.timeout(30000)
  });

  // Handle GCP response format
  const result: ApiResponse<T> = {
    success: data?.success ?? true,
    data: data?.data ?? data,
    status: response.status,
  };

  return result;
}
```

### Step 3: Database Operations Migration

#### Database Select
```typescript
// Before (AWS DynamoDB)
const params = {
  table_name: 'Users',
  index_name: 'email-index',
  key_name: 'email',
  key_value: 'user@example.com'
};

// After (GCP Firestore)
const gcpParams = {
  collection_name: 'Users',
  key_name: 'email',
  key_value: 'user@example.com',
  account_id: session.user.id,
  filters: {},
  limit: 100,
  order_by: 'created_at',
  order_direction: 'desc'
};
```

#### Database Update
```typescript
// Before (AWS DynamoDB)
const params = {
  table_name: 'Users',
  index_name: 'email-index',
  key_name: 'email',
  key_value: 'user@example.com',
  update_data: { status: 'active' }
};

// After (GCP Firestore)
const gcpParams = {
  collection_name: 'Users',
  key_name: 'email',
  key_value: 'user@example.com',
  update_data: { status: 'active' },
  account_id: session.user.id
};
```

#### Database Delete
```typescript
// Before (AWS DynamoDB)
const params = {
  table_name: 'Users',
  attribute_name: 'email',
  attribute_value: 'user@example.com',
  is_primary_key: false
};

// After (GCP Firestore)
const gcpParams = {
  collection_name: 'Users',
  key_name: 'email',
  key_value: 'user@example.com',
  account_id: session.user.id
};
```

### Step 4: Authentication Flow Updates

#### Login Route
```typescript
// app/api/auth/login/route.ts
export async function POST(request: Request) {
  const body = await request.json();
  const {email, password, name, provider} = body;

  // Call GCP API Gateway
  const response = await fetch(`${config.API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, provider, name }),
  });

  const data = await response.json();

  if (!response.ok) {
    return NextResponse.json({ 
      error: data.error?.message || 'Login failed.',
      details: data.error?.details
    }, { status: response.status });
  }

  // Return JWT token in response
  return NextResponse.json({
    success: true,
    message: 'Login successful!',
    user: {
      id: data.data?.user?.id,
      email: email,
      name: data.data?.user?.name || name,
      authType: 'existing',
      provider: provider || 'form',
      rate_limit_per_minute: data.data?.user?.rate_limit_per_minute || 60
    },
    session: data.data?.session, // Contains JWT token
  }, { status: 200 });
}
```

#### Database Routes Authentication
```typescript
// All database routes now use JWT tokens
const session = await getServerSession(authOptions) as Session & { 
  user: { id: string; accessToken?: string };
  sessionId?: string;
};

// Use JWT token in Authorization header
const response = await fetch(`${config.API_URL}/db/select`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.user.accessToken || session.sessionId}`
  },
  body: JSON.stringify(gcpParams),
});
```

### Step 5: Type Definitions Updates

#### Updated API Types
```typescript
// lib/types/api.ts

// Updated response format
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  status: number;
  headers?: Headers;
  timestamp?: string;
  request_id?: string;
}

// GCP-specific database parameters
export interface GcpDbSelectParams {
  collection_name: string;
  key_name?: string;
  key_value?: any;
  account_id: string;
  filters?: Record<string, any>;
  limit?: number;
  order_by?: string;
  order_direction?: 'asc' | 'desc';
  include_ai_insights?: boolean;
}

// GCP Authentication response
export interface GcpAuthResponse {
  success: boolean;
  data?: {
    user: {
      id: string;
      email: string;
      name: string;
      rate_limit_per_minute: number;
    };
    session: {
      id: string;
      token: string;
      expires_at: string;
    };
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
  request_id: string;
}
```

## 🔧 API Endpoint Mapping

### Authentication Endpoints
| AWS Endpoint | GCP Endpoint | Changes |
|--------------|--------------|---------|
| `/users/auth/login` | `/auth/login` | JWT token response |
| `/users/auth/signup` | `/auth/signup` | JWT token response |
| `/auth/logout` | `/auth/logout` | Token invalidation |

### Database Endpoints
| AWS Endpoint | GCP Endpoint | Changes |
|--------------|--------------|---------|
| `/db/select` | `/db/select` | Firestore parameters |
| `/db/update` | `/db/update` | Firestore parameters |
| `/db/delete` | `/db/delete` | Firestore parameters |

### Email Endpoints
| AWS Endpoint | GCP Endpoint | Changes |
|--------------|--------------|---------|
| `/email/send` | `/email/send` | SendGrid integration |
| `/email/process` | `/email/process` | Email processing |
| `/email/receive` | `/email/receive` | Email receiving |

## 🚨 Breaking Changes

### 1. **Session Management**
- **Before**: Session cookies automatically handled by browser
- **After**: JWT tokens must be manually managed in frontend
- **Impact**: All authenticated requests need Authorization header

### 2. **Database Parameters**
- **Before**: `table_name`, `index_name`, `attribute_name`
- **After**: `collection_name`, `key_name` (no index_name)
- **Impact**: All database operations need parameter updates

### 3. **Response Format**
- **Before**: Direct data responses
- **After**: Wrapped in `{ success, data, error }` format
- **Impact**: All response handling needs updates

### 4. **Error Handling**
- **Before**: Simple error messages
- **After**: Structured error objects with codes and details
- **Impact**: Error handling logic needs updates

## 🔄 Migration Checklist

### Configuration
- [ ] Update environment variables
- [ ] Update API configuration
- [ ] Test API Gateway connectivity

### Authentication
- [ ] Update login route
- [ ] Update signup route
- [ ] Update logout route
- [ ] Test JWT token flow
- [ ] Update session management

### Database Operations
- [ ] Update db/select route
- [ ] Update db/update route
- [ ] Update db/delete route
- [ ] Test all database operations
- [ ] Update parameter mapping

### API Client
- [ ] Update ApiClient class
- [ ] Add JWT token management
- [ ] Update request/response handling
- [ ] Test all API calls

### Type Definitions
- [ ] Update API types
- [ ] Add GCP-specific types
- [ ] Update response interfaces
- [ ] Test type safety

### Testing
- [ ] Test authentication flow
- [ ] Test database operations
- [ ] Test error handling
- [ ] Test rate limiting
- [ ] Performance testing

## 🛠️ Troubleshooting

### Common Issues

#### 1. **Authentication Failures**
```typescript
// Check JWT token format
console.log('Token:', session.user.accessToken);

// Verify Authorization header
headers: {
  'Authorization': `Bearer ${token}`
}
```

#### 2. **Database Parameter Errors**
```typescript
// Ensure correct parameter mapping
const gcpParams = {
  collection_name: table_name, // Not table_name
  key_name: key_name,          // Not attribute_name
  key_value: key_value,        // Not attribute_value
  account_id: session.user.id
};
```

#### 3. **Response Format Issues**
```typescript
// Handle GCP response format
if (!data.success) {
  throw new Error(data.error || 'API call failed');
}

const result = data.data; // Access actual data
```

#### 4. **CORS Issues**
```typescript
// Ensure CORS headers are set
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
}
```

## 📊 Performance Considerations

### 1. **JWT Token Management**
- Store tokens securely (localStorage/sessionStorage)
- Implement token refresh logic
- Handle token expiration gracefully

### 2. **Rate Limiting**
- GCP provides per-user rate limiting
- Monitor rate limit headers
- Implement retry logic with exponential backoff

### 3. **Caching**
- Implement response caching for GET requests
- Cache user data and preferences
- Clear cache on logout

## 🔒 Security Considerations

### 1. **JWT Token Security**
- Store tokens securely
- Implement token rotation
- Handle token expiration

### 2. **API Security**
- Use HTTPS for all API calls
- Validate all inputs
- Implement proper error handling

### 3. **Data Protection**
- Encrypt sensitive data
- Implement proper access controls
- Audit all API calls

## 📈 Monitoring and Logging

### 1. **API Monitoring**
- Monitor response times
- Track error rates
- Monitor rate limiting

### 2. **User Experience**
- Track authentication success/failure
- Monitor database operation performance
- Track user session duration

### 3. **Error Tracking**
- Log all API errors
- Track error patterns
- Monitor system health

## 🎯 Success Metrics

### 1. **Performance**
- API response time < 500ms
- Authentication success rate > 99%
- Database operation success rate > 99.9%

### 2. **Reliability**
- Zero downtime during migration
- No data loss
- Successful rollback capability

### 3. **User Experience**
- Seamless authentication flow
- Fast database operations
- Clear error messages

## 📞 Support

For issues during migration:
1. Check the troubleshooting section
2. Review GCP API Gateway logs
3. Verify environment configuration
4. Test with Postman/curl
5. Contact the backend team

---

**Last Updated**: January 2024  
**Version**: 1.0  
**Status**: ✅ **READY FOR IMPLEMENTATION** 