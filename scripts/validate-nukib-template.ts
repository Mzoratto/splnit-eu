import { readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { NukibRegistrationSchema } from "@/lib/compliance/nukib/registration-schema";

const fixturePath = join(
  process.cwd(),
  "scripts",
  "fixtures",
  "nukib-registration-fixture.json",
);

function assertTemplate(condition: boolean, message: string) {
  console.assert(condition, message);

  if (!condition) {
    throw new Error(message);
  }
}

try {
  const fixture = JSON.parse(readFileSync(fixturePath, "utf8"));
  const parsed = NukibRegistrationSchema.parse(fixture);
  const roles = parsed.contacts.map((contact) => contact.role);

  assertTemplate(roles.includes("primary"), "FAIL: no primary contact");
  assertTemplate(roles.includes("technical"), "FAIL: no technical contact");
  assertTemplate(roles.includes("statutory"), "FAIL: no statutory contact");
  assertTemplate(
    Array.isArray(parsed.serviceNetworkScope?.ipRanges),
    "FAIL: ipRanges missing",
  );
  assertTemplate(
    Array.isArray(parsed.serviceNetworkScope?.domainNames),
    "FAIL: domainNames missing",
  );

  console.log("✓ NÚKIB registration fixture valid");
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error(JSON.stringify(z.flattenError(error), null, 2));
  } else if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error("Unknown validation error.");
  }

  process.exit(1);
}
