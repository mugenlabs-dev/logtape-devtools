import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { useCallback, useRef } from "react";
import { PACKAGE_NAME, SITE_URL } from "./content/site";
import { GradualBlur } from "./gradual-blur";
import { type AnimatedIconHandle, GithubIcon, PlayIcon } from "./icons";
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
  const isActive = pathname === to || (to === "/" && pathname === "/docs");

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

const GithubLink = () => {
  const iconRef = useRef<AnimatedIconHandle>(null);
  const start = useCallback(() => iconRef.current?.startAnimation(), []);
  const stop = useCallback(() => iconRef.current?.stopAnimation(), []);

  return (
    <a
      className="ml-2 flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-text-muted transition-colors hover:text-text-primary"
      href="https://github.com/mugenlabs-dev/logtape-devtools"
      onMouseEnter={start}
      onMouseLeave={stop}
      rel="noopener noreferrer"
      target="_blank"
    >
      <GithubIcon ref={iconRef} size={14} />
      <span className="hidden sm:inline">GitHub</span>
    </a>
  );
};

const footerLinkClass = "text-accent-light no-underline hover:underline";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isDocsPage = pathname === "/" || pathname === "/docs";

  return (
    <div className="min-h-screen">
      {/* Header */}
      <a
        className="sr-only z-[60] rounded-md bg-accent px-3 py-2 text-sm text-white focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
        href="#main-content"
      >
        Skip to content
      </a>
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
            <NavLink icon={PlayIcon} to="/playground">
              Playground
            </NavLink>
            <GithubLink />
            <ThemeToggle />
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-14" id="main-content">
        {children}
      </main>

      {/* Footer — extra bottom padding so links clear the fixed GradualBlur on docs */}
      <footer
        className={`border-border-primary border-t px-6 py-10 ${isDocsPage ? "pb-40" : "pb-16"}`}
      >
        <div className="mx-auto flex max-w-3xl flex-col gap-4 text-sm text-text-muted">
          <p className="m-0 font-mono text-text-secondary">{PACKAGE_NAME}</p>
          <p className="m-0">
            Mugenlabs open-source LogTape DevTools plugin. Documentation and playground for agents
            and humans.
          </p>
          <nav className="flex flex-wrap gap-x-4 gap-y-2">
            <Link className={footerLinkClass} to="/docs">
              Docs
            </Link>
            <Link className={footerLinkClass} to="/developers">
              Developers
            </Link>
            <Link className={footerLinkClass} to="/about">
              About
            </Link>
            <Link className={footerLinkClass} to="/contact">
              Contact
            </Link>
            <Link className={footerLinkClass} to="/privacy">
              Privacy
            </Link>
            <a className={footerLinkClass} href={`${SITE_URL}llms.txt`}>
              llms.txt
            </a>
            <a
              className={footerLinkClass}
              href="https://github.com/mugenlabs-dev/logtape-devtools"
              rel="noopener noreferrer"
              target="_blank"
            >
              GitHub
            </a>
          </nav>
        </div>
      </footer>

      {/* Blurred bottom fade — docs pages only */}
      {isDocsPage ? (
        <GradualBlur direction="bottom" height="120px" layers={5} maxBlur={10} />
      ) : null}
    </div>
  );
};
