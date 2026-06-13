import React, { createContext, useContext, useState, useCallback } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  loadingCount: number;
  startLoading: (key?: string) => void;
  stopLoading: (key?: string) => void;
  globalLoading: boolean;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider');
  }
  return context;
};

interface LoadingProviderProps {
  children: React.ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [loadingCount, setLoadingCount] = useState(0);
  const [loadingKeys, setLoadingKeys] = useState<Set<string>>(new Set());

  const startLoading = useCallback((key?: string) => {
    if (key) {
      setLoadingKeys(prev => new Set(prev).add(key));
    } else {
      setLoadingCount(prev => prev + 1);
    }
  }, []);

  const stopLoading = useCallback((key?: string) => {
    if (key) {
      setLoadingKeys(prev => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    } else {
      setLoadingCount(prev => Math.max(0, prev - 1));
    }
  }, []);

  const isLoading = loadingCount > 0 || loadingKeys.size > 0;
  const globalLoading = loadingCount > 0;

  return (
    <LoadingContext.Provider value={{ isLoading, loadingCount, startLoading, stopLoading, globalLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};