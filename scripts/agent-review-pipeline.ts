import { spawnSync } from "node:child_process";

const VALID_FRAMEWORKS = ["nis2", "eu_ai_act", "gdpr", "iso27001"] as const;
const VALID_JURISDICTIONS = ["it", "cz", "eu", "de", "fr", "es", "other"] as const;

type MappingReviewFramework = (typeof VALID_FRAMEWORKS)[number];
type MappingReviewJurisdiction = (typeof VALID_JURISDICTIONS)[number];

function getArg(name: string) {
  const inlineValue = process.argv.find((arg) => arg.startsWith(`${name}=`));

  if (inlineValue) {
    return inlineValue.slice(name.length + 1) || null;
  }

  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1] ?? null;
}

function hasFlag(name: string) {
  return process.argv.includes(name);
}

function requireEnum<T extends readonly string[]>(
  value: string | null,
  validValues: T,
  name: string,
): T[number] {
  if (value && validValues.includes(value)) {
    return value as T[number];
  }

  throw new Error(
    `${name} must be one of ${validValues.join(", ")}. Received: ${value ?? "(missing)"}`,
  );
}

function runNpmScript(script: string, args: string[]) {
  console.log(`\n> npm run ${script} -- ${args.join(" ")}`);
  const result = spawnSync("npm", ["run", script, "--", ...args], {
    env: process.env,
    stdio: "inherit",
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(`${script} failed with exit code ${result.status ?? "unknown"}.`);
  }
}

function baseArgs(input: {
  framework: MappingReviewFramework;
  jurisdiction: MappingReviewJurisdiction;
}) {
  const args = ["--framework", input.framework];

  if (input.framework !== "iso27001") {
    args.push("--jurisdiction", input.jurisdiction);
  }

  return args;
}

function optionalArg(args: string[], name: string) {
  const value = getArg(name);

  if (value) {
    args.push(name, value);
  }
}

function optionalFlag(args: string[], name: string) {
  if (hasFlag(name)) {
    args.push(name);
  }
}

function main() {
  const framework = requireEnum(
    getArg("--framework"),
    VALID_FRAMEWORKS,
    "--framework",
  );
  const jurisdiction =
    framework === "iso27001"
      ? "eu"
      : requireEnum(getArg("--jurisdiction"), VALID_JURISDICTIONS, "--jurisdiction");
  const shouldApply = hasFlag("--apply");

  const stage1Args = baseArgs({ framework, jurisdiction });
  optionalArg(stage1Args, "--input");
  optionalArg(stage1Args, "--language");
  optionalFlag(stage1Args, "--embed");
  optionalFlag(stage1Args, "--replace");
  if (shouldApply) stage1Args.push("--apply");

  const stage2Args = baseArgs({ framework, jurisdiction });
  optionalArg(stage2Args, "--limit");
  if (shouldApply) stage2Args.push("--apply");

  const stage3Args = baseArgs({ framework, jurisdiction });
  optionalArg(stage3Args, "--limit");
  if (shouldApply) stage3Args.push("--apply");

  const stage4Args = baseArgs({ framework, jurisdiction });
  optionalArg(stage4Args, "--limit");
  if (shouldApply) stage4Args.push("--apply");

  console.log(
    JSON.stringify(
      {
        apply: shouldApply,
        framework,
        jurisdiction,
        mode: shouldApply ? "write" : "dry-run",
        stages: ["stage1", "stage2", "stage3", "stage4"],
      },
      null,
      2,
    ),
  );

  runNpmScript("agent:review:stage1", stage1Args);
  runNpmScript("agent:review:stage2", stage2Args);
  runNpmScript("agent:review:stage3", stage3Args);
  runNpmScript("agent:review:stage4", stage4Args);
}

try {
  main();
} catch (error: unknown) {
  console.error(error);
  process.exit(1);
}
