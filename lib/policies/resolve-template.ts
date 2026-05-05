import type { Organisation } from "@/lib/db/schema";
import { getJurisdictionContext } from "@/lib/jurisdictions/context";
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

function materializeText(value: string, context: ReturnType<typeof getJurisdictionContext>) {
  const replacements: Record<string, string> = {
    "{{jurisdiction.address}}": context.labels.address,
    "{{jurisdiction.aiActCitation}}": context.citations.aiAct,
    "{{jurisdiction.contactEmail}}": context.labels.contactEmail,
    "{{jurisdiction.cybersecurityAuthority}}": context.authorities.cybersecurity,
    "{{jurisdiction.dataProtectionAuthority}}": context.authorities.dataProtection,
    "{{jurisdiction.gdprCitation}}": context.citations.gdpr,
    "{{jurisdiction.legalIdentifier}}": context.labels.legalIdentifier,
    "{{jurisdiction.nis2Citation}}": context.citations.nis2,
    "{{jurisdiction.organisation}}": context.labels.organisation,
    "{{jurisdiction.telecomAuthority}}": context.authorities.telecom,
    "{{tenant.legalIdentifier}}": context.labels.legalIdentifier,
    "{{tenant.organisation}}": context.labels.organisation,
  };

  return Object.entries(replacements).reduce(
    (text, [placeholder, replacement]) => text.replaceAll(placeholder, replacement),
    value,
  );
}

function materializeTemplate(
  template: PolicyTemplate,
  tenantContext: ReturnType<typeof getTenantContext>,
): PolicyTemplate {
  const jurisdictionContext = getJurisdictionContext(
    tenantContext.primaryJurisdiction,
    tenantContext.locale,
  );

  return {
    ...template,
    description: materializeText(template.description, jurisdictionContext),
    sections: template.sections.map((section) => ({
      ...section,
      body: section.body
        ? materializeText(section.body, jurisdictionContext)
        : undefined,
      fields: section.fields?.map((field) =>
        materializeText(field, jurisdictionContext),
      ),
      title: materializeText(section.title, jurisdictionContext),
    })),
    titleCs: materializeText(template.titleCs, jurisdictionContext),
  };
}

export function isCustomerUsablePolicyTemplate(template: PolicyTemplate) {
  return template.reviewStatus !== "draft";
}

function getCustomerUsablePolicyTemplates() {
  return POLICY_TEMPLATES.filter(isCustomerUsablePolicyTemplate);
}

export function resolvePolicyTemplate(
  family: PolicyTemplateType,
  tenant?: TemplateTenant | null,
): PolicyTemplate {
  const context = getTenantContext(tenant);
  const templates = getCustomerUsablePolicyTemplates();
  const exact = templates.find(
    (template) =>
      template.templateFamily === family &&
      template.jurisdiction === context.primaryJurisdiction &&
      template.locale === context.locale,
  );

  if (exact) {
    return materializeTemplate(exact, context);
  }

  const euFallback = templates.find(
    (template) =>
      template.templateFamily === family &&
      template.jurisdiction === "EU" &&
      template.locale === "en-EU",
  );

  if (euFallback) {
    return materializeTemplate(euFallback, context);
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

export function listDraftPolicyTemplatesForReview(input: {
  jurisdiction?: PolicyTemplate["jurisdiction"];
  locale?: PolicyTemplate["locale"];
} = {}): PolicyTemplate[] {
  return POLICY_TEMPLATES.filter(
    (template) =>
      template.reviewStatus === "draft" &&
      (!input.jurisdiction || template.jurisdiction === input.jurisdiction) &&
      (!input.locale || template.locale === input.locale),
  );
}
