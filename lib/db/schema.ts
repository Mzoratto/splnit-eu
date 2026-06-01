import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  integer,
  interval,
  jsonb,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
  vector,
} from "drizzle-orm/pg-core";

import type {
  EvidenceAssessmentResult,
  EvidenceBlockedReason,
  EvidenceCollectionStatus,
  EvidenceConfidence,
  EvidenceSource,
} from "@/lib/activation/evidence-state";

export const mappingReviewFrameworkEnum = pgEnum("mapping_review_framework", [
  "nis2",
  "eu_ai_act",
  "gdpr",
  "iso27001",
]);

export const mappingReviewJurisdictionEnum = pgEnum(
  "mapping_review_jurisdiction",
  ["it", "cz", "eu", "de", "fr", "es", "other"],
);

export const mappingReviewLanguageEnum = pgEnum("mapping_review_language", [
  "it",
  "cs",
  "en",
  "de",
  "fr",
  "es",
]);

export const mappingReviewStatusEnum = pgEnum("mapping_review_status", [
  "unclassified",
  "needs_human",
  "agent_decided",
  "promoted",
  "rejected",
]);
export const mappingReviewDecisionEnum = pgEnum("mapping_review_decision", [
  "approved",
  "wrong_article",
  "too_broad",
  "needs_research",
]);
export const mappingReviewConfidenceEnum = pgEnum("mapping_review_confidence", [
  "high",
  "medium",
  "low",
]);

export type OrgTier = "standard" | "agency";
export type ObligationRegime = "nizsi" | "vyssi";
export type SubscriptionPlan = "sme" | "agency";
export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "incomplete";

export interface BrandingConfig {
  logoUrl: string | null;
  displayName: string | null;
  footerText: string | null;
}

export const organisations = pgTable("organisations", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkOrgId: text("clerk_org_id").notNull().unique(),
  name: text("name").notNull(),
  ico: varchar("ico", { length: 32 }),
  dic: varchar("dic", { length: 12 }),
  sidlo: text("sidlo"),
  rezimPovinnosti: varchar("rezim_povinnosti", { length: 10 })
    .$type<ObligationRegime>()
    .notNull()
    .default("nizsi"),
  tier: varchar("tier", { length: 20 }).$type<OrgTier>().notNull().default("standard"),
  brandingLogoUrl: text("branding_logo_url"),
  brandingDisplayName: varchar("branding_display_name", { length: 200 }),
  brandingFooterText: varchar("branding_footer_text", { length: 500 }),
  country: text("country").notNull().default("CZ"),
  primaryJurisdiction: text("primary_jurisdiction").notNull().default("CZ"),
  locale: text("locale").notNull().default("cs-CZ"),
  sector: text("sector"),
  employeeCount: text("employee_count"),
  toolInventory: jsonb("tool_inventory").$type<string[]>().default([]),
  onboardingCompletedAt: timestamp("onboarding_completed_at", { withTimezone: true }),
  plan: text("plan").notNull().default("free"),
  stripeCustomerId: text("stripe_customer_id").unique(),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const featureFlags = pgTable(
  "feature_flags",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: text("org_id")
      .notNull()
      .references(() => organisations.clerkOrgId, { onDelete: "cascade" }),
    flag: text("flag").notNull(),
    enabled: boolean("enabled").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique().on(table.orgId, table.flag)],
);

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkOrgId: text("clerk_org_id").notNull().unique(),
    stripeCustomerId: text("stripe_customer_id").notNull().unique(),
    stripeSubscriptionId: text("stripe_subscription_id"),
    plan: text("plan").$type<SubscriptionPlan>().notNull(),
    status: text("status").$type<SubscriptionStatus>().notNull(),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check("subscriptions_plan_check", sql`${table.plan} IN ('sme', 'agency')`),
    check(
      "subscriptions_status_check",
      sql`${table.status} IN ('active', 'trialing', 'past_due', 'canceled', 'incomplete')`,
    ),
    index("idx_subscriptions_clerk_org_id").on(table.clerkOrgId),
    index("idx_subscriptions_stripe_customer_id").on(table.stripeCustomerId),
  ],
);

export type OrgIntakeAnswers = Record<string, unknown>;

export type OrgIntakeDerivedScope = {
  applicableControlKeys?: string[];
  outOfScopeControlKeys?: string[];
  notApplicableControlKeys?: string[];
  rationales?: Record<string, string>;
  [key: string]: unknown;
};

export const orgIntakeProfiles = pgTable("org_intake_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkOrgId: text("clerk_org_id")
    .notNull()
    .unique()
    .references(() => organisations.clerkOrgId, { onDelete: "cascade" }),
  version: integer("version").notNull().default(1),
  answers: jsonb("answers").$type<OrgIntakeAnswers>().notNull().default({}),
  derivedScope: jsonb("derived_scope")
    .$type<OrgIntakeDerivedScope>()
    .notNull()
    .default({}),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkUserId: text("clerk_user_id").notNull(),
    clerkOrgId: text("clerk_org_id")
      .notNull()
      .references(() => organisations.clerkOrgId, { onDelete: "cascade" }),
    fullName: text("full_name"),
    email: text("email"),
    role: text("role").notNull().default("member"),
    locale: text("locale").notNull().default("cs"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [unique().on(table.clerkUserId, table.clerkOrgId)],
);

export type EmployeeTrainingRole =
  | "employee"
  | "manager"
  | "it_admin"
  | "security_owner"
  | "contractor";

export type EmployeeTrainingType =
  | "security_awareness"
  | "role_based"
  | "incident_response"
  | "ai_literacy"
  | "privacy";

export const employeeTrainingRecords = pgTable(
  "employee_training_records",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkOrgId: text("clerk_org_id")
      .notNull()
      .references(() => organisations.clerkOrgId, { onDelete: "cascade" }),
    employeeName: text("employee_name").notNull(),
    employeeEmail: text("employee_email"),
    employeeRole: text("employee_role")
      .$type<EmployeeTrainingRole>()
      .notNull()
      .default("employee"),
    trainingType: text("training_type")
      .$type<EmployeeTrainingType>()
      .notNull()
      .default("security_awareness"),
    trainingDate: date("training_date").notNull(),
    provider: text("provider"),
    notes: text("notes"),
    createdBy: text("created_by").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    check(
      "employee_training_records_employee_role_check",
      sql`${table.employeeRole} IN ('employee', 'manager', 'it_admin', 'security_owner', 'contractor')`,
    ),
    check(
      "employee_training_records_training_type_check",
      sql`${table.trainingType} IN ('security_awareness', 'role_based', 'incident_response', 'ai_literacy', 'privacy')`,
    ),
    index("idx_employee_training_records_org").on(table.clerkOrgId),
    index("idx_employee_training_records_org_training_date").on(
      table.clerkOrgId,
      table.trainingDate,
    ),
  ],
);

export const frameworks = pgTable("frameworks", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  nameCs: text("name_cs").notNull(),
  nameEn: text("name_en").notNull(),
  descriptionCs: text("description_cs"),
  regulator: text("regulator"),
  mandatoryDeadline: date("mandatory_deadline"),
  version: text("version"),
  isActive: boolean("is_active").notNull().default(true),
});

export const sourceDocuments = pgTable("source_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  jurisdiction: text("jurisdiction").notNull(),
  locale: text("locale").notNull(),
  title: text("title").notNull(),
  citation: text("citation").notNull(),
  url: text("url"),
  filename: text("filename").unique(),
  effectiveDate: timestamp("effective_date", { withTimezone: true }),
  lastReviewed: timestamp("last_reviewed", { withTimezone: true }),
});

export const orgFrameworks = pgTable(
  "org_frameworks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkOrgId: text("clerk_org_id")
      .notNull()
      .references(() => organisations.clerkOrgId, { onDelete: "cascade" }),
    frameworkId: uuid("framework_id")
      .notNull()
      .references(() => frameworks.id),
    status: text("status").notNull().default("active"),
    score: integer("score"),
    enrolledAt: timestamp("enrolled_at", { withTimezone: true }).defaultNow(),
    targetDate: date("target_date"),
  },
  (table) => [unique().on(table.clerkOrgId, table.frameworkId)],
);

export const controls = pgTable("controls", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull().unique(),
  titleCs: text("title_cs").notNull(),
  titleEn: text("title_en").notNull(),
  descriptionCs: text("description_cs"),
  category: text("category"),
  testType: text("test_type"),
  requiresEvidence: boolean("requires_evidence").notNull().default(true),
  isAutomated: boolean("is_automated").notNull().default(false),
});

export const frameworkControls = pgTable(
  "framework_controls",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    frameworkId: uuid("framework_id")
      .notNull()
      .references(() => frameworks.id),
    controlId: uuid("control_id")
      .notNull()
      .references(() => controls.id),
    articleRef: text("article_ref"),
    regulatorGuidance: text("regulator_guidance"),
    evidenceRequirements: text("evidence_requirements"),
    localizedTitle: text("localized_title"),
    localizedDescription: text("localized_description"),
    requirementLevel: text("requirement_level").notNull().default("mandatory"),
    sortOrder: integer("sort_order").default(0),
  },
  (table) => [unique().on(table.frameworkId, table.controlId, table.articleRef)],
);

export const articles = pgTable(
  "articles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sourceDocumentId: uuid("source_document_id")
      .notNull()
      .references(() => sourceDocuments.id),
    frameworkId: uuid("framework_id")
      .notNull()
      .references(() => frameworks.id),
    jurisdiction: text("jurisdiction").notNull(),
    locale: text("locale").notNull(),
    articleKey: text("article_key").notNull(),
    title: text("title"),
    officialText: text("official_text").notNull(),
    citation: text("citation").notNull(),
    effectiveDate: timestamp("effective_date", { withTimezone: true }),
    lastReviewed: timestamp("last_reviewed", { withTimezone: true }),
    reviewStatus: text("review_status").notNull().default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    unique().on(table.sourceDocumentId, table.locale, table.articleKey),
    index("idx_articles_framework_jurisdiction").on(
      table.frameworkId,
      table.jurisdiction,
      table.locale,
    ),
    index("idx_articles_review_status").on(table.reviewStatus),
  ],
);

export const frameworkControlArticles = pgTable(
  "framework_control_articles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    frameworkControlId: uuid("framework_control_id")
      .notNull()
      .references(() => frameworkControls.id, { onDelete: "cascade" }),
    articleId: uuid("article_id")
      .notNull()
      .references(() => articles.id, { onDelete: "cascade" }),
    citationNote: text("citation_note"),
    confidence: text("confidence").notNull().default("reviewed"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    unique().on(table.frameworkControlId, table.articleId),
    index("idx_framework_control_articles_article").on(table.articleId),
  ],
);

export const evidenceTemplates = pgTable(
  "evidence_templates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    controlId: uuid("control_id").references(() => controls.id, {
      onDelete: "cascade",
    }),
    frameworkControlId: uuid("framework_control_id").references(
      () => frameworkControls.id,
      { onDelete: "cascade" },
    ),
    title: text("title").notNull(),
    description: text("description").notNull(),
    evidenceType: text("evidence_type").notNull(),
    exampleFields: jsonb("example_fields")
      .$type<Record<string, unknown>>()
      .default({}),
    locale: text("locale").notNull().default("en-EU"),
    sortOrder: integer("sort_order").default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_evidence_templates_control").on(table.controlId),
    index("idx_evidence_templates_framework_control").on(
      table.frameworkControlId,
    ),
    index("idx_evidence_templates_locale").on(table.locale),
  ],
);

export const mappingReviewQueue = pgTable(
  "mapping_review_queue",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    framework: mappingReviewFrameworkEnum("framework").notNull(),
    jurisdiction: mappingReviewJurisdictionEnum("jurisdiction").notNull(),
    language: mappingReviewLanguageEnum("language").notNull(),
    mappingId: uuid("mapping_id").references(() => frameworkControlArticles.id, {
      onDelete: "cascade",
    }),
    controlId: text("control_id").notNull(),
    controlTitle: text("control_title").notNull(),
    controlDescription: text("control_description"),
    sourceText: text("source_text").notNull(),
    citation: text("citation").notNull(),
    regulator: text("regulator"),
    controlEmbedding: vector("control_embedding", { dimensions: 1536 }),
    sourceEmbedding: vector("source_embedding", { dimensions: 1536 }),
    similarityScore: real("similarity_score"),
    agentVerdict: mappingReviewDecisionEnum("agent_verdict"),
    agentConfidence: mappingReviewConfidenceEnum("agent_confidence"),
    stage2Passes: jsonb("stage2_passes")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    stage3Checks: jsonb("stage3_checks")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    classifiedAt: timestamp("classified_at", { withTimezone: true }),
    status: mappingReviewStatusEnum("status").notNull().default("unclassified"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_mapping_review_queue_scope_status").on(
      table.framework,
      table.jurisdiction,
      table.status,
    ),
    index("idx_mapping_review_queue_mapping").on(table.mappingId),
  ],
);

export const mappingPromotionAudit = pgTable(
  "mapping_promotion_audit",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    queueId: uuid("queue_id").references(() => mappingReviewQueue.id, {
      onDelete: "set null",
    }),
    mappingId: uuid("mapping_id").references(() => frameworkControlArticles.id, {
      onDelete: "set null",
    }),
    framework: mappingReviewFrameworkEnum("framework").notNull(),
    jurisdiction: mappingReviewJurisdictionEnum("jurisdiction").notNull(),
    language: mappingReviewLanguageEnum("language").notNull(),
    decisionSource: text("decision_source").notNull(),
    stage2Passes: jsonb("stage2_passes")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    stage3Checks: jsonb("stage3_checks")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    promotedAt: timestamp("promoted_at", { withTimezone: true }).defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_mapping_promotion_audit_scope").on(
      table.framework,
      table.jurisdiction,
      table.promotedAt,
    ),
    index("idx_mapping_promotion_audit_mapping").on(table.mappingId),
  ],
);

export const tests = pgTable("tests", {
  id: uuid("id").primaryKey().defaultRandom(),
  controlId: uuid("control_id")
    .notNull()
    .references(() => controls.id),
  name: text("name").notNull(),
  integrationType: text("integration_type").notNull(),
  checkLogic: text("check_logic").notNull(),
  passCriteria: text("pass_criteria"),
  runFrequency: interval("run_frequency").default("1 hour"),
  isActive: boolean("is_active").notNull().default(true),
});

export const integrations = pgTable(
  "integrations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkOrgId: text("clerk_org_id")
      .notNull()
      .references(() => organisations.clerkOrgId, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    accessTokenEnc: text("access_token_enc"),
    refreshTokenEnc: text("refresh_token_enc"),
    tokenExpiresAt: timestamp("token_expires_at", { withTimezone: true }),
    status: text("status").notNull().default("connected"),
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
    lastErrorMsg: text("last_error_msg"),
    config: jsonb("config").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [unique().on(table.clerkOrgId, table.provider)],
);

export const integrationRuns = pgTable(
  "integration_runs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    integrationId: uuid("integration_id")
      .notNull()
      .references(() => integrations.id, { onDelete: "cascade" }),
    testId: uuid("test_id")
      .notNull()
      .references(() => tests.id),
    clerkOrgId: text("clerk_org_id").notNull(),
    status: text("status").notNull(),
    resultData: jsonb("result_data").$type<Record<string, unknown>>(),
    failureReason: text("failure_reason"),
    ranAt: timestamp("ran_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_runs_org_test").on(table.clerkOrgId, table.testId),
    index("idx_runs_ran_at").on(table.ranAt),
  ],
);

export const evidence = pgTable("evidence", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkOrgId: text("clerk_org_id")
    .notNull()
    .references(() => organisations.clerkOrgId, { onDelete: "cascade" }),
  controlId: uuid("control_id")
    .notNull()
    .references(() => controls.id),
  integrationRunId: uuid("integration_run_id").references(() => integrationRuns.id),
  type: text("type").notNull(),
  source: text("source")
    .$type<EvidenceSource>()
    .notNull()
    .default("manual"),
  sourceArtifactId: uuid("source_artifact_id").references(() => generatedArtifacts.id, {
    onDelete: "set null",
  }),
  assessmentResult: text("assessment_result")
    .$type<EvidenceAssessmentResult>()
    .notNull()
    .default("unknown"),
  collectionStatus: text("collection_status")
    .$type<EvidenceCollectionStatus>()
    .notNull()
    .default("collected"),
  confidence: text("confidence")
    .$type<EvidenceConfidence>()
    .notNull()
    .default("medium"),
  blockedReason: text("blocked_reason").$type<EvidenceBlockedReason>(),
  blobUrl: text("blob_url"),
  snapshotData: jsonb("snapshot_data").$type<Record<string, unknown>>(),
  description: text("description"),
  collectedBy: text("collected_by"),
  collectedAt: timestamp("collected_at", { withTimezone: true }).defaultNow(),
});

export const generatedArtifacts = pgTable(
  "generated_artifacts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkOrgId: text("clerk_org_id")
      .notNull()
      .references(() => organisations.clerkOrgId, { onDelete: "cascade" }),
    kind: text("kind").notNull(),
    title: text("title").notNull(),
    source: text("source").notNull().default("questionnaire_ai"),
    model: text("model"),
    content: jsonb("content").$type<Record<string, unknown>>().notNull(),
    createdBy: text("created_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_generated_artifacts_org_created_at").on(
      table.clerkOrgId,
      table.createdAt,
    ),
    index("idx_generated_artifacts_org_kind").on(table.clerkOrgId, table.kind),
  ],
);

export const orgControlStatuses = pgTable(
  "org_control_statuses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkOrgId: text("clerk_org_id").notNull(),
    controlId: uuid("control_id")
      .notNull()
      .references(() => controls.id),
    status: text("status").notNull().default("unknown"),
    lastTestedAt: timestamp("last_tested_at", { withTimezone: true }),
    lastEvidenceAt: timestamp("last_evidence_at", { withTimezone: true }),
    assignedTo: text("assigned_to"),
    notes: text("notes"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [unique().on(table.clerkOrgId, table.controlId)],
);

export const policies = pgTable("policies", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkOrgId: text("clerk_org_id")
    .notNull()
    .references(() => organisations.clerkOrgId, { onDelete: "cascade" }),
  type: text("type").notNull(),
  titleCs: text("title_cs").notNull(),
  version: integer("version").notNull().default(1),
  status: text("status").notNull().default("draft"),
  content: jsonb("content").$type<Record<string, unknown>>(),
  blobUrl: text("blob_url"),
  approvedBy: text("approved_by"),
  reviewedAt: date("reviewed_at"),
  expiresAt: date("expires_at"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const policyControls = pgTable(
  "policy_controls",
  {
    policyId: uuid("policy_id")
      .notNull()
      .references(() => policies.id, { onDelete: "cascade" }),
    controlId: uuid("control_id")
      .notNull()
      .references(() => controls.id),
  },
  (table) => [unique().on(table.policyId, table.controlId)],
);

export const vendors = pgTable("vendors", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkOrgId: text("clerk_org_id")
    .notNull()
    .references(() => organisations.clerkOrgId, { onDelete: "cascade" }),
  name: text("name").notNull(),
  website: text("website"),
  category: text("category"),
  riskTier: text("risk_tier"),
  status: text("status").notNull().default("pending"),
  lastAssessedAt: date("last_assessed_at"),
  nextReviewAt: date("next_review_at"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const vendorAssessments = pgTable("vendor_assessments", {
  id: uuid("id").primaryKey().defaultRandom(),
  vendorId: uuid("vendor_id")
    .notNull()
    .references(() => vendors.id, { onDelete: "cascade" }),
  clerkOrgId: text("clerk_org_id").notNull(),
  answers: jsonb("answers").$type<Record<string, unknown>>().default({}),
  score: integer("score"),
  status: text("status").notNull().default("draft"),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  assessedBy: text("assessed_by"),
  assessedAt: timestamp("assessed_at", { withTimezone: true }).defaultNow(),
});

export const incidents = pgTable("incidents", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkOrgId: text("clerk_org_id")
    .notNull()
    .references(() => organisations.clerkOrgId, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  severity: text("severity").notNull(),
  status: text("status").notNull().default("open"),
  affectsPersonalData: boolean("affects_personal_data").default(false),
  affectsCriticalSystems: boolean("affects_critical_systems").default(false),
  reportedToNukib: boolean("reported_to_nukib").default(false),
  nukibReportedAt: timestamp("nukib_reported_at", { withTimezone: true }),
  reportedToUoou: boolean("reported_to_uoou").default(false),
  uoouReportedAt: timestamp("uoou_reported_at", { withTimezone: true }),
  detectedAt: timestamp("detected_at", { withTimezone: true }).notNull(),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const riskItems = pgTable("risk_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkOrgId: text("clerk_org_id")
    .notNull()
    .references(() => organisations.clerkOrgId, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category"),
  likelihood: integer("likelihood").notNull(),
  impact: integer("impact").notNull(),
  riskScore: integer("risk_score"),
  status: text("status").notNull().default("open"),
  owner: text("owner"),
  dueDate: date("due_date"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export type RemediationTaskSourceType =
  | "workspace_evidence_stale"
  | "workspace_gap"
  | "helios_csv_change"
  | "workspace_review_due";

export type RemediationTaskStatus = "open" | "in_progress" | "resolved" | "dismissed";
export type RemediationTaskSeverity = "low" | "medium" | "high";

export const remediationTasks = pgTable(
  "remediation_tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkOrgId: text("clerk_org_id")
      .notNull()
      .references(() => organisations.clerkOrgId, { onDelete: "cascade" }),
    controlId: uuid("control_id")
      .notNull()
      .references(() => controls.id),
    controlKey: text("control_key").notNull(),
    sourceType: text("source_type").$type<RemediationTaskSourceType>().notNull(),
    sourceKey: text("source_key").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    frameworkRefs: jsonb("framework_refs")
      .$type<Record<string, unknown>[]>()
      .notNull()
      .default([]),
    severity: text("severity").$type<RemediationTaskSeverity>().notNull().default("medium"),
    status: text("status").$type<RemediationTaskStatus>().notNull().default("open"),
    dueDate: date("due_date"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    unique("remediation_tasks_source_unique").on(
      table.clerkOrgId,
      table.controlId,
      table.sourceType,
      table.sourceKey,
    ),
    index("idx_remediation_tasks_org_status_due").on(
      table.clerkOrgId,
      table.status,
      table.dueDate,
    ),
    index("idx_remediation_tasks_org_control").on(table.clerkOrgId, table.controlKey),
    check(
      "remediation_tasks_source_type_check",
      sql`${table.sourceType} IN ('workspace_evidence_stale', 'workspace_gap', 'helios_csv_change', 'workspace_review_due')`,
    ),
    check(
      "remediation_tasks_status_check",
      sql`${table.status} IN ('open', 'in_progress', 'resolved', 'dismissed')`,
    ),
    check(
      "remediation_tasks_severity_check",
      sql`${table.severity} IN ('low', 'medium', 'high')`,
    ),
  ],
);

export const trustCenters = pgTable("trust_centers", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkOrgId: text("clerk_org_id")
    .notNull()
    .unique()
    .references(() => organisations.clerkOrgId, { onDelete: "cascade" }),
  subdomain: text("subdomain").unique(),
  isPublic: boolean("is_public").notNull().default(false),
  ndaRequired: boolean("nda_required").notNull().default(false),
  showFrameworkDrilldown: boolean("show_framework_drilldown").notNull().default(true),
  showFrameworkPercentages: boolean("show_framework_percentages").notNull().default(true),
  visibleFrameworks: jsonb("visible_frameworks").$type<string[]>().default([]),
  customDomain: text("custom_domain"),
  logoUrl: text("logo_url"),
  accentColor: text("accent_color"),
  lastUpdated: timestamp("last_updated", { withTimezone: true }).defaultNow(),
});

export const trustCenterClients = pgTable("trust_center_clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  trustCenterId: uuid("trust_center_id")
    .notNull()
    .references(() => trustCenters.id, { onDelete: "cascade" }),
  clientName: varchar("client_name", { length: 200 }).notNull(),
  accessToken: text("access_token").notNull().unique(),
  visibleFrameworks: jsonb("visible_frameworks").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  lastViewedAt: timestamp("last_viewed_at", { withTimezone: true }),
  viewCount: integer("view_count").notNull().default(0),
});

export const consultantClients = pgTable(
  "consultant_clients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    consultantOrgId: text("consultant_org_id")
      .notNull()
      .references(() => organisations.clerkOrgId, { onDelete: "cascade" }),
    clientOrgId: text("client_org_id")
      .notNull()
      .references(() => organisations.clerkOrgId, { onDelete: "cascade" }),
    accessLevel: text("access_level").notNull().default("manage"),
    status: text("status").notNull().default("active"),
    inviteEmail: text("invite_email"),
    whiteLabelLogoUrl: text("white_label_logo_url"),
    whiteLabelAccentColor: text("white_label_accent_color"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    unique().on(table.consultantOrgId, table.clientOrgId),
    index("idx_consultant_clients_consultant").on(table.consultantOrgId),
    index("idx_consultant_clients_client").on(table.clientOrgId),
  ],
);

export type ControlCommentAuthorType = "consultant" | "client";

export const agencies = pgTable(
  "agencies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkOrgId: text("clerk_org_id").unique().references(() => organisations.clerkOrgId, {
      onDelete: "set null",
    }),
    slug: text("slug").unique(),
    name: text("name").notNull(),
    contactEmail: text("contact_email"),
    stripeSubscriptionId: text("stripe_subscription_id"),
    plan: text("plan").$type<"agency">(),
    planClientLimit: integer("plan_client_limit").default(20),
    status: text("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    check("agencies_plan_check", sql`${table.plan} IS NULL OR ${table.plan} = 'agency'`),
    index("idx_agencies_status").on(table.status),
  ],
);

export const agencyBranding = pgTable(
  "agency_branding",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    agencyId: uuid("agency_id")
      .notNull()
      .references(() => agencies.id, { onDelete: "cascade" }),
    displayName: text("display_name"),
    logoUrl: text("logo_url"),
    logoAltText: text("logo_alt_text"),
    primaryColour: text("primary_colour"),
    poweredByText: text("powered_by_text").notNull().default("Powered by Splnit.eu"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    unique().on(table.agencyId),
    check(
      "agency_branding_primary_colour_check",
      sql`${table.primaryColour} IS NULL OR ${table.primaryColour} ~ '^#[0-9A-Fa-f]{6}$'`,
    ),
  ],
);

export const agencyClientOrgs = pgTable(
  "agency_client_orgs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    agencyId: uuid("agency_id")
      .notNull()
      .references(() => agencies.id, { onDelete: "cascade" }),
    orgId: text("org_id")
      .notNull()
      .references(() => organisations.clerkOrgId, { onDelete: "cascade" }),
    status: text("status").notNull().default("active"),
    linkedByUserId: text("linked_by_user_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    unique().on(table.agencyId, table.orgId),
    unique("agency_client_orgs_org_id_unique").on(table.orgId),
    index("idx_agency_client_orgs_agency").on(table.agencyId),
  ],
);

export const agencyConsultants = pgTable(
  "agency_consultants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    agencyId: uuid("agency_id")
      .notNull()
      .references(() => agencies.id, { onDelete: "cascade" }),
    clerkUserId: text("clerk_user_id"),
    email: text("email"),
    role: text("role").notNull().default("consultant"),
    status: text("status").notNull().default("active"),
    invitedByUserId: text("invited_by_user_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    unique().on(table.agencyId, table.clerkUserId),
    unique().on(table.agencyId, table.email),
    index("idx_agency_consultants_user").on(table.clerkUserId),
    index("idx_agency_consultants_agency").on(table.agencyId),
  ],
);

export const agencyConsultantInvites = pgTable(
  "agency_consultant_invites",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    agencyId: uuid("agency_id")
      .notNull()
      .references(() => agencies.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    tokenHash: text("token_hash").notNull().unique(),
    role: text("role").notNull().default("consultant"),
    status: text("status").notNull().default("pending"),
    createdByUserId: text("created_by_user_id").notNull(),
    acceptedByUserId: text("accepted_by_user_id"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    check("agency_consultant_invites_role_check", sql`${table.role} IN ('admin', 'consultant')`),
    check(
      "agency_consultant_invites_status_check",
      sql`${table.status} IN ('pending', 'accepted', 'expired')`,
    ),
    index("idx_agency_consultant_invites_agency").on(table.agencyId),
    index("idx_agency_consultant_invites_status_expires").on(
      table.status,
      table.expiresAt,
    ),
  ],
);

export const agencyClientInvites = pgTable(
  "agency_client_invites",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    agencyId: uuid("agency_id")
      .notNull()
      .references(() => agencies.id, { onDelete: "cascade" }),
    email: text("email"),
    tokenHash: text("token_hash").notNull().unique(),
    status: text("status").notNull().default("pending"),
    createdByUserId: text("created_by_user_id").notNull(),
    acceptedByUserId: text("accepted_by_user_id"),
    acceptedOrgId: text("accepted_org_id").references(() => organisations.clerkOrgId, {
      onDelete: "set null",
    }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_agency_client_invites_agency").on(table.agencyId),
    index("idx_agency_client_invites_status_expires").on(table.status, table.expiresAt),
  ],
);

export const controlComments = pgTable(
  "control_comments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    agencyId: uuid("agency_id")
      .notNull()
      .references(() => agencies.id, { onDelete: "cascade" }),
    orgId: text("org_id")
      .notNull()
      .references(() => organisations.clerkOrgId, { onDelete: "cascade" }),
    controlKey: text("control_key").notNull(),
    authorUserId: text("author_user_id").notNull(),
    authorType: text("author_type").$type<ControlCommentAuthorType>().notNull(),
    body: text("body").notNull(),
    isGapFlag: boolean("is_gap_flag").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    check(
      "control_comments_author_type_check",
      sql`${table.authorType} IN ('consultant', 'client')`,
    ),
    index("idx_control_comments_org_control").on(table.orgId, table.controlKey),
    index("idx_control_comments_agency").on(table.agencyId),
  ],
);

export const trustCenterRequests = pgTable("trust_center_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkOrgId: text("clerk_org_id").notNull(),
  email: text("email").notNull(),
  company: text("company"),
  status: text("status").notNull().default("pending"),
  ndaSigned: boolean("nda_signed").default(false),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const reminderLog = pgTable(
  "reminder_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkOrgId: text("clerk_org_id").notNull(),
    reminderType: text("reminder_type").notNull(),
    sentAt: timestamp("sent_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique().on(table.clerkOrgId, table.reminderType),
  ],
);

export const accessReviews = pgTable("access_reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkOrgId: text("clerk_org_id")
    .notNull()
    .references(() => organisations.clerkOrgId, { onDelete: "cascade" }),
  name: text("name").notNull(),
  provider: text("provider").notNull(),
  status: text("status").notNull().default("in_progress"),
  totalItems: integer("total_items").default(0),
  reviewedItems: integer("reviewed_items").default(0),
  dueDate: date("due_date"),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const accessReviewItems = pgTable("access_review_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  reviewId: uuid("review_id")
    .notNull()
    .references(() => accessReviews.id, { onDelete: "cascade" }),
  clerkOrgId: text("clerk_org_id").notNull(),
  userName: text("user_name").notNull(),
  userEmail: text("user_email"),
  resource: text("resource").notNull(),
  accessLevel: text("access_level").notNull(),
  decision: text("decision"),
  decidedBy: text("decided_by"),
  decidedAt: timestamp("decided_at", { withTimezone: true }),
});

export const regulationUpdates = pgTable("regulation_updates", {
  id: uuid("id").primaryKey().defaultRandom(),
  frameworkId: uuid("framework_id").references(() => frameworks.id),
  externalId: text("external_id").unique(),
  title: text("title").notNull(),
  summaryCs: text("summary_cs"),
  summaryEn: text("summary_en"),
  sourceUrl: text("source_url"),
  source: text("source").notNull().default("unknown"),
  severity: text("severity").notNull().default("info"),
  affectsPlans: text("affects_plans").array(),
  publishedAt: timestamp("published_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const regulationUpdateReads = pgTable(
  "regulation_update_reads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    updateId: uuid("update_id")
      .notNull()
      .references(() => regulationUpdates.id, { onDelete: "cascade" }),
    clerkOrgId: text("clerk_org_id")
      .notNull()
      .references(() => organisations.clerkOrgId, { onDelete: "cascade" }),
    readAt: timestamp("read_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    unique().on(table.updateId, table.clerkOrgId),
    index("idx_regulation_update_reads_org").on(table.clerkOrgId),
  ],
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkOrgId: text("clerk_org_id").notNull(),
    clerkUserId: text("clerk_user_id"),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("idx_audit_logs_org_created_at").on(table.clerkOrgId, table.createdAt),
    index("idx_audit_logs_entity").on(table.entityType, table.entityId),
  ],
);

export type Organisation = typeof organisations.$inferSelect;
export type Framework = typeof frameworks.$inferSelect;
export type Control = typeof controls.$inferSelect;
export type Test = typeof tests.$inferSelect;
export type Integration = typeof integrations.$inferSelect;
export type IntegrationRun = typeof integrationRuns.$inferSelect;
export type Evidence = typeof evidence.$inferSelect;
export type EmployeeTrainingRecord = typeof employeeTrainingRecords.$inferSelect;
export type FeatureFlag = typeof featureFlags.$inferSelect;
export type GeneratedArtifact = typeof generatedArtifacts.$inferSelect;
export type RemediationTask = typeof remediationTasks.$inferSelect;
export type MappingReviewQueueItem = typeof mappingReviewQueue.$inferSelect;
export type MappingPromotionAudit = typeof mappingPromotionAudit.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
