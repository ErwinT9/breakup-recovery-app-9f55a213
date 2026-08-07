# Add Firebase In-App Messaging (Android)

Goal: campaigns created in the Firebase console display inside the Android app, without disturbing Auth, FCM, Crashlytics, Performance or Analytics.

## Background

Firebase In-App Messaging has no official Capacitor plugin (the `@capacitor-firebase/*` family does not ship one). The display SDK works fully on its own once added: it auto-initializes from `google-services.json`, fetches campaigns, and renders the message over the Activity — including over a Capacitor WebView. So the native dependency does the heavy lifting, and a very small custom plugin exposes the few controls the app needs from JavaScript.

## Native side (Android)

`android/app/build.gradle` — add to the existing Firebase BoM block (BoM already pins versions, no version numbers needed):
- `com.google.firebase:firebase-inappmessaging-display`

In-App Messaging depends on Analytics (already present) and FCM (already present) for campaign delivery and triggers, so nothing else changes. No new Gradle plugin, no manifest permission.

New Capacitor plugin `FirebaseInAppMessaging` under `android/app/src/main/java/app/lovable/nocontacttracker/`:
- `triggerEvent(eventId)` — fire a programmatic campaign trigger
- `setMessagesSuppressed(suppressed)` — pause messages during onboarding/questionnaire or full-screen flows
- `setAutomaticDataCollectionEnabled(enabled)` — respect a future user opt-out
- registered in `MainActivity.java` via `registerPlugin(FirebaseInAppMessagingPlugin.class)`

## Web/TS side

New `src/lib/monitoring/inAppMessaging.ts`, following the exact pattern already used by `crashlytics.ts` / `performance.ts`:
- `registerPlugin<...>("FirebaseInAppMessaging")` rather than a package import
- `isNative()` guard so web builds are a no-op
- a latched `unavailable` flag plus try/catch, so a missing native plugin can never throw synchronously into `window.onerror` (this is what previously caused the WebView ANR)
- exported helpers: `initInAppMessaging()`, `triggerInAppEvent(id)`, `suppressInAppMessages(bool)`

`src/routes/__root.tsx` — call `initInAppMessaging()` alongside the existing `initPerformance()` / `initCrashlytics()` startup calls.

Optional light wiring (kept minimal): suppress messages while the questionnaire/onboarding flow is open and re-enable afterwards, so a campaign can't cover the Start button.

## Verification

- Typecheck and web build stay green (all calls no-op on web).
- After `bun run sync:android` and an APK rebuild, an In-App Messaging test campaign targeted at the installation's FID displays on app open.
- Existing Google sign-in, push notifications, Crashlytics reports and Performance traces are unaffected — no shared files change beyond the additive Gradle line and the startup call.

## Note

Testing a campaign requires the app's Firebase installation ID; that is available from the FCM/installations SDK. If you want, the plugin can also expose `getInstallationId()` so the ID can be read from a debug screen instead of logcat.
