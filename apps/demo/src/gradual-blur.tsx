import type { ReactElement } from "react";

interface GradualBlurProps {
  direction?: "top" | "bottom";
  height?: string;
  layers?: number;
  maxBlur?: number;
}

export const GradualBlur = ({
  layers = 8,
  maxBlur = 8,
  height = "140px",
  direction = "bottom",
}: GradualBlurProps) => {
  const layerElements: ReactElement[] = [];

  for (let i = 0; i < layers; i += 1) {
    const t = i / (layers - 1);
    const blur = t * t * maxBlur;
    const bandCenter = t * 100;
    const fadeWidth = (100 / layers) * 1.2;
    const maskDir = direction === "bottom" ? "to bottom" : "to top";

    layerElements.push(
      <div
        key={i}
        style={{
          WebkitBackdropFilter: `blur(${blur}px)`,
          WebkitMaskImage: `linear-gradient(${maskDir}, transparent ${Math.max(0, bandCenter - fadeWidth)}%, black ${bandCenter}%, black 100%)`,
          backdropFilter: `blur(${blur}px)`,
          inset: 0,
          maskImage: `linear-gradient(${maskDir}, transparent ${Math.max(0, bandCenter - fadeWidth)}%, black ${bandCenter}%, black 100%)`,
          position: "absolute" as const,
        }}
      />
    );
  }

  const gradientDir = direction === "bottom" ? "to bottom" : "to top";

  return (
    <div
      style={{
        [direction]: 0,
        background: `linear-gradient(${gradientDir}, transparent 0%, var(--bg-primary, #0a0a0a) 100%)`,
        height,
        isolation: "isolate",
        left: 0,
        pointerEvents: "none",
        position: "fixed",
        right: 0,
        zIndex: 40,
      }}
    >
      {layerElements}
    </div>
  );
};
