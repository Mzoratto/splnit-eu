import assert from "node:assert/strict";
import {
  normalizeTrustCenterSlug,
  TRUST_CENTER_RESERVED_SLUGS,
} from "@/lib/trust-center/settings";

assert.deepEqual(TRUST_CENTER_RESERVED_SLUGS, ["demo", "splnit"]);

assert.equal(normalizeTrustCenterSlug(" Prospect-Portal "), "prospect-portal");
assert.equal(normalizeTrustCenterSlug("prospect-1"), "prospect-1");

for (const reservedSlug of TRUST_CENTER_RESERVED_SLUGS) {
  assert.throws(
    () => normalizeTrustCenterSlug(reservedSlug),
    /reserved Trust Center slug/,
    `${reservedSlug} should not be available as an organisation Trust Center slug.`,
  );
}

assert.throws(() => normalizeTrustCenterSlug("-bad"), /invalid Trust Center slug/);
assert.throws(() => normalizeTrustCenterSlug("bad-"), /invalid Trust Center slug/);
assert.throws(() => normalizeTrustCenterSlug("x"), /invalid Trust Center slug/);
assert.throws(() => normalizeTrustCenterSlug("has space"), /invalid Trust Center slug/);

console.log("Trust Center settings smoke passed.");
