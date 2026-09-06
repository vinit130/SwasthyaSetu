import React, { createContext, useContext, useState, useEffect } from 'react';
import { en } from '../translations/en';
import { hi } from '../translations/hi';
import { mr } from '../translations/mr';

const LanguageContext = createContext();

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', shortLabel: 'EN' },
  { code: 'hi', label: 'हिन्दी', shortLabel: 'हिंदी' },
  { code: 'mr', label: 'मराठी', shortLabel: 'मराठी' },
];

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('swasthyasetu_lang');
    // If invalid or obsolete 'bn' is stored, default safely to 'en'
    if (saved === 'hi' || saved === 'mr' || saved === 'en') {
      return saved;
    }
    return 'en';
  });

  useEffect(() => {
    localStorage.setItem('swasthyasetu_lang', language);
  }, [language]);

  const dictionaries = { en, hi, mr };
  const currentDict = dictionaries[language] || en;

  // Translation helper function
  const t = (key, fallback = '') => {
    if (currentDict && currentDict[key]) {
      return currentDict[key];
    }
    // Fallback to English if key missing in chosen dialect
    if (en[key]) {
      return en[key];
    }
    return fallback || key;
  };

  const changeLanguage = (langCode) => {
    if (dictionaries[langCode]) {
      setLanguage(langCode);
    }
  };

  // Legacy cycle helper if needed
  const toggleLanguage = () => {
    setLanguage((prev) => {
      if (prev === 'en') return 'hi';
      if (prev === 'hi') return 'mr';
      return 'en';
    });
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage: changeLanguage,
        toggleLanguage,
        t,
        languages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
