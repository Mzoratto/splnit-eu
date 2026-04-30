import type { Integration } from "@/lib/db/schema";

export type IntegrationProvider =
  | "microsoft365"
  | "github"
  | "aws"
  | "azure"
  | "gcp"
  | "google_workspace"
  | "nukib";

export type TestStatus =
  | "pass"
  | "fail"
  | "warning"
  | "error"
  | "manual_review"
  | "not_applicable";

export type TestResult = {
  status: TestStatus;
  data: Record<string, unknown>;
  failureReason?: string;
};

export type IntegrationAdapter = {
  provider: IntegrationProvider;
  runTest(checkLogic: string, integration: Integration): Promise<TestResult>;
};
