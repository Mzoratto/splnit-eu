import { match } from "node:assert/strict";
import { readFileSync } from "node:fs";

const controlsPageSource = readFileSync("app/(app)/controls/page.tsx", "utf8");
const controlsQuerySource = readFileSync("lib/db/queries/controls.ts", "utf8");

match(
  controlsPageSource,
  /import \{ ActivationStatus, deriveActivationStatusState \} from "@\/components\/activation\/activation-status";/,
  "Controls focus page should render the shared activation status component.",
);

match(
  controlsPageSource,
  /state=\{deriveActivationStatusState\(\{[\s\S]*assessmentResult: control\.latestEvidenceAssessmentResult,/,
  "Controls focus cards should derive activation state from the latest evidence row.",
);

match(
  controlsPageSource,
  /showDetails=\{viewMode === "focus"\}/,
  "Focus cards should show status details while all-controls cards stay compact.",
);

match(
  controlsQuerySource,
  /latestEvidenceAssessmentResult: EvidenceAssessmentResult \| null;/,
  "Controls index query type should expose latest evidence assessment result.",
);

match(
  controlsQuerySource,
  /\.from\(evidence\)[\s\S]*eq\(evidence\.clerkOrgId, clerkOrgId\)[\s\S]*inArray\(evidence\.controlId,/,
  "Controls index query should load latest evidence state for the active organisation controls.",
);

match(
  controlsQuerySource,
  /existing\.lastKnownAssessmentResult = row\.assessmentResult;/,
  "Controls index query should preserve the previous confirmed result when the latest evidence is blocked.",
);

match(
  controlsQuerySource,
  /latestEvidenceSource: EvidenceSource \| null;/,
  "Controls index query type should expose latest evidence source so manual evidence can be distinguished.",
);

match(
  controlsPageSource,
  /reviewStatus: control\.status,[\s\S]*source: control\.latestEvidenceSource,/,
  "Controls focus cards should pass manual review status and evidence source into the shared activation state.",
);
