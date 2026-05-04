import { getMessagesForLocale } from "@/i18n/messages";
import { normalizeLocale, type Locale } from "@/i18n/routing";

export type CommonRisk = {
  category: string;
  description: string;
  impact: number;
  likelihood: number;
  owner: string;
  title: string;
};

type CommonRiskBase = Pick<CommonRisk, "category" | "impact" | "likelihood">;

const COMMON_SME_RISK_BASE: CommonRiskBase[] = [
  {
    category: "identity",
    impact: 5,
    likelihood: 4,
  },
  {
    category: "backup",
    impact: 5,
    likelihood: 3,
  },
  {
    category: "vendor",
    impact: 4,
    likelihood: 4,
  },
  {
    category: "incident",
    impact: 4,
    likelihood: 3,
  },
  {
    category: "data",
    impact: 4,
    likelihood: 4,
  },
  {
    category: "endpoint",
    impact: 4,
    likelihood: 3,
  },
  {
    category: "access",
    impact: 4,
    likelihood: 4,
  },
  {
    category: "ai",
    impact: 3,
    likelihood: 5,
  },
  {
    category: "logging",
    impact: 3,
    likelihood: 4,
  },
  {
    category: "training",
    impact: 3,
    likelihood: 3,
  },
];

export function getCommonSmeRisks(locale: Locale | string | null | undefined) {
  const normalizedLocale = normalizeLocale(locale) ?? "cs-CZ";
  const copy = getMessagesForLocale(normalizedLocale).risks.demoRisks;

  return COMMON_SME_RISK_BASE.map((risk, index) => {
    const localizedRisk = copy[index];

    return {
      ...risk,
      description: localizedRisk?.description ?? "",
      owner: localizedRisk?.owner ?? "",
      title: localizedRisk?.title ?? risk.category,
    };
  });
}
