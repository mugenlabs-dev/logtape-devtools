import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn } from "storybook/test";
import { errorRecord, infoRecord, simpleInfoRecord } from "../__stories__/fixtures";
import { theme } from "../theme";
import { LogRow } from "./log-row";

const meta: Meta<typeof LogRow> = {
  title: "Components/LogRow",
  component: LogRow,
  decorators: [
    (Story) => (
      <div style={{ background: theme.colors.background, width: "100%" }}>
        <Story />
      </div>
    ),
  ],
  args: {
    expanded: false,
    onToggle: fn(),
    record: infoRecord,
  },
};

export default meta;
type Story = StoryObj<typeof LogRow>;

export const Collapsed: Story = {
  play: async ({ canvas, step }) => {
    await step("Verify collapsed row", async () => {
      const row = await canvas.findByTestId("log-row");
      await expect(row).toBeInTheDocument();
      await expect(canvas.getByText("INF")).toBeInTheDocument();
      await expect(canvas.getByText("app.auth")).toBeInTheDocument();
      await expect(canvas.getByText("User john_doe logged in")).toBeInTheDocument();
    });
  },
};

export const Expanded: Story = {
  args: {
    expanded: true,
  },
  play: async ({ canvas, step }) => {
    await step("Verify expanded shows detail", async () => {
      await canvas.findByTestId("log-detail");
      await expect(canvas.getByText("info")).toBeInTheDocument();
      // Message appears in both the row and the detail, use getAllByText
      await expect(canvas.getAllByText("User john_doe logged in").length).toBeGreaterThan(0);
    });
  },
};

export const WithCaller: Story = {
  args: {
    expanded: true,
    record: infoRecord,
  },
  play: async ({ canvas, step }) => {
    await step("Verify caller is shown", async () => {
      await canvas.findByTestId("log-detail");
      // Caller appears in both the collapsed row and the detail pane
      await expect(canvas.getAllByText("auth.ts:88:12").length).toBeGreaterThan(0);
    });
  },
};

export const WithoutCaller: Story = {
  args: {
    expanded: true,
    record: simpleInfoRecord,
  },
  play: async ({ canvas, step }) => {
    await step("Verify no caller row when absent", async () => {
      await canvas.findByTestId("log-detail");
      await expect(canvas.queryByText("Caller")).not.toBeInTheDocument();
    });
  },
};

export const ErrorLevel: Story = {
  args: {
    record: errorRecord,
  },
  play: async ({ canvas, step }) => {
    await step("Verify error level badge", async () => {
      await expect(canvas.getByText("ERR")).toBeInTheDocument();
      await expect(canvas.getByText("lib.http")).toBeInTheDocument();
    });
  },
};
