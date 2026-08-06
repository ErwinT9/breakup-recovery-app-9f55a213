# Firebase Crashlytics + Performance Monitoring (Android)

Add crash reporting and performance monitoring to the Android app without touching auth, database, or existing feature logic. Everything routes through the app's existing `analytics` helper, so screen code barely changes.

## Native setup (Gradle, `android/`)

- Add the Crashlytics and Performance Gradle plugins to the classpath in `android/build.gradle`, and apply them in `android/app/build.gradle`. The Google Services plugin is already applied conditionally when `google-services.json` exists — reuse it, no duplication.
- Add the Firebase Android BoM plus Crashlytics, Crashlytics NDK, Analytics, and Performance dependencies in `android/app/build.gradle`.
- Enable Crashlytics mapping-file upload for release builds only, so local debug builds stay fast.
- ProGuard rules already keep Firebase classes and source/line attributes — no change needed.
- `google-services.json` is present at `android/app/` and its package matches `app.lovable.nocontacttracker` — verified, no change needed.

## JS bridge

Install `@capacitor-firebase/crashlytics`, `@capacitor-firebase/performance`, and `@capacitor-firebase/analytics` (Capawesome, Capacitor 8 compatible). `cap sync` registers the native plugins automatically.

## New module `src/lib/monitoring/crashlytics.ts`

- `initMonitoring()` — enables collection on native only, no-ops on web and during SSR.
- `setCrashUser(userId)` / `clearCrashUser()` — anonymous Supabase user id only, no email or name.
- `setScreen(route, feature)` — custom keys for current screen and feature (Home, Flags, Wins, Badges, SOS, Unsent Letter, Profile, Settings).
- `logBreadcrumb(name, props)` — Crashlytics log line.
- `recordNonFatal(error, context)` — non-fatal exception with context.
- Static custom keys set once at startup: app version, build number, Android version, device model, platform.
- Network status key kept live from the existing network watcher.

## Wiring (small, additive edits)

- `src/lib/analytics.ts` — existing `track` / `screen` / `error` calls forward into the new module. Every already-instrumented event becomes a breadcrumb for free; add `analytics.track` calls where a required event is missing (login, logout, onboarding completed, notification received/opened, sync started/completed/failed, offline mode, profile updated).
- `src/routes/__root.tsx` — call `initMonitoring()` once, subscribe router navigation to `setScreen`, and forward global `error` / `unhandledrejection` handlers to `recordNonFatal` so WebView JavaScript exceptions land in Crashlytics as non-fatals.
- `src/hooks/useAuth.tsx` — set and clear the Crashlytics user id on sign-in and sign-out. No other auth behaviour changes.

## Performance Monitoring

- Automatic traces come free from the SDK: app start, foreground/background, activity rendering, slow and frozen frames, and native HTTP requests.
- WebView `fetch`/XHR calls are not auto-instrumented on Android, so a light wrapper records a custom HTTP metric per Supabase/API call (host + path, method, status, duration), sampled to keep overhead negligible.
- One custom trace covering cold start through the first painted home screen.

## ANRs and native crashes

ANRs are reported automatically by Crashlytics on Android 11+ via `ApplicationExitInfo`; the NDK artifact adds native crash capture. No extra configuration.

## Notes

- Monitoring is native-only and inert in the web preview, so the Lovable preview is unaffected.
- No secrets required — both SDKs authenticate through `google-services.json`.
- The only identifier sent is the anonymous Supabase user id.
- Verification is a device step: `bun run build:mobile && bun run sync:android`, then rebuild the APK. A hidden test-crash trigger can be added in Settings if you want one-tap confirmation that reports reach the Firebase console.