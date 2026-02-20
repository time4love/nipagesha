import i18n from "i18next";

export { i18n };
import { initReactI18next } from "react-i18next";
import type { Resource } from "i18next";

import en from "@/assets/locale/messages_en.json";
import he from "@/assets/locale/messages_he.json";
import lt from "@/assets/locale/messages_lt.json";
import uk from "@/assets/locale/messages_uk.json";

export const defaultNS = "translation";
export const supportedLngs = ["en", "he", "lt", "uk"] as const;
export type SupportedLocale = (typeof supportedLngs)[number];

const resources: Resource = {
  en: { [defaultNS]: en },
  he: { [defaultNS]: he },
  lt: { [defaultNS]: lt },
  uk: { [defaultNS]: uk },
};

export function initI18n(lng: string = "he") {
  if (i18n.isInitialized) return i18n;

  i18n.use(initReactI18next).init({
    resources,
    lng: supportedLngs.includes(lng as SupportedLocale) ? lng : "he",
    fallbackLng: "he",
    defaultNS,
    interpolation: {
      escapeValue: false,
    },
  });

  return i18n;
}

// Initialize so useTranslation works in client components (server gets same instance for consistency)
initI18n();
