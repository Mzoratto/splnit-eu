import clsx from "clsx";

type PageHeaderProps = {
  actions?: React.ReactNode;
  breadcrumb?: string;
  children?: React.ReactNode;
  className?: string;
  eyebrow?: string;
  subtitle?: string;
  title: string;
};

export function PageHeader({
  actions,
  breadcrumb,
  children,
  className,
  eyebrow,
  subtitle,
  title,
}: PageHeaderProps) {
  return (
    <div
      className={clsx(
        "flex flex-col justify-between gap-4 border-b border-border pb-6 md:flex-row md:items-end",
        className,
      )}
    >
      <div className="max-w-3xl">
        {breadcrumb ? (
          <p className="mb-2 text-xs text-foreground/48">{breadcrumb}</p>
        ) : null}
        {eyebrow ? (
          <p className="text-sm font-medium text-primary">{eyebrow}</p>
        ) : null}
        <h1 className="mt-2 text-[22px] font-medium tracking-normal">{title}</h1>
        {subtitle ? (
          <p className="mt-2 text-sm leading-6 text-foreground/64">{subtitle}</p>
        ) : null}
        {children}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
