import { configure, getLogger, reset } from "@logtape/logtape";
import { createDevtoolsSink, createLogTapeDevtoolsPlugin } from "@mugenlabs/logtape-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { CodeBlock } from "../docs/code-block";

// --- Source code shown to the user ---
const EXAMPLE_CODE = `import { configure, getLogger } from "@logtape/logtape";
import { TanStackDevtools } from "@tanstack/react-devtools";
import {
  createDevtoolsSink,
  createLogTapeDevtoolsPlugin,
} from "@mugenlabs/logtape-devtools";

// 1. Configure LogTape with the devtools sink
//    This captures all log records and forwards them to the panel.
await configure({
  sinks: {
    devtools: createDevtoolsSink(),
  },
  loggers: [
    {
      category: [],          // [] = match all categories
      lowestLevel: "trace",  // capture every level
      sinks: ["devtools"],
    },
  ],
});

// 2. Use LogTape's getLogger to emit structured logs
//    Categories are arrays — e.g. ["app", "auth"] becomes "app.auth"
const logger = getLogger(["app", "auth"]);

logger.info("User {username} logged in", { username: "john_doe" });
logger.debug("Session token refreshed");
logger.error("Failed to fetch {url}: {status}", {
  url: "/api/data",
  status: 500,
});

// 3. Mount TanStack DevTools with the LogTape plugin
//    This renders the log viewer panel in your app.
function App() {
  return (
    <>
      <YourApp />
      <TanStackDevtools
        plugins={[createLogTapeDevtoolsPlugin()]}
      />
    </>
  );
}`;

// --- LogTape setup ---
let configured = false;

async function setupLogTape() {
  if (configured) {
    await reset();
  }
  await configure({
    sinks: {
      devtools: createDevtoolsSink({ experimentalCaptureStackTrace: true }),
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

function randomProps(): Record<string, unknown> {
  const props: Record<string, unknown> = {};
  const keys = [
    "userId",
    "username",
    "endpoint",
    "ms",
    "route",
    "key",
    "count",
    "url",
    "status",
    "statusText",
    "table",
    "current",
    "max",
    "component",
    "service",
    "i",
    "total",
  ];
  const count = Math.floor(Math.random() * 3) + 1;
  for (let n = 0; n < count; n++) {
    const key = randomItem(keys);
    if (
      key === "ms" ||
      key === "count" ||
      key === "current" ||
      key === "max" ||
      key === "status" ||
      key === "i" ||
      key === "total"
    ) {
      props[key] = Math.floor(Math.random() * 1000);
    } else if (key === "userId") {
      props[key] = `usr_${Math.random().toString(36).slice(2, 8)}`;
    } else {
      props[key] = randomItem([
        "users",
        "posts",
        "/api/data",
        "/dashboard",
        "AuthProvider",
        "redis-primary",
        "john_doe",
        "200",
        "500",
      ]);
    }
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
  const props = randomProps();

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
      const props = randomProps();
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
      <TanStackDevtools config={{ defaultOpen: false }} plugins={[createLogTapeDevtoolsPlugin()]} />
    </div>
  );
};
