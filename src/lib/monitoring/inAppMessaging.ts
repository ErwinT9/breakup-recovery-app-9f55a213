import { registerPlugin } from "@capacitor/core";

import { isNative } from "../native/platform";

type InAppMessagingPlugin = {
  triggerEvent(options: { eventId: string }): Promise<void>;
  setMessagesSuppressed(options: { suppressed: boolean }): Promise<void>;
  setAutomaticDataCollectionEnabled(options: { enabled: boolean }): Promise<void>;
  getInstallationId(): Promise<{ installationId: string }>;
};

// Registered directly (no package import) to match crashlytics.ts /
// performance.ts: only the native bridge is used and web stays a no-op.
const inAppMessaging = registerPlugin<InAppMessagingPlugin>("FirebaseInAppMessaging");

// A missing native plugin makes the Capacitor proxy throw SYNCHRONOUSLY. Left
// unguarded that throw reaches window.onerror and can loop the WebView into an
// ANR, so the sink latches off after the first failure.
let unavailable = false;
let started = false;

function call(fn: (p: InAppMessagingPlugin) => Promise<unknown>): void {
  if (!isNative() || unavailable) return;
  try {
    void Promise.resolve(fn(inAppMessaging)).catch(() => {
      unavailable = true;
    });
  } catch {
    unavailable = true;
  }
}

/**
 * Enables Firebase In-App Messaging. Campaign fetch and display are handled by
 * the native SDK; this just opts data collection in once per launch.
 */
export function initInAppMessaging(): void {
  if (started || !isNative()) return;
  started = true;
  call((p) => p.setAutomaticDataCollectionEnabled({ enabled: true }));
  call((p) => p.setMessagesSuppressed({ suppressed: false }));
}

/** Fires a programmatic campaign trigger (contextual triggers in the console). */
export function triggerInAppEvent(eventId: string): void {
  call((p) => p.triggerEvent({ eventId }));
}

/** Pauses/resumes messages so a campaign can't cover a full-screen flow. */
export function suppressInAppMessages(suppressed: boolean): void {
  call((p) => p.setMessagesSuppressed({ suppressed }));
}

/** Firebase installation ID, used to target a test campaign at this device. */
export async function getInstallationId(): Promise<string | null> {
  if (!isNative() || unavailable) return null;
  try {
    const { installationId } = await inAppMessaging.getInstallationId();
    return installationId;
  } catch {
    return null;
  }
}
