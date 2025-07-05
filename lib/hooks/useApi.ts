import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api/client';
import type { ApiResponse, RequestOptions } from '@/types/api';

interface UseApiOptions extends RequestOptions {
  enabled?: boolean;
  refetchInterval?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  mutate: (data: T) => void;
}

export function useApi<T>(
  endpoint: string | null,
  options: UseApiOptions = {}
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stringifiedOptions = JSON.stringify(options);

  const fetchData = useCallback(async () => {
    if (!endpoint) return;
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.request<T>(endpoint, options);
      
      if (response.success && response.data) {
        setData(response.data);
        options.onSuccess?.(response.data);
      } else {
        setError(response.error || 'An error occurred');
        options.onError?.(response.error || 'An error occurred');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      options.onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [endpoint, stringifiedOptions]);

  useEffect(() => {
    if (options.enabled !== false && endpoint) {
      fetchData();
    }
  }, [fetchData, options.enabled, endpoint]);

  useEffect(() => {
    if (options.enabled !== false && options.refetchInterval && endpoint) {
      const interval = setInterval(fetchData, options.refetchInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, options.enabled, options.refetchInterval, endpoint]);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  const mutate = useCallback((newData: T) => {
    setData(newData);
  }, []);

  return {
    data,
    loading,
    error,
    refetch,
    mutate,
  };
} 