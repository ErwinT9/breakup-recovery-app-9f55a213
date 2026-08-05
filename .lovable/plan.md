# Firebase Auth + Native Android Hardening

Goal: replace Supabase Auth with Firebase Auth (native Google picker + email/password), keep Supabase purely as the database keyed by Firebase UID, and tighten the app for a real Play Store Android build. Existing code is upgraded, not rebuilt.

Because this touches sign-in, every table's ownership column, and the whole native shell, it ships in four stages so the app is never left half-broken.

## Stage 1 — Database re-keying

Today every table stores the owner as a Supabase `auth.users` UUID and `profiles.id` has a foreign key into `auth.users`. Firebase UIDs are short text strings, so those columns must become text.

- Drop the `profiles -> auth.users` foreign key and the `handle_new_user` trigger on `auth.users`.
- Convert `profiles.id` and every `user_id` column (journal, wins, flags, badges, letters, pictures, rituals, triggers, affirmations, streaks, mood check-ins, daily promises, questionnaire, push tokens) from uuid to text. Existing rows keep their old UUID as text, so nothing is lost.
- Add `profiles.email` so old rows can be adopted by the matching Firebase account.
- Rewrite every RLS policy to compare against the Firebase UID carried in the request token instead of `auth.uid()`, and re-issue the required grants.
- Same treatment for the `activity-pictures` storage policies.

Existing accounts are preserved: the first time someone signs in with Firebase using the same email address as an old profile, their old rows are re-pointed to the new Firebase UID automatically. Accounts with no email match simply start fresh.

## Stage 2 — Firebase Authentication

- Add Firebase (`firebase` JS SDK + `@capacitor-firebase/authentication`) and register the Android plugin.
- Native Google Sign-In: on Android the plugin opens the system Google account picker — no Chrome, no Custom Tab, no Supabase OAuth page. On web the same call falls back to a standard popup so the Lovable preview keeps working.
- Email/password sign-up and sign-in, forgot-password email, and email verification, all through Firebase.
- Rewrite `useAuth` around Firebase's auth state listener: it exposes the Firebase user, the ID token, loading state and sign-out. Session restore is instant from Firebase's own persisted credential, so an already-signed-in user goes straight Splash → Home with no auth flash.
- The Supabase client is recreated with an `accessToken` callback that hands it the current Firebase ID token (auto-refreshed), so RLS keeps working directly from the client with no server round trip.
- Delete the Supabase auth surfaces: OAuth hash handling, the Supabase `/reset-password` recovery route, the bearer attacher, and the Supabase-session auth gate (replaced with a Firebase-session gate).
- After each successful sign-in, upsert the Supabase `profiles` row from the Firebase identity (uid, email, display name, photo) and run the email-adoption step above.
- Account deletion and log-out are rewritten to delete/sign out of Firebase and then clear Supabase rows and local caches.

### Console steps you must do (blocking)

The code cannot work until these are done; exact values will be listed in `ANDROID.md`:
1. Firebase Console: enable Google and Email/Password providers.
2. Add the Android app with your package name and both debug and release SHA-1/SHA-256 fingerprints, then download a fresh `google-services.json`.
3. Supabase Dashboard → Authentication → Sign In / Providers → Third Party Auth: add Firebase with your Firebase project ID. Without this, Supabase rejects the Firebase token and every read fails.

## Stage 3 — Offline-first and sync

- One local cache layer over Capacitor Preferences holding profile, streak, journal, flags, wins, badges, letters, settings, notification prefs and theme, so all read screens render instantly from cache and then refresh.
- All writes go through the existing sync queue: applied locally first, queued when offline, flushed automatically when the network returns, with retry/backoff and last-write-wins conflict resolution on `updated_at`.
- A persistent "Offline mode" banner replaces error toasts when there's no connection; nothing hard-fails.

## Stage 4 — Native feel and performance

- Firebase Cloud Messaging for all push (daily motivation, morning/evening reminders, streak, milestone, weekly progress, journal, SOS), with Android notification channels, silent-notification support, respect for saved preferences, and deep links that route straight to the right screen.
- Android back button handling (back navigates, double-back exits from Home), keyboard resize handling, safe areas, locked portrait orientation, native splash into the app with no white flash, and lifecycle-aware refresh on resume.
- Performance pass: route-level code splitting and lazy loading of heavy screens (cropper, breathing, Pop It, badges), memoized lists and derived values, debounced text saves, capped and cached images, timers cleaned up on unmount, and batched Supabase reads on Home instead of many parallel ones.
- Skeleton loaders, empty/error/offline states, haptics on key actions, pull-to-refresh on list screens.
- Cleanup: remove dead Supabase-auth code, unused dependencies, and duplicated data-fetching logic.

## Technical notes

- Supabase client auth switches from `persistSession` to a stateless `accessToken: () => firebaseIdToken` provider; no Supabase session is ever created again.
- RLS predicate becomes `((auth.jwt() ->> 'sub') = user_id)` scoped to the `authenticated` role, matching Supabase's Firebase third-party auth mapping.
- The `_authenticated` layout stays `ssr: false` and gates on the Firebase user instead of `supabase.auth.getUser()`.
- Server functions that used `requireSupabaseAuth` (account deletion) switch to verifying the Firebase ID token against Google's public keys, then acting with the service-role client.
- Web/preview stays functional throughout: Firebase web SDK popup sign-in in browsers, native plugin on Android.

## Verification

At the end of each stage: a brand-new Google account, a brand-new email/password account, and an existing account (email-matched) must all reach Home with identical UI, correct data, working offline read/write, and no browser redirect during sign-in.