# Native Google Sign-In Deep Link for the Android APK

Right now the Google button always sends Supabase a browser redirect back to `window.location.origin/auth`. Inside the APK that origin is the published Lovable site, so after consent Google hands the session to the website in Chrome and the app never hears about it. Fix is to give the native build its own deep-link callback and finish the sign-in inside the app. The web flow is untouched.

## What changes

**1. A dedicated OAuth helper (`src/lib/auth/oauthNative.ts`)**

One `signInWithGoogle()` used by the auth screen, branching on platform:

- **Web / Lovable preview**: exactly today's behaviour — `signInWithOAuth` with `redirectTo: ${origin}/auth`, full-page redirect.
- **Android (Capacitor)**: request the URL with `skipBrowserRedirect: true` and `redirectTo: app.lovable.nocontacttracker://auth-callback`, open that URL in a Custom Tab via the `@capacitor/browser` plugin, then wait for the deep link.

**2. Deep-link listener**

A single `App.addListener("appUrlOpen", …)` registered once at app start. When a URL matching the app scheme arrives it:
- closes the Custom Tab (`Browser.close()`),
- hands the callback to Supabase — `exchangeCodeForSession` for a PKCE `?code=`, or `setSession` for an implicit `#access_token/#refresh_token` payload,
- shows a friendly toast on `error_description` instead of leaving the user stranded,
- lets the existing auth-state listener route to Home.

Also handles the case where the user swipes the Custom Tab away: on app resume with no session, the pending sign-in is cancelled and the button becomes usable again (no infinite spinner).

**3. Supabase client config**

Switch the browser client to PKCE (`flowType: "pkce"`) and keep `detectSessionInUrl` on for web. PKCE is what makes the deep-link callback exchangeable inside the app and is also safer on web; the existing email/password and reset-password flows are unaffected.

**4. Android configuration**

- Add the custom scheme intent filter to `MainActivity` in `AndroidManifest.xml` (`BROWSABLE` + `DEFAULT`, scheme `app.lovable.nocontacttracker`, host `auth-callback`). The activity is already `singleTask`, so the callback reuses the running app rather than starting a second copy.
- Add `@capacitor/browser` and sync it into the native project.

**5. Dependencies and docs**

`@capacitor/browser` installed; `ANDROID.md` updated with the redirect URL to register and a note to re-run `bun run sync:android`.

## Console step you must do (blocking)

Supabase Dashboard → Authentication → URL Configuration → **Redirect URLs**, add:

```text
app.lovable.nocontacttracker://auth-callback
```

Keep the existing `https://breakup-recovery-app.lovable.app/**` entry so web keeps working. Nothing changes in the Google Cloud console — Google still redirects to your Supabase callback; only the final hop back from Supabase changes.

## What stays the same

- Email/password sign-in, sign-up and password reset.
- The web Google flow and its `/auth` return handling, including the `#`-stripping fix.
- The `_authenticated` route gate and session persistence.

## Verification

- **Web preview**: Google button still redirects through the browser and lands on Home with a clean URL.
- **Android APK** (needs a rebuild after sync): tapping Continue with Google opens a Custom Tab, and after choosing the account the tab closes on its own, the app comes to the foreground signed in, and Chrome is never left showing the Lovable website.

Note: I can verify the web path here, but the APK path can only be confirmed on a device build on your side — I'll flag exactly what to look for.