import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();
const read = (filePath: string) => readFileSync(join(repoRoot, filePath), "utf8");

function assertIncludes(source: string, needle: string, message: string) {
  assert.ok(source.includes(needle), message);
}

function assertNotIncludes(source: string, needle: string, message: string) {
  assert.ok(!source.includes(needle), message);
}

function assertRegex(source: string, pattern: RegExp, message: string) {
  assert.ok(pattern.test(source), message);
}

function assertExists(filePath: string) {
  assert.ok(existsSync(join(repoRoot, filePath)), `${filePath} must exist`);
}

function assertPublicFormA11y() {
  const footer = read("components/footer.tsx");
  assertIncludes(footer, 'id="footer-newsletter-email"', "Footer newsletter input needs a durable id.");
  assertIncludes(footer, 'htmlFor="footer-newsletter-email"', "Footer newsletter input needs an explicit label.");
  assertIncludes(footer, 'aria-describedby="footer-newsletter-status"', "Footer newsletter input must describe dynamic status.");
  assertIncludes(footer, 'aria-invalid={status === "error"}', "Footer newsletter input must expose invalid state.");
  assertIncludes(footer, 'id="footer-newsletter-status"', "Footer newsletter status must be addressable.");
  assertRegex(footer, /role=\{status === "error" \? "alert" : "status"\}/, "Footer newsletter status must announce errors/status changes.");

  const lead = read("components/marketing/lead-capture.tsx");
  assertIncludes(lead, 'id="lead-capture-email"', "Lead capture input needs a durable id.");
  assertIncludes(lead, 'htmlFor="lead-capture-email"', "Lead capture input needs an explicit label.");
  assertIncludes(lead, 'aria-describedby="lead-capture-status lead-capture-footnote"', "Lead capture input must describe status and footnote.");
  assertIncludes(lead, 'aria-invalid={status === "error"}', "Lead capture input must expose invalid state.");
  assertIncludes(lead, 'id="lead-capture-status"', "Lead capture status must be addressable.");
  assertRegex(lead, /role=\{status === "error" \? "alert" : "status"\}/, "Lead capture status must announce errors/status changes.");
  assertIncludes(lead, "aria-pressed={active}", "Lead capture company-size choices must expose pressed selected state.");
  assertNotIncludes(lead, 'role="radio"', "Lead capture choices must not claim radio semantics without radio keyboard behavior.");
  assertNotIncludes(lead, 'role="radiogroup"', "Lead capture choices must not claim radiogroup semantics without radio keyboard behavior.");
}

function assertDrawerAndDialogA11y() {
  const sidebar = read("components/app/sidebar.tsx");
  assertIncludes(sidebar, "moreButtonRef", "Mobile drawer must keep a trigger ref for focus restoration.");
  assertIncludes(sidebar, "drawerRef", "Mobile drawer must keep a dialog ref for focus management.");
  assertIncludes(sidebar, 'role="dialog"', "Mobile drawer must expose dialog role.");
  assertIncludes(sidebar, 'aria-modal="true"', "Mobile drawer must be modal to assistive tech.");
  assertIncludes(sidebar, 'aria-labelledby="mobile-more-title"', "Mobile drawer must have a labelled title.");
  assertIncludes(sidebar, 'event.key === "Escape"', "Mobile drawer must close on Escape.");
  assertIncludes(sidebar, "getFocusableElements", "Mobile drawer must trap focus within focusable controls.");
  assertIncludes(sidebar, "wasMoreOpenRef", "Mobile drawer focus restoration must be gated by prior open state.");
  assertIncludes(sidebar, "moreButtonRef.current?.focus()", "Mobile drawer must restore focus to trigger after close.");

  const onboarding = read("components/onboarding/onboarding-wizard.tsx");
  assertIncludes(onboarding, "intakeRevealTriggerRef", "Onboarding result dialog must restore focus to the trigger.");
  assertIncludes(onboarding, "intakeRevealDialogRef", "Onboarding result dialog must manage focus inside the dialog.");
  assertIncludes(onboarding, 'role="dialog"', "Onboarding result dialog must expose dialog role.");
  assertIncludes(onboarding, 'aria-modal="true"', "Onboarding result dialog must be modal.");
  assertIncludes(onboarding, 'aria-describedby="intake-results-description"', "Onboarding result dialog must describe its content.");
  assertIncludes(onboarding, 'event.key === "Escape"', "Onboarding result dialog must close on Escape.");
  assertIncludes(onboarding, "wasIntakeRevealOpenRef", "Onboarding result dialog focus restoration must be gated by prior open state.");
  assertIncludes(onboarding, "intakeRevealTriggerRef.current?.focus()", "Onboarding result dialog must restore focus after close.");
}

function assertRouteBoundaries() {
  for (const filePath of [
    "app/(marketing)/loading.tsx",
    "app/(marketing)/error.tsx",
    "app/(marketing)/not-found.tsx",
    "app/(app)/loading.tsx",
    "app/(app)/not-found.tsx",
    "app/(demo)/loading.tsx",
    "app/(demo)/error.tsx",
    "app/(demo)/not-found.tsx",
  ]) {
    assertExists(filePath);
    const source = read(filePath);
    assertRegex(source, /bg-surface|bg-\[var\(--/, `${filePath} must use tokenized surfaces.`);
    assertNotIncludes(source, "error.message", `${filePath} must not expose raw error messages.`);
    assertNotIncludes(source, "digest", `${filePath} must not expose framework digests.`);
  }
}

function assertProgressAndSelectionA11y() {
  const frameworkWizard = read("components/frameworks/framework-assessment-wizard.tsx");
  assertIncludes(frameworkWizard, 'role="progressbar"', "Framework wizard progress must expose progressbar role.");
  assertIncludes(frameworkWizard, "aria-valuenow={answeredCount}", "Framework wizard progress must expose current answer count.");
  assertIncludes(frameworkWizard, 'aria-current={active ? "step" : undefined}', "Framework wizard step buttons must expose current step.");
  assertIncludes(frameworkWizard, "aria-pressed={selected}", "Framework answer choices must expose pressed selected state without incomplete custom radio semantics.");
  assertNotIncludes(frameworkWizard, 'role="radio"', "Framework answer choices must not claim radio semantics without radio keyboard behavior.");
  assertRegex(frameworkWizard, /role=\{error \? "alert" : "status"\}/, "Framework wizard dynamic messages must announce errors/status.");

  const onboarding = read("components/onboarding/onboarding-wizard.tsx");
  assertIncludes(onboarding, 'role="progressbar"', "Onboarding progress must expose progressbar role.");
  assertIncludes(onboarding, "aria-valuenow={wizardProgress}", "Onboarding progress must expose wizard percent.");
  assertIncludes(onboarding, "aria-valuenow={intakeProgress}", "Intake progress must expose intake percent.");
  assertRegex(onboarding, /role=\{error \? "alert" : "status"\}/, "Onboarding dynamic errors must announce as alerts.");

  const nis2 = read("components/marketing/nis2-scope-checker.tsx");
  assertIncludes(nis2, '<fieldset', "NIS2 scope checker selection groups must use fieldsets.");
  assertIncludes(nis2, '<legend', "NIS2 scope checker selection groups must have legends.");
  assertIncludes(nis2, "aria-pressed={size === key}", "NIS2 size choices must expose pressed selected state.");
  assertNotIncludes(nis2, 'role="radio"', "NIS2 size choices must not claim radio semantics without radio keyboard behavior.");
  assertIncludes(nis2, 'aria-live="polite"', "NIS2 result updates must be announced politely.");
}

function assertTokenDriftReduced() {
  const tokens = read("styles/design-tokens.css");
  assertIncludes(tokens, "--app-sidebar-width", "Design tokens must define app sidebar width instead of arbitrary shell pixels.");

  const appShell = read("components/app/app-shell.tsx");
  assertNotIncludes(appShell, "lg:pl-[220px]", "App shell must use sidebar width token instead of raw 220px padding.");
  assertNotIncludes(appShell, "<label className=\"mx-4 hidden h-11", "App shell search affordance must not be a label with no control.");
  assertIncludes(appShell, 'type="button"', "App shell search affordance must be represented as a button if not functional.");
  assertIncludes(appShell, "disabled", "App shell search affordance must be programmatically unavailable until implemented.");

  const sidebar = read("components/app/sidebar.tsx");
  assertNotIncludes(sidebar, "w-[220px]", "Sidebar must use sidebar width token instead of raw 220px width.");
  assertNotIncludes(sidebar, "bg-slate-900", "Sidebar shell must use tokenized brand surface instead of raw slate palette.");

  const nis2 = read("components/marketing/nis2-scope-checker.tsx");
  for (const rawClass of ["border-blue-200", "bg-blue-50", "text-blue-700", "border-zinc-200", "text-zinc-900"]) {
    assertNotIncludes(nis2, rawClass, `NIS2 scope checker should avoid raw palette class ${rawClass}.`);
  }
}

assertPublicFormA11y();
assertDrawerAndDialogA11y();
assertRouteBoundaries();
assertProgressAndSelectionA11y();
assertTokenDriftReduced();

console.log("T4-H frontend UX/a11y source smoke passed.");
