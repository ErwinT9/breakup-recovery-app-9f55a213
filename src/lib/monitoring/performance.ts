import { isNative } from "../native/platform";

// Registered directly instead of importing the package: its web implementation
// pulls in the optional `firebase` JS SDK, which breaks the bundle. Only the
// native bridge is used — calls are skipped on web by isNative().
const performance = registerPlugin<PerformancePlugin>("FirebasePerformance");

async function plugin(): Promise<PerformancePlugin> {
  return performance;
}

let started = false;
let coldStartAt = 0;
let coldStartDone = false;

function call(fn: (p: PerformancePlugin) => Promise<unknown>): void {
  if (!isNative()) return;
  void plugin()
    .then(fn)
    .catch(() => undefined);
}

/**
 * Enables Firebase Performance. App start, screen rendering, slow/frozen frames
 * and native HTTP requests are collected automatically by the SDK; the helpers
 * below cover the WebView traffic Android cannot auto-instrument.
 */
export function initPerformance(): void {
  if (started || !isNative()) return;
  started = true;
  coldStartAt = Date.now();
  call((p) => p.setEnabled({ enabled: true }));
}

/** Cold start → first painted app screen. Recorded once per launch. */
export function markAppReady(): void {
  if (coldStartDone || !isNative() || !coldStartAt) return;
  coldStartDone = true;
  const duration = Date.now() - coldStartAt;
  call((p) => p.record({ traceName: "app_ready", startTime: coldStartAt, duration }));
}

// One in N WebView requests is reported; enough signal, negligible overhead.
const SAMPLE_RATE = 4;
let requestCount = 0;

/** Records a WebView fetch/XHR as a custom trace with host, method and status. */
export function recordHttpRequest(input: {
  url: string;
  method: string;
  status: number;
  startTime: number;
  duration: number;
}): void {
  if (!isNative()) return;
  requestCount += 1;
  if (requestCount % SAMPLE_RATE !== 0) return;
  let host = "unknown";
  let path = "/";
  try {
    const parsed = new URL(input.url, "http://localhost");
    host = parsed.host;
    path = parsed.pathname.slice(0, 80);
  } catch {
    // keep defaults
  }
  call((p) =>
    p.record({
      traceName: "webview_http_request",
      startTime: input.startTime,
      duration: input.duration,
      options: {
        metrics: { status: input.status, duration_ms: Math.round(input.duration) },
        attributes: { host, path, method: input.method.toUpperCase() },
      },
    }),
  );
}

let patched = false;

/** Wraps window.fetch once so API response times reach Performance Monitoring. */
export function instrumentWebViewRequests(): void {
  if (patched || !isNative() || typeof window === "undefined") return;
  patched = true;
  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const startTime = Date.now();
    const url =
      typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const method = init?.method ?? (input instanceof Request ? input.method : "GET");
    try {
      const response = await originalFetch(input, init);
      recordHttpRequest({
        url,
        method,
        status: response.status,
        startTime,
        duration: Date.now() - startTime,
      });
      return response;
    } catch (error) {
      recordHttpRequest({ url, method, status: 0, startTime, duration: Date.now() - startTime });
      throw error;
    }
  };
}