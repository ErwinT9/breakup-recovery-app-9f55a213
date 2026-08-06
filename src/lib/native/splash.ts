import { isNative } from "./platform";

/**
 * The native launch splash is configured with `launchAutoHide: false`, so the
 * Android WebView keeps showing `@drawable/splash` (a blank white image) until
 * JavaScript explicitly hides it. Nothing called `hide()`, which is why the APK
 * sat on a white screen while the web build — where the plugin is a no-op —
 * worked fine. Called once the React tree has mounted.
 */
let hidden = false;

export function hideNativeSplash(): void {
  if (hidden || !isNative()) return;
  hidden = true;
  void (async () => {
    try {
      const { SplashScreen } = await import("@capacitor/splash-screen");
      await SplashScreen.hide({ fadeOutDuration: 200 });
    } catch (error) {
      console.warn("[native] splash hide failed", error);
    }
  })();
}
