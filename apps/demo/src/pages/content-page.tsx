import type { ReactNode } from "react";

export const ContentPage = ({
  children,
  description,
  title,
}: {
  children: ReactNode;
  description: string;
  title: string;
}) => (
  <article className="mx-auto max-w-3xl px-6 py-16 pb-40 text-text-secondary">
    <h1 className="mb-3 font-bold text-3xl text-text-primary">{title}</h1>
    <p className="mb-10 text-text-muted leading-relaxed">{description}</p>
    <div className="space-y-4 text-sm text-text-muted leading-relaxed [&_a]:text-accent-light [&_a]:underline [&_a]:underline-offset-2 [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:font-semibold [&_h2]:text-text-primary [&_li]:my-1 [&_ul]:list-disc [&_ul]:pl-5">
      {children}
    </div>
  </article>
);
