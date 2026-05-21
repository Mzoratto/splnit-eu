import { pohodaWorkspace } from "@/lib/workspaces/pohoda";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const allControls = pohodaWorkspace.layers.flatMap((layer) => layer.controls);
const designatedPerson = allControls.find(
  (control) => control.controlKey === "§4-poverena-osoba",
);
const backupControl = allControls.find(
  (control) => control.controlKey === "pohoda-backup-automated-daily",
);

assert(pohodaWorkspace.layers.length === 4, "Pohoda workspace must keep 4 layers.");
assert(designatedPerson, "Pohoda workspace must include §4 designated person control.");
assert(
  designatedPerson.nukibTier === "mandatory_minimum",
  "§4 designated person control must be mandatory minimum.",
);
assert(
  designatedPerson.frameworkMappings?.some(
    (mapping) => mapping.frameworkId === "zokb" && mapping.reference === "§ 4",
  ),
  "§4 designated person control must include ZoKB §4 mapping.",
);
assert(
  designatedPerson.evidenceFields?.some((field) => field.key === "skoleni_absolvovano"),
  "§4 designated person control must capture training completion.",
);
assert(
  backupControl?.frameworkMappings?.some(
    (mapping) => mapping.frameworkId === "zokb" && mapping.reference === "§ 6",
  ),
  "Pohoda daily backup control must include ZoKB §6 mapping.",
);
assert(
  backupControl?.nukibTier === "mandatory_minimum",
  "Pohoda daily backup control must be mandatory minimum.",
);

for (const control of allControls) {
  assert(
    typeof control.nis2ArticleRef === "string" && control.nis2ArticleRef.trim().length > 0,
    `Control "${control.controlKey}" is missing compatibility legal reference.`,
  );
}

console.log("Pohoda workspace config smoke passed");
