import type { LogRecord } from "@logtape/logtape";
import { createLogTapeDevtools } from "./create-logtape-devtools";
import { createLogStore } from "./store";

function makeLogRecord(overrides: Partial<LogRecord> = {}): LogRecord {
  return {
    category: ["test"],
    level: "info",
    message: ["hello"],
    properties: {},
    rawMessage: "hello",
    timestamp: Date.now(),
    ...overrides,
  };
}

function storeOf(plugin: { render: unknown }) {
  return (plugin.render as { props: { store: unknown } }).props.store;
}

describe("createLogTapeDevtools", () => {
  it("returns a sink and a plugin", () => {
    const { sink, plugin } = createLogTapeDevtools();
    expect(typeof sink).toBe("function");
    expect(plugin.id).toBe("logtape-devtools-plugin");
  });

  it("wires the sink and the plugin to the same custom store", () => {
    const store = createLogStore();
    const { sink, plugin } = createLogTapeDevtools({ store });

    sink(makeLogRecord({ message: ["wired"] }));

    expect(storeOf(plugin)).toBe(store);
    expect(store.getSnapshot()).toHaveLength(1);
    expect(store.getSnapshot()[0].messageText).toBe("wired");
  });

  it("forwards plugin options", () => {
    const store = createLogStore();
    const { plugin } = createLogTapeDevtools({
      plugin: { defaultOpen: false, name: "Logs" },
      store,
    });

    expect(plugin.defaultOpen).toBe(false);
    expect(plugin.name).toBe("Logs");
  });

  it("forwards sink options", () => {
    const store = createLogStore();
    const hasListeners = vi.spyOn(store, "hasListeners");
    const { sink } = createLogTapeDevtools({ sink: { captureStackTrace: false }, store });

    sink(makeLogRecord());

    expect(hasListeners).not.toHaveBeenCalled();
    expect(store.getSnapshot()[0].caller).toBeUndefined();
  });

  it("cannot have its store overridden by the nested option objects", () => {
    const store = createLogStore();
    const other = createLogStore();
    const { sink, plugin } = createLogTapeDevtools({
      plugin: { store: other } as never,
      sink: { store: other } as never,
      store,
    });

    sink(makeLogRecord());

    expect(storeOf(plugin)).toBe(store);
    expect(store.getSnapshot()).toHaveLength(1);
    expect(other.getSnapshot()).toHaveLength(0);
  });
});
