import React, { useState, useEffect } from 'react';
import { loadingManager } from '../../utils/loadingManager';

const GlobalLoading: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = loadingManager.subscribe(setIsLoading);
    return unsubscribe;
  }, []);

  if (!isLoading) return null;

  return (
    <>
      {/* Full screen overlay */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9999]" />
      
      {/* Centered Loading Spinner */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[10000]">
        <div className="backdrop-blur-sm p-6">
          <div className="relative">
            {/* Outer ring */}
            <div className="w-16 h-16 border-4 border-orange/20 rounded-full animate-spin">
              <div className="absolute top-0 left-0 w-16 h-16 border-4 border-royal-blue rounded-full animate-pulse" 
                   style={{ clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)' }} />
            </div>
            
            {/* Inner dot */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-3 h-3 bg-royal-blue rounded-full animate-bounce" />
            </div>
          </div>
          
          {/* Loading text */}
          <div className="mt-4 text-center">
            <span className="text-md font-bold text-royal-blue">
              Loading
              <span className="inline-flex ml-1 text-orange">
                <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
              </span>
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default GlobalLoading;