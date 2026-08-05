# Fix push notifications (FCM) and the notification toggle

## What's actually broken

Four confirmed issues, from reading the notification code, the Android config and the project secrets:

1. **The server can't send any push.** The `send-push-notification` function needs a `FIREBASE_SERVICE_ACCOUNT` secret. The project has no such secret configured, so every send returns "FIREBASE_SERVICE_ACCOUNT is not configured" and nothing ever reaches a device.
2. **No device is ever registered in practice.** FCM registration only runs at sign-in. At that moment Android 13+ has not granted notification permission yet, so registration returns nothing and is never retried — the `push_tokens` table stays empty even after the user later turns notifications on.
3. **The notification channel may not exist.** Both incoming pushes and the manifest point at the channel `no-contact-reminders`, but that channel is only created when local reminders get scheduled. If it doesn't exist, Android silently drops the notification.
4. **The Settings notification switch does too little.** It asks only for local-notification permission and saves a flag; it never registers the device with Firebase, so turning it on appears to do nothing.

## The fix

**Settings toggle**
- Turning notifications on: request permission, create the notification channel, register with Firebase, save the token, then schedule reminders — in that order, with a clear toast on success or failure.
- Turning it off: cancel reminders and mark this device's token inactive.
- Add a "Send a test notification" action visible while notifications are on, so delivery can be verified end to end from the phone.

**Registration reliability**
- Create the `no-contact-reminders` channel as part of push setup, not just reminder scheduling.
- Re-attempt registration on every app start when permission is already granted, and refresh the stored token when Firebase rotates it.
- Fix the duplicate Firebase listeners currently registered on each call (they cause repeat/ghost handling).
- Keep foreground, background and tap handling, routing taps into the app as today.

**Server side**
- Store the Firebase service-account JSON as a secret so the sending function works. This is the one item that needs you: it comes from Firebase Console → Project settings → Service accounts → Generate new private key, for project `healing-path-9c858`.
- Harden the send function: surface a clear error when no active device token exists, and deactivate tokens Firebase reports as invalid (already partly present).

## Technical notes

- `src/lib/notifications/push.ts`: single set of listeners, channel creation, token refresh, retry on resume.
- `src/lib/notifications/index.ts`: export the channel helper; keep local reminder scheduling unchanged.
- `src/routes/_authenticated/profile.tsx`: rework `toggleReminders` into the ordered flow above and add the test-notification row.
- No database changes — `push_tokens` and its RLS/unique index are already correct.

## After the code change

Native push only works in an installed APK, not the web preview. You'll need to run `bun run sync:android` and rebuild the APK to test.