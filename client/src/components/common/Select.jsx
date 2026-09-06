import React from 'react';

export default function Select({
  label,
  id,
  value,
  onChange,
  options = [],
  error = '',
  required = false,
  disabled = false,
  className = '',
  ...props
}) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center justify-between">
          <span>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </span>
        </label>
      )}

      <select
        id={selectId}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`w-full rounded-xl border text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 transition-colors text-base md:text-sm py-2.5 px-3.5 ${
          error
            ? 'border-red-400 dark:border-red-500 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-950/50'
            : 'border-slate-300 dark:border-slate-700 focus:border-teal-600 dark:focus:border-teal-500 focus:ring-teal-100 dark:focus:ring-teal-950/50'
        } ${disabled ? 'bg-slate-100 dark:bg-slate-800/50 cursor-not-allowed text-slate-500' : ''} min-h-[44px]`}
        {...props}
      >
        {options.map((opt) => {
          const val = typeof opt === 'object' ? opt.value : opt;
          const lbl = typeof opt === 'object' ? opt.label : opt;
          return (
            <option key={val} value={val}>
              {lbl}
            </option>
          );
        })}
      </select>

      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1 mt-0.5">
          <span>•</span> {error}
        </p>
      )}
    </div>
  );
}
