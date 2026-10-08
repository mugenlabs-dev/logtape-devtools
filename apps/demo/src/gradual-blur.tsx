import type { CSSProperties, ReactElement } from "react";

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
    const t = layers > 1 ? i / (layers - 1) : 0;
    const blur = t * t * maxBlur;
    const bandCenter = t * 100;
    const fadeWidth = (100 / layers) * 1.2;
    const maskDir = direction === "bottom" ? "to bottom" : "to top";

    layerElements.push(
      <div
        key={i}
        style={{
          backdropFilter: `blur(${blur}px)`,
          inset: 0,
          maskImage: `linear-gradient(${maskDir}, transparent ${Math.max(0, bandCenter - fadeWidth)}%, black ${bandCenter}%, black 100%)`,
          position: "absolute" as const,
          WebkitBackdropFilter: `blur(${blur}px)`,
          WebkitMaskImage: `linear-gradient(${maskDir}, transparent ${Math.max(0, bandCenter - fadeWidth)}%, black ${bandCenter}%, black 100%)`,
        }}
      />
    );
  }

  const gradientDir = direction === "bottom" ? "to bottom" : "to top";
  const edgeStyle: CSSProperties =
    direction === "bottom"
      ? { insetBlockEnd: 0, insetInline: 0 }
      : { insetBlockStart: 0, insetInline: 0 };

  return (
    <div
      style={{
        ...edgeStyle,
        background: `linear-gradient(${gradientDir}, transparent 0%, var(--bg-primary) 100%)`,
        height,
        isolation: "isolate",
        pointerEvents: "none",
        position: "fixed",
        zIndex: 40,
      }}
    >
      {layerElements}
    </div>
  );
};
