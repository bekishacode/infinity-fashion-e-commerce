import { useState, useCallback, useEffect, useRef } from 'react';
import { apiClient } from '../utils/apiClient';
import { ApiResponse } from '../types/api.types';

export function useApiWithLoading<T = any>(componentKey: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    apiClient.registerLoadingCallback(componentKey, setIsLoading);
    
    return () => {
      isMounted.current = false;
      apiClient.unregisterLoadingCallback(componentKey);
      apiClient.cancelRequest(componentKey);
    };
  }, [componentKey]);

  const execute = useCallback(async <R = T>(
    apiCall: () => Promise<ApiResponse<R>>
  ): Promise<ApiResponse<R> | null> => {
    if (!isMounted.current) return null;
    
    setError(null);
    
    try {
      const result = await apiCall();
      if (!result.success && isMounted.current) {
        setError(result.message);
      }
      return result;
    } catch (err: any) {
      if (isMounted.current && err.name !== 'AbortError') {
        setError(err.message || 'An error occurred');
      }
      return null;
    }
  }, []);

  return { isLoading, error, execute, setIsLoading };
}