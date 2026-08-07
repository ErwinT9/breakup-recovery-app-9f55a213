import type { Session } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

/**
 * Reads the locally persisted Supabase session.
 *
 * `supabase.auth.getUser()` hits the network, so it fails the moment the
 * device is offline — using it as a route guard logs people out in airplane
 * mode. `getSession()` resolves from local storage; it only touches the
 * network when the access token is expired, and a failed refresh while
 * offline must NEVER be treated as "signed out".
 */
export async function getCachedSession(): Promise<Session | null> {
  try {
    // getSession() silently attempts a token refresh; offline that call can
    // hang or resolve with `session: null` even though a valid session is
    // persisted. Bound it, and always fall back to the stored session.
    const result = await Promise.race([
      supabase.auth.getSession(),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000)),
    ]);
    return result?.data?.session ?? readPersistedSession();
  } catch {
    // Network/refresh failure — fall through to the raw persisted session.
    return readPersistedSession();
  }
}

/** Last-resort read straight out of storage (used when a refresh throws). */
function readPersistedSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      if (!key || !key.startsWith("sb-") || !key.endsWith("-auth-token")) continue;
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as Partial<Session> & { currentSession?: Session };
      const session = parsed.currentSession ?? parsed;
      if (session.access_token) return session as Session;
    }
  } catch {
    // Ignore malformed storage; treated as "no cached session".
  }
  return null;
}