import { Network } from "@capacitor/network";

import { isNative } from "../native/platform";

type Listener = (online: boolean) => void;

const listeners = new Set<Listener>();
let online = true;
let started = false;

function emit(next: boolean) {
  if (next === online) return;
  online = next;
  listeners.forEach((listener) => listener(next));
}

export function startNetworkWatcher(): void {
  if (started || typeof window === "undefined") return;
  started = true;

  if (isNative()) {
    void Network.getStatus().then((status) => emit(status.connected));
    void Network.addListener("networkStatusChange", (status) => emit(status.connected));
    return;
  }

  online = window.navigator.onLine;
  window.addEventListener("online", () => emit(true));
  window.addEventListener("offline", () => emit(false));
}

/**
 * Re-reads the real connectivity state (Capacitor Network on Android, the
 * browser flag on web). Used by "Retry" buttons so the user is never stuck on
 * a stale offline state after switching Wi-Fi/mobile data.
 */
export async function refreshNetworkStatus(): Promise<boolean> {
  if (typeof window === "undefined") return true;
  startNetworkWatcher();
  try {
    const next = isNative() ? (await Network.getStatus()).connected : window.navigator.onLine;
    emit(next);
    return next;
  } catch {
    return online;
  }
}

export function isOnline(): boolean {
  return online;
}

export function subscribeNetwork(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}