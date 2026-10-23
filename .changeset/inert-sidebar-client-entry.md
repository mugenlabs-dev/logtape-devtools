---
"@mugenlabs/logtape-devtools": patch
---

- Make the collapsed sidebar `inert`, so Tab and screen readers skip its hidden controls.
- Raise panel text and icon contrast to WCAG AA (4.5:1 for text, 3:1 for icons). The warning badge now uses dark text, greys and the accent are lighter, and inactive level toggles, the caller column and the chip remove button no longer fade.
- Skip only `@logtape/*` and devtools frames when finding a log's caller, matched on the file path. Your own files and functions with "logtape" in the name now show up as the caller.
- Mark the package root `"use client"` for React Server Components. `/sink` stays server-safe.
- Add a `default` export condition, so Node 24 can `require()` the package.
- Move from `@base-ui-components/react@1.0.0-rc.0` to the stable `@base-ui/react` 1.x.
- Build a record's detail JSON once instead of on every mount.
