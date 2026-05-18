import type { FrameworkSlug } from "@/lib/controls/library";
import type { IntakeAnswers } from "@/lib/onboarding/intake-scope";

export type FrameworkApplicability = "mandatory" | "recommended" | "monitor" | "out_of_scope";

export type FrameworkAssessment = {
  slug: FrameworkSlug;
  applicability: FrameworkApplicability;
  reason: string;
  selectedByDefault: boolean;
};

export function deriveFrameworkAssessment(answers: IntakeAnswers): FrameworkAssessment[] {
  const employeeThresholdMet = answers.employeeBand !== "1_9";
  const sellsBusinessServices = ["professional_services", "saas", "regulated_service"].includes(
    answers.businessModel,
  );
  const providesDigitalServices =
    answers.businessModel === "saas" ||
    answers.usesCloudHosting ||
    answers.hasPublicApp ||
    answers.hasProductionSoftware;
  const nis2Applies = employeeThresholdMet && (sellsBusinessServices || providesDigitalServices);
  const gdprApplies = answers.handlesPersonalData !== "none";
  const isoRecommended = nis2Applies || gdprApplies;
  const aiActApplicability: FrameworkApplicability =
    answers.usesAiSystems === "customer_or_patient_facing" || answers.usesHighRiskAi
      ? "mandatory"
      : answers.usesAiSystems === "internal_productivity"
        ? "monitor"
        : "out_of_scope";

  return [
    {
      slug: "nis2",
      applicability: nis2Applies ? "mandatory" : "out_of_scope",
      selectedByDefault: nis2Applies,
      reason: nis2Applies
        ? "NIS2 je předvybraná, protože máte 10+ zaměstnanců a dodáváte služby nebo digitální provoz dalším organizacím."
        : "NIS2 zatím nepředvybíráme: podle odpovědí jste pod prahovou velikostí, nebo nejde o B2B/digitální provoz. Pokud vám zákazník NIS2 výslovně požaduje, můžete ji přidat ručně.",
    },
    {
      slug: "gdpr",
      applicability: gdprApplies ? "mandatory" : "out_of_scope",
      selectedByDefault: gdprApplies,
      reason: gdprApplies
        ? "GDPR je předvybrané, protože zpracováváte osobní údaje zákazníků nebo zaměstnanců."
        : "GDPR zatím nepředvybíráme pro zákaznická data. I bez zákaznických údajů může být potřeba základní HR evidence, pokud zpracováváte údaje zaměstnanců.",
    },
    {
      slug: "iso27001",
      applicability: isoRecommended ? "recommended" : "out_of_scope",
      selectedByDefault: false,
      reason: isoRecommended
        ? "ISO 27001 je doporučené, ne povinné. Překryv kontrol s NIS2/GDPR je velký, takže ho můžete přidat později s malým dodatečným úsilím."
        : "ISO 27001 je dobrovolná certifikace. Doporučíme ji hlavně ve chvíli, kdy míříte na enterprise zákazníky nebo už řešíte NIS2/GDPR."
    },
    {
      slug: "ai-act",
      applicability: aiActApplicability,
      selectedByDefault: aiActApplicability === "mandatory",
      reason:
        aiActApplicability === "mandatory"
          ? "EU AI Act je předvybraný, protože stavíte nebo nasazujete AI do produktů či služeb pro zákazníky, případně může jít o vysoce rizikové použití."
          : aiActApplicability === "monitor"
            ? "EU AI Act zatím jen sledujte: používáte AI interně pro produktivitu, ale nevypadá to jako zákaznický nebo vysoce rizikový AI systém."
            : "EU AI Act je mimo úvodní rozsah, protože jste neuvedli použití AI systémů v produktech, službách ani interních nástrojích.",
    },
  ];
}

export function getDefaultFrameworkSlugs(assessment: readonly FrameworkAssessment[]): FrameworkSlug[] {
  return assessment.filter((item) => item.selectedByDefault).map((item) => item.slug);
}
