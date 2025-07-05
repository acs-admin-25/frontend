import { useCallback } from 'react';
import { apiClient } from '@/lib/api/client';
import type { DbSelectParams, DbUpdateParams, DbDeleteParams } from '@/types/api';

export function useDbOperations() {
  const select = useCallback(async (params: DbSelectParams) => {
    return apiClient.dbSelect(params);
  }, []);

  const update = useCallback(async (params: DbUpdateParams) => {
    return apiClient.dbUpdate(params);
  }, []);

  const remove = useCallback(async (params: DbDeleteParams) => {
    return apiClient.dbDelete(params);
  }, []);

  return {
    select,
    update,
    delete: remove,
  };
} 