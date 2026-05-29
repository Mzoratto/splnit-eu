import { readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import {
  parseNukibRegistrationContent,
  serializeNukibRegistrationContent,
} from "@/lib/compliance/nukib/registration-artifact";
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
  assertTemplate(
    NukibRegistrationSchema.safeParse({
      ...fixture,
      serviceNetworkScope: {
        ...fixture.serviceNetworkScope,
        ipRanges: ["192.0.2.0/24"],
      },
    }).success,
    "FAIL: valid CIDR 192.0.2.0/24 rejected",
  );
  assertTemplate(
    !NukibRegistrationSchema.safeParse({
      ...fixture,
      serviceNetworkScope: {
        ...fixture.serviceNetworkScope,
        ipRanges: ["999.999.999.999"],
      },
    }).success,
    "FAIL: invalid IPv4 octets accepted",
  );
  assertTemplate(
    !NukibRegistrationSchema.safeParse({
      ...fixture,
      serviceNetworkScope: {
        ...fixture.serviceNetworkScope,
        ipRanges: ["192.0.2.0/99"],
      },
    }).success,
    "FAIL: invalid CIDR mask accepted",
  );
  assertTemplate(
    NukibRegistrationSchema.safeParse({
      ...fixture,
      contacts: fixture.contacts.map((contact: { role: string }) =>
        contact.role === "primary"
          ? { ...contact, phone: "+420 200 000 001" }
          : contact,
      ),
    }).success,
    "FAIL: valid international phone rejected",
  );
  assertTemplate(
    !NukibRegistrationSchema.safeParse({
      ...fixture,
      contacts: fixture.contacts.map((contact: { role: string }) =>
        contact.role === "primary"
          ? { ...contact, phone: "+420****6789" }
          : contact,
      ),
    }).success,
    "FAIL: masked/free-text phone accepted",
  );

  const serialized = serializeNukibRegistrationContent(parsed);
  assertTemplate(
    typeof serialized === "object" && serialized !== null && !Array.isArray(serialized),
    "FAIL: serialized content is not a JSON object",
  );
  assertTemplate(
    parseNukibRegistrationContent(serialized).ico === parsed.ico,
    "FAIL: object JSONB content parsing failed",
  );
  assertTemplate(
    parseNukibRegistrationContent(JSON.stringify(serialized)).ico === parsed.ico,
    "FAIL: legacy string JSON content parsing failed",
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
