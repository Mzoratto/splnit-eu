import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import {
  computeVboNCoverage,
  groupVboNCoverage,
  summarizeVboNCoverage,
  type VboNCoverageStatus,
} from "@/lib/regulations/vbo-n/coverage";
import { VBO_N_SPEC } from "@/lib/regulations/vbo-n/spec";

export const metadata = {
  title: "Demo: NÚKIB baseline VBO-N | Splnit.eu",
  description:
    "Ukázka pokrytí 47 opatření vyhlášky č. 410/2025 Sb. v režimu nižších povinností na demo datech.",
};

// Demo org state: a believable mid-implementation SMB. The coverage below is
// computed by the SAME engine the product uses — only these inputs are demo.
const DEMO_STATUSES: Record<string, string> = {
  ctrl_cryptography_policy: "pass",
  ctrl_endpoint_protection: "pass",
  ctrl_incident_72h_notification: "pass",
  ctrl_logging_monitoring: "pass",
  ctrl_mfa_all_users: "pass",
  ctrl_network_segmentation: "pass",
  ctrl_offboarding_access_revoked: "pass",
  ctrl_password_policy: "pass",
  ctrl_patch_management: "pass",
  ctrl_security_event_alerting: "pass",
  ctrl_security_policy_approved: "pass",
  ctrl_security_training_annual: "pass",
};

// Vrcholné vedení demo records: pověřená osoba + schválené priority obnovy
// exist; pravidelné školení vedení je po lhůtě (proto N-4-02 chybí).
const DEMO_RECORD_OVERRIDES: Record<string, boolean> = {
  "N-4-01": true,
  "N-4-06": true,
};

const COVERAGE_CHIP_CLASS: Record<VboNCoverageStatus, string> = {
  covered:
    "border-[var(--status-pass-border)] bg-[var(--status-pass-subtle)] text-[var(--status-pass)]",
  partial:
    "border-[var(--status-warn-border)] bg-[var(--status-warn-subtle)] text-[var(--status-warn)]",
  missing:
    "border-[var(--status-fail-border)] bg-[var(--status-fail-subtle)] text-[var(--status-fail)]",
};

const COVERAGE_LABELS: Record<VboNCoverageStatus, string> = {
  covered: "Pokryto",
  missing: "Chybí",
  partial: "Částečně",
};

const PREHLED_EXAMPLE_ROWS = [
  {
    detail: "Popis zavedení: MFA vynuceno v Microsoft Entra ID pro všechny účty.",
    id: "V-8-02",
    ref: "§ 8 VBO-N",
    status: "Zavedeno",
  },
  {
    detail:
      "Termín: 30. 9. 2026 · Priorita: vysoká · Odpovědná osoba: pověřená osoba KB",
    id: "N-5-03",
    ref: "§ 5 VBO-N",
    status: "Plánováno",
  },
  {
    detail:
      "Odůvodnění: Výměnná média nejsou v organizaci povolena, autorun není relevantní.",
    id: "V-9-03",
    ref: "§ 9 VBO-N",
    status: "Nezavedeno",
  },
] as const;

export default function DemoVboNPage() {
  const items = computeVboNCoverage({
    recordOverrides: DEMO_RECORD_OVERRIDES,
    statusesByControlKey: DEMO_STATUSES,
  });
  const summary = summarizeVboNCoverage(items);
  const gaps = items.filter((item) => item.coverage === "missing");
  const grouped = groupVboNCoverage(items);

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Vyhláška č. 410/2025 Sb. · demo data"
        title="NÚKIB baseline — režim nižších povinností"
        subtitle="Pokrytí 47 opatření z manuálu NÚKIB spočítané stejným enginem jako v aplikaci — pouze vstupní data jsou ukázková. Výstup je návrh dle požadavků vyhlášky, ne právní stanovisko."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {(["covered", "partial", "missing"] as const).map((status) => (
          <div key={status} className="rounded-lg border border-border bg-surface p-4">
            <p className="text-xs text-foreground/52">{COVERAGE_LABELS[status]}</p>
            <p className="mt-1 font-mono text-2xl font-semibold">
              {summary[status]}
              <span className="text-sm font-normal text-foreground/48">
                {" "}
                / {summary.total}
              </span>
            </p>
          </div>
        ))}
      </div>

      <section className="rounded-lg border border-border bg-surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">
              Přehled bezpečnostních opatření (§ 3 odst. 2)
            </h2>
            <p className="mt-1 text-sm text-foreground/58">
              Zákonný dokument generovaný z vyplněných stavů: tři stavy s povinnými
              náležitostmi, neměnné verze (uchovávejte nejméně 4 roky) a roční
              připomenutí přezkumu. Neopominutelná opatření nelze označit jako
              nezavedená.
            </p>
          </div>
          <span className="mono rounded-full border border-[var(--accent-border)] bg-[var(--accent-subtle)] px-3 py-1 text-xs text-[var(--accent)]">
            ukázka výstupu
          </span>
        </div>
        <div className="mt-4 divide-y divide-border">
          {PREHLED_EXAMPLE_ROWS.map((row) => (
            <div key={row.id} className="py-3 text-sm">
              <p>
                <span className="mono text-xs text-foreground/58">{row.id}</span> ·{" "}
                <span className="mono text-xs text-foreground/48">{row.ref}</span> ·{" "}
                <strong>{row.status}</strong>
              </p>
              <p className="mt-1 text-foreground/64">{row.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {gaps.length ? (
        <section className="rounded-lg border border-[var(--status-fail-border)] bg-surface p-5">
          <h2 className="text-lg font-semibold">Nepokrytá opatření</h2>
          <p className="mt-1 text-sm text-foreground/58">
            Opatření bez namapované kontroly — přesně to, co kontrola NÚKIB uvidí
            jako první. V aplikaci je doplníte ručně nebo modulem Vrcholné vedení.
          </p>
          <div className="mt-3">
            {gaps.map((item) => (
              <div
                key={item.id}
                className="grid gap-2 border-t border-border py-3 text-sm md:grid-cols-[110px_1fr_120px]"
              >
                <span className="mono text-xs text-foreground/58">{item.id}</span>
                <span>
                  <span className="block leading-6">{item.control}</span>
                  <span className="mono mt-1 block text-xs text-foreground/48">
                    {item.ref}
                  </span>
                </span>
                <span
                  className={`mono inline-flex h-fit items-center justify-self-start rounded-full border px-2.5 py-0.5 text-xs md:justify-self-end ${COVERAGE_CHIP_CLASS.missing}`}
                >
                  {COVERAGE_LABELS.missing}
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {grouped.map((tierGroup) => (
        <section
          key={tierGroup.tier}
          className="rounded-lg border border-border bg-surface p-5"
        >
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold">
              {tierGroup.tier === "neopominutelné"
                ? "Neopominutelná opatření"
                : "Vyhodnotitelná opatření"}
            </h2>
            <span className="mono rounded-full border border-[var(--accent-border)] bg-[var(--accent-subtle)] px-2.5 py-0.5 text-xs text-[var(--accent)]">
              {tierGroup.tier === "neopominutelné" ? "vždy vyžadováno" : "posuzované"}
            </span>
          </div>
          {tierGroup.areas.map((areaGroup) => (
            <div key={areaGroup.area} className="mt-4">
              <h3 className="text-sm font-semibold text-foreground/72">
                {areaGroup.area}
              </h3>
              <div className="mt-2">
                {areaGroup.items.map((item) => (
                  <div
                    key={item.id}
                    className="grid gap-2 border-t border-border py-3 text-sm md:grid-cols-[110px_1fr_120px]"
                  >
                    <span className="mono text-xs text-foreground/58">{item.id}</span>
                    <span>
                      <span className="block leading-6">{item.control}</span>
                      <span className="mono mt-1 block text-xs text-foreground/48">
                        {item.ref}
                      </span>
                    </span>
                    <span
                      className={`mono inline-flex h-fit items-center justify-self-start rounded-full border px-2.5 py-0.5 text-xs md:justify-self-end ${COVERAGE_CHIP_CLASS[item.coverage]}`}
                    >
                      {COVERAGE_LABELS[item.coverage]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      ))}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--accent-border)] bg-[var(--accent-subtle)] p-5">
        <p className="text-sm text-foreground/72">
          Chcete vidět pokrytí na vlastních datech? Registrace zabere pár minut.
        </p>
        <Link href="/early-access" className="btn btn-primary">
          Získat přístup
          <ArrowRight className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
        </Link>
      </div>

      <p className="text-xs leading-5 text-foreground/52">
        Zdroj: {VBO_N_SPEC.meta.source}
      </p>
    </section>
  );
}
