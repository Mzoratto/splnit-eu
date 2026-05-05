import assert from "node:assert/strict";
import { getIncidentReportProfile } from "../lib/incidents/reporting";
import { renderIncidentNotificationPdf } from "../lib/pdf/incident-notification";
import type { incidents } from "../lib/db/schema";

type Incident = typeof incidents.$inferSelect;

const incident = {
  affectsCriticalSystems: true,
  affectsPersonalData: true,
  clerkOrgId: "org_it_demo",
  createdAt: new Date("2026-05-05T10:00:00.000Z"),
  description: "Accesso non autorizzato a un pannello amministrativo SaaS.",
  detectedAt: new Date("2026-05-05T09:00:00.000Z"),
  id: "incident_it_demo",
  nukibReportedAt: null,
  reportedToNukib: false,
  reportedToUoou: false,
  resolvedAt: null,
  severity: "high",
  status: "investigating",
  title: "Accesso amministratore sospetto",
  uoouReportedAt: null,
} satisfies Incident;

const acn = getIncidentReportProfile({
  jurisdiction: "IT",
  locale: "it-IT",
  track: "cybersecurity",
});

assert.equal(acn.authority, "ACN / CSIRT Italia");
assert.equal(acn.citation, "D.Lgs. 138/2024, Art. 25");
assert.deepEqual(acn.timeline, [
  "Preallarme entro 24 ore dalla conoscenza dell'incidente significativo",
  "Notifica entro 72 ore dalla conoscenza dell'incidente significativo",
  "Relazione finale entro un mese dalla notifica",
]);

const garante = getIncidentReportProfile({
  jurisdiction: "IT",
  locale: "it-IT",
  track: "dataProtection",
});

assert.equal(garante.authority, "Garante per la protezione dei dati personali");
assert.equal(garante.citation, "GDPR Art. 33-34");
assert.match(garante.timeline.join("\n"), /72 ore/);

async function main() {
  const acnPdf = await renderIncidentNotificationPdf({
    generatedAt: new Date("2026-05-05T11:00:00.000Z"),
    incident,
    organisation: {
      ico: "IT-12345678901",
      locale: "it-IT",
      name: "Demo SRL",
      primaryJurisdiction: "IT",
    },
    track: "cybersecurity",
  });

  const garantePdf = await renderIncidentNotificationPdf({
    generatedAt: new Date("2026-05-05T11:00:00.000Z"),
    incident,
    organisation: {
      ico: "IT-12345678901",
      locale: "it-IT",
      name: "Demo SRL",
      primaryJurisdiction: "IT",
    },
    track: "dataProtection",
  });

  assert.ok(acnPdf.byteLength > 1000, "ACN PDF should render non-empty output.");
  assert.ok(
    garantePdf.byteLength > 1000,
    "Garante PDF should render non-empty output.",
  );

  console.log("Incident notification smoke test passed.");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
