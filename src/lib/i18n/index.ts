import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { storage } from "@/lib/native/storage";

import { LANGUAGES, resources, type LanguageCode } from "./resources";

/** Deep lookup used so a raw key is never rendered, even pre-init. */
function lookupEnglish(key: string): string | undefined {
  const parts = key.split(".");
  let node: unknown = resources.en.translation;
  for (const part of parts) {
    if (typeof node !== "object" || node === null) return undefined;
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === "string" ? node : undefined;
}

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
  // Synchronous init (initImmediate: false) so the very first render already
  // has translations — otherwise components would flash raw keys.
  const initOptions = {
    resources,
    lng: storedLanguage() ?? deviceLanguage(),
    fallbackLng: "en",
    supportedLngs: SUPPORTED as string[],
    nonExplicitSupportedLngs: true,
    initImmediate: false,
    react: { useSuspense: false },
    parseMissingKeyHandler: (key: string) => lookupEnglish(key) ?? key.split(".").pop() ?? key,
    interpolation: { escapeValue: false },
    returnNull: false,
  };

  void i18n.use(initReactI18next).init(initOptions as Parameters<typeof i18n.init>[0]);

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