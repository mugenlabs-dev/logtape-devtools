import type { Meta, StoryObj } from "@storybook/react";
import { expect, fn } from "storybook/test";
import { theme } from "../theme";
import { Toolbar } from "./toolbar";

const meta: Meta<typeof Toolbar> = {
  title: "Components/Toolbar",
  component: Toolbar,
  decorators: [
    (Story) => (
      <div style={{ background: theme.colors.background, width: "200px" }}>
        <Story />
      </div>
    ),
  ],
  args: {
    categories: ["app", "app.auth", "app.db", "lib.http"],
    categoryFilter: [],
    filteredCount: 5,
    levelFilter: new Set(),
    onCategoryFilterChange: fn(),
    onClear: fn(),
    onLevelFilterChange: fn(),
    onPause: fn(),
    onResume: fn(),
    onSearchTextChange: fn(),
    paused: false,
    searchText: "",
    totalCount: 5,
  },
};

export default meta;
type Story = StoryObj<typeof Toolbar>;

export const Default: Story = {
  play: async ({ canvas, step }) => {
    await step("Verify toolbar renders", async () => {
      await canvas.findByTestId("toolbar");
      await expect(canvas.getByRole("button", { name: /Pause/ })).toBeInTheDocument();
      await expect(canvas.getByRole("button", { name: /Clear/ })).toBeInTheDocument();
      await expect(canvas.getByText("5")).toBeInTheDocument();
      await expect(canvas.getByText("logs")).toBeInTheDocument();
    });
  },
};

export const LevelToggle: Story = {
  play: async ({ canvas, userEvent, step, args }) => {
    await step("Click a level toggle", async () => {
      const errToggle = canvas.getByTestId("level-toggle-error");
      await userEvent.click(errToggle);
      await expect(args.onLevelFilterChange).toHaveBeenCalledTimes(1);
    });
  },
};

export const SearchFilter: Story = {
  play: async ({ canvas, userEvent, step, args }) => {
    await step("Type in search input", async () => {
      const searchInput = canvas.getByTestId("search-input");
      await userEvent.type(searchInput, "error");
      // Wait for the 200ms debounce to fire
      await new Promise((resolve) => setTimeout(resolve, 300));
      await expect(args.onSearchTextChange).toHaveBeenCalled();
    });
  },
};

export const CategoryCombobox: Story = {
  play: async ({ canvas, step }) => {
    await step("Verify category combobox renders", async () => {
      const categoryInput = canvas.getByTestId("category-input");
      await expect(categoryInput).toBeInTheDocument();
      await expect(categoryInput.getAttribute("placeholder")).toBe("Category…");
    });
  },
};

export const PauseResume: Story = {
  play: async ({ canvas, userEvent, step, args }) => {
    await step("Click pause button", async () => {
      const pauseBtn = canvas.getByRole("button", { name: /Pause/ });
      await userEvent.click(pauseBtn);
      await expect(args.onPause).toHaveBeenCalledTimes(1);
    });
  },
};
