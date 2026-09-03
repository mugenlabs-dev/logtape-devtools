---
"@mugenlabs/logtape-devtools": patch
---

Keep auto-following new logs once the store has reached `maxRecords`. Previously the panel stopped scrolling to new entries after the buffer filled up, because the record count no longer changed.
