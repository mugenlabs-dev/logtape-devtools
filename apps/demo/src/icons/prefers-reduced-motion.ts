/** Shared gate for lucide-animated / motion icon hover loops. */
export const shouldReduceMotion = (): boolean =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
