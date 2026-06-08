"use client";

import { useMemo, useState, useTransition, type ReactNode } from "react";
import {
  Building2,
  CheckCircle2,
  Info,
  ListChecks,
  Server,
  ShieldAlert,
  Sparkles,
  X,
} from "lucide-react";

type CiaLevel = "low" | "medium" | "high";
type Cia = {
  availability: CiaLevel;
  confidentiality: CiaLevel;
  integrity: CiaLevel;
};

export type ProposedAsset = {
  category: string;
  id: string;
  name: string;
  provider: string;
  rationale: string;
  suggestedCia: Cia;
  suggestedOwner: string;
  tier: "primary" | "supporting";
};

export type ProposedVendor = {
  ico: string | null;
  id: string;
  name: string;
  provider: string;
  rationale: string;
  suggestedCriticality: "critical" | "high" | "standard";
  supplyType: string;
};

export type DiscoveryReviewCopy = {
  actions: {
    confirm: string;
    dismiss: string;
  };
  cia: {
    availability: string;
    body: string;
    confidentiality: string;
    integrity: string;
    levelDescriptions: Record<CiaLevel, string>;
    levels: Record<CiaLevel, string>;
    levelsTitle: string;
    title: string;
  };
  draftNotice: {
    body: string;
    title: string;
  };
  empty: {
    assets: string;
    vendors: string;
  };
  labels: {
    assetReasons: {
      handlesSensitiveData: string;
      internetFacing: string;
      noElevatingSignals: string;
      outageDependents: string;
      privilegedAccessScope: string;
      privilegedProductionIntegrity: string;
      productionSystem: string;
      productionSystemWithDependents: string;
    };
    category: Record<string, string>;
    criticality: Record<ProposedVendor["suggestedCriticality"], string>;
    ico: string;
    namePrefixes: {
      connectedApp: string;
      microsoftTenant: string;
      privilegedAccount: string;
      standardUsers: string;
    };
    primary: string;
    provider: Record<string, string>;
    suggestedFrom: string;
    suggestedOwner: string;
    supplyType: Record<string, string>;
    tier: Record<ProposedAsset["tier"], string>;
    via: string;
    vendorRationales: {
      thirdPartyApp: string;
    };
  };
  metrics: {
    assetsWaiting: string;
    evidenceBoundary: string;
    evidenceBoundaryValue: string;
    suppliersWaiting: string;
  };
  nextSteps: {
    body: string;
    confirmBody: string;
    confirmTitle: string;
    dismissBody: string;
    dismissTitle: string;
    leaveBody: string;
    leaveTitle: string;
    title: string;
  };
  tabs: {
    assets: string;
    suppliers: string;
  };
};

type Props = {
  assets: ProposedAsset[];
  copy: DiscoveryReviewCopy;
  onConfirmAsset: (id: string) => Promise<void>;
  onConfirmVendor: (id: string) => Promise<void>;
  onDismiss: (kind: "asset" | "vendor", id: string) => Promise<void>;
  vendors: ProposedVendor[];
};

const ciaColor: Record<CiaLevel, string> = {
  high: "border-red-200 bg-red-50 text-red-800",
  low: "border-border bg-surface-muted text-foreground/64",
  medium: "border-amber-200 bg-amber-50 text-amber-900",
};

const criticalityColor = {
  critical: "bg-red-50 text-red-800",
  high: "bg-amber-50 text-amber-900",
  standard: "bg-surface-muted text-foreground/64",
};

export function DiscoveryReview({
  assets,
  copy,
  onConfirmAsset,
  onConfirmVendor,
  onDismiss,
  vendors,
}: Props) {
  const [tab, setTab] = useState<"assets" | "vendors">("assets");
  const [handled, setHandled] = useState<Set<string>>(new Set());
  const [pending, startTransition] = useTransition();
  const visibleAssets = useMemo(
    () => assets.filter((asset) => !handled.has(`asset:${asset.id}`)),
    [assets, handled],
  );
  const visibleVendors = useMemo(
    () => vendors.filter((vendor) => !handled.has(`vendor:${vendor.id}`)),
    [vendors, handled],
  );

  function handle(
    key: string,
    action: () => Promise<void>,
  ) {
    startTransition(async () => {
      await action();
      setHandled((current) => new Set(current).add(key));
    });
  }

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950">
        <div className="flex gap-3">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" aria-hidden="true" />
          <div>
            <p className="font-semibold">{copy.draftNotice.title}</p>
            <p className="mt-1 text-emerald-900/80">{copy.draftNotice.body}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-xl border border-border bg-surface p-4 shadow-sm">
          <div className="flex gap-3">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <h2 className="font-semibold text-foreground">{copy.cia.title}</h2>
              <p className="mt-1 text-sm leading-6 text-foreground/64">{copy.cia.body}</p>
            </div>
          </div>
          <dl className="mt-4 grid gap-3 text-sm md:grid-cols-3">
            <CiaDefinition code="C" label={copy.cia.confidentiality} />
            <CiaDefinition code="I" label={copy.cia.integrity} />
            <CiaDefinition code="A" label={copy.cia.availability} />
          </dl>
          <div className="mt-4 rounded-lg bg-surface-muted p-3 text-sm text-foreground/64">
            <p className="font-medium text-foreground/80">{copy.cia.levelsTitle}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(["high", "medium", "low"] as const).map((level) => (
                <span key={level} className={`rounded border px-2 py-1 text-xs font-medium ${ciaColor[level]}`}>
                  {copy.cia.levels[level]} — {copy.cia.levelDescriptions[level]}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-surface p-4 shadow-sm">
          <div className="flex gap-3">
            <ListChecks className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <h2 className="font-semibold text-foreground">{copy.nextSteps.title}</h2>
              <p className="mt-1 text-sm leading-6 text-foreground/64">{copy.nextSteps.body}</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 text-sm">
            <ReviewStep title={copy.nextSteps.confirmTitle} body={copy.nextSteps.confirmBody} />
            <ReviewStep title={copy.nextSteps.dismissTitle} body={copy.nextSteps.dismissBody} />
            <ReviewStep title={copy.nextSteps.leaveTitle} body={copy.nextSteps.leaveBody} />
          </div>
        </section>
      </div>

      <div className="grid gap-3 rounded-xl border border-border bg-surface p-4 md:grid-cols-3">
        <Metric label={copy.metrics.assetsWaiting} value={visibleAssets.length} />
        <Metric label={copy.metrics.suppliersWaiting} value={visibleVendors.length} />
        <Metric label={copy.metrics.evidenceBoundary} value={copy.metrics.evidenceBoundaryValue} />
      </div>

      <div className="flex gap-1 rounded-lg bg-surface-muted p-1 text-sm">
        <TabButton
          active={tab === "assets"}
          count={visibleAssets.length}
          icon={<Server className="h-4 w-4" aria-hidden="true" />}
          label={copy.tabs.assets}
          onClick={() => setTab("assets")}
        />
        <TabButton
          active={tab === "vendors"}
          count={visibleVendors.length}
          icon={<Building2 className="h-4 w-4" aria-hidden="true" />}
          label={copy.tabs.suppliers}
          onClick={() => setTab("vendors")}
        />
      </div>

      {tab === "assets" ? (
        <ul className="space-y-3">
          {visibleAssets.map((asset) => (
            <li key={asset.id} className="rounded-xl border border-border bg-surface p-4 shadow-sm">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-foreground">{localizeAssetName(asset.name, copy)}</h2>
                    {asset.tier === "primary" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-800">
                        <ShieldAlert className="h-3 w-3" aria-hidden="true" />
                        {copy.labels.primary}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-foreground/52">
                    {labelFromMap(copy.labels.category, asset.category)} · {copy.labels.via} {labelFromMap(copy.labels.provider, asset.provider)}
                    {asset.suggestedOwner ? ` · ${copy.labels.suggestedOwner} ${asset.suggestedOwner}` : ""}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <CiaChip code="C" level={asset.suggestedCia.confidentiality} label={copy.cia.confidentiality} copy={copy} />
                    <CiaChip code="I" level={asset.suggestedCia.integrity} label={copy.cia.integrity} copy={copy} />
                    <CiaChip code="A" level={asset.suggestedCia.availability} label={copy.cia.availability} copy={copy} />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-foreground/64">
                    {localizeAssetRationale(asset.rationale, copy)}
                  </p>
                </div>
                <RowActions
                  copy={copy}
                  pending={pending}
                  onConfirm={() => handle(`asset:${asset.id}`, () => onConfirmAsset(asset.id))}
                  onDismiss={() =>
                    handle(`asset:${asset.id}`, () => onDismiss("asset", asset.id))
                  }
                />
              </div>
            </li>
          ))}
          {visibleAssets.length === 0 ? <EmptyState text={copy.empty.assets} /> : null}
        </ul>
      ) : (
        <ul className="space-y-3">
          {visibleVendors.map((vendor) => (
            <li key={vendor.id} className="rounded-xl border border-border bg-surface p-4 shadow-sm">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-foreground">{vendor.name}</h2>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${criticalityColor[vendor.suggestedCriticality]}`}>
                      {copy.labels.criticality[vendor.suggestedCriticality]}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-foreground/52">
                    {vendor.ico ? `${copy.labels.ico} ${vendor.ico} · ` : ""}
                    {labelFromMap(copy.labels.supplyType, vendor.supplyType)} · {copy.labels.via} {labelFromMap(copy.labels.provider, vendor.provider)}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-foreground/64">
                    {localizeVendorRationale(vendor.rationale, copy)}
                  </p>
                </div>
                <RowActions
                  copy={copy}
                  pending={pending}
                  onConfirm={() => handle(`vendor:${vendor.id}`, () => onConfirmVendor(vendor.id))}
                  onDismiss={() =>
                    handle(`vendor:${vendor.id}`, () => onDismiss("vendor", vendor.id))
                  }
                />
              </div>
            </li>
          ))}
          {visibleVendors.length === 0 ? <EmptyState text={copy.empty.vendors} /> : null}
        </ul>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-foreground/44">{label}</p>
      <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}

function CiaDefinition({ code, label }: { code: "C" | "I" | "A"; label: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface-muted px-3 py-2">
      <dt className="font-mono text-xs font-semibold text-primary">{code}</dt>
      <dd className="mt-1 font-medium text-foreground">{label}</dd>
    </div>
  );
}

function ReviewStep({ body, title }: { body: string; title: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface-muted px-3 py-2">
      <p className="font-medium text-foreground">{title}</p>
      <p className="mt-1 leading-6 text-foreground/64">{body}</p>
    </div>
  );
}

function TabButton({
  active,
  count,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  count: number;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 font-medium transition ${
        active ? "bg-surface text-foreground shadow-sm" : "text-foreground/58"
      }`}
    >
      {icon}
      {label}
      <span className="rounded-full bg-background px-1.5 text-xs text-foreground/58">{count}</span>
    </button>
  );
}

function CiaChip({
  code,
  copy,
  label,
  level,
}: {
  code: "C" | "I" | "A";
  copy: DiscoveryReviewCopy;
  label: string;
  level: CiaLevel;
}) {
  return (
    <span
      aria-label={`${label}: ${copy.cia.levels[level]}`}
      className={`rounded border px-1.5 py-0.5 text-xs font-medium ${ciaColor[level]}`}
    >
      {code}: {copy.cia.levels[level]}
    </span>
  );
}

function RowActions({
  copy,
  onConfirm,
  onDismiss,
  pending,
}: {
  copy: DiscoveryReviewCopy;
  onConfirm: () => void;
  onDismiss: () => void;
  pending: boolean;
}) {
  return (
    <div className="flex shrink-0 gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={onConfirm}
        className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
      >
        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
        {copy.actions.confirm}
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={onDismiss}
        className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground/70 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <X className="h-4 w-4" aria-hidden="true" />
        {copy.actions.dismiss}
      </button>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <li className="rounded-xl border border-dashed border-border bg-surface-muted p-8 text-center text-sm text-foreground/58">
      <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" aria-hidden="true" />
      <p className="mt-2 font-medium">{text}</p>
    </li>
  );
}

function labelFromMap(labels: Record<string, string>, value: string) {
  return labels[value] ?? value;
}

function formatTemplate(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

function localizeAssetName(name: string, copy: DiscoveryReviewCopy) {
  if (name === "Microsoft 365 tenant") {
    return copy.labels.namePrefixes.microsoftTenant;
  }

  const standardUsersMatch = /^Standard user accounts \((\d+)\)$/.exec(name);
  if (standardUsersMatch) {
    return formatTemplate(copy.labels.namePrefixes.standardUsers, {
      count: standardUsersMatch[1],
    });
  }

  const privilegedPrefix = "Privileged account: ";
  if (name.startsWith(privilegedPrefix)) {
    return `${copy.labels.namePrefixes.privilegedAccount}: ${name.slice(privilegedPrefix.length)}`;
  }

  const connectedAppPrefix = "Connected app: ";
  if (name.startsWith(connectedAppPrefix)) {
    return `${copy.labels.namePrefixes.connectedApp}: ${name.slice(connectedAppPrefix.length)}`;
  }

  return name;
}

function localizeAssetRationale(rationale: string, copy: DiscoveryReviewCopy) {
  const trimmed = rationale.trim();
  if (trimmed === "No elevating signals found; defaulted to low. Confirm manually.") {
    return copy.labels.assetReasons.noElevatingSignals;
  }

  const match = /^Suggested from: (.*)\.$/.exec(trimmed);
  if (!match) {
    return rationale;
  }

  const translated = match[1]
    .split("; ")
    .map((reason) => translateAssetReason(reason, copy));

  return `${copy.labels.suggestedFrom}: ${translated.join("; ")}.`;
}

function translateAssetReason(reason: string, copy: DiscoveryReviewCopy) {
  if (reason === "processes personal or financial data") {
    return copy.labels.assetReasons.handlesSensitiveData;
  }
  if (reason === "has privileged access scope") {
    return copy.labels.assetReasons.privilegedAccessScope;
  }
  if (reason === "privileged changes affect production integrity") {
    return copy.labels.assetReasons.privilegedProductionIntegrity;
  }
  if (reason === "production system") {
    return copy.labels.assetReasons.productionSystem;
  }
  if (reason === "production system with active dependents") {
    return copy.labels.assetReasons.productionSystemWithDependents;
  }
  if (reason === "internet-facing (exposure raises the floor)") {
    return copy.labels.assetReasons.internetFacing;
  }

  const outageMatch = /^outage would affect ~(\d+) dependents$/.exec(reason);
  if (outageMatch) {
    return formatTemplate(copy.labels.assetReasons.outageDependents, {
      count: outageMatch[1],
    });
  }

  return reason;
}

function localizeVendorRationale(rationale: string, copy: DiscoveryReviewCopy) {
  if (
    rationale.trim() ===
    "Third-party application granted access to the Microsoft 365 tenant; treat as a candidate supplier/data processor for review."
  ) {
    return copy.labels.vendorRationales.thirdPartyApp;
  }

  return rationale;
}
