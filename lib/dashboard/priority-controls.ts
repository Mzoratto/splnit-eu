export type DashboardPriorityControlScopeSummary = {
  applicableControlKeys: readonly string[];
  notApplicableControlKeys: readonly string[];
  outOfScopeControlKeys: readonly string[];
  priorityControlKeys: readonly string[];
  rationales: Readonly<Record<string, string>>;
};

export type DashboardPriorityControlInput = {
  key: string;
  intakeRationale: string | null;
  isIntakePriority: boolean;
  scopeStatus: "applicable" | "not_applicable" | "out_of_scope" | null;
};

export function applyIntakeScopeToDashboardPriorityControls<
  TControl extends DashboardPriorityControlInput,
>(
  controls: readonly TControl[],
  scopeSummary: DashboardPriorityControlScopeSummary,
): TControl[] {
  return controls
    .map((control) => {
      const scopeStatus = scopeSummary.applicableControlKeys.includes(control.key)
        ? "applicable" as const
        : scopeSummary.notApplicableControlKeys.includes(control.key)
          ? "not_applicable" as const
          : scopeSummary.outOfScopeControlKeys.includes(control.key)
            ? "out_of_scope" as const
            : null;

      return {
        ...control,
        intakeRationale: scopeSummary.rationales[control.key] ?? null,
        isIntakePriority: scopeSummary.priorityControlKeys.includes(control.key),
        scopeStatus,
      };
    })
    .filter(
      (control) => control.scopeStatus !== "not_applicable" && control.scopeStatus !== "out_of_scope",
    )
    .sort((a, b) => Number(b.isIntakePriority) - Number(a.isIntakePriority));
}
