---
"@mugenlabs/logtape-devtools": patch
---

Render Error objects, Maps, Sets, BigInts, symbols and functions readably in the Data pane instead of showing `{}` or collapsing the whole properties object to `[object Object]`. Circular references are still marked `[Circular]`, but shared non-circular references are no longer mislabelled.
