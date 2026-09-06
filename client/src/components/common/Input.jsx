import React from 'react';

export default function Input({
  label,
  id,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  error = '',
  helperText = '',
  required = false,
  icon: Icon,
  disabled = false,
  className = '',
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center justify-between">
          <span>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </span>
        </label>
      )}

      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`w-full rounded-xl border text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-colors text-base md:text-sm py-2.5 ${
            Icon ? 'pl-11 pr-3.5' : 'px-3.5'
          } ${
            error
              ? 'border-red-400 dark:border-red-500 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-950/50'
              : 'border-slate-300 dark:border-slate-700 focus:border-teal-600 dark:focus:border-teal-500 focus:ring-teal-100 dark:focus:ring-teal-950/50'
          } ${disabled ? 'bg-slate-100 dark:bg-slate-800/50 cursor-not-allowed text-slate-500' : 'bg-white dark:bg-slate-800'} min-h-[44px]`}
          {...props}
        />
      </div>

      {error ? (
        <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1 mt-0.5">
          <span>•</span> {error}
        </p>
      ) : helperText ? (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{helperText}</p>
      ) : null}
    </div>
  );
}
