import { ClipboardList } from "lucide-react";
import type { ComponentType } from "react";

import { BrainIcon, PauseIcon, SearchIcon, SlidersHorizontalIcon, ZapIcon } from "../icons";
import {
  BoundedMemoryDemo,
  CategorySearchDemo,
  LevelFilterDemo,
  LiveStreamDemo,
  PauseResumeDemo,
  StructuredInspectionDemo,
} from "./feature-demos";

const FEATURES: {
  demo: ComponentType;
  description: string;
  icon: ComponentType<{ size: number }>;
  title: string;
}[] = [
  {
    demo: LiveStreamDemo,
    description:
      "Watch logs appear in real time as your application runs. No more switching between browser console and your app.",
    icon: ZapIcon,
    title: "Live Log Stream",
  },
  {
    demo: LevelFilterDemo,
    description:
      "Filter logs by severity level — trace, debug, info, warning, error, fatal. Focus on what matters.",
    icon: SlidersHorizontalIcon,
    title: "Level Filtering",
  },
  {
    demo: CategorySearchDemo,
    description:
      "Filter by category prefix and search across log messages. Find the needle in the haystack.",
    icon: SearchIcon,
    title: "Category Search",
  },
  {
    demo: StructuredInspectionDemo,
    description:
      "Click any log entry to expand and inspect the full payload, including structured properties and metadata.",
    icon: ClipboardList,
    title: "Structured Inspection",
  },
  {
    demo: PauseResumeDemo,
    description:
      "Pause the live stream to inspect logs without them scrolling away. Resume when you're ready.",
    icon: PauseIcon,
    title: "Pause & Resume",
  },
  {
    demo: BoundedMemoryDemo,
    description:
      "A configurable buffer keeps memory usage under control. Old logs are dropped automatically.",
    icon: BrainIcon,
    title: "Bounded Memory",
  },
];

export const FeaturesSection = () => (
  <section className="mx-auto max-w-4xl px-6 pb-24">
    <div className="flex flex-col gap-14">
      {FEATURES.map((feature, index) => (
        <div
          className="grid grid-cols-1 items-center gap-6 lg:grid-cols-2 lg:gap-12"
          key={feature.title}
        >
          <div className={index % 2 === 1 ? "lg:order-2" : ""}>
            <div className="mb-2 flex items-center gap-2.5 text-accent-light">
              <feature.icon size={20} />
              <h3 className="m-0 font-semibold text-[17px] text-text-primary">{feature.title}</h3>
            </div>
            <p className="m-0 text-sm text-text-muted leading-relaxed">{feature.description}</p>
          </div>
          <div className={index % 2 === 1 ? "lg:order-1" : ""}>
            <feature.demo />
          </div>
        </div>
      ))}
    </div>
  </section>
);
