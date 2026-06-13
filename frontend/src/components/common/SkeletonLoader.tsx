import React from 'react';

interface SkeletonLoaderProps {
  type?: 'table' | 'card' | 'form';
  rows?: number;
  columns?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  type = 'table', 
  rows = 5, 
  columns = 4 
}) => {
  if (type === 'table') {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden animate-pulse mt-56">
        {/* Table Header */}
        <div className="bg-gray-100 px-6 py-3 border-b">
          <div className="flex gap-4">
            {Array.from({ length: columns }).map((_, idx) => (
              <div key={idx} className="h-4 bg-gray-300 rounded flex-1" />
            ))}
          </div>
        </div>
        
        {/* Table Rows */}
        <div className="divide-y divide-gray-200">
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <div key={rowIdx} className="px-6 py-4">
              <div className="flex gap-4">
                {Array.from({ length: columns }).map((_, colIdx) => (
                  <div key={colIdx} className="h-4 bg-gray-200 rounded flex-1" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-36">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="w-12 h-12 bg-gray-200 rounded-full mb-4 mx-auto" />
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 mx-auto" />
            <div className="h-3 bg-gray-200 rounded w-full mx-auto" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'form') {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse max-w-4xl mx-auto">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-6" />
        <div className="space-y-4">
          {Array.from({ length: rows }).map((_, idx) => (
            <div key={idx}>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
              <div className="h-10 bg-gray-200 rounded w-full" />
            </div>
          ))}
          <div className="h-10 bg-gray-200 rounded w-32 mt-4" />
        </div>
      </div>
    );
  }

  return null;
};

export default SkeletonLoader;