import { CloudOff, RefreshCw } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { haptic } from "@/lib/native/haptics";
import { refreshNetworkStatus } from "@/lib/offline/network";

/**
 * Shown instead of the sign-in form when the app starts with no connection and
 * no cached session — signing in genuinely requires the network.
 */
export function OfflineScreen() {
  const [checking, setChecking] = useState(false);

  const retry = async () => {
    haptic.light();
    setChecking(true);
    await refreshNetworkStatus();
    // Give the status listener a beat to re-render the screen away.
    window.setTimeout(() => setChecking(false), 400);
  };

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-background px-8 text-center">
      <span className="flex size-16 items-center justify-center rounded-3xl bg-muted text-muted-foreground">
        <CloudOff className="size-8" aria-hidden />
      </span>
      <div className="space-y-2">
        <h1 className="text-xl font-semibold text-foreground">You're offline</h1>
        <p className="text-balance text-sm text-muted-foreground">
          You're offline. Connect to the internet to sign in.
        </p>
      </div>
      <Button className="rounded-full px-8" disabled={checking} onClick={() => void retry()}>
        <RefreshCw className={`mr-2 size-4 ${checking ? "animate-spin" : ""}`} aria-hidden />
        Retry
      </Button>
    </main>
  );
}