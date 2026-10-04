---
"@mugenlabs/logtape-devtools": patch
---

- Unknown log levels no longer crash the expanded detail pane (same `getLevelColors` fallback already used by rows and badges).
- Optional peers are now caret-bounded (`@logtape/logtape` `^2.0.0`, `@tanstack/react-devtools` `^0.9.0`) so a LogTape 3 or DevTools 0.10 plugin-prop change cannot be pulled in automatically. 0.10 changed how props are passed into plugins.
- The published package now declares `engines.node` `>=24.0.0` (Node 24 Active LTS).
