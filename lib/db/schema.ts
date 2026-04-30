import {
  boolean,
  date,
  index,
  integer,
  interval,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

export const organisations = pgTable("organisations", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkOrgId: text("clerk_org_id").notNull().unique(),
  name: text("name").notNull(),
  ico: text("ico"),
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

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkUserId: text("clerk_user_id").notNull().unique(),
  clerkOrgId: text("clerk_org_id")
    .notNull()
    .references(() => organisations.clerkOrgId, { onDelete: "cascade" }),
  fullName: text("full_name"),
  email: text("email"),
  role: text("role").notNull().default("member"),
  locale: text("locale").notNull().default("cs"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

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
    requirementLevel: text("requirement_level").notNull().default("mandatory"),
    sortOrder: integer("sort_order").default(0),
  },
  (table) => [unique().on(table.frameworkId, table.controlId)],
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
  source: text("source"),
  blobUrl: text("blob_url"),
  snapshotData: jsonb("snapshot_data").$type<Record<string, unknown>>(),
  description: text("description"),
  collectedBy: text("collected_by"),
  expiresAt: date("expires_at"),
  collectedAt: timestamp("collected_at", { withTimezone: true }).defaultNow(),
});

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

export const trustCenters = pgTable("trust_centers", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkOrgId: text("clerk_org_id")
    .notNull()
    .unique()
    .references(() => organisations.clerkOrgId, { onDelete: "cascade" }),
  subdomain: text("subdomain").unique(),
  isPublic: boolean("is_public").notNull().default(false),
  ndaRequired: boolean("nda_required").notNull().default(false),
  visibleFrameworks: jsonb("visible_frameworks").$type<string[]>().default([]),
  customDomain: text("custom_domain"),
  logoUrl: text("logo_url"),
  accentColor: text("accent_color"),
  lastUpdated: timestamp("last_updated", { withTimezone: true }).defaultNow(),
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
  severity: text("severity").notNull().default("info"),
  affectsPlans: text("affects_plans").array(),
  publishedAt: timestamp("published_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export type Organisation = typeof organisations.$inferSelect;
export type Framework = typeof frameworks.$inferSelect;
export type Control = typeof controls.$inferSelect;
export type Test = typeof tests.$inferSelect;
export type Integration = typeof integrations.$inferSelect;
export type IntegrationRun = typeof integrationRuns.$inferSelect;
export type Evidence = typeof evidence.$inferSelect;
