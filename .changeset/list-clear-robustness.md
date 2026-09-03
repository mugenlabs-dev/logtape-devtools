---
"@mugenlabs/logtape-devtools": patch
---

Fix two log list edge cases: a render crash when the list shrinks (after Clear or a narrowing filter) while the virtualizer still holds keys for old indices, and auto-follow staying off after Clear if the user had scrolled up before.
