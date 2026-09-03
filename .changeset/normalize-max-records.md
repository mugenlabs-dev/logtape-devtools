---
"@mugenlabs/logtape-devtools": patch
---

Normalise `maxRecords` to a non-negative integer. A fractional value no longer disables the capacity limit, and `NaN` or a negative value no longer leaves the store silently dropping every record.
