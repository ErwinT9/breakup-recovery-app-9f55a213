import { quotes, type Quote } from "@/data/quotes";

export const DAILY_QUOTES: string[] = quotes.map((q: Quote) => q.text);

const STORAGE_KEY = "nc:daily-quote";

type QuoteState = {
  day: string;
  index: number;
  bag: number[];
};

/** Local calendar day key so rotation follows the device's midnight. */
export function localDayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function shuffledBag(total: number): number[] {
  const bag = Array.from({ length: total }, (_, i) => i);
  for (let i = bag.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j] as number, bag[i] as number];
  }
  return bag;
}

function read(): QuoteState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as QuoteState;
    if (typeof parsed?.day !== "string" || typeof parsed?.index !== "number") return null;
    return { day: parsed.day, index: parsed.index, bag: Array.isArray(parsed.bag) ? parsed.bag : [] };
  } catch {
    return null;
  }
}

function write(state: QuoteState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable — quote still renders for this session */
  }
}

/** Deterministic fallback used during SSR / before hydration. */
export function fallbackQuote(date = new Date()): string {
  const day = Math.floor(date.getTime() / 86_400_000);
  return DAILY_QUOTES[day % DAILY_QUOTES.length] as string;
}

/**
 * Returns today's quote, persisted locally. Quotes never repeat until the
 * whole library has been shown, then the bag is reshuffled.
 */
export function getQuoteOfTheDay(date = new Date()): string {
  const today = localDayKey(date);
  const existing = read();
  if (existing && existing.day === today && DAILY_QUOTES[existing.index]) {
    return DAILY_QUOTES[existing.index] as string;
  }

  let bag = existing?.bag ?? [];
  if (bag.length === 0) bag = shuffledBag(DAILY_QUOTES.length);
  const next = bag.shift();
  const index = typeof next === "number" && DAILY_QUOTES[next] ? next : 0;
  write({ day: today, index, bag });
  return DAILY_QUOTES[index] as string;
}

/**
 * A second quote for the same calendar day (used in the SOS toolkit) that is
 * always different from the Home screen quote. Deterministic + offline-safe.
 */
export function getSupportQuoteOfTheDay(date = new Date()): string {
  const primary = getQuoteOfTheDay(date);
  const total = DAILY_QUOTES.length;
  const dayNumber = Math.floor(date.getTime() / 86_400_000);
  let index = ((dayNumber * 37 + 11) % total + total) % total;
  for (let i = 0; i < total; i += 1) {
    const candidate = DAILY_QUOTES[index] as string;
    if (candidate !== primary) return candidate;
    index = (index + 1) % total;
  }
  return primary;
}

const ROTATING_KEY = "nc:rotating-quote";
/** How long a rotating quote stays put, in milliseconds (2 hours). */
export const ROTATION_MS = 2 * 60 * 60 * 1000;

type RotatingState = { slot: number; index: number };

function readRotating(): RotatingState | null {
  try {
    const raw = window.localStorage.getItem(ROTATING_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RotatingState;
    if (typeof parsed?.slot !== "number" || typeof parsed?.index !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Current 2-hour slot number since the epoch (local clock, offline-safe). */
export function rotationSlot(date = new Date()): number {
  return Math.floor(date.getTime() / ROTATION_MS);
}

/**
 * A quote that changes every 2 hours. Random within each slot, never the same
 * as the previous slot's quote, persisted locally so it stays stable while the
 * slot lasts. Works fully offline.
 */
export function getRotatingQuote(date = new Date()): string {
  const slot = rotationSlot(date);
  const total = DAILY_QUOTES.length;
  const existing = readRotating();
  if (existing && existing.slot === slot && DAILY_QUOTES[existing.index]) {
    return DAILY_QUOTES[existing.index] as string;
  }

  let index = Math.floor(Math.random() * total);
  if (existing && index === existing.index) index = (index + 1) % total;

  try {
    window.localStorage.setItem(ROTATING_KEY, JSON.stringify({ slot, index }));
  } catch {
    /* storage unavailable — quote still renders for this session */
  }
  return DAILY_QUOTES[index] as string;
}

/** A random quote, optionally guaranteed to differ from the current one. */
export function getRandomQuote(exclude?: string | null): string {
  const total = DAILY_QUOTES.length;
  let index = Math.floor(Math.random() * total);
  for (let i = 0; i < total; i += 1) {
    const candidate = DAILY_QUOTES[index] as string;
    if (candidate !== exclude) return candidate;
    index = (index + 1) % total;
  }
  return DAILY_QUOTES[0] as string;
}
