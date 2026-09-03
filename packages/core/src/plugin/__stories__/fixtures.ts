import type { DevtoolsLogRecord } from "../../types";

let idCounter = 0;

export const makeRecord = (
  overrides: Partial<DevtoolsLogRecord> & Pick<DevtoolsLogRecord, "level">
): DevtoolsLogRecord => {
  idCounter += 1;
  return {
    caller: overrides.caller,
    category: overrides.category ?? ["app"],
    id: `story-log-${idCounter}`,
    level: overrides.level,
    message: overrides.message ?? [overrides.messageText ?? "Log message"],
    messageText: overrides.messageText ?? "Log message",
    properties: overrides.properties ?? {},
    timestamp: Date.now() - idCounter * 1000,
  };
};

export const traceRecord = makeRecord({
  caller: "router.ts:42:8",
  category: ["app", "router"],
  level: "trace",
  messageText: "Entering function renderPage",
  properties: { functionName: "renderPage" },
});

export const debugRecord = makeRecord({
  category: ["app", "cache"],
  level: "debug",
  messageText: "Cache lookup for key user:123",
  properties: { hit: false, key: "user:123" },
});

export const infoRecord = makeRecord({
  caller: "auth.ts:88:12",
  category: ["app", "auth"],
  level: "info",
  messageText: "User john_doe logged in",
  properties: { sessionId: "abc123", username: "john_doe" },
});

export const warningRecord = makeRecord({
  category: ["app", "api"],
  level: "warning",
  messageText: "Slow query detected: 950ms on users",
  properties: { ms: 950, table: "users" },
});

export const errorRecord = makeRecord({
  caller: "http.ts:201:5",
  category: ["lib", "http"],
  level: "error",
  messageText: "Failed to fetch /api/data: 500 Internal Server Error",
  properties: { status: 500, url: "/api/data" },
});

export const fatalRecord = makeRecord({
  category: ["app"],
  level: "fatal",
  messageText: "Application state corrupted, forcing restart",
  properties: { service: "state-manager" },
});

export const simpleInfoRecord = makeRecord({
  category: ["app", "ui"],
  level: "info",
  messageText: "Page loaded successfully",
});

export const debugNoCaller = makeRecord({
  category: ["app", "db"],
  level: "debug",
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
