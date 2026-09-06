import React from 'react';

/**
 * SwasthyaSetu Unified Healthcare Button System
 * Features refined hover lift, active press feedback, consistent radii, and spinner.
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  loading = false,
  icon: Icon,
  className = '',
  onClick,
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none rounded-xl select-none';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 min-h-[36px]',
    md: 'text-sm px-4 py-2.5 gap-2 min-h-[44px]',
    lg: 'text-base px-6 py-3 gap-2.5 min-h-[48px]',
  };

  const variantStyles = {
    primary:
      'bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white shadow-sm shadow-teal-700/20 hover:-translate-y-0.5 hover:shadow-md hover:shadow-teal-700/25 active:translate-y-0 active:scale-[0.98]',
    secondary:
      'bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 border border-slate-200/90 shadow-2xs hover:-translate-y-0.5 hover:shadow-xs active:translate-y-0 active:scale-[0.98]',
    outline:
      'border-1.5 border-teal-600 text-teal-700 bg-white hover:bg-teal-50 active:bg-teal-100/70 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]',
    danger:
      'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-sm shadow-red-700/20 hover:-translate-y-0.5 hover:shadow-md hover:shadow-red-700/25 active:translate-y-0 active:scale-[0.98]',
    success:
      'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-sm shadow-emerald-700/20 hover:-translate-y-0.5 hover:shadow-md hover:shadow-emerald-700/25 active:translate-y-0 active:scale-[0.98]',
    warning:
      'bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white shadow-sm shadow-amber-600/20 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.98]',
    ghost:
      'text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 active:scale-[0.98]',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : Icon ? (
        <Icon className="w-4 h-4 shrink-0" />
      ) : null}
      <span>{children}</span>
    </button>
  );
}
