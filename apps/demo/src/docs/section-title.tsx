export const SectionTitle = ({
  id,
  children,
  subtitle,
}: {
  id: string;
  children: React.ReactNode;
  subtitle?: string;
}) => (
  <div className="mb-8" id={id}>
    <h2 className="mb-2 font-bold text-2xl text-text-primary">{children}</h2>
    {subtitle && <p className="text-text-muted">{subtitle}</p>}
  </div>
);
