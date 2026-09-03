import type { Preview } from "@storybook/react";

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: "dark",
      values: [{ name: "dark", value: "#1e1e1e" }],
    },
    layout: "fullscreen",
  },
};

export default preview;
