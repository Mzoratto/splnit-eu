import { Icon } from "@/components/marketing/local-icon";

export function DashboardMockup() {
  return (
    <div
      className="relative mx-auto mt-16 hidden max-w-5xl md:block"
      id="dashboard-wrap"
    >
      <div className="dash-glow relative rounded-[28px] p-px grad-border">
        <div className="overflow-hidden rounded-[27px] bg-white">
          <div className="flex h-11 items-center gap-3 border-b border-zinc-100 bg-zinc-50 px-4">
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-zinc-200" />
              <div className="h-2.5 w-2.5 rounded-full bg-zinc-200" />
              <div className="h-2.5 w-2.5 rounded-full bg-zinc-200" />
            </div>
            <div className="flex flex-1 justify-center">
              <div className="flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-4 py-1 text-xs font-medium text-zinc-400">
                <Icon
                  icon="solar:lock-keyhole-minimalistic-linear"
                  className="text-xs text-zinc-300"
                  aria-hidden="true"
                />
                app.splnit.eu/prehled
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="pulse-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span className="mono text-[10px] text-zinc-400">Živý přehled</span>
            </div>
          </div>

          <div className="flex h-[420px] bg-zinc-50/40">
            <aside className="hidden w-52 shrink-0 flex-col gap-0.5 border-r border-zinc-100 bg-white p-4 md:flex">
              <div className="mb-3 px-2 py-1.5">
                <div className="flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-blue-600">
                    <Icon
                      icon="solar:shield-keyhole-linear"
                      className="text-[10px] text-white"
                      aria-hidden="true"
                    />
                  </div>
                  <span className="text-xs font-semibold text-zinc-700">
                    Splnit.eu
                  </span>
                </div>
              </div>
              {[
                ["Přehled", "solar:widget-5-linear"],
                ["Předpisy", "solar:folder-with-files-linear"],
                ["Důkazy", "solar:document-add-linear"],
                ["Integrace", "solar:link-square-linear"],
                ["Trust Center", "solar:global-linear"],
              ].map(([label, icon], index) => (
                <div
                  key={label}
                  className={`sidebar-item flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors ${
                    index === 0
                      ? "bg-blue-50 text-blue-700"
                      : "text-zinc-500 hover:bg-zinc-50"
                  }`}
                >
                  <Icon icon={icon} aria-hidden="true" />
                  {label}
                </div>
              ))}
              <div className="mt-auto flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-50">
                <Icon icon="solar:users-group-rounded-linear" aria-hidden="true" />
                Tým
              </div>
            </aside>

            <div className="grid flex-1 gap-4 overflow-auto p-5 md:grid-cols-2">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-900">
                      Stav předpisů
                    </h3>
                    <p className="mt-0.5 text-[11px] text-zinc-400">
                      4 předpisy · Poslední test: 47 min. zpět
                    </p>
                  </div>
                  <div className="flex items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
                    <div className="h-1 w-1 rounded-full bg-emerald-500" />
                    Live
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-100 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 shrink-0">
                      <svg className="h-full w-full -rotate-90" viewBox="0 0 56 56">
                        <circle
                          cx="28"
                          cy="28"
                          r="22"
                          fill="none"
                          stroke="#F1F5F9"
                          strokeWidth="5"
                        />
                        <circle
                          id="score-ring"
                          cx="28"
                          cy="28"
                          r="22"
                          fill="none"
                          stroke="#2563EB"
                          strokeWidth="5"
                          strokeLinecap="round"
                          strokeDasharray="138.23"
                          strokeDashoffset="16.59"
                          className="ring-track"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span
                          className="score-number text-base font-semibold text-zinc-900"
                          id="score-val"
                        >
                          88%
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="mb-0.5 text-xs font-medium text-zinc-900">
                        Celkový soulad
                      </p>
                      <p className="text-[10px] text-zinc-400">
                        88 ze 100 kontrol splněno
                      </p>
                      <div className="mt-2 flex gap-1">
                        <span className="rounded-full border border-emerald-100 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                          14 PASS
                        </span>
                        <span className="rounded-full border border-amber-100 bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                          3 WARN
                        </span>
                        <span className="rounded-full border border-red-100 bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-600">
                          1 FAIL
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <FrameworkRow
                    icon="solar:shield-up-linear"
                    name="GDPR"
                    score="100%"
                    badge="Splněno"
                    barId="bar-gdpr"
                    barWidth="88%"
                    tone="emerald"
                  />
                  <FrameworkRow
                    icon="solar:server-square-linear"
                    name="NIS2"
                    score="84%"
                    badge="Zmapováno"
                    barId="bar-nis2"
                    barWidth="91%"
                    tone="amber"
                  />
                  <FrameworkRow
                    icon="solar:document-text-linear"
                    name="ISO 27001"
                    score="Čeká"
                    badge="Čeká"
                    barId="bar-aiact"
                    barWidth="67%"
                    tone="zinc"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="rounded-xl border border-zinc-100 bg-white p-4 shadow-sm">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-900">
                        Poslední testování
                      </h4>
                      <p className="mono mt-0.5 text-[10px] text-zinc-400">
                        2026-04-30 · 08:14:02 UTC
                      </p>
                    </div>
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50">
                      <Icon
                        icon="solar:bolt-circle-linear"
                        className="text-sm text-blue-600"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                  {[
                    ["check_mfa_enabled", "PASS", "text-emerald-600"],
                    ["check_conditional_access", "PASS", "text-emerald-600"],
                    ["check_guest_users", "WARN", "text-amber-500"],
                    ["check_privileged_roles", "PASS", "text-emerald-600"],
                  ].map(([check, state, color]) => (
                    <div
                      key={check}
                      className="flex items-center justify-between border-b border-zinc-50 py-1 text-[11px] last:border-b-0"
                    >
                      <span className="mono text-zinc-600">{check}</span>
                      <span className={`font-semibold ${color}`}>{state}</span>
                    </div>
                  ))}
                  <div className="mt-2 flex items-center gap-1 text-[10px] text-zinc-400">
                    <Icon icon="solar:link-circle-linear" aria-hidden="true" />
                    Microsoft 365 · 247 kontrol celkem
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 rounded-xl border border-zinc-100 bg-white p-4 shadow-sm">
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-900">
                      Data v EU (eu-west-1)
                    </h4>
                    <p className="mt-0.5 text-[10px] text-zinc-400">
                      Irsko · AWS · Šifrováno AES-256
                    </p>
                  </div>
                  <div
                    className="relative flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full bg-blue-600 shadow-inner"
                    id="mock-toggle"
                  >
                    <div
                      id="toggle-knob"
                      className="absolute right-0.5 h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-300"
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-emerald-900/50 bg-emerald-950 p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 rounded-lg bg-emerald-900/50 p-1.5">
                      <Icon
                        icon="solar:shield-network-linear"
                        className="text-base text-emerald-400"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-0.5 flex items-center gap-1.5">
                        <h4 className="text-xs font-semibold text-emerald-100">
                          Hodnocení rizik dodavatelů
                        </h4>
                        <span className="nukib-chip">High Trust</span>
                      </div>
                      <p className="text-[10px] text-emerald-400/80">
                        Poslední sken: 2 min. zpět
                      </p>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-emerald-900">
                        <div className="relative h-full w-[92%] overflow-hidden rounded-full bg-emerald-400">
                          <div
                            className="absolute inset-y-0 -left-1/2 w-1/3 bg-white/30"
                            style={{ animation: "shimmer 2.4s infinite" }}
                          />
                        </div>
                      </div>
                      <p className="mono mt-2 text-[10px] text-emerald-300">
                        vendor_risk_score · 92%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FrameworkRow({
  icon,
  name,
  score,
  badge,
  barId,
  barWidth,
  tone,
}: {
  icon: string;
  name: string;
  score: string;
  badge: string;
  barId: string;
  barWidth: string;
  tone: "emerald" | "amber" | "zinc";
}) {
  const color =
    tone === "emerald"
      ? "text-emerald-600 bg-emerald-50 border-emerald-100"
      : tone === "amber"
        ? "text-amber-600 bg-amber-50 border-amber-100"
        : "text-zinc-500 bg-zinc-100 border-zinc-200";
  const bar =
    tone === "emerald" ? "bg-emerald-400" : tone === "amber" ? "bg-amber-400" : "bg-zinc-300";

  return (
    <div className="flex cursor-default items-center gap-3 rounded-xl border border-zinc-100 bg-white p-3 shadow-sm transition-transform hover:-translate-y-0.5">
      <div className={`shrink-0 rounded-lg border p-1.5 ${color}`}>
        <Icon icon={icon} className="text-base" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-900">{name}</span>
          <span className={`text-[10px] font-semibold ${tone === "zinc" ? "text-zinc-500" : tone === "amber" ? "text-amber-600" : "text-emerald-600"}`}>
            {score}
          </span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-zinc-100">
          <div className={`progress-fill ${bar}`} style={{ width: barWidth }} id={barId} />
        </div>
      </div>
      <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${color}`}>
        {badge}
      </span>
    </div>
  );
}
