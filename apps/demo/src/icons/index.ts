// Animated icon components vendored from https://lucide-animated.com/
// (shadcn registry — fetched from https://lucide-animated.com/r/<name>.json).
// The only local adjustments are dropping the "use client" directive and the
// `@/lib/utils` `cn` import, which this app does not have.

export { ArrowUpIcon } from "./arrow-up";
export { BrainIcon } from "./brain";
export { CheckIcon } from "./check";
export { ChevronRightIcon } from "./chevron-right";
export { CopyIcon } from "./copy";
export { GithubIcon } from "./github";
export { MoonIcon } from "./moon";
export { PauseIcon } from "./pause";
export { PlayIcon } from "./play";
export { RotateCCWIcon } from "./rotate-ccw";
export { SearchIcon } from "./search";
export { SlidersHorizontalIcon } from "./sliders-horizontal";
export { SunIcon } from "./sun";
export { ZapIcon } from "./zap";

/**
 * Shared shape of the imperative handle every animated icon exposes. Attaching
 * a ref switches the icon to controlled mode, so the animation can be driven
 * from the hover state of a parent button/link instead of the icon itself.
 */
export interface AnimatedIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}
