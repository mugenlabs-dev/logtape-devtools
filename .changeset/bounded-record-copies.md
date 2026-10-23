---
"@mugenlabs/logtape-devtools": patch
---

- Interpolated message values are now copied when they are logged, like properties already were. Changing an object after logging it no longer changes what the panel shows, and the store no longer keeps large objects such as DOM nodes alive.
- The copy has size limits: nesting deeper than 8 levels, entries past the first 100 of an object, array, Map or Set, strings past 10,000 characters, and anything past 5,000 values per record become `[Truncated: …]` markers. A single huge payload can no longer cost its full size for every buffered record.
- The copy keeps `Date`, `Map`, `Set`, `RegExp` and `Error` values, including an error's custom fields such as `code` and `AggregateError.errors`. Objects with a `toJSON` method are stored as what `toJSON` returns, so values that keep their data in private fields still show up. `toJSON` now runs when the value is logged rather than when the panel first displays it. Functions, DOM nodes and binary data become short descriptions such as `[HTMLButtonElement]`.
