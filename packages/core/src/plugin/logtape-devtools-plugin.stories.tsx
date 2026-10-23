import type { Meta, StoryObj } from "@storybook/react";
import { expect, waitFor, within } from "storybook/test";
import { getActiveStoryStore, withLogStore, withPluginContainer } from "./__stories__/decorators";
import { allLevelRecords, makeRecord, typicalRecords } from "./__stories__/fixtures";
import { LogTapeDevtoolsPlugin } from "./logtape-devtools-plugin";

const meta: Meta<typeof LogTapeDevtoolsPlugin> = {
  component: LogTapeDevtoolsPlugin,
  decorators: [withPluginContainer],
  title: "Plugin/LogTapeDevtoolsPlugin",
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
  decorators: [withLogStore([])],
  name: "Empty (No Logs)",
  play: async ({ canvas, step }) => {
    await step("Verify empty state", async () => {
      await canvas.findByTestId("log-list-empty");
      await expect(canvas.getByText("No logs yet")).toBeInTheDocument();
    });
  },
};

export const AllLevels: Story = {
  decorators: [withLogStore(allLevelRecords)],
  name: "All Log Levels",
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
    await step("Emit while paused does not change visible rows", async () => {
      const before = canvas.getAllByTestId("log-row").length;
      getActiveStoryStore().addRecord(
        makeRecord({
          category: ["pause", "test"],
          level: "info",
          messageText: "emitted-while-paused-unique",
        })
      );
      // Store notifies on a microtask; the paused panel must ignore it.
      await new Promise((resolve) => setTimeout(resolve, 50));
      await expect(canvas.getAllByTestId("log-row")).toHaveLength(before);
      await expect(canvas.queryByText("emitted-while-paused-unique")).not.toBeInTheDocument();
    });
    await step("Paused panel still counts as a listener, so callers are captured", async () => {
      await expect(getActiveStoryStore().hasListeners()).toBe(true);
    });
    await step("Resume shows logs emitted while paused", async () => {
      const resumeBtn = canvas.getByRole("button", { name: /Resume/ });
      await userEvent.click(resumeBtn);
      await expect(canvas.getByRole("button", { name: /Pause/ })).toBeInTheDocument();
      await waitFor(() => {
        expect(canvas.getByText("emitted-while-paused-unique")).toBeInTheDocument();
      });
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

export const ClearKeepsCategoryFilter: Story = {
  decorators: [withLogStore(typicalRecords)],
  name: "Clear Keeps Category Filter Visible",
  play: async ({ canvas, userEvent, step }) => {
    await step("Select a category", async () => {
      await userEvent.type(canvas.getByTestId("category-input"), "lib.http");
      const body = within(document.body);
      await userEvent.click(await body.findByRole("option", { name: "lib.http" }));
      await expect(canvas.getByTitle("Remove lib.http")).toBeInTheDocument();
    });
    await step("Clear keeps the active filter's chip", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /Clear/ }));
      await waitFor(() => {
        expect(canvas.getByText("No logs yet")).toBeInTheDocument();
      });
      await expect(canvas.getByTitle("Remove lib.http")).toBeInTheDocument();
    });
    await step("The chip can still be removed", async () => {
      await userEvent.click(canvas.getByTitle("Remove lib.http"));
      await expect(canvas.queryByTitle("Remove lib.http")).not.toBeInTheDocument();
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

export const CollapsedSidebarIsInert: Story = {
  decorators: [withLogStore(typicalRecords)],
  name: "Collapsed Sidebar Is Inert",
  play: async ({ canvas, userEvent, step }) => {
    const sidebar = canvas.getByTestId("logtape-sidebar");
    await step("Open sidebar is reachable", async () => {
      await expect(sidebar.inert).toBe(false);
    });
    await step("Hiding the controls takes them out of the Tab order", async () => {
      await userEvent.click(canvas.getByRole("button", { name: /Hide controls/ }));
      await waitFor(() => expect(sidebar.inert).toBe(true));
      // Shift+Tab from the toggle would land on the search box if it were reachable.
      await userEvent.tab({ shift: true });
      await expect(sidebar.contains(document.activeElement)).toBe(false);
      await userEvent.click(canvas.getByRole("button", { name: /Show controls/ }));
      await waitFor(() => expect(sidebar.inert).toBe(false));
    });
  },
};
