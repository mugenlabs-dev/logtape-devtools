import posthog from "posthog-js";

/** PostHog runs only on Vercel production when a project key is present. */
export function isPostHogEnabled(): boolean {
  return Boolean(
    import.meta.env.VITE_PUBLIC_POSTHOG_KEY && import.meta.env.VERCEL_ENV === "production"
  );
}

export function initPostHog(): void {
  const key = import.meta.env.VITE_PUBLIC_POSTHOG_KEY;
  if (!(key && import.meta.env.VERCEL_ENV === "production")) {
    return;
  }

  posthog.init(key, {
    api_host: "/ingest",
    capture_exceptions: true,
    capture_pageleave: true,
    capture_pageview: false,
    disable_surveys: true,
    persistence: "memory",
    person_profiles: "identified_only",
    ui_host: "https://eu.posthog.com",
  });
}

export function capturePageview(): void {
  if (!isPostHogEnabled()) {
    return;
  }
  posthog.capture("$pageview");
}

export function captureException(error: unknown): void {
  if (!isPostHogEnabled()) {
    return;
  }
  posthog.captureException(error);
}
