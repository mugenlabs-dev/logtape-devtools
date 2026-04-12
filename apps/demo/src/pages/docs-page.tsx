import { Link } from "@tanstack/react-router";
import {
  ArrowUp,
  BookOpen,
  Brain,
  ClipboardList,
  Pause,
  Search,
  SlidersHorizontal,
  Zap,
} from "lucide-react";
import { type ComponentType, useCallback, useEffect, useState } from "react";
import { CodeBlock } from "../docs/code-block";
import { InstallBlock } from "../docs/install-block";
import { PmProvider } from "../docs/pm-context";
import { SectionTitle } from "../docs/section-title";

const SINK_CODE = `import { configure } from "@logtape/logtape";
import { createDevtoolsSink } from "@mugenlabs/logtape-devtools";

await configure({
  sinks: {
    devtools: createDevtoolsSink(),
  },
  loggers: [
    {
      category: ["app"],
      lowestLevel: "debug",
      sinks: ["devtools"],
    },
  ],
});`;

const PLUGIN_CODE = `import { TanStackDevtools } from "@tanstack/react-devtools";
import { createLogTapeDevtoolsPlugin } from "@mugenlabs/logtape-devtools";

function App() {
  return (
    <>
      <YourApp />
      <TanStackDevtools
        plugins={[createLogTapeDevtoolsPlugin()]}
      />
    </>
  );
}`;

const features: { description: string; icon: ComponentType<{ size: number }>; title: string }[] = [
  {
    title: "Live Log Stream",
    description:
      "Watch logs appear in real time as your application runs. No more switching between browser console and your app.",
    icon: Zap,
  },
  {
    title: "Level Filtering",
    description:
      "Filter logs by severity level — trace, debug, info, warning, error, fatal. Focus on what matters.",
    icon: SlidersHorizontal,
  },
  {
    title: "Category Search",
    description:
      "Filter by category prefix and search across log messages. Find the needle in the haystack.",
    icon: Search,
  },
  {
    title: "Structured Inspection",
    description:
      "Click any log entry to expand and inspect the full payload, including structured properties and metadata.",
    icon: ClipboardList,
  },
  {
    title: "Pause & Resume",
    description:
      "Pause the live stream to inspect logs without them scrolling away. Resume when you're ready.",
    icon: Pause,
  },
  {
    title: "Bounded Memory",
    description:
      "A configurable buffer keeps memory usage under control. Old logs are dropped automatically.",
    icon: Brain,
  },
];

const FloatingButtons = () => {
  const [showDocs, setShowDocs] = useState(true);
  const [showTop, setShowTop] = useState(false);

  const update = useCallback(() => {
    const el = document.querySelector("#installation");
    if (!el) {
      return;
    }
    const rect = el.getBoundingClientRect();
    const belowViewport = rect.top > window.innerHeight;
    setShowDocs(belowViewport);
    setShowTop(!belowViewport && window.scrollY > 200);
  }, []);

  useEffect(() => {
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [update]);

  const scrollToDocs = useCallback(() => {
    document.querySelector("#installation")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ behavior: "smooth", top: 0 });
  }, []);

  return (
    <>
      {/* Scroll to documentation */}
      <div className="pointer-events-none fixed inset-x-0 bottom-8 z-50 flex justify-center">
        <button
          className="pointer-events-auto flex items-center gap-2 rounded-full border border-accent/30 bg-bg-primary/80 px-5 py-2.5 font-medium text-accent-light text-sm shadow-lg backdrop-blur-md transition-all hover:border-accent/50 hover:bg-bg-primary/90"
          onClick={scrollToDocs}
          style={{
            opacity: showDocs ? 1 : 0,
            pointerEvents: showDocs ? "auto" : "none",
            transform: showDocs ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.3s, transform 0.3s",
          }}
          type="button"
        >
          <BookOpen size={14} />
          Go to Documentation
        </button>
      </div>

      {/* Scroll to top */}
      <div className="pointer-events-none fixed inset-x-0 bottom-8 z-50 mx-auto flex max-w-5xl justify-end px-6">
        <button
          className="pointer-events-auto flex size-10 items-center justify-center rounded-full border border-border-secondary bg-bg-primary/80 text-text-muted shadow-md backdrop-blur-md transition-all hover:border-accent/40 hover:text-accent-light"
          onClick={scrollToTop}
          style={{
            opacity: showTop ? 1 : 0,
            pointerEvents: showTop ? "auto" : "none",
            transform: showTop ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.3s, transform 0.3s",
          }}
          title="Scroll to top"
          type="button"
        >
          <ArrowUp size={16} />
        </button>
      </div>
    </>
  );
};

export const DocsPage = () => (
  <div className="text-text-secondary">
    {/* Hero */}
    <section className="relative overflow-hidden py-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.08),transparent_70%)]" />
      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border-secondary bg-bg-secondary px-4 py-1.5 text-sm text-text-muted">
          <span className="size-2 rounded-full bg-accent-green" />
          Built for{" "}
          <a
            className="text-text-primary underline decoration-border-secondary underline-offset-2 transition-colors hover:decoration-accent"
            href="https://logtape.org"
            rel="noopener noreferrer"
            target="_blank"
          >
            LogTape
          </a>
          {" & "}
          <a
            className="text-text-primary underline decoration-border-secondary underline-offset-2 transition-colors hover:decoration-accent"
            href="https://tanstack.com/devtools"
            rel="noopener noreferrer"
            target="_blank"
          >
            TanStack DevTools
          </a>
        </div>
        <div className="mb-6 flex flex-col items-center gap-4">
          <img alt="" className="size-24 rounded-2xl" height={96} src="/logo-192.png" width={96} />
          <h1 className="font-bold text-5xl text-text-primary leading-tight tracking-tight">
            LogTape DevTools
          </h1>
        </div>
        <p className="mx-auto mb-10 max-w-xl text-lg text-text-muted leading-relaxed">
          A TanStack DevTools plugin that brings your LogTape logs into a dedicated, filterable
          panel. See everything your app is logging without leaving DevTools.
        </p>
        <div className="flex justify-center gap-4">
          <a
            className="rounded-lg bg-accent px-6 py-3 font-semibold text-white transition-colors hover:bg-accent-light"
            href="#installation"
          >
            Get Started
          </a>
          <Link
            className="rounded-lg border border-border-secondary bg-bg-secondary px-6 py-3 font-semibold text-text-primary transition-colors hover:border-accent/40 hover:bg-bg-tertiary"
            to="/playground"
          >
            Try Playground
          </Link>
        </div>
      </div>
    </section>

    {/* Features */}
    <section className="mx-auto max-w-5xl px-6 pb-24">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <div
            className="rounded-xl border border-border-primary bg-card-bg p-6 transition-colors hover:border-border-secondary"
            key={f.title}
          >
            <div className="mb-3 text-accent-light">
              <f.icon size={24} />
            </div>
            <h3 className="mb-2 font-semibold text-text-primary">{f.title}</h3>
            <p className="text-sm text-text-muted leading-relaxed">{f.description}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Docs content */}
    <div className="mx-auto max-w-3xl px-6 pb-40">
      {/* Installation */}
      <section className="mb-16" id="installation">
        <SectionTitle id="install" subtitle="Add to your project as a dev dependency">
          Installation
        </SectionTitle>

        <PmProvider>
          <div className="space-y-6">
            <div>
              <h3 className="mb-3 font-medium text-sm text-text-muted">
                Install logtape-devtools:
              </h3>
              <InstallBlock packages="@mugenlabs/logtape-devtools" />
            </div>

            <div>
              <h3 className="mb-3 font-medium text-sm text-text-muted">
                Or install everything at once (including peer dependencies):
              </h3>
              <InstallBlock packages="@mugenlabs/logtape-devtools @logtape/logtape @tanstack/react-devtools" />
            </div>
          </div>
        </PmProvider>
      </section>

      {/* Quick Start */}
      <section className="mb-16">
        <SectionTitle id="quick-start" subtitle="Two steps: configure the sink, add the plugin">
          Quick Start
        </SectionTitle>

        <div className="space-y-8">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <span className="flex size-7 items-center justify-center rounded-full bg-accent font-bold text-white text-xs">
                1
              </span>
              <h3 className="font-semibold text-text-primary">Configure the LogTape sink</h3>
            </div>
            <CodeBlock code={SINK_CODE} lang="typescript" />
          </div>

          <div>
            <div className="mb-3 flex items-center gap-3">
              <span className="flex size-7 items-center justify-center rounded-full bg-accent font-bold text-white text-xs">
                2
              </span>
              <h3 className="font-semibold text-text-primary">Add the DevTools plugin</h3>
            </div>
            <CodeBlock code={PLUGIN_CODE} lang="tsx" />
          </div>
        </div>
      </section>

      {/* API Reference */}
      <section className="mb-16">
        <SectionTitle id="api" subtitle="Exported functions and types">
          API Reference
        </SectionTitle>

        <div className="space-y-8">
          {/* createDevtoolsSink */}
          <div>
            <h3 className="mb-2 font-mono font-semibold text-accent-light text-sm">
              createDevtoolsSink(options?)
            </h3>
            <p className="mb-3 text-sm text-text-muted">
              Creates a LogTape sink that forwards log records to the devtools panel.
            </p>
            <div className="overflow-x-auto rounded-lg border border-border-secondary">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead className="border-border-secondary border-b bg-bg-tertiary">
                  <tr>
                    <th className="px-4 py-2 font-medium text-text-muted">Option</th>
                    <th className="px-4 py-2 font-medium text-text-muted">Type</th>
                    <th className="px-4 py-2 font-medium text-text-muted">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-primary">
                  <tr>
                    <td className="px-4 py-2 font-mono text-accent-light">store?</td>
                    <td className="px-4 py-2 font-mono text-text-muted">LogStore</td>
                    <td className="px-4 py-2 text-text-muted">
                      Custom store instance. Uses the shared default store when omitted.
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-mono text-accent-light">
                      experimentalCaptureStackTrace?
                    </td>
                    <td className="px-4 py-2 font-mono text-text-muted">boolean</td>
                    <td className="px-4 py-2 text-text-muted">
                      Capture the source file and line of each log call via stack trace parsing.
                      Dev-only — automatically disabled when{" "}
                      <code className="text-text-primary">process.env.NODE_ENV</code> is{" "}
                      <code className="text-text-primary">"production"</code> because minified
                      bundles produce meaningless references. Source maps do not help — browsers do
                      not apply them to <code className="text-text-primary">Error.stack</code>. Use{" "}
                      <code className="text-text-primary">forceStackTrace</code> to override.
                      Defaults to <code className="text-text-primary">true</code>.
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-mono text-accent-light">forceStackTrace?</td>
                    <td className="px-4 py-2 font-mono text-text-muted">boolean</td>
                    <td className="px-4 py-2 text-text-muted">
                      Override the production guard for stack trace capture. Useful when your
                      production build ships unminified code. Only has an effect when{" "}
                      <code className="text-text-primary">experimentalCaptureStackTrace</code> is{" "}
                      <code className="text-text-primary">true</code>. Defaults to{" "}
                      <code className="text-text-primary">false</code>.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* createLogTapeDevtoolsPlugin */}
          <div>
            <h3 className="mb-2 font-mono font-semibold text-accent-light text-sm">
              createLogTapeDevtoolsPlugin(options?)
            </h3>
            <p className="mb-3 text-sm text-text-muted">
              Creates a TanStack DevTools plugin config object.
            </p>
            <div className="overflow-x-auto rounded-lg border border-border-secondary">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead className="border-border-secondary border-b bg-bg-tertiary">
                  <tr>
                    <th className="px-4 py-2 font-medium text-text-muted">Option</th>
                    <th className="px-4 py-2 font-medium text-text-muted">Type</th>
                    <th className="px-4 py-2 font-medium text-text-muted">Default</th>
                    <th className="px-4 py-2 font-medium text-text-muted">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-primary">
                  <tr>
                    <td className="px-4 py-2 font-mono text-accent-light">defaultOpen?</td>
                    <td className="px-4 py-2 font-mono text-text-muted">boolean</td>
                    <td className="px-4 py-2 text-text-muted">true</td>
                    <td className="px-4 py-2 text-text-muted">
                      Whether the LogTape panel starts expanded in DevTools.
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-mono text-accent-light">name?</td>
                    <td className="px-4 py-2 font-mono text-text-muted">string</td>
                    <td className="px-4 py-2 text-text-muted">"LogTape"</td>
                    <td className="px-4 py-2 text-text-muted">
                      Display name shown in the DevTools tab bar.
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-mono text-accent-light">store?</td>
                    <td className="px-4 py-2 font-mono text-text-muted">LogStore</td>
                    <td className="px-4 py-2 text-text-muted">shared default</td>
                    <td className="px-4 py-2 text-text-muted">
                      Must match the store passed to{" "}
                      <code className="text-text-primary">createDevtoolsSink</code>.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* createLogStore / defaultLogStore */}
          <div>
            <h3 className="mb-2 font-mono font-semibold text-accent-light text-sm">
              createLogStore(maxSize?)
            </h3>
            <p className="mb-3 text-sm text-text-muted">
              Creates a new log store with a bounded buffer. When the buffer is full, the oldest
              records are dropped automatically.
            </p>
            <div className="overflow-x-auto rounded-lg border border-border-secondary">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead className="border-border-secondary border-b bg-bg-tertiary">
                  <tr>
                    <th className="px-4 py-2 font-medium text-text-muted">Argument</th>
                    <th className="px-4 py-2 font-medium text-text-muted">Type</th>
                    <th className="px-4 py-2 font-medium text-text-muted">Default</th>
                    <th className="px-4 py-2 font-medium text-text-muted">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-4 py-2 font-mono text-accent-light">maxSize?</td>
                    <td className="px-4 py-2 font-mono text-text-muted">number</td>
                    <td className="px-4 py-2 text-text-muted">1000</td>
                    <td className="px-4 py-2 text-text-muted">
                      Maximum number of log records to keep in memory.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm text-text-muted">
              A shared <code className="text-text-primary">defaultLogStore</code> (maxSize 1000) is
              used automatically when no custom store is provided. Create your own store when you
              need a different buffer size or isolated stores for testing:
            </p>
            <CodeBlock
              code={`import { createLogStore, createDevtoolsSink, createLogTapeDevtoolsPlugin } from "@mugenlabs/logtape-devtools";

const store = createLogStore(5000); // keep up to 5000 records

const sink = createDevtoolsSink({ store });
const plugin = createLogTapeDevtoolsPlugin({ store });`}
              lang="typescript"
            />
          </div>
        </div>
      </section>
    </div>
    <FloatingButtons />
  </div>
);
