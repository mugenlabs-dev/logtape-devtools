import type { Meta, StoryObj } from "@storybook/react";
import { expect } from "storybook/test";
import { debugNoCaller, errorRecord, infoRecord, simpleInfoRecord } from "../__stories__/fixtures";
import { theme } from "../theme";
import { LogDetail } from "./log-detail";

const meta: Meta<typeof LogDetail> = {
  title: "Components/LogDetail",
  component: LogDetail,
  decorators: [
    (Story) => (
      <div style={{ background: theme.colors.background, width: "100%" }}>
        <Story />
      </div>
    ),
  ],
  args: {
    record: infoRecord,
  },
};

export default meta;
type Story = StoryObj<typeof LogDetail>;

export const FullRecord: Story = {
  play: async ({ canvas, step }) => {
    await step("Verify all fields render", async () => {
      await canvas.findByTestId("log-detail");
      await expect(canvas.getByText("info")).toBeInTheDocument();
      await expect(canvas.getByText("app.auth")).toBeInTheDocument();
      await expect(canvas.getByText("auth.ts:88:12")).toBeInTheDocument();
      await expect(canvas.getByText("User john_doe logged in")).toBeInTheDocument();
    });
  },
};

export const WithCaller: Story = {
  args: { record: errorRecord },
  play: async ({ canvas, step }) => {
    await step("Verify caller renders", async () => {
      await expect(canvas.getByText("http.ts:201:5")).toBeInTheDocument();
    });
  },
};

export const WithoutProperties: Story = {
  args: { record: simpleInfoRecord },
  play: async ({ canvas, step }) => {
    await step("Verify no Data section when properties empty", async () => {
      await canvas.findByTestId("log-detail");
      await expect(canvas.getByText("Page loaded successfully")).toBeInTheDocument();
      // Data label should not be present when properties is empty
      const dataLabels = canvas.queryAllByText("Data");
      await expect(dataLabels).toHaveLength(0);
    });
  },
};

export const MinimalRecord: Story = {
  args: { record: debugNoCaller },
  play: async ({ canvas, step }) => {
    await step("Verify record without caller", async () => {
      await canvas.findByTestId("log-detail");
      await expect(canvas.getByText("debug")).toBeInTheDocument();
      await expect(canvas.getByText("app.db")).toBeInTheDocument();
      // No Caller row should appear
      const callerLabels = canvas.queryAllByText("Caller");
      await expect(callerLabels).toHaveLength(0);
    });
  },
};
