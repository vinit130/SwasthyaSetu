import React from 'react';

export default function SkeletonLoader({ count = 3, type = 'card', className = '' }) {
  if (type === 'table') {
    return (
      <div className={`w-full divide-y divide-slate-100 animate-pulse ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-200 rounded-full shrink-0"></div>
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 rounded w-36"></div>
                <div className="h-3 bg-slate-200 rounded w-24"></div>
              </div>
            </div>
            <div className="h-6 bg-slate-200 rounded w-20"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-3 animate-pulse ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white border border-slate-100 rounded-xl p-5 space-y-3">
          <div className="flex justify-between items-center">
            <div className="h-5 bg-slate-200 rounded w-1/3"></div>
            <div className="h-6 bg-slate-200 rounded-full w-20"></div>
          </div>
          <div className="h-3.5 bg-slate-200 rounded w-2/3"></div>
          <div className="h-3.5 bg-slate-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
}
