import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-context";

const buttonClass =
  "ml-1 flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border-primary bg-bg-tertiary text-text-muted transition-[color,background,border-color] duration-150";

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className={buttonClass}
      onClick={toggleTheme}
      type="button"
    >
      {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
};
