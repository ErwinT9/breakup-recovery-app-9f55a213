import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { storage } from "@/lib/native/storage";

import { LANGUAGES, resources, type LanguageCode } from "./resources";

export { LANGUAGES } from "./resources";
export type { LanguageCode } from "./resources";

export const LANGUAGE_KEY = "nc:language";

const SUPPORTED = LANGUAGES.map((entry) => entry.code) as readonly string[];

function normalize(tag: string | null | undefined): LanguageCode | null {
  if (!tag) return null;
  const base = tag.toLowerCase().split(/[-_]/)[0] ?? "";
  return (SUPPORTED.includes(base) ? base : null) as LanguageCode | null;
}

/** Device/system language, falling back to English when unsupported. */
function deviceLanguage(): LanguageCode {
  if (typeof navigator === "undefined") return "en";
  const candidates = [...(navigator.languages ?? []), navigator.language];
  for (const tag of candidates) {
    const match = normalize(tag);
    if (match) return match;
  }
  return "en";
}

/** Stored preference read synchronously so the first paint is already correct. */
function storedLanguage(): LanguageCode | null {
  if (typeof window === "undefined") return null;
  try {
    return normalize(window.localStorage.getItem(LANGUAGE_KEY)?.replace(/"/g, ""));
  } catch {
    return null;
  }
}

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources,
    lng: storedLanguage() ?? deviceLanguage(),
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    returnNull: false,
  });

  // Native builds keep the preference in Capacitor Preferences, which is async.
  void storage.get<string | null>(LANGUAGE_KEY, null).then((value) => {
    const match = normalize(value);
    if (match && match !== i18n.language) void i18n.changeLanguage(match);
  });
}

/** Switches language instantly and persists it for the next app start. */
export async function setLanguage(code: LanguageCode): Promise<void> {
  await i18n.changeLanguage(code);
  try {
    window.localStorage.setItem(LANGUAGE_KEY, code);
  } catch {
    /* private mode */
  }
  await storage.set(LANGUAGE_KEY, code);
}

export function currentLanguage(): LanguageCode {
  return (normalize(i18n.language) ?? "en") as LanguageCode;
}

export default i18n;