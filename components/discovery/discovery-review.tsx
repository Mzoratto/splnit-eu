"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Building2,
  CheckCircle2,
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

type Props = {
  assets: ProposedAsset[];
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
            <p className="font-semibold">Drafts only — you stay in control.</p>
            <p className="mt-1 text-emerald-900/80">
              Connected systems can propose assets and suppliers, but only your confirmation creates register rows and evidence.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-3 rounded-xl border border-border bg-surface p-4 md:grid-cols-3">
        <Metric label="Assets waiting" value={visibleAssets.length} />
        <Metric label="Suppliers waiting" value={visibleVendors.length} />
        <Metric label="Evidence boundary" value="Human confirmed" />
      </div>

      <div className="flex gap-1 rounded-lg bg-surface-muted p-1 text-sm">
        <TabButton
          active={tab === "assets"}
          count={visibleAssets.length}
          icon={<Server className="h-4 w-4" aria-hidden="true" />}
          label="Assets"
          onClick={() => setTab("assets")}
        />
        <TabButton
          active={tab === "vendors"}
          count={visibleVendors.length}
          icon={<Building2 className="h-4 w-4" aria-hidden="true" />}
          label="Suppliers"
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
                    <h2 className="font-semibold text-foreground">{asset.name}</h2>
                    {asset.tier === "primary" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-800">
                        <ShieldAlert className="h-3 w-3" aria-hidden="true" />
                        Primary
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs text-foreground/52">
                    {asset.category} · via {asset.provider}
                    {asset.suggestedOwner ? ` · suggested owner ${asset.suggestedOwner}` : ""}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <CiaChip label="C" level={asset.suggestedCia.confidentiality} />
                    <CiaChip label="I" level={asset.suggestedCia.integrity} />
                    <CiaChip label="A" level={asset.suggestedCia.availability} />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-foreground/64">{asset.rationale}</p>
                </div>
                <RowActions
                  pending={pending}
                  onConfirm={() => handle(`asset:${asset.id}`, () => onConfirmAsset(asset.id))}
                  onDismiss={() =>
                    handle(`asset:${asset.id}`, () => onDismiss("asset", asset.id))
                  }
                />
              </div>
            </li>
          ))}
          {visibleAssets.length === 0 ? <EmptyState text="No proposed assets are waiting for review." /> : null}
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
                      {vendor.suggestedCriticality}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-foreground/52">
                    {vendor.ico ? `IČO ${vendor.ico} · ` : ""}
                    {vendor.supplyType} · via {vendor.provider}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-foreground/64">{vendor.rationale}</p>
                </div>
                <RowActions
                  pending={pending}
                  onConfirm={() => handle(`vendor:${vendor.id}`, () => onConfirmVendor(vendor.id))}
                  onDismiss={() =>
                    handle(`vendor:${vendor.id}`, () => onDismiss("vendor", vendor.id))
                  }
                />
              </div>
            </li>
          ))}
          {visibleVendors.length === 0 ? <EmptyState text="No proposed suppliers are waiting for review." /> : null}
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

function TabButton({
  active,
  count,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  count: number;
  icon: React.ReactNode;
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

function CiaChip({ label, level }: { label: string; level: CiaLevel }) {
  return (
    <span className={`rounded border px-1.5 py-0.5 text-xs font-medium ${ciaColor[level]}`}>
      {label}: {level}
    </span>
  );
}

function RowActions({
  onConfirm,
  onDismiss,
  pending,
}: {
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
        Confirm
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={onDismiss}
        className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground/70 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <X className="h-4 w-4" aria-hidden="true" />
        Dismiss
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
