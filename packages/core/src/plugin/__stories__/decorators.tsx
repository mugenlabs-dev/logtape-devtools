import type { Decorator } from "@storybook/react";
import { useEffect, useRef } from "react";
import { createLogStore, type LogStore } from "../../store";
import type { DevtoolsLogRecord } from "../../types";
import { theme } from "../theme";

/** Store most recently wired by {@link withLogStore} (for Storybook play steps). */
let activeStoryStore: LogStore | null = null;

/** Returns the store created by the active `withLogStore` decorator. */
export function getActiveStoryStore(): LogStore {
  if (!activeStoryStore) {
    throw new Error("No active story LogStore — wrap the story with withLogStore()");
  }
  return activeStoryStore;
}

export const withLogStore =
  (records: DevtoolsLogRecord[] = []): Decorator =>
  (Story, context) => {
    const storeRef = useRef(createLogStore());
    activeStoryStore = storeRef.current;

    useEffect(() => {
      const store = storeRef.current;
      for (const record of records) {
        store.addRecord(record);
      }
      return () => {
        store.clear();
        if (activeStoryStore === store) {
          activeStoryStore = null;
        }
      };
    }, []);

    return <Story args={{ ...context.args, store: storeRef.current }} />;
  };

export const withPluginContainer: Decorator = (Story) => (
  <div
    style={{
      background: theme.colors.background,
      color: theme.colors.textPrimary,
      fontFamily: theme.fontFamily.sans,
      height: "500px",
      width: "100%",
    }}
  >
    <Story />
  </div>
);
