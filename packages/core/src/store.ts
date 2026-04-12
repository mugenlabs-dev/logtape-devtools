import type { DevtoolsLogRecord } from "./types";

type Listener = () => void;

export interface LogStore {
  addRecord(record: DevtoolsLogRecord): void;
  clear(): void;
  getSnapshot(): DevtoolsLogRecord[];
  setMaxSize(size: number): void;
  subscribe(listener: Listener): () => void;
}

export function createLogStore(maxSize = 1000): LogStore {
  let records: DevtoolsLogRecord[] = [];
  let max = maxSize;
  const listeners = new Set<Listener>();

  function notify() {
    for (const listener of listeners) {
      listener();
    }
  }

  return {
    getSnapshot: () => records,
    addRecord: (record) => {
      // Create new array reference for useSyncExternalStore
      records = [...records, record];
      if (records.length > max) {
        records = records.slice(records.length - max);
      }
      notify();
    },
    clear: () => {
      records = [];
      notify();
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    setMaxSize: (size) => {
      max = size;
      if (records.length > max) {
        records = records.slice(records.length - max);
        notify();
      }
    },
  };
}

/** Default shared store instance used when no custom store is provided */
export const defaultLogStore = createLogStore();
