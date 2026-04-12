import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn } from "storybook/test";
import { allLevelRecords, makeRecord } from "../__stories__/fixtures";
import { theme } from "../theme";
import { LogList } from "./log-list";

const meta: Meta<typeof LogList> = {
  title: "Components/LogList",
  component: LogList,
  decorators: [
    (Story) => (
      <div
        style={{
          background: theme.colors.background,
          display: "flex",
          flexDirection: "column",
          height: "400px",
          width: "100%",
        }}
      >
        <Story />
      </div>
    ),
  ],
  args: {
    autoScroll: true,
    expandedId: null,
    onToggle: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof LogList>;

export const WithLogs: Story = {
  args: {
    records: allLevelRecords,
  },
  play: async ({ canvas, step }) => {
    await step("Verify log rows render", async () => {
      const rows = await canvas.findAllByTestId("log-row");
      await expect(rows).toHaveLength(6);
    });
  },
};

export const Empty: Story = {
  args: {
    records: [],
  },
  play: async ({ canvas, step }) => {
    await step("Verify empty state", async () => {
      await canvas.findByTestId("log-list-empty");
      await expect(canvas.getByText("No logs yet")).toBeInTheDocument();
    });
  },
};

export const ManyLogs: Story = {
  args: {
    records: Array.from({ length: 50 }, (_, i) =>
      makeRecord({
        level: (["trace", "debug", "info", "warning", "error", "fatal"] as const)[i % 6],
        messageText: `Log entry ${i + 1}`,
      })
    ),
  },
  play: async ({ canvas, step }) => {
    await step("Verify many rows render", async () => {
      const rows = await canvas.findAllByTestId("log-row");
      await expect(rows).toHaveLength(50);
    });
  },
};
