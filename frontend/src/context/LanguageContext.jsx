import { createContext, useContext, useEffect, useMemo, useState } from "react";
import en from "../translations/en";
import hi from "../translations/hi";

const STORAGE_KEY = "agroaid_language";

const dictionaries = {
  en,
  hi,
};

const LanguageContext = createContext(null);

function readByPath(source, path) {
  return path.split(".").reduce((cursor, key) => {
    if (cursor && Object.prototype.hasOwnProperty.call(cursor, key)) {
      return cursor[key];
    }
    return undefined;
  }, source);
}

function interpolate(value, params = {}) {
  if (typeof value !== "string") {
    return value;
  }

  return value.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (Object.prototype.hasOwnProperty.call(params, key)) {
      return String(params[key]);
    }
    return "";
  });
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState("en");
  const [hasSelectedLanguage, setHasSelectedLanguage] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && dictionaries[saved]) {
      setLanguageState(saved);
      setHasSelectedLanguage(true);
    }
    setIsReady(true);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (nextLanguage) => {
    if (!dictionaries[nextLanguage]) {
      return;
    }
    setLanguageState(nextLanguage);
    localStorage.setItem(STORAGE_KEY, nextLanguage);
    setHasSelectedLanguage(true);
  };

  const t = (key, params) => {
    const languagePack = dictionaries[language] || dictionaries.en;
    const translated = readByPath(languagePack, key);
    const fallback = readByPath(dictionaries.en, key);
    const resolved = translated ?? fallback ?? key;
    return interpolate(resolved, params);
  };

  const value = useMemo(() => ({
    language,
    setLanguage,
    t,
    isReady,
    hasSelectedLanguage,
  }), [language, isReady, hasSelectedLanguage]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
