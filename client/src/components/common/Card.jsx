import React from 'react';

export default function Card({ children, className = '', hover = false, ...props }) {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 transition-all duration-200 ${
 hover ? 'hover:shadow-md hover:border-teal-300 hover:-translate-y-0.5' : ''
 } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
