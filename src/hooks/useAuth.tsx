import type { Session, User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { supabase } from "@/integrations/supabase/client";
import { deactivatePushToken, syncPushRegistration } from "@/lib/notifications/push";
import { isOnline } from "@/lib/offline/network";
import { identifyUser, logOutRevenueCat } from "@/lib/subscription/revenuecat";

type AuthValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  // Set only by an explicit sign-out so a failed token refresh while offline
  // can never drop the cached session.
  const signingOut = useRef(false);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!nextSession && !signingOut.current && !isOnline()) {
        // Offline refresh failure — keep the user signed in with cached data.
        setLoading(false);
        return;
      }
      setSession(nextSession);
      setLoading(false);
      if (nextSession?.user) {
        void identifyUser(nextSession.user.id);
        void syncPushRegistration(nextSession.user.id);
      }
    });

    void supabase.auth.getSession().then(({ data: current }) => {
      setSession(current.session);
      setLoading(false);
      if (current.session?.user) void syncPushRegistration(current.session.user.id);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      signOut: async () => {
        signingOut.current = true;
        await deactivatePushToken(session?.user?.id ?? null);
        await logOutRevenueCat();
        await supabase.auth.signOut();
        setSession(null);
      },
    }),
    [session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);