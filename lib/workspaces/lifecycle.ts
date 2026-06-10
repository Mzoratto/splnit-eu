import { recalculateVendorAssessmentControlsForAllOrgs } from "@/lib/vendors/assessment-coverage";
import { processHeliosWorkspaceEvidenceLifecycle } from "@/lib/workspaces/helios/lifecycle";

export async function processWorkspaceEvidenceLifecycle(now = new Date()) {
  const helios = await processHeliosWorkspaceEvidenceLifecycle(now);
  const vendorAssessmentCoverage =
    await recalculateVendorAssessmentControlsForAllOrgs(now);

  return {
    helios,
    vendorAssessmentCoverage,
  };
}
