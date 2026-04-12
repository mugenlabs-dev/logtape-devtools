import type { Meta, StoryObj } from "@storybook/react";
import { expect } from "storybook/test";
import { theme } from "../theme";
import { LevelBadge } from "./level-badge";

const meta: Meta<typeof LevelBadge> = {
  title: "Components/LevelBadge",
  component: LevelBadge,
  decorators: [
    (Story) => (
      <div style={{ background: theme.colors.background, padding: "20px" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof LevelBadge>;

export const Trace: Story = {
  args: { level: "trace" },
  play: async ({ canvas, step }) => {
    await step("Verify trace badge", async () => {
      await expect(canvas.getByText("TRC")).toBeInTheDocument();
    });
  },
};

export const Debug: Story = {
  args: { level: "debug" },
  play: async ({ canvas, step }) => {
    await step("Verify debug badge", async () => {
      await expect(canvas.getByText("DBG")).toBeInTheDocument();
    });
  },
};

export const Info: Story = {
  args: { level: "info" },
  play: async ({ canvas, step }) => {
    await step("Verify info badge", async () => {
      await expect(canvas.getByText("INF")).toBeInTheDocument();
    });
  },
};

export const Warning: Story = {
  args: { level: "warning" },
  play: async ({ canvas, step }) => {
    await step("Verify warning badge", async () => {
      await expect(canvas.getByText("WRN")).toBeInTheDocument();
    });
  },
};

export const ErrorLevel: Story = {
  args: { level: "error" },
  play: async ({ canvas, step }) => {
    await step("Verify error badge", async () => {
      await expect(canvas.getByText("ERR")).toBeInTheDocument();
    });
  },
};

export const Fatal: Story = {
  args: { level: "fatal" },
  play: async ({ canvas, step }) => {
    await step("Verify fatal badge", async () => {
      await expect(canvas.getByText("FTL")).toBeInTheDocument();
    });
  },
};
