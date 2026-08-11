import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { translations, type Language } from './translations'

const STORAGE_KEY = 'kisufit:language'

function getStoredLanguage(): Language {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'en' ? 'en' : 'tr'
}

type Vars = Record<string, string | number>

function resolve(dict: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((node, key) => {
    if (node && typeof node === 'object' && key in node) {
      return (node as Record<string, unknown>)[key]
    }
    return undefined
  }, dict)
}

function interpolate(text: string, vars?: Vars): string {
  if (!vars) return text
  return text.replace(/\{(\w+)\}/g, (match, key) => (key in vars ? String(vars[key]) : match))
}

interface LanguageContextValue {
  language: Language
  locale: string
  setLanguage: (lang: Language) => void
  t: (key: string, vars?: Vars) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getStoredLanguage)

  const value = useMemo<LanguageContextValue>(() => {
    function t(key: string, vars?: Vars): string {
      const entry = resolve(translations, key) as Partial<Record<Language, string>> | undefined
      const text = entry?.[language]
      if (text === undefined) return key
      return interpolate(text, vars)
    }

    return {
      language,
      locale: language === 'en' ? 'en-US' : 'tr-TR',
      setLanguage: (lang: Language) => {
        localStorage.setItem(STORAGE_KEY, lang)
        setLanguageState(lang)
      },
      t,
    }
  }, [language])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider')
  return ctx
}

export function translateMuscleGroup(group: string, language: Language): string {
  const entry = (translations.muscleGroups as Record<string, Partial<Record<Language, string>>>)[group]
  return entry?.[language] ?? group
}
