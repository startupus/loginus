import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Language = 'ru' | 'en';

interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'ru',
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'loginus-language',
    }
  )
);

