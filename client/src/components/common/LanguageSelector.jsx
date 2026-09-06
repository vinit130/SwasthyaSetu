import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * SwasthyaSetu Trilingual Selector (EN | हिन्दी | मराठी)
 * Accessible, compact, polished healthcare language switcher.
 */
export default function LanguageSelector({
  variant = 'pill', // 'pill' | 'dropdown' | 'compact'
  className = '',
}) {
  const { language, setLanguage, languages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Variant 1: Segmented Pill (Ideal for top navigation & hero)
  if (variant === 'pill') {
    return (
      <div
        className={`inline-flex items-center p-0.5 rounded-xl border border-slate-200/90 bg-white shadow-2xs ${className}`}
        role="group"
        aria-label="Language selector"
      >
        <div className="pl-2 pr-1.5 text-slate-400">
          <Globe className="w-3.5 h-3.5 text-teal-600" />
        </div>
        {languages.map((lang) => {
          const isActive = language === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => setLanguage(lang.code)}
              aria-pressed={isActive}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                isActive
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {lang.label}
            </button>
          );
        })}
      </div>
    );
  }

  // Variant 2: Compact Dropdown (Ideal for mobile headers & cramped bars)
  const currentLangObj = languages.find((l) => l.code === language) || languages[0];

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs transition-colors focus:ring-2 focus:ring-teal-500"
      >
        <Globe className="w-3.5 h-3.5 text-teal-600 shrink-0" />
        <span>{currentLangObj.label}</span>
        <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute right-0 mt-1.5 w-36 rounded-xl bg-white border border-slate-200/90 shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-100"
        >
          {languages.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <button
                key={lang.code}
                role="option"
                aria-selected={isSelected}
                type="button"
                onClick={() => {
                  setLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-left text-xs font-medium flex items-center justify-between transition-colors ${
                  isSelected
                    ? 'bg-teal-50 text-teal-900 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{lang.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-teal-600" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
