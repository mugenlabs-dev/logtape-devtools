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
  <article className="py-16 pb-40 text-text-secondary content-grid">
    <div>
      <h1
        className="mb-3 font-bold text-text-primary"
        style={{ fontSize: "var(--text-page-title)" }}
      >
        {title}
      </h1>
      <p className="mb-10 text-text-muted leading-relaxed">{description}</p>
      <div className="lt-prose">{children}</div>
    </div>
  </article>
);
