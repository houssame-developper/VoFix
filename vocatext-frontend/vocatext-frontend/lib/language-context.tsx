"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { translations, SupportedLanguage } from "./translations";

type LanguageContextType = {
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;
  t: (key: keyof typeof translations.en) => string | string[];
};

const defaultLanguage: SupportedLanguage = "en";

const LanguageContext = createContext<LanguageContextType>({
  language: defaultLanguage,
  setLanguage: () => {},
  t: (key) => key as string,
});

export const LanguageProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const [language, setLanguage] = useState<SupportedLanguage>(defaultLanguage);

  const t = (key: keyof typeof translations.en): string | string[] => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => useContext(LanguageContext);
