---
"@mugenlabs/logtape-devtools": patch
---

- Stack capture now really turns off in production browser builds. The `NODE_ENV` check was written so that Vite and webpack could not replace it, so it was always false in the browser and every log paid for a stack trace. If you rely on `caller` in a production build, set `forceStackTrace: true`.
- Logs that arrive while the panel is paused keep their `caller`. Pausing used to unsubscribe the panel, so the sink stopped capturing stacks until Resume.
- Server rendering shows an empty panel instead of reading the process-wide store, which on a server can hold other requests' logs. The client fills the panel in after hydration.
- Selected category filters stay visible after Clear, or once their records are evicted, so they can still be removed. Before, the chips disappeared but the filter kept hiding new logs.
