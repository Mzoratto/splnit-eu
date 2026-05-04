import type { Organisation } from "@/lib/db/schema";
import {
  POLICY_TEMPLATES,
  POLICY_TEMPLATE_TYPES,
  type PolicyTemplate,
  type PolicyTemplateType,
} from "@/lib/policies/templates";

type TemplateTenant = Pick<Organisation, "locale" | "primaryJurisdiction">;

export class TemplateNotFoundError extends Error {
  constructor(
    family: string,
    tenant: Pick<TemplateTenant, "locale" | "primaryJurisdiction">,
  ) {
    super(
      `No policy template found for ${family} (${tenant.primaryJurisdiction}, ${tenant.locale})`,
    );
    this.name = "TemplateNotFoundError";
  }
}

function getTenantContext(tenant: TemplateTenant | null | undefined) {
  return {
    locale: tenant?.locale ?? "cs-CZ",
    primaryJurisdiction: tenant?.primaryJurisdiction ?? "CZ",
  };
}

export function resolvePolicyTemplate(
  family: PolicyTemplateType,
  tenant?: TemplateTenant | null,
): PolicyTemplate {
  const context = getTenantContext(tenant);
  const exact = POLICY_TEMPLATES.find(
    (template) =>
      template.templateFamily === family &&
      template.jurisdiction === context.primaryJurisdiction &&
      template.locale === context.locale,
  );

  if (exact) {
    return exact;
  }

  const euFallback = POLICY_TEMPLATES.find(
    (template) =>
      template.templateFamily === family &&
      template.jurisdiction === "EU" &&
      template.locale === "en-EU",
  );

  if (euFallback) {
    return euFallback;
  }

  throw new TemplateNotFoundError(family, context);
}

export function listResolvedPolicyTemplates(
  tenant?: TemplateTenant | null,
): PolicyTemplate[] {
  return POLICY_TEMPLATE_TYPES.map((family) =>
    resolvePolicyTemplate(family, tenant),
  );
}
