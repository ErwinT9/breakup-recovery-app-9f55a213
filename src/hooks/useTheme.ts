import { useEffect, useState } from "react";
import {
  applyTheme,
  readThemeMode,
  resolveTheme,
  setThemeMode,
  subscribeTheme,
  type ResolvedTheme,
  type ThemeMode,
} from "@/lib/theme";

/** Reactive access to the theme preference and the resolved light/dark value. */
export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>("system");
  const [resolved, setResolved] = useState<ResolvedTheme>("light");

  useEffect(() => {
    const current = readThemeMode();
    setMode(current);
    setResolved(applyTheme(current));
    const unsubscribe = subscribeTheme((next) => {
      setMode(next);
      setResolved(resolveTheme(next));
    });
    const query = window.matchMedia?.("(prefers-color-scheme: dark)");
    const onChange = () => setResolved(resolveTheme(readThemeMode()));
    query?.addEventListener("change", onChange);
    return () => {
      unsubscribe();
      query?.removeEventListener("change", onChange);
    };
  }, []);

  return {
    mode,
    resolved,
    setMode: setThemeMode,
    toggle: () => setThemeMode(resolved === "dark" ? "light" : "dark"),
  };
}