import { useEffect, useState } from "react";

import {
  fallbackQuote,
  getHomeRotatingQuote,
  getQuoteOfTheDay,
  localDayKey,
  rotationSlot,
} from "@/lib/dailyQuote";

/**
 * One quote per calendar day, stored locally so it works fully offline.
 * Re-checks periodically so the quote swaps at midnight without a reload.
 */
export function useDailyQuote(): string {
  const [quote, setQuote] = useState(() => fallbackQuote());

  useEffect(() => {
    let day = localDayKey();
    setQuote(getQuoteOfTheDay());

    const check = () => {
      const today = localDayKey();
      if (today === day) return;
      day = today;
      setQuote(getQuoteOfTheDay());
    };

    const id = window.setInterval(check, 60_000);
    window.addEventListener("focus", check);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", check);
    };
  }, []);

  return quote;
}

/**
 * Home motivational quote that rotates every 2 hours, offline-first.
 * Re-checks periodically so it swaps without a reload.
 */
export function useRotatingHomeQuote(): string {
  const [quote, setQuote] = useState(() => fallbackQuote());

  useEffect(() => {
    let slot = rotationSlot();
    setQuote(getHomeRotatingQuote());

    const check = () => {
      const current = rotationSlot();
      if (current === slot) return;
      slot = current;
      setQuote(getHomeRotatingQuote());
    };

    const id = window.setInterval(check, 60_000);
    window.addEventListener("focus", check);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", check);
    };
  }, []);

  return quote;
}
