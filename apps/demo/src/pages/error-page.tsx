import { type ErrorComponentProps, Link, useRouter } from "@tanstack/react-router";
import { AlertTriangle, Compass } from "lucide-react";
import { useCallback, useRef } from "react";
import { type AnimatedIconHandle, RotateCCWIcon } from "../icons";

export const ErrorPage = ({ error }: ErrorComponentProps) => {
  const router = useRouter();
  const iconRef = useRef<AnimatedIconHandle>(null);
  const start = useCallback(() => iconRef.current?.startAnimation(), []);
  const stop = useCallback(() => iconRef.current?.stopAnimation(), []);

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center justify-center px-6 py-24 text-center">
      <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-red-500/15">
        <AlertTriangle className="text-red-400" size={28} />
      </div>
      <h1 className="mb-2 font-bold text-2xl text-text-primary">Something went wrong</h1>
      <p className="mb-6 text-text-muted">
        {error instanceof Error ? error.message : "An unexpected error occurred."}
      </p>
      <button
        className="flex items-center gap-2 rounded-lg bg-accent/15 px-5 py-2.5 font-semibold text-accent-light text-sm transition-colors hover:bg-accent/25"
        onClick={() => router.invalidate()}
        onMouseEnter={start}
        onMouseLeave={stop}
        type="button"
      >
        <RotateCCWIcon ref={iconRef} size={14} />
        Try again
      </button>
    </div>
  );
};

export const NotFoundPage = () => (
  <div className="mx-auto flex max-w-xl flex-col items-center justify-center px-6 py-24 text-center">
    <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-accent/15">
      <Compass className="text-accent-light" size={28} />
    </div>
    <h1 className="m-0 font-bold text-2xl text-text-primary">Page not found</h1>
    <p className="mt-3 text-sm text-text-muted">There is nothing at this address.</p>
    <Link
      className="mt-6 rounded-md border border-border-secondary px-4 py-2 text-sm text-text-primary no-underline transition-colors hover:bg-white/5"
      to="/"
    >
      Back to the docs
    </Link>
  </div>
);
