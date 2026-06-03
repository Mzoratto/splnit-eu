import { z } from "zod";
import type { FrameworkSlug } from "@/lib/controls/library";
import { FRAMEWORK_LIBRARY } from "@/lib/frameworks/registry";
import {
  ACCOUNTING_PLATFORM_OPTIONS,
  AI_USAGE_OPTIONS,
  BUSINESS_MODEL_OPTIONS,
  EMPLOYEE_BAND_OPTIONS,
  PERSONAL_DATA_OPTIONS,
  PROCESSOR_USAGE_OPTIONS,
  SECTOR_OPTIONS,
} from "@/lib/onboarding/intake-questions";
import type { IntakeAnswers } from "@/lib/onboarding/intake-scope";
import { TOOL_INVENTORY_LIBRARY } from "@/lib/onboarding/tools";

function optionValues<const T extends readonly { value: string }[]>(options: T) {
  return options.map((option) => option.value) as [T[number]["value"], ...T[number]["value"][]];
}

const frameworkSlugs = FRAMEWORK_LIBRARY.map((framework) => framework.slug) as [FrameworkSlug, ...FrameworkSlug[]];
const toolKeys = TOOL_INVENTORY_LIBRARY.map((tool) => tool.key) as [string, ...string[]];

export const onboardingIntakeStepInputSchema = z.object({
  answers: z.object({
    accountingPlatform: z.enum(optionValues(ACCOUNTING_PLATFORM_OPTIONS)).optional(),
    businessModel: z.enum(optionValues(BUSINESS_MODEL_OPTIONS)),
    employeeBand: z.enum(optionValues(EMPLOYEE_BAND_OPTIONS)),
    handlesPersonalData: z.enum(optionValues(PERSONAL_DATA_OPTIONS)),
    handlesSensitiveData: z.boolean(),
    hasCriticalOperations: z.boolean(),
    hasProductionSoftware: z.boolean(),
    hasPublicApp: z.boolean(),
    sector: z.enum(optionValues(SECTOR_OPTIONS)),
    usesAiSystems: z.enum(optionValues(AI_USAGE_OPTIONS)),
    usesCloudHosting: z.boolean(),
    usesHighRiskAi: z.boolean(),
    usesThirdPartyProcessors: z.enum(optionValues(PROCESSOR_USAGE_OPTIONS)),
  }),
  selectedFrameworks: z.array(z.enum(frameworkSlugs)).min(1).max(FRAMEWORK_LIBRARY.length),
  selectedTools: z.array(z.enum(toolKeys)).max(TOOL_INVENTORY_LIBRARY.length),
});

export type OnboardingIntakeStepInput = Omit<
  z.infer<typeof onboardingIntakeStepInputSchema>,
  "answers" | "selectedFrameworks"
> & {
  answers: IntakeAnswers;
  selectedFrameworks: FrameworkSlug[];
};

export function parseOnboardingIntakeStepInput(input: unknown): OnboardingIntakeStepInput {
  return onboardingIntakeStepInputSchema.parse(input) as OnboardingIntakeStepInput;
}
