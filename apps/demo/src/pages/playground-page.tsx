import { configure, getLogger, reset } from "@logtape/logtape";
import { createLogTapeDevtools } from "@mugenlabs/logtape-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { CodeBlock } from "../docs/code-block";

// --- Source code shown to the user ---
const EXAMPLE_CODE = `import { configure, getLogger } from "@logtape/logtape";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { createLogTapeDevtools } from "@mugenlabs/logtape-devtools";

// 1. Create the sink and the panel plugin, wired to the same store
const { sink, plugin } = createLogTapeDevtools();

// 2. Configure LogTape with the devtools sink
//    This captures all log records and forwards them to the panel.
await configure({
  sinks: {
    devtools: sink,
  },
  loggers: [
    {
      category: [],          // [] = match all categories
      lowestLevel: "trace",  // capture every level
      sinks: ["devtools"],
    },
  ],
});

// 3. Use LogTape's getLogger to emit structured logs
//    Categories are arrays — e.g. ["app", "auth"] becomes "app.auth"
const logger = getLogger(["app", "auth"]);

logger.info("User {username} logged in", { username: "john_doe" });
logger.debug("Session token refreshed");
logger.error("Failed to fetch {url}: {status}", {
  url: "/api/data",
  status: 500,
});

// 4. Mount TanStack DevTools with the LogTape plugin
//    This renders the log viewer panel in your app.
function App() {
  return (
    <>
      <YourApp />
      <TanStackDevtools plugins={[plugin]} />
    </>
  );
}`;

// --- LogTape setup ---
// One call wires a sink and the devtools plugin to the same store.
const { sink: devtoolsSink, plugin: devtoolsPlugin } = createLogTapeDevtools({
  sink: { captureStackTrace: true },
});

let configured = false;

async function setupLogTape() {
  if (configured) {
    await reset();
  }
  await configure({
    sinks: {
      devtools: devtoolsSink,
    },
    loggers: [{ category: [], lowestLevel: "trace", sinks: ["devtools"] }],
  });
  configured = true;
}

// --- Log generators ---
const categories = [
  ["app", "auth"],
  ["app", "api"],
  ["app", "router"],
  ["app", "db"],
  ["app", "cache"],
  ["app", "ui"],
  ["lib", "http"],
  ["lib", "ws"],
];

const messages = {
  trace: [
    "Entering function renderPage",
    "Variable userId = {userId}",
    "Loop iteration {i} of {total}",
  ],
  debug: [
    "Cache lookup for key {key}",
    "Request headers prepared",
    "Component re-rendered with {count} items",
  ],
  info: [
    "User {username} logged in",
    "API request to {endpoint} completed in {ms}ms",
    "Page {route} loaded successfully",
  ],
  warning: [
    "Slow query detected: {ms}ms on {table}",
    "Rate limit approaching: {current}/{max} requests",
    "Deprecated API endpoint called: {endpoint}",
  ],
  error: [
    "Failed to fetch {url}: {status} {statusText}",
    "Database connection timeout after {ms}ms",
    "Unhandled promise rejection in {component}",
  ],
  fatal: [
    "Application state corrupted, forcing restart",
    "Critical service unreachable: {service}",
  ],
};

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// A value generator per placeholder name, so every `{placeholder}` in a
// message template gets a plausible value instead of `undefined`.
const propValues: Record<string, () => unknown> = {
  component: () => randomItem(["AuthProvider", "DashboardView", "SearchBar", "RouteGuard"]),
  count: () => Math.floor(Math.random() * 200) + 1,
  current: () => Math.floor(Math.random() * 900) + 50,
  endpoint: () => randomItem(["/api/users", "/api/posts", "/api/session", "/api/v1/legacy"]),
  i: () => Math.floor(Math.random() * 50) + 1,
  key: () => randomItem(["user:1042", "posts:recent", "session:abc123", "flags:beta"]),
  max: () => 1000,
  ms: () => Math.floor(Math.random() * 2000) + 5,
  route: () => randomItem(["/dashboard", "/settings", "/login", "/reports/monthly"]),
  service: () => randomItem(["redis-primary", "auth-service", "postgres-main", "mailer"]),
  status: () => randomItem([400, 404, 500, 503]),
  statusText: () =>
    randomItem(["Bad Request", "Not Found", "Internal Server Error", "Service Unavailable"]),
  table: () => randomItem(["users", "posts", "sessions", "audit_log"]),
  total: () => 50,
  url: () => randomItem(["/api/data", "/api/profile", "/api/orders", "/api/search?q=logs"]),
  userId: () => `usr_${Math.random().toString(36).slice(2, 8)}`,
  username: () => randomItem(["john_doe", "ada", "grace_h", "linus"]),
};

const statusTexts: Record<number, string> = {
  400: "Bad Request",
  404: "Not Found",
  500: "Internal Server Error",
  503: "Service Unavailable",
};

const placeholderRe = /\{(\w+)\}/g;

function randomProps(template: string): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  for (const [, key] of template.matchAll(placeholderRe)) {
    props[key] = propValues[key]?.() ?? key;
  }
  // Keep the status code and its text consistent when both are interpolated.
  if (typeof props.status === "number" && typeof props.statusText === "string") {
    props.statusText = statusTexts[props.status];
  }
  return props;
}

const levels = ["trace", "debug", "info", "warning", "error", "fatal"] as const;

function emitRandomLog() {
  // Weight towards info/debug (more realistic)
  const weights = [0.1, 0.25, 0.35, 0.15, 0.12, 0.03];
  let r = Math.random();
  let levelIdx = 0;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) {
      levelIdx = i;
      break;
    }
  }
  const level = levels[levelIdx];
  const category = randomItem(categories);
  const logger = getLogger(category);
  const msgTemplate = randomItem(messages[level]);
  const props = randomProps(msgTemplate);

  logger[level === "warning" ? "warn" : level](msgTemplate, props);
}

// --- Playground UI ---
export const PlaygroundPage = () => {
  const [ready, setReady] = useState(false);
  const [autoLog, setAutoLog] = useState(false);
  const [speed, setSpeed] = useState(500);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setupLogTape().then(() => setReady(true));
  }, []);

  useEffect(() => {
    if (autoLog && ready) {
      intervalRef.current = setInterval(emitRandomLog, speed);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoLog, ready, speed]);

  const emitOne = useCallback(
    (level: (typeof levels)[number]) => {
      if (!ready) {
        return;
      }
      const category = randomItem(categories);
      const logger = getLogger(category);
      const msgTemplate = randomItem(messages[level]);
      const props = randomProps(msgTemplate);
      logger[level === "warning" ? "warn" : level](msgTemplate, props);
    },
    [ready]
  );

  return (
    <div className="mx-auto max-w-5xl px-6 py-12 pb-96">
      <h1 className="mb-2 font-bold text-3xl text-text-primary">Playground</h1>
      <p className="mb-8 text-text-muted">
        Generate logs to see them appear in the LogTape DevTools panel below.
      </p>

      {ready ? (
        <div className="space-y-6">
          {/* Auto-log controls */}
          <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border-secondary bg-card-bg p-5">
            <button
              className={`rounded-lg px-5 py-2.5 font-semibold text-sm transition-colors ${
                autoLog
                  ? "bg-red-500/15 text-red-400 hover:bg-red-500/25"
                  : "bg-accent/15 text-accent-light hover:bg-accent/25"
              }`}
              onClick={() => setAutoLog((v) => !v)}
              type="button"
            >
              {autoLog ? "⏹ Stop Auto-Log" : "▶ Start Auto-Log"}
            </button>
            <label className="flex items-center gap-2 text-sm text-text-muted">
              Speed:
              <select
                className="rounded-md border border-border-secondary bg-bg-tertiary px-3 py-1.5 text-sm text-text-primary"
                onChange={(e) => setSpeed(Number(e.target.value))}
                value={speed}
              >
                <option value={1000}>Slow (1/s)</option>
                <option value={500}>Medium (2/s)</option>
                <option value={200}>Fast (5/s)</option>
                <option value={50}>Burst (20/s)</option>
              </select>
            </label>
          </div>

          {/* Manual log buttons */}
          <div className="rounded-xl border border-border-secondary bg-card-bg p-5">
            <h3 className="mb-3 font-medium text-sm text-text-muted">Emit single log:</h3>
            <div className="flex flex-wrap gap-2">
              {levels.map((level) => {
                const colorMap: Record<string, string> = {
                  trace: "bg-[#5555aa]/20 text-[#8888bb] hover:bg-[#5555aa]/30",
                  debug: "bg-[#55aa55]/20 text-[#88bb88] hover:bg-[#55aa55]/30",
                  info: "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30",
                  warning: "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30",
                  error: "bg-red-500/20 text-red-400 hover:bg-red-500/30",
                  fatal: "bg-red-700/20 text-red-300 hover:bg-red-700/30",
                };
                return (
                  <button
                    className={`rounded-md px-4 py-2 font-mono font-semibold text-sm transition-colors ${colorMap[level]}`}
                    key={level}
                    onClick={() => emitOne(level)}
                    type="button"
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hint */}
          <p className="text-sm text-text-dimmed">
            Open the DevTools panel at the bottom of the page to see your logs.
          </p>

          {/* Source code reference */}
          <details className="group rounded-xl border border-border-secondary bg-card-bg">
            <summary className="flex cursor-pointer list-none items-center gap-2 p-5 font-medium text-sm text-text-muted [&::-webkit-details-marker]:hidden">
              <ChevronRight className="transition-transform group-open:rotate-90" size={14} />
              How this playground works
            </summary>
            <div className="px-5 pb-5">
              <CodeBlock code={EXAMPLE_CODE} lang="tsx" />
            </div>
          </details>
        </div>
      ) : (
        <div className="text-text-muted">Initializing LogTape…</div>
      )}

      {/* TanStack Devtools */}
      <TanStackDevtools config={{ defaultOpen: false }} plugins={[devtoolsPlugin]} />
    </div>
  );
};
