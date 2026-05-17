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
const publicTrustPage = readFileSync(
  join(root, "app/(marketing)/trust/[orgSlug]/page.tsx"),
  "utf8",
);
const publicTrustFrameworkPage = readFileSync(
  join(root, "app/(marketing)/trust/[orgSlug]/frameworks/[frameworkSlug]/page.tsx"),
  "utf8",
);
const publicTrustOgImage = readFileSync(
  join(root, "app/(marketing)/trust/[orgSlug]/opengraph-image.tsx"),
  "utf8",
);

const publicTrustSurface = [
  publicTrustCopy,
  publicTrustPage,
  publicTrustFrameworkPage,
  publicTrustOgImage,
  publicTrustUi,
].join("\n");

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

equal(
  /verified continuously|průběžně ověřov|EU compliance status|stav souladu s EU|stato compliance UE|Last verified|next test/i.test(
    publicTrustSurface,
  ),
  false,
  "Public Trust Center must not overclaim continuous verification or public EU compliance status.",
);

equal(
  /\{framework\.(verified|inProgress|notApplicable)\}\s*\{copy\.frameworkCard|categoryCounts\.verified|\bcontrolCount\b|\bframeworkCount\b|documents\.length/.test(
    publicTrustSurface,
  ),
  false,
  "Public Trust Center must not render exact public framework/control/document counts.",
);

equal(
  /framework\.score\s*\?\?/.test(publicTrustSurface),
  false,
  "Public Trust Center must not render exact framework score percentages publicly.",
);

console.log("Trust Center public disclosure smoke passed.");
