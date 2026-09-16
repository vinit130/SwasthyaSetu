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
        <label htmlFor={selectId} className="text-sm font-medium text-slate-700 flex items-center justify-between">
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
        className={`w-full rounded-xl border text-slate-800 bg-white transition-colors text-base md:text-sm py-2.5 px-3.5 ${
 error
 ? 'border-red-400 focus:border-red-500 focus:ring-red-200 '
 : 'border-slate-300 focus:border-teal-600 focus:ring-teal-100 '
 } ${disabled ? 'bg-slate-100 cursor-not-allowed text-slate-500' : ''} min-h-[44px]`}
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
