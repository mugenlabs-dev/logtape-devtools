import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

// Compact, self-contained mock replicas of the devtools UI — each one loops a
// tiny scripted animation showing exactly one feature. Colors mirror the
// plugin's own dark theme so the demos read as slices of the real panel.

const IN_VIEW_THRESHOLD = 0.3;

/** Cycles 0..steps-1 while the demo is on screen; pauses when scrolled away. */
const useDemoPhase = (steps: number, intervalMs: number) => {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        setInView(entries.some((entry) => entry.isIntersecting));
      },
      { threshold: IN_VIEW_THRESHOLD }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!inView) {
      return;
    }
    const id = window.setInterval(() => {
      setPhase((p) => (p + 1) % steps);
    }, intervalMs);
    return () => {
      window.clearInterval(id);
    };
  }, [inView, steps, intervalMs]);

  return { phase, ref };
};

const DemoShell = ({ caption, children }: { caption: string; children: ReactNode }) => (
  <div className="w-full rounded-xl border border-[#333] bg-[#1e1e1e] p-4 font-mono text-[11px] shadow-[0_12px_32px_rgba(0,0,0,0.3)]">
    <div className="flex min-h-[124px] flex-col justify-center gap-1.5">{children}</div>
    <p className="m-0 mt-3 min-h-[28px] border-[#2a2a2a] border-t pt-2.5 font-sans text-[#888] text-[11px] leading-snug">
      {caption}
    </p>
  </div>
);

type Level = "debug" | "error" | "fatal" | "info" | "trace" | "warning";

// Badge colors from the plugin's own level palette (theme.ts).
const LEVEL_BADGES: Record<Level, { abbr: string; className: string }> = {
  debug: { abbr: "DBG", className: "bg-[#55aa55] text-white" },
  error: { abbr: "ERR", className: "bg-[#dc2626] text-white" },
  fatal: { abbr: "FTL", className: "bg-[#b91c1c] text-white" },
  info: { abbr: "INF", className: "bg-[#3b82f6] text-white" },
  trace: { abbr: "TRC", className: "bg-[#5555aa] text-white" },
  warning: { abbr: "WRN", className: "bg-[#eab308] text-black" },
};

interface DemoLog {
  category: string;
  level: Level;
  message: string;
  time: string;
}

const LogRow = ({ dimmed, log }: { dimmed?: boolean; log: DemoLog }) => (
  <div
    className={`flex items-center gap-1.5 overflow-hidden rounded bg-[#1a1a1a] px-2 py-1 transition-opacity duration-300 ${dimmed ? "opacity-35" : "opacity-100"}`}
  >
    <span className="shrink-0 text-[#555] text-[9px]">{log.time}</span>
    <span className={`shrink-0 rounded px-1 py-px text-[8px] ${LEVEL_BADGES[log.level].className}`}>
      {LEVEL_BADGES[log.level].abbr}
    </span>
    <span className="shrink-0 text-[#93c5fd] text-[10px]">{log.category}</span>
    <span className="truncate text-[#c9c9c9]">{log.message}</span>
  </div>
);

const LOG_POOL: DemoLog[] = [
  { category: "app·auth", level: "info", message: "User ada logged in", time: "12:04:01" },
  { category: "app·db", level: "debug", message: "Fetched 42 rows from users", time: "12:04:02" },
  { category: "app·ui", level: "trace", message: "Render pass for CheckoutForm", time: "12:04:02" },
  {
    category: "app·api",
    level: "error",
    message: "POST /api/checkout failed (502)",
    time: "12:04:03",
  },
  { category: "lib·ws", level: "debug", message: "Frame received (313 bytes)", time: "12:04:04" },
  {
    category: "app·db",
    level: "warning",
    message: "Slow query on orders: 819ms",
    time: "12:04:05",
  },
  { category: "app·api", level: "info", message: "GET /api/users 200 in 45ms", time: "12:04:06" },
  { category: "app·db", level: "fatal", message: "Connection pool exhausted", time: "12:04:07" },
];

const STREAM_WINDOW = 4;

// ---------------------------------------------------------------------------
// 1. Live Log Stream — records appear as they happen
// ---------------------------------------------------------------------------

export const LiveStreamDemo = () => {
  const { phase, ref } = useDemoPhase(LOG_POOL.length, 1400);
  const rows = Array.from(
    { length: STREAM_WINDOW },
    (_, i) => LOG_POOL[(phase + i) % LOG_POOL.length]
  );

  return (
    <div ref={ref}>
      <DemoShell caption="Every record streams into the panel the moment it's logged — no more juggling the browser console.">
        {rows.map((log, index) => (
          <LogRow dimmed={index === 0} key={`${log.time}-${log.message}`} log={log} />
        ))}
      </DemoShell>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 2. Level Filtering — isolate severities with one click
// ---------------------------------------------------------------------------

const LEVEL_CHIP_ORDER: Level[] = ["trace", "debug", "info", "warning", "error", "fatal"];

const LEVEL_FILTER_STEPS: { active: Level[]; caption: string }[] = [
  { active: [], caption: "A healthy app is noisy — every severity mixed together." },
  { active: ["error"], caption: "One click on the error chip and only failures remain." },
  { active: ["error", "warning"], caption: "Chips combine — add warnings to widen the net." },
  { active: [], caption: "Clear the chips to get the full stream back." },
];

const LEVEL_FILTER_ROWS = [LOG_POOL[0], LOG_POOL[3], LOG_POOL[5], LOG_POOL[6]];

export const LevelFilterDemo = () => {
  const { phase, ref } = useDemoPhase(LEVEL_FILTER_STEPS.length, 2100);
  const step = LEVEL_FILTER_STEPS[phase];

  return (
    <div ref={ref}>
      <DemoShell caption={step.caption}>
        <div className="mb-0.5 flex items-center gap-1 px-0.5">
          {LEVEL_CHIP_ORDER.map((level) => (
            <span
              className={`rounded px-1 py-px text-[8px] transition-opacity duration-300 ${LEVEL_BADGES[level].className} ${
                step.active.length === 0 || step.active.includes(level)
                  ? "opacity-100"
                  : "opacity-25"
              }`}
              key={level}
            >
              {LEVEL_BADGES[level].abbr}
            </span>
          ))}
        </div>
        <div className="flex flex-col gap-1.5">
          {LEVEL_FILTER_ROWS.map((log) => {
            const visible = step.active.length === 0 || step.active.includes(log.level);
            return (
              <div
                className={`overflow-hidden transition-all duration-300 ${visible ? "max-h-8 opacity-100" : "max-h-0 opacity-0"}`}
                key={`${log.time}-${log.message}`}
              >
                <LogRow log={log} />
              </div>
            );
          })}
        </div>
      </DemoShell>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 3. Category Search — narrow by logger category or message text
// ---------------------------------------------------------------------------

const SEARCH_STEPS: { caption: string; query: string }[] = [
  { caption: "Hundreds of records across every subsystem…", query: "" },
  { caption: "Start typing and the list narrows as you go…", query: "au" },
  { caption: "…down to just the app·auth logger. Search matches message text too.", query: "auth" },
  { caption: "Clear it and the full stream is back.", query: "" },
];

const SEARCH_ROWS = [LOG_POOL[0], LOG_POOL[1], LOG_POOL[3], LOG_POOL[4]];

export const CategorySearchDemo = () => {
  const { phase, ref } = useDemoPhase(SEARCH_STEPS.length, 2100);
  const step = SEARCH_STEPS[phase];

  return (
    <div ref={ref}>
      <DemoShell caption={step.caption}>
        <div className="mb-0.5 flex items-center gap-1.5 rounded border border-[#444] bg-[#252525] px-2 py-1 text-[#e0e0e0]">
          <span className="text-[#666]">⌕</span>
          <span>{step.query}</span>
          <span className="-ml-1 animate-pulse text-[#6366f1]">▏</span>
          {step.query === "" ? <span className="text-[#555]">Filter by category…</span> : null}
        </div>
        <div className="flex flex-col gap-1.5">
          {SEARCH_ROWS.map((log) => {
            const visible = step.query === "" || log.category.includes(step.query);
            return (
              <div
                className={`overflow-hidden transition-all duration-300 ${visible ? "max-h-8 opacity-100" : "max-h-0 opacity-0"}`}
                key={`${log.time}-${log.message}`}
              >
                <LogRow log={log} />
              </div>
            );
          })}
        </div>
      </DemoShell>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 4. Structured Inspection — expand a record to see its full payload
// ---------------------------------------------------------------------------

const INSPECT_STEPS = [
  "Logs aren't strings — each record carries structured properties.",
  "Click any entry to unfold the full payload: nested objects included.",
];

export const StructuredInspectionDemo = () => {
  const { phase, ref } = useDemoPhase(INSPECT_STEPS.length, 2600);
  const expanded = phase === 1;

  return (
    <div ref={ref}>
      <DemoShell caption={INSPECT_STEPS[phase]}>
        <div className="rounded bg-[#1a1a1a]">
          <div className="flex items-center gap-1.5 px-2 py-1">
            <span
              className={`text-[#666] text-[9px] transition-transform duration-300 ${expanded ? "rotate-90" : ""}`}
            >
              ▶
            </span>
            <span
              className={`shrink-0 rounded px-1 py-px text-[8px] ${LEVEL_BADGES.error.className}`}
            >
              ERR
            </span>
            <span className="shrink-0 text-[#93c5fd] text-[10px]">app·api</span>
            <span className="truncate text-[#c9c9c9]">POST /api/checkout failed (502)</span>
          </div>
          <div
            className={`overflow-hidden pl-7 transition-all duration-300 ${expanded ? "max-h-24 pb-1.5 opacity-100" : "max-h-0 opacity-0"}`}
          >
            <div className="text-[#8b8b8b] leading-relaxed">
              <div>
                <span className="text-[#93c5fd]">order</span>: {"{ id: "}
                <span className="text-[#fca5a5]">"ord_8123"</span>
                {", total: "}
                <span className="text-[#fcd34d]">129.9</span>
                {" }"}
              </div>
              <div>
                <span className="text-[#93c5fd]">response</span>: {"{ status: "}
                <span className="text-[#fcd34d]">502</span>
                {", durationMs: "}
                <span className="text-[#fcd34d]">3012</span>
                {" }"}
              </div>
              <div>
                <span className="text-[#93c5fd]">retry</span>: {"{ attempt: "}
                <span className="text-[#fcd34d]">2</span>
                {", max: "}
                <span className="text-[#fcd34d]">3</span>
                {" }"}
              </div>
            </div>
          </div>
        </div>
      </DemoShell>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 5. Pause & Resume — freeze the list while the stream continues
// ---------------------------------------------------------------------------

const PAUSE_STEPS: { buffered: number; caption: string; offset: number; paused: boolean }[] = [
  {
    buffered: 0,
    caption: "At full speed, the record you care about scrolls away…",
    offset: 0,
    paused: false,
  },
  {
    buffered: 2,
    caption: "Hit pause: the list freezes while logging continues.",
    offset: 1,
    paused: true,
  },
  {
    buffered: 5,
    caption: "Inspect calmly — new records are buffered, not lost.",
    offset: 1,
    paused: true,
  },
  {
    buffered: 0,
    caption: "Resume, and everything buffered flows back in.",
    offset: 4,
    paused: false,
  },
];

export const PauseResumeDemo = () => {
  const { phase, ref } = useDemoPhase(PAUSE_STEPS.length, 2100);
  const step = PAUSE_STEPS[phase];
  const rows = Array.from({ length: 3 }, (_, i) => LOG_POOL[(step.offset + i) % LOG_POOL.length]);

  return (
    <div ref={ref}>
      <DemoShell caption={step.caption}>
        <div className="mb-0.5 flex items-center justify-between px-0.5">
          <span
            className={`rounded border px-2 py-0.5 transition-colors duration-300 ${
              step.paused
                ? "border-[#6366f1]/70 bg-[#6366f1]/20 text-[#a5b4fc]"
                : "border-[#444] text-[#888]"
            }`}
          >
            {step.paused ? "▶ Resume" : "❚❚ Pause"}
          </span>
          <span
            className={`text-[#facc15] transition-opacity duration-300 ${step.buffered > 0 ? "opacity-100" : "opacity-0"}`}
          >
            +{step.buffered} buffered
          </span>
        </div>
        {rows.map((log) => (
          <LogRow key={`${log.time}-${log.message}`} log={log} />
        ))}
      </DemoShell>
    </div>
  );
};

// ---------------------------------------------------------------------------
// 6. Bounded Memory — a ring buffer that never grows past its cap
// ---------------------------------------------------------------------------

const MEMORY_CAPTIONS = [
  "The store is a ring buffer with a configurable cap.",
  "New records keep arriving at the bottom…",
  "…and the oldest are evicted from the top, automatically.",
  "Memory stays flat no matter how chatty your app gets.",
];

export const BoundedMemoryDemo = () => {
  const { phase, ref } = useDemoPhase(MEMORY_CAPTIONS.length, 1600);
  const rows = Array.from(
    { length: STREAM_WINDOW },
    (_, i) => LOG_POOL[(phase + i) % LOG_POOL.length]
  );

  return (
    <div ref={ref}>
      <DemoShell caption={MEMORY_CAPTIONS[phase]}>
        <div className="mb-0.5 flex items-center justify-between px-0.5 text-[#888]">
          <span>
            buffer <span className="text-[#e0e0e0]">25 / 25</span>
          </span>
          <span className="text-[#666]">
            evicted <span className="text-[#facc15]">{phase * 3 + 12}</span>
          </span>
        </div>
        {rows.map((log, index) => (
          <div
            className={index === 0 ? "opacity-35 [&_span]:line-through" : ""}
            key={`${log.time}-${log.message}`}
          >
            <LogRow log={log} />
          </div>
        ))}
      </DemoShell>
    </div>
  );
};
