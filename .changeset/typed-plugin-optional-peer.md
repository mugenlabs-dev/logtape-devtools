---
"@mugenlabs/logtape-devtools": minor
---

- `createLogTapeDevtoolsPlugin` now returns `TanStackDevtoolsReactPlugin` from `@tanstack/react-devtools`, so a change in the host plugin shape is caught by this package's typecheck rather than in consumer apps.
- `@logtape/logtape` is now an optional peer dependency: the package only imports its types, so store-only consumers no longer need it installed.
- The published package now includes its LICENSE file.
