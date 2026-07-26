import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, Github, Play } from "lucide-react";
import { GradualBlur } from "./gradual-blur";
import { ThemeToggle } from "./theme-toggle";

const NavLink = ({
  to,
  icon: Icon,
  children,
}: {
  to: string;
  icon: React.ComponentType<{ size: number }>;
  children: React.ReactNode;
}) => {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = pathname === to;

  return (
    <Link
      className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium text-sm transition-colors ${
        isActive
          ? "bg-accent/15 text-accent-light"
          : "text-text-muted hover:bg-white/5 hover:text-text-primary"
      }`}
      to={to}
    >
      <Icon size={14} />
      <span className="hidden sm:inline">{children}</span>
    </Link>
  );
};

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isDocsPage = pathname === "/";

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 right-0 left-0 z-50 border-border-primary border-b bg-header-bg backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <Link className="flex items-center gap-2 font-semibold text-text-primary" to="/">
            <img
              alt="LogTape DevTools"
              className="size-7 rounded-md"
              height={28}
              src="/logo-192.png"
              width={28}
            />
            <span>LogTape DevTools</span>
          </Link>
          <nav className="flex items-center gap-1">
            <NavLink icon={BookOpen} to="/">
              Docs
            </NavLink>
            <NavLink icon={Play} to="/playground">
              Playground
            </NavLink>
            <a
              className="ml-2 flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-text-muted transition-colors hover:text-text-primary"
              href="https://github.com/mugenlabs-dev/logtape-devtools"
              rel="noopener noreferrer"
              target="_blank"
            >
              <Github size={14} />
              <span className="hidden sm:inline">GitHub</span>
            </a>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-14">{children}</main>

      {/* Blurred bottom fade — docs page only */}
      {isDocsPage && <GradualBlur direction="bottom" height="120px" layers={5} maxBlur={10} />}
    </div>
  );
};
