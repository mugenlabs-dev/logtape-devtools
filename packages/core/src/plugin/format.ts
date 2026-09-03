// Built once: constructing an Intl formatter per row per render is measurably slow.
let timeFormatter: Intl.DateTimeFormat | undefined;

/** Formats a timestamp as a 24-hour `HH:MM:SS` local time string. */
export function formatTime(ts: number): string {
  timeFormatter ??= new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    second: "2-digit",
  });
  return timeFormatter.format(new Date(ts));
}
