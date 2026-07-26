import { useCallback, useRef } from "react";
import { type AnimatedIconHandle, MoonIcon, SunIcon } from "./icons";
import { useTheme } from "./theme-context";

const buttonClass =
  "ml-1 flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border-primary bg-bg-tertiary text-text-muted transition-[color,background,border-color] duration-150";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const iconRef = useRef<AnimatedIconHandle>(null);
  const start = useCallback(() => iconRef.current?.startAnimation(), []);
  const stop = useCallback(() => iconRef.current?.stopAnimation(), []);

  return (
    <button
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className={buttonClass}
      onClick={toggleTheme}
      onMouseEnter={start}
      onMouseLeave={stop}
      type="button"
    >
      {theme === "dark" ? (
        <SunIcon ref={iconRef} size={15} />
      ) : (
        <MoonIcon ref={iconRef} size={15} />
      )}
    </button>
  );
};
