import type { DevtoolsLogRecord } from "../../types";

let idCounter = 0;

export const makeRecord = (
  overrides: Partial<DevtoolsLogRecord> & Pick<DevtoolsLogRecord, "level">
): DevtoolsLogRecord => {
  idCounter += 1;
  return {
    id: `story-log-${idCounter}`,
    timestamp: Date.now() - idCounter * 1000,
    level: overrides.level,
    category: overrides.category ?? ["app"],
    message: overrides.message ?? [overrides.messageText ?? "Log message"],
    messageText: overrides.messageText ?? "Log message",
    properties: overrides.properties ?? {},
    caller: overrides.caller,
  };
};

export const traceRecord = makeRecord({
  level: "trace",
  category: ["app", "router"],
  messageText: "Entering function renderPage",
  properties: { functionName: "renderPage" },
  caller: "router.ts:42:8",
});

export const debugRecord = makeRecord({
  level: "debug",
  category: ["app", "cache"],
  messageText: "Cache lookup for key user:123",
  properties: { key: "user:123", hit: false },
});

export const infoRecord = makeRecord({
  level: "info",
  category: ["app", "auth"],
  messageText: "User john_doe logged in",
  properties: { username: "john_doe", sessionId: "abc123" },
  caller: "auth.ts:88:12",
});

export const warningRecord = makeRecord({
  level: "warning",
  category: ["app", "api"],
  messageText: "Slow query detected: 950ms on users",
  properties: { ms: 950, table: "users" },
});

export const errorRecord = makeRecord({
  level: "error",
  category: ["lib", "http"],
  messageText: "Failed to fetch /api/data: 500 Internal Server Error",
  properties: { url: "/api/data", status: 500 },
  caller: "http.ts:201:5",
});

export const fatalRecord = makeRecord({
  level: "fatal",
  category: ["app"],
  messageText: "Application state corrupted, forcing restart",
  properties: { service: "state-manager" },
});

export const simpleInfoRecord = makeRecord({
  level: "info",
  category: ["app", "ui"],
  messageText: "Page loaded successfully",
});

export const debugNoCaller = makeRecord({
  level: "debug",
  category: ["app", "db"],
  messageText: "Database connection established",
  properties: { host: "localhost", port: 5432 },
});

export const allLevelRecords: DevtoolsLogRecord[] = [
  traceRecord,
  debugRecord,
  infoRecord,
  warningRecord,
  errorRecord,
  fatalRecord,
];

export const typicalRecords: DevtoolsLogRecord[] = [
  simpleInfoRecord,
  debugNoCaller,
  infoRecord,
  debugRecord,
  warningRecord,
  traceRecord,
  errorRecord,
];
