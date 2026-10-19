import type { PostHog } from "posthog-js";

/** The only hostname analytics may report from. */
const PRODUCTION_HOST = "logtape-devtools.mugenlabs.dev";

let clientPromise: Promise<PostHog | null> | null = null;

/**
 * PostHog runs only on Vercel production builds with a project key, on the
 * production domain, and never in automated browsers. The CI preview serves the
 * same production build (deployed, tested with Playwright, then promoted), so
 * the build environment alone is not enough.
 */
export function isPostHogEnabled(): boolean {
  return Boolean(
    import.meta.env.VITE_PUBLIC_POSTHOG_KEY &&
      import.meta.env.VERCEL_ENV === "production" &&
      typeof window !== "undefined" &&
      window.location.hostname === PRODUCTION_HOST &&
      !navigator.webdriver
  );
}

/** posthog-js is loaded on demand, so untracked visitors never download it. */
export function initPostHog(): void {
  const key = import.meta.env.VITE_PUBLIC_POSTHOG_KEY;
  if (!(key && isPostHogEnabled())) {
    return;
  }

  clientPromise = import("posthog-js")
    .then(({ default: posthog }) => {
      posthog.init(key, {
        // No feature flags are used, so skip the flags request on every load.
        advanced_disable_feature_flags: true,
        api_host: "/ingest",
        // Autocapture would send clicked element text, which in the playground
        // includes user-visible log data.
        autocapture: false,
        capture_dead_clicks: false,
        capture_exceptions: true,
        capture_pageleave: true,
        capture_pageview: false,
        capture_performance: false,
        disable_session_recording: true,
        disable_surveys: true,
        persistence: "memory",
        person_profiles: "identified_only",
        respect_dnt: true,
        ui_host: "https://eu.posthog.com",
      });
      return posthog;
    })
    // A blocked or failed load (ad blockers) leaves analytics off.
    .catch(() => null);
}

/** Run once the client is ready; a no-op whenever analytics are disabled. */
function withClient(fn: (client: PostHog) => void): void {
  void clientPromise?.then((client) => {
    if (client) {
      fn(client);
    }
  });
}

export function capturePageview(): void {
  withClient((client) => client.capture("$pageview"));
}

export function captureException(error: unknown): void {
  withClient((client) => client.captureException(error));
}
