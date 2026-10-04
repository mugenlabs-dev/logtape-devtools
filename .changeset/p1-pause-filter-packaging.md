---
"@mugenlabs/logtape-devtools": patch
---

- Pausing the panel unsubscribes from the store so hot loggers no longer re-render the plugin/toolbar/virtualizer until Resume.
- Filter/search uses precomputed `categoryKey` and lazy `messageSearchText` (optional fields; fixtures without them still work).
- Align `@tanstack/pacer` with msw-devtools (`^0.22.0`); published build is minified without sourcemaps (ESM + dts only).
