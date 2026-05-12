import { equal } from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const publicTrustUi = readFileSync(
  join(root, "components/trust-center/public-trust-ui.tsx"),
  "utf8",
);
const trustCenterAdminPage = readFileSync(
  join(root, "app/(app)/trust-center/page.tsx"),
  "utf8",
);
const publicTrustCopy = readFileSync(
  join(root, "lib/trust-center/public-copy.ts"),
  "utf8",
);

equal(
  publicTrustUi.includes("timeStyle"),
  false,
  "Public Trust Center UI must not expose exact timestamp formatting.",
);

equal(
  publicTrustUi.includes("formatTimeUntil"),
  false,
  "Public Trust Center UI must not expose exact next-test timing intervals.",
);

equal(
  trustCenterAdminPage.includes('/trust/demo'),
  false,
  "Trust Center admin must not fall back to the public demo Trust Center.",
);

equal(
  publicTrustUi.includes("{copy.liveIndicator.next}"),
  false,
  "Public Trust Center live indicator must not expose next-run dates.",
);

equal(
  /every hour|každou hodinu|ogni ora/i.test(publicTrustCopy),
  false,
  "Public Trust Center copy must not expose exact test schedules.",
);

console.log("Trust Center public disclosure smoke passed.");
