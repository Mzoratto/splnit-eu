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

try {
  const fixture = JSON.parse(readFileSync(fixturePath, "utf8"));
  const parsed = NukibRegistrationSchema.parse(fixture);
  const roles = new Set(parsed.contacts.map((contact) => contact.role));

  if (!roles.has("primary") || !roles.has("technical")) {
    throw new Error("Fixture must include at least one primary and one technical contact.");
  }

  console.log("NÚKIB registration template fixture is valid.");
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
