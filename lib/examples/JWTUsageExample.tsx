'use client';

import { useEffect, useState } from 'react';
import { useApiAuth } from '@/lib/hooks/useApiAuth';
import { useSession } from 'next-auth/react';

/**
 * Example component demonstrating JWT-only authentication usage
 */
export function JWTUsageExample() {
  const { apiClient, isAuthenticated, isLoading } = useApiAuth();
  const { data: session } = useSession();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Example: Fetch data using the authenticated API client
  const fetchData = async () => {
    if (!isAuthenticated) {
      setError('User not authenticated');
      return;
    }

    try {
      // The API client automatically includes the JWT token
      const response = await apiClient.getThreads();
      
      if (response.success) {
        setData(response.data);
        setError(null);
      } else {
        setError(response.error || 'Failed to fetch data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      fetchData();
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return <div>Loading authentication...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please log in to access this content</div>;
  }

  return (
    <div>
      <h2>JWT Authentication Example</h2>
      
      <div>
        <h3>Session Info:</h3>
        <p>User ID: {(session?.user as any)?.id}</p>
        <p>Email: {session?.user?.email}</p>
        <p>Has Backend Token: {(session as any)?.backendToken ? 'Yes' : 'No'}</p>
      </div>

      <div>
        <h3>API Data:</h3>
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        {data && (
          <pre>{JSON.stringify(data, null, 2)}</pre>
        )}
      </div>

      <button onClick={fetchData}>Refresh Data</button>
    </div>
  );
}

/**
 * Example of how to use the API client in any component
 */
export function ExampleUsage() {
  const { apiClient, isAuthenticated } = useApiAuth();

  const handleDatabaseOperation = async () => {
    if (!isAuthenticated) return;

    // Example database operation
    const response = await apiClient.dbSelect({
      table_name: 'Users',
      index_name: 'id-index',
      key_name: 'id',
      key_value: 'user-id'
    });

    if (response.success) {
      console.log('Data:', response.data);
    } else {
      console.error('Error:', response.error);
    }
  };

  const handleLCPOperation = async () => {
    if (!isAuthenticated) return;

    // Example LCP operation
    const response = await apiClient.getThreads({
      status: ['active']
    });

    if (response.success) {
      console.log('Threads:', response.data);
    } else {
      console.error('Error:', response.error);
    }
  };

  return (
    <div>
      <h3>API Operations</h3>
      <button onClick={handleDatabaseOperation}>Database Operation</button>
      <button onClick={handleLCPOperation}>LCP Operation</button>
    </div>
  );
} 