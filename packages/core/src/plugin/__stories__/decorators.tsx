import type { Decorator } from "@storybook/react";
import { useEffect, useRef } from "react";
import { createLogStore } from "../../store";
import type { DevtoolsLogRecord } from "../../types";
import { theme } from "../theme";

export const withLogStore = (records: DevtoolsLogRecord[] = []): Decorator => {
  return (Story, context) => {
    const storeRef = useRef(createLogStore());

    useEffect(() => {
      const store = storeRef.current;
      for (const record of records) {
        store.addRecord(record);
      }
      return () => {
        store.clear();
      };
    }, []);

    return <Story args={{ ...context.args, store: storeRef.current }} />;
  };
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
