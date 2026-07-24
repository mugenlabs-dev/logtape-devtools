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
import { createLogTapeDevtools } from "@mugenlabs/logtape-devtools";

// One call returns a sink and a panel plugin
// already wired to the same store.
const { sink, plugin } = createLogTapeDevtools();

await configure({
  sinks: {
    devtools: sink,
  },
  loggers: [
    {
      category: [],          // [] = match all categories
      lowestLevel: "trace",  // capture every level
      sinks: ["devtools"],
    },
  ],
});`;

const PLUGIN_CODE = `import { TanStackDevtools } from "@tanstack/react-devtools";

function App() {
  return (
    <>
      <YourApp />
      <TanStackDevtools plugins={[plugin]} />
    </>
  );
}`;

const ADVANCED_CODE = `// logging.ts — no React imported here
import { configure } from "@logtape/logtape";
import {
  createDevtoolsSink,
  createLogStore,
} from "@mugenlabs/logtape-devtools/sink";

export const logStore = createLogStore({ maxRecords: 5000 });

await configure({
  sinks: {
    devtools: createDevtoolsSink({ store: logStore }),
  },
  loggers: [
    { category: ["app"], lowestLevel: "debug", sinks: ["devtools"] },
  ],
});

// app.tsx
import { createLogTapeDevtoolsPlugin } from "@mugenlabs/logtape-devtools";
import { logStore } from "./logging";

// The plugin must get the SAME store instance as the sink,
// otherwise the panel stays empty.
const plugin = createLogTapeDevtoolsPlugin({ store: logStore });`;

const PRODUCTION_CODE = `import { lazy, Suspense } from "react";

// The import() sits behind a statically analyzable flag, so the
// panel and @tanstack/react-devtools are tree-shaken out of the
// production bundle entirely.
const Devtools = import.meta.env.DEV
  ? lazy(() => import("./devtools"))
  : () => null;

export function App() {
  return (
    <>
      <YourApp />
      <Suspense fallback={null}>
        <Devtools />
      </Suspense>
    </>
  );
}

// devtools.tsx — only ever imported in development
import { createLogTapeDevtoolsPlugin } from "@mugenlabs/logtape-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { logStore } from "./logging";

export default function Devtools() {
  return (
    <TanStackDevtools
      plugins={[createLogTapeDevtoolsPlugin({ store: logStore })]}
    />
  );
}`;

const STORE_CODE = `import {
  createDevtoolsSink,
  createLogStore,
  createLogTapeDevtoolsPlugin,
} from "@mugenlabs/logtape-devtools";

const store = createLogStore({ maxRecords: 5000 });

const sink = createDevtoolsSink({ store });
const plugin = createLogTapeDevtoolsPlugin({ store });`;

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

      {/* Advanced setup */}
      <section className="mb-16">
        <SectionTitle
          id="advanced-setup"
          subtitle="Hold on to the store yourself, or keep React out of your logging setup"
        >
          Advanced Setup
        </SectionTitle>

        <p className="mb-4 text-sm text-text-muted leading-relaxed">
          <code className="text-text-primary">createLogTapeDevtools()</code> is a thin wrapper over{" "}
          <code className="text-text-primary">createDevtoolsSink</code> and{" "}
          <code className="text-text-primary">createLogTapeDevtoolsPlugin</code>. Call them
          separately when you need a reference to the store — for a custom buffer size, isolated
          stores in tests, or clearing logs programmatically.
        </p>
        <p className="mb-4 text-sm text-text-muted leading-relaxed">
          The package root pulls in React, since the panel is a React component. If your LogTape
          configuration is shared with a server entry point, a worker, or any non-React bundle,
          import from the{" "}
          <code className="text-text-primary">@mugenlabs/logtape-devtools/sink</code> subpath
          instead — it exports the sink, the store and the types with no React dependency.
        </p>
        <CodeBlock code={ADVANCED_CODE} lang="tsx" />
      </section>

      {/* Production */}
      <section className="mb-16">
        <SectionTitle id="production" subtitle="Keep the panel out of your production bundle">
          Production
        </SectionTitle>

        <p className="mb-4 text-sm text-text-muted leading-relaxed">
          The panel is a development tool. Guard the mount behind a build-time flag so your bundler
          can tree-shake it — and{" "}
          <code className="text-text-primary">@tanstack/react-devtools</code> along with it — out of
          production builds. With webpack or other bundlers,{" "}
          <code className="text-text-primary">process.env.NODE_ENV !== "production"</code> works the
          same way.
        </p>
        <CodeBlock code={PRODUCTION_CODE} lang="tsx" />

        <p className="mt-6 mb-3 text-sm text-text-muted leading-relaxed">
          Two behaviours make the sink itself cheap to leave in place:
        </p>
        <ul className="space-y-2 text-sm text-text-muted leading-relaxed">
          <li className="flex gap-2">
            <span className="text-accent-light">•</span>
            <span>
              <strong className="text-text-primary">
                Stack capture auto-disables in production.
              </strong>{" "}
              When <code className="text-text-primary">process.env.NODE_ENV</code> is{" "}
              <code className="text-text-primary">"production"</code>,{" "}
              <code className="text-text-primary">captureStackTrace</code> is ignored — minified
              bundles produce meaningless file and line references, and browsers do not apply source
              maps to <code className="text-text-primary">Error.stack</code>. Set{" "}
              <code className="text-text-primary">forceStackTrace: true</code> to override.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-accent-light">•</span>
            <span>
              <strong className="text-text-primary">
                Stack capture is skipped while no panel is open.
              </strong>{" "}
              The sink checks <code className="text-text-primary">store.hasListeners()</code> per
              record and does no stack work while nothing is subscribed, so an unmounted panel costs
              close to nothing.
            </span>
          </li>
        </ul>
        <p className="mt-4 text-sm text-text-muted leading-relaxed">
          Records are still buffered in memory when no panel is mounted. If you do not want that
          either, keep the sink out of your production LogTape configuration, or pass{" "}
          <code className="text-text-primary">createLogStore(&#123; maxRecords: 0 &#125;)</code>.
        </p>
      </section>

      {/* API Reference */}
      <section className="mb-16">
        <SectionTitle id="api" subtitle="Exported functions and types">
          API Reference
        </SectionTitle>

        <div className="space-y-8">
          {/* createLogTapeDevtools */}
          <div>
            <h3 className="mb-2 font-mono font-semibold text-accent-light text-sm">
              createLogTapeDevtools(options?)
            </h3>
            <p className="mb-3 text-sm text-text-muted">
              Creates a LogTape sink and its matching DevTools plugin, both wired to the same store.
              Returns <code className="text-text-primary">&#123; sink, plugin &#125;</code>. This is
              the recommended entry point.
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
                    <td className="px-4 py-2 font-mono text-accent-light">sink?</td>
                    <td className="px-4 py-2 font-mono text-text-muted">
                      Omit&lt;DevtoolsSinkOptions, "store"&gt;
                    </td>
                    <td className="px-4 py-2 text-text-muted">&#123;&#125;</td>
                    <td className="px-4 py-2 text-text-muted">
                      Sink options. The shared store is wired automatically.
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-mono text-accent-light">plugin?</td>
                    <td className="px-4 py-2 font-mono text-text-muted">
                      Omit&lt;LogTapeDevtoolsPluginOptions, "store"&gt;
                    </td>
                    <td className="px-4 py-2 text-text-muted">&#123;&#125;</td>
                    <td className="px-4 py-2 text-text-muted">
                      Plugin options. The shared store is wired automatically.
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-mono text-accent-light">store?</td>
                    <td className="px-4 py-2 font-mono text-text-muted">LogStore</td>
                    <td className="px-4 py-2 text-text-muted">defaultLogStore</td>
                    <td className="px-4 py-2 text-text-muted">
                      Store shared by the sink and the plugin.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* createDevtoolsSink */}
          <div>
            <h3 className="mb-2 font-mono font-semibold text-accent-light text-sm">
              createDevtoolsSink(options?)
            </h3>
            <p className="mb-3 text-sm text-text-muted">
              Creates a LogTape sink that forwards log records to the devtools panel. Also available
              from the React-free{" "}
              <code className="text-text-primary">@mugenlabs/logtape-devtools/sink</code> subpath.
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
                    <td className="px-4 py-2 font-mono text-accent-light">captureStackTrace?</td>
                    <td className="px-4 py-2 font-mono text-text-muted">boolean</td>
                    <td className="px-4 py-2 text-text-muted">true</td>
                    <td className="px-4 py-2 text-text-muted">
                      Capture the source file and line of each log call via stack trace parsing.
                      Experimental and engine-dependent. Automatically disabled when{" "}
                      <code className="text-text-primary">process.env.NODE_ENV</code> is{" "}
                      <code className="text-text-primary">"production"</code> because minified
                      bundles produce meaningless references — source maps do not help, browsers do
                      not apply them to <code className="text-text-primary">Error.stack</code>. Also
                      skipped while no panel is subscribed to the store.
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-mono text-accent-light">forceStackTrace?</td>
                    <td className="px-4 py-2 font-mono text-text-muted">boolean</td>
                    <td className="px-4 py-2 text-text-muted">false</td>
                    <td className="px-4 py-2 text-text-muted">
                      Capture stack traces even in production builds and while the panel is closed.
                      Only has an effect when{" "}
                      <code className="text-text-primary">captureStackTrace</code> is{" "}
                      <code className="text-text-primary">true</code>.
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 font-mono text-accent-light">store?</td>
                    <td className="px-4 py-2 font-mono text-text-muted">LogStore</td>
                    <td className="px-4 py-2 text-text-muted">defaultLogStore</td>
                    <td className="px-4 py-2 text-text-muted">
                      Store to write records into. Must match the store given to the plugin.
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
              createLogStore(options?)
            </h3>
            <p className="mb-3 text-sm text-text-muted">
              Creates an isolated log store. Records live in a fixed-capacity ring buffer, so
              appending is O(1) and the oldest record is evicted once the buffer is full. Listener
              notifications are coalesced into a microtask, so a synchronous burst of log calls
              triggers a single re-render.
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
                <tbody>
                  <tr>
                    <td className="px-4 py-2 font-mono text-accent-light">maxRecords?</td>
                    <td className="px-4 py-2 font-mono text-text-muted">number</td>
                    <td className="px-4 py-2 text-text-muted">1000</td>
                    <td className="px-4 py-2 text-text-muted">
                      Maximum number of records to retain.{" "}
                      <code className="text-text-primary">0</code> disables buffering entirely.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm text-text-muted">
              The returned <code className="text-text-primary">LogStore</code> exposes{" "}
              <code className="text-text-primary">addRecord</code>,{" "}
              <code className="text-text-primary">clear</code>,{" "}
              <code className="text-text-primary">getSnapshot</code>,{" "}
              <code className="text-text-primary">hasListeners</code>,{" "}
              <code className="text-text-primary">setMaxSize</code> and{" "}
              <code className="text-text-primary">subscribe</code>. A shared{" "}
              <code className="text-text-primary">defaultLogStore</code> (1000 records) is used
              automatically when no custom store is provided. Create your own when you need a
              different buffer size or isolated stores for testing:
            </p>
            <CodeBlock code={STORE_CODE} lang="typescript" />
          </div>
        </div>

        {/* Compatibility */}
        <div className="mt-8 rounded-lg border border-border-secondary bg-card-bg p-5">
          <h3 className="mb-2 font-semibold text-sm text-text-primary">Compatibility</h3>
          <p className="text-sm text-text-muted leading-relaxed">
            Requires <code className="text-text-primary">@logtape/logtape</code> 2.0 or newer and
            React 18 or 19. <code className="text-text-primary">@tanstack/react-devtools</code>{" "}
            (0.9.0 or newer) is an optional peer dependency — you only need it to host the panel, so
            you can depend on this package purely for the sink via the{" "}
            <code className="text-text-primary">/sink</code> subpath. Node 18 or newer.
          </p>
        </div>
      </section>
    </div>
    <FloatingButtons />
  </div>
);
