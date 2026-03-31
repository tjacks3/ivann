"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import en from "./locales/en.json";

type Translations = Record<string, string>;
type TranslationParams = Record<string, string | number>;

const STORAGE_KEY = "ivann-locale";
const RTL_LOCALES = ["ar"];

export const SUPPORTED_LOCALES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "pt", label: "Português" },
  { code: "it", label: "Italiano" },
  { code: "nl", label: "Nederlands" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
  { code: "zh-CN", label: "中文(简体)" },
  { code: "ar", label: "العربية" },
  { code: "hi", label: "हिन्दी" },
] as const;

export type LocaleCode = (typeof SUPPORTED_LOCALES)[number]["code"];

interface LanguageContextValue {
  locale: LocaleCode;
  setLocale: (code: LocaleCode) => void;
  t: (key: string, params?: TranslationParams) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const fallback: Translations = en;

async function loadTranslations(locale: LocaleCode): Promise<Translations> {
  if (locale === "en") return en;
  try {
    const mod = await import(`./locales/${locale}.json`);
    return mod.default as Translations;
  } catch {
    return en;
  }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>("en");
  const [translations, setTranslations] = useState<Translations>(fallback);

  // Read stored locale on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as LocaleCode | null;
    if (stored && SUPPORTED_LOCALES.some((l) => l.code === stored)) {
      setLocaleState(stored);
      loadTranslations(stored).then(setTranslations);
    }
  }, []);

  // Update HTML attributes when locale changes
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = RTL_LOCALES.includes(locale) ? "rtl" : "ltr";
  }, [locale]);

  const setLocale = useCallback((code: LocaleCode) => {
    setLocaleState(code);
    localStorage.setItem(STORAGE_KEY, code);
    loadTranslations(code).then(setTranslations);
  }, []);

  const t = useCallback(
    (key: string, params?: TranslationParams): string => {
      let value = translations[key] ?? fallback[key] ?? key;
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          value = value.replace(`{${k}}`, String(v));
        }
      }
      return value;
    },
    [translations],
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
}
