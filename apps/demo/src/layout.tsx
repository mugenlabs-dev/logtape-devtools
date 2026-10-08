import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { useCallback, useRef } from "react";
import { SITE_URL } from "./content/site";
import { GradualBlur } from "./gradual-blur";
import { type AnimatedIconHandle, GithubIcon, PlayIcon } from "./icons";
import { PackageName } from "./package-name";
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
      className={`lt-nav-link lt-control flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium text-sm ${
        isActive ? "bg-accent/15 text-accent-light" : "text-text-muted"
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
      className="lt-nav-link--muted lt-control flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-text-muted"
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

const footerLinkClass = "lt-footer-link text-accent-light no-underline";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isDocsPage = pathname === "/" || pathname === "/docs";

  return (
    <div className="min-h-svh">
      {/* Header */}
      <a className="lt-skip-link sr-only z-[60] bg-accent text-sm text-white" href="#main-content">
        Skip to content
      </a>
      <header className="lt-site-header border-border-primary border-b bg-header-bg backdrop-blur-md">
        <div className="content-grid content-grid--header">
          <div className="flex items-center justify-between py-3">
            <Link
              className="flex shrink-0 items-center gap-2 font-semibold text-text-primary"
              to="/"
            >
              <img
                alt="LogTape DevTools"
                className="size-7 shrink-0 rounded-md"
                height={28}
                src="/logo-192.png"
                width={28}
              />
              <span>LogTape DevTools</span>
            </Link>
            <nav className="lt-icon-nav shrink-0">
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
        </div>
      </header>

      {/* Main content — pt matches --header-block-size / scroll-padding */}
      <main className="pt-14" id="main-content">
        {children}
      </main>

      {/* Footer — extra bottom padding so links clear the fixed GradualBlur on docs */}
      <footer className={`border-border-primary border-t py-10 ${isDocsPage ? "pb-40" : "pb-16"}`}>
        <div className="content-grid">
          <div className="flex flex-col gap-4 text-sm text-text-muted">
            <p className="m-0 font-mono text-text-secondary">
              <PackageName />
            </p>
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
        </div>
      </footer>

      {/* Blurred bottom fade — docs pages only */}
      {isDocsPage ? (
        <GradualBlur direction="bottom" height="120px" layers={5} maxBlur={10} />
      ) : null}
    </div>
  );
};
