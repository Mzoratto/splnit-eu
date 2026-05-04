import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Blocks,
  ClipboardCheck,
  DatabaseBackup,
  Download,
  ExternalLink,
  Factory,
  FileText,
  GraduationCap,
  KeyRound,
  LockKeyhole,
  Mail,
  Network,
  Radar,
  ScanLine,
  Server,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { StatusPill, type StatusPillTone } from "@/components/app/status-pill";
import type {
  PublicTrustCenterModel,
  PublicTrustDocument,
  TrustFramework,
  TrustFrameworkCategory,
  TrustSignal,
} from "@/lib/trust-center/public-model";

export function TrustTopbar({
  backHref,
  trustCenter,
}: {
  backHref?: string;
  trustCenter: PublicTrustCenterModel;
}) {
  return (
    <header className="sticky top-0 z-[var(--z-sticky)] h-14 border-b border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-3 rounded-[var(--r-md)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2"
          aria-label="Go to Splnit.eu homepage"
        >
          <span
            aria-hidden="true"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-[var(--r-md)] text-white"
            style={{ backgroundColor: trustCenter.accentColor }}
          >
            <ShieldCheck className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">
              {trustCenter.organisationName}
            </p>
            <p className="truncate font-mono text-[11px] text-foreground/50">
              trust.splnit.eu/{trustCenter.orgSlug}
            </p>
          </div>
        </Link>
        <div className="flex shrink-0 items-center gap-3">
          {backHref ? (
            <Link
              href={backHref}
              className="hidden items-center gap-2 rounded-[var(--r-md)] border border-border px-3 py-2 text-xs font-medium text-foreground/68 sm:inline-flex"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Back
            </Link>
          ) : null}
          <div className="inline-flex items-center gap-2 text-xs font-medium text-foreground/62">
            <ShieldCheck className="h-4 w-4 text-[var(--accent)]" aria-hidden="true" />
            Verified by Splnit.eu
          </div>
        </div>
      </div>
    </header>
  );
}

export function TrustSignalsStrip({ signals }: { signals: TrustSignal[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="grid overflow-hidden rounded-[var(--r-lg)] border border-border bg-surface sm:grid-cols-2 lg:grid-cols-5">
        {signals.map((signal) => {
          const Icon = signalIconMap[signal.icon];

          return (
            <div
              key={signal.label}
              className="border-b border-border p-4 last:border-b-0 sm:border-r sm:last:border-r-0 lg:border-b-0"
            >
              <Icon
                className="h-7 w-7 text-[var(--accent)]"
                aria-hidden="true"
              />
              <p className="mt-3 text-xs font-medium uppercase tracking-[0.12em] text-foreground/48">
                {signal.label}
              </p>
              <p className="mt-1 text-sm font-semibold">{signal.value}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function FrameworkCard({
  framework,
  href,
  showDrilldown,
  showPercentages,
}: {
  framework: TrustFramework;
  href: string;
  showDrilldown: boolean;
  showPercentages: boolean;
}) {
  const passPct = segmentWidth(framework.verified, framework.totalControls);
  const warnPct = segmentWidth(framework.inProgress, framework.totalControls);

  return (
    <article className="rounded-[var(--r-lg)] border border-border bg-surface p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <FrameworkIcon slug={framework.framework.slug} />
          <div>
            <h3 className="text-lg font-semibold">{framework.framework.nameCs}</h3>
            <p className="mt-1 text-sm text-foreground/58">
              Český regulátor: {framework.regulator} · {framework.law}
            </p>
          </div>
        </div>
        <StatusPill tone={framework.statusTone}>{framework.statusLabel}</StatusPill>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <div className="flex h-2 overflow-hidden rounded-full bg-surface-muted">
            <span
              className="bg-[var(--status-pass)]"
              style={{ width: `${passPct}%` }}
            />
            <span
              className="bg-[var(--status-warn)]"
              style={{ width: `${warnPct}%` }}
            />
          </div>
          <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-foreground/58">
            <span>
              <Dot className="bg-[var(--status-pass)]" /> {framework.verified} verified
            </span>
            <span>
              <Dot className="bg-[var(--status-warn)]" /> {framework.inProgress} in progress
            </span>
            <span>
              <Dot className="bg-foreground/28" /> {framework.notApplicable} not applicable
            </span>
          </p>
        </div>
        {showPercentages ? (
          <p className="font-mono text-[22px] font-semibold text-foreground">
            {framework.score ?? "-"}%
          </p>
        ) : null}
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-xs text-foreground/50">
          Last assessed: {formatDateTime(framework.lastAssessedAt)} · Auto
        </p>
        {showDrilldown ? (
          <Link
            href={href}
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)]"
          >
            Zobrazit detail frameworku
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        ) : null}
      </div>
    </article>
  );
}

export function DocumentsSection({
  documents,
  title = "Dokumenty",
}: {
  documents: PublicTrustDocument[];
  title?: string;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-foreground/48">
            DOCUMENTS
          </p>
          <h2 className="mt-2 text-2xl font-medium tracking-normal">{title}</h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-foreground/58">
          Uzamčené položky jsou dostupné na žádost. Veřejné dokumenty lze zobrazit
          přímo bez dodatečného přístupu.
        </p>
      </div>
      <div className="mt-6 grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(320px,1fr))]">
        {documents.map((document) => (
          <div
            key={document.id}
            className="flex items-center justify-between gap-4 rounded-[var(--r-lg)] border border-border bg-surface p-4"
          >
            <div className="flex min-w-0 items-start gap-3">
              {document.isLocked ? (
                <LockKeyhole
                  className="mt-0.5 h-5 w-5 shrink-0 text-[var(--status-warn)]"
                  aria-hidden="true"
                />
              ) : (
                <FileText
                  className="mt-0.5 h-5 w-5 shrink-0 text-foreground/38"
                  aria-hidden="true"
                />
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{document.title}</p>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-foreground/58">
                  {document.description}
                </p>
              </div>
            </div>
            <Link
              href={document.href}
              className={
                document.isLocked
                  ? primaryButtonClass
                  : secondaryButtonClass
              }
            >
              {document.isLocked ? "Request" : document.href.startsWith("mailto:") ? "Request" : "View"}
              {document.isLocked ? (
                <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />
              ) : document.href.startsWith("mailto:") ? (
                <Mail className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              )}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ContactSection({ orgName }: { orgName: string }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <ContactCard
          description={`Procurement nebo bezpečnostní tým může požádat o detailnější odpovědi k ${orgName}.`}
          href="mailto:hello@splnit.eu?subject=Vendor%20risk%20assessment"
          icon="vendor"
          meta="Odpověď obvykle do 2 pracovních dnů"
          title="Vendor risk assessment"
        />
        <ContactCard
          description="Bezpečnostní nálezy a zranitelnosti posílejte přes odpovědný disclosure kanál."
          href="mailto:security@splnit.eu?subject=Responsible%20disclosure"
          icon="security"
          meta="PGP klíč na vyžádání · první odpověď do 24 hodin"
          title="Responsible disclosure"
        />
      </div>
    </section>
  );
}

export function TrustFooter({
  backHref,
  trustCenter,
}: {
  backHref?: string;
  trustCenter: PublicTrustCenterModel;
}) {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <p className="font-mono text-xs text-foreground/50">
          Last verified {formatDateTime(trustCenter.lastTestedAt)} · next test{" "}
          {formatTimeUntil(trustCenter.nextTestAt)}
        </p>
        <div className="flex flex-wrap items-center gap-4 text-sm text-foreground/58">
          {backHref ? <Link href={backHref}>← Back to Trust Center</Link> : null}
          <Link href="/">Splnit.eu home</Link>
          <Link href="https://status.splnit.eu">status page</Link>
          <Link href="/soukromi">Privacy</Link>
          <Link href="/podminky">Terms</Link>
        </div>
      </div>
    </footer>
  );
}

export function CategoryRow({ category }: { category: TrustFrameworkCategory }) {
  const Icon = categoryIconMap[category.icon] ?? ShieldQuestion;
  const tone: StatusPillTone =
    category.status === "pass" ? "pass" : category.status === "warn" ? "warn" : "neutral";

  return (
    <div className="grid gap-4 border-b border-border p-4 last:border-b-0 sm:grid-cols-[1fr_auto_auto] sm:items-center">
      <div className="flex min-w-0 items-start gap-3">
        <span
          className="grid h-8 w-8 shrink-0 place-items-center rounded-[var(--r-md)]"
          style={{
            background:
              category.status === "pass"
                ? "var(--status-pass-subtle)"
                : category.status === "warn"
                  ? "var(--status-warn-subtle)"
                  : "var(--status-neutral-subtle)",
            color:
              category.status === "pass"
                ? "var(--status-pass)"
                : category.status === "warn"
                  ? "var(--status-warn)"
                  : "var(--status-neutral)",
          }}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold">{category.name}</h3>
          <p className="mt-1 text-sm leading-6 text-foreground/58">
            {category.description}
          </p>
        </div>
      </div>
      <p className="font-mono text-xs text-foreground/58 sm:text-right">
        {formatCategoryCounts(category)}
      </p>
      <StatusPill tone={tone}>
        {category.status === "pass"
          ? "VERIFIED"
          : category.status === "warn"
            ? "IN PROGRESS"
            : "N/A"}
      </StatusPill>
    </div>
  );
}

export function HeroActions({ orgName }: { orgName: string }) {
  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
      <Link
        href={`mailto:hello@splnit.eu?subject=Document%20access%20request%20for%20${encodeURIComponent(orgName)}`}
        className={primaryButtonClass}
      >
        Request access to documents
        <Download className="h-4 w-4" aria-hidden="true" />
      </Link>
      <Link
        href="mailto:security@splnit.eu?subject=Security%20question"
        className={secondaryButtonClass}
      >
        Contact security team
        <Mail className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  );
}

export function LiveIndicator({
  lastTestedAt,
  nextTestAt,
}: {
  lastTestedAt: Date | null;
  nextTestAt: Date | null;
}) {
  return (
    <div className="mt-6 inline-flex flex-wrap items-center gap-3 rounded-[var(--r-lg)] border border-[var(--status-pass-border)] bg-[var(--status-pass-subtle)] px-4 py-3">
      <span className="flex items-center gap-2 text-sm font-medium text-[var(--status-pass)]">
        <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--status-pass)]" />
        Live
      </span>
      <span className="font-mono text-xs text-foreground/58">
        last {formatDateTime(lastTestedAt)} · next {formatDateTime(nextTestAt)}
      </span>
    </div>
  );
}

export function FrameworkIcon({ slug }: { slug: string }) {
  const Icon =
    slug === "gdpr"
      ? LockKeyhole
      : slug === "iso27001"
        ? BadgeCheck
        : slug === "ai-act"
          ? Activity
          : ShieldCheck;

  return (
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--r-lg)] bg-[var(--accent-subtle)] text-[var(--accent)]">
      <Icon className="h-5 w-5" aria-hidden="true" />
    </span>
  );
}

export function formatDateTime(value: Date | string | null | undefined) {
  if (!value) {
    return "n/a";
  }

  return new Intl.DateTimeFormat("cs-CZ", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatTimeUntil(value: Date | string | null | undefined) {
  if (!value) {
    return "n/a";
  }

  const diffMinutes = Math.max(
    0,
    Math.round((new Date(value).getTime() - Date.now()) / 60000),
  );

  if (diffMinutes < 60) {
    return `in ${diffMinutes} min`;
  }

  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  return minutes > 0 ? `in ${hours}h ${minutes}m` : `in ${hours}h`;
}

export const primaryButtonClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-[var(--r-md)] bg-[var(--accent)] px-4 text-sm font-medium text-white";

export const secondaryButtonClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-[var(--r-md)] border border-border bg-surface px-4 text-sm font-medium text-foreground";

function ContactCard({
  description,
  href,
  icon,
  meta,
  title,
}: {
  description: string;
  href: string;
  icon: "vendor" | "security";
  meta: string;
  title: string;
}) {
  const Icon = icon === "vendor" ? ClipboardCheck : ShieldAlert;
  const iconColor = icon === "vendor" ? "var(--accent)" : "var(--status-fail)";

  return (
    <article className="rounded-[var(--r-lg)] border border-border bg-surface p-5">
      <div className="flex items-start gap-3">
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--r-lg)] bg-surface-muted"
          style={{ color: iconColor }}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-foreground/58">{description}</p>
          <Link
            href={href}
            className="mt-3 inline-flex items-center gap-2 font-mono text-sm text-[var(--accent)]"
          >
            {href.replace("mailto:", "").split("?")[0]}
            <Mail className="h-4 w-4" aria-hidden="true" />
          </Link>
          <p className="mt-2 font-mono text-xs text-foreground/45">{meta}</p>
        </div>
      </div>
    </article>
  );
}

function Dot({ className }: { className: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-2 w-2 rounded-full align-middle ${className}`}
    />
  );
}

function segmentWidth(value: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.round((value / total) * 1000) / 10;
}

function formatCategoryCounts(category: TrustFrameworkCategory) {
  if (category.notApplicable === category.total) {
    return `${category.total} not applicable`;
  }

  return `${category.verified} / ${category.total} verified`;
}

const signalIconMap: Record<TrustSignal["icon"], LucideIcon> = {
  activity: Activity,
  badge: BadgeCheck,
  radar: Radar,
  server: Server,
  shield: ShieldCheck,
};

const categoryIconMap: Record<string, LucideIcon> = {
  activity: Activity,
  blocks: Blocks,
  "database-backup": DatabaseBackup,
  factory: Factory,
  "graduation-cap": GraduationCap,
  "key-round": KeyRound,
  network: Network,
  "scan-line": ScanLine,
  "shield-alert": ShieldAlert,
  "shield-keyhole": LockKeyhole,
};
