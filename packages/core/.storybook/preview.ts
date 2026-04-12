import type { Preview } from "@storybook/react";

const preview: Preview = {
  parameters: {
    layout: "fullscreen",
    backgrounds: {
      default: "dark",
      values: [{ name: "dark", value: "#1e1e1e" }],
    },
  },
};

export default preview;
