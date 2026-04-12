import type { Meta, StoryObj } from "@storybook/react";
import { expect, waitFor } from "storybook/test";
import { withLogStore, withPluginContainer } from "./__stories__/decorators";
import { allLevelRecords, typicalRecords } from "./__stories__/fixtures";
import { LogTapeDevtoolsPlugin } from "./logtape-devtools-plugin";

const meta: Meta<typeof LogTapeDevtoolsPlugin> = {
  title: "Plugin/LogTapeDevtoolsPlugin",
  component: LogTapeDevtoolsPlugin,
  decorators: [withPluginContainer],
};

export default meta;
type Story = StoryObj<typeof LogTapeDevtoolsPlugin>;

export const Default: Story = {
  decorators: [withLogStore(typicalRecords)],
  play: async ({ canvas, step }) => {
    await step("Verify initial render shows logs", async () => {
      await canvas.findByTestId("log-list");
      await canvas.findByTestId("toolbar");
      const rows = await canvas.findAllByTestId("log-row");
      await expect(rows.length).toBe(typicalRecords.length);
    });
    await step("Log count is displayed", async () => {
      await expect(canvas.getByText(`${typicalRecords.length}`)).toBeInTheDocument();
      await expect(canvas.getByText("logs")).toBeInTheDocument();
    });
  },
};

export const EmptyState: Story = {
  name: "Empty (No Logs)",
  decorators: [withLogStore([])],
  play: async ({ canvas, step }) => {
    await step("Verify empty state", async () => {
      await canvas.findByTestId("log-list-empty");
      await expect(canvas.getByText("No logs yet")).toBeInTheDocument();
    });
  },
};

export const AllLevels: Story = {
  name: "All Log Levels",
  decorators: [withLogStore(allLevelRecords)],
  play: async ({ canvas, step }) => {
    await step("Verify all level badges appear", async () => {
      // Use getAllByText since level text appears in both toolbar toggles and row badges
      await expect(canvas.getAllByText("TRC").length).toBeGreaterThan(0);
      await expect(canvas.getAllByText("DBG").length).toBeGreaterThan(0);
      await expect(canvas.getAllByText("INF").length).toBeGreaterThan(0);
      await expect(canvas.getAllByText("WRN").length).toBeGreaterThan(0);
      await expect(canvas.getAllByText("ERR").length).toBeGreaterThan(0);
      await expect(canvas.getAllByText("FTL").length).toBeGreaterThan(0);
    });
  },
};

export const PauseResume: Story = {
  decorators: [withLogStore(typicalRecords)],
  play: async ({ canvas, userEvent, step }) => {
    await step("Pause logs", async () => {
      const pauseBtn = canvas.getByRole("button", { name: /Pause/ });
      await userEvent.click(pauseBtn);
      await expect(canvas.getByRole("button", { name: /Resume/ })).toBeInTheDocument();
    });
    await step("Resume logs", async () => {
      const resumeBtn = canvas.getByRole("button", { name: /Resume/ });
      await userEvent.click(resumeBtn);
      await expect(canvas.getByRole("button", { name: /Pause/ })).toBeInTheDocument();
    });
  },
};

export const ClearLogs: Story = {
  decorators: [withLogStore(typicalRecords)],
  play: async ({ canvas, userEvent, step }) => {
    await step("Clear all logs", async () => {
      const rows = await canvas.findAllByTestId("log-row");
      await expect(rows.length).toBeGreaterThan(0);
      const clearBtn = canvas.getByRole("button", { name: /Clear/ });
      await userEvent.click(clearBtn);
      await waitFor(() => {
        expect(canvas.getByText("No logs yet")).toBeInTheDocument();
      });
    });
  },
};

export const FilterByLevel: Story = {
  decorators: [withLogStore(allLevelRecords)],
  play: async ({ canvas, userEvent, step }) => {
    await step("Filter to errors only", async () => {
      const errToggle = canvas.getByTestId("level-toggle-error");
      await userEvent.click(errToggle);
      await waitFor(() => {
        expect(canvas.getAllByTestId("log-row")).toHaveLength(1);
      });
      await expect(canvas.getAllByText("ERR").length).toBeGreaterThan(0);
    });
  },
};
