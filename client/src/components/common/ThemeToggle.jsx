import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle({ className = '', size = 'md' }) {
  const { theme, toggleTheme, isDark } = useTheme();

  const sizeClasses = {
    sm: 'p-1.5 text-xs',
    md: 'p-2 text-sm',
    lg: 'p-2.5 text-base',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`relative inline-flex items-center justify-center rounded-xl transition-all duration-200 border cursor-pointer ${
        isDark
          ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700 shadow-xs'
          : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200 shadow-2xs'
      } ${sizeClasses[size] || sizeClasses.md} ${className}`}
    >
      <div className="relative flex items-center justify-center">
        {isDark ? (
          <Sun className={`${iconSizes[size] || 'w-4 h-4'} transition-transform duration-300 rotate-0 hover:rotate-45`} />
        ) : (
          <Moon className={`${iconSizes[size] || 'w-4 h-4'} transition-transform duration-300 -rotate-12 hover:rotate-0`} />
        )}
      </div>
    </button>
  );
}
