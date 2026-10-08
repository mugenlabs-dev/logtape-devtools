import { PACKAGE_NAME } from "./content/site";

/** Scoped package name with a break opportunity after the scope slash (msw lesson). */
export const PackageName = ({ className }: { className?: string }) => {
  const slash = PACKAGE_NAME.indexOf("/");
  if (slash === -1) {
    return <span className={className}>{PACKAGE_NAME}</span>;
  }
  return (
    <span className={className}>
      {PACKAGE_NAME.slice(0, slash + 1)}
      <wbr />
      {PACKAGE_NAME.slice(slash + 1)}
    </span>
  );
};
