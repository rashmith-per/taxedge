import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "../../..");

test("1. GST Registration: restores and syncs exact step index", () => {
  const guardPath = path.join(ROOT, "src/modules/gst/gst-registration/hooks/useGstRegistrationDraftGuard.ts");
  const guardCode = fs.readFileSync(guardPath, "utf-8");

  // Verify step restoration from gstDraft
  assert.ok(
    guardCode.includes("setScreenIndex(gstDraft.stepIndex)"),
    "useGstRegistrationDraftGuard must restore stepIndex from gstDraft"
  );

  // Verify step restoration from AsyncStorage draft
  assert.ok(
    guardCode.includes("setScreenIndex(parsed.step)"),
    "useGstRegistrationDraftGuard must restore step from AsyncStorage draft"
  );

  // Verify stepOverride / screenIndex saved on draft sync
  assert.ok(
    guardCode.includes("stepIndex: stepOverride ?? screenIndex"),
    "useGstRegistrationDraftGuard must persist the active screenIndex or stepOverride"
  );
});

test("2. GST Filing: restores and syncs exact step index", () => {
  const restorePath = path.join(ROOT, "src/modules/gst/gst-filing/hooks/useGstFilingRestore.ts");
  const restoreCode = fs.readFileSync(restorePath, "utf-8");

  // Verify step restoration from gstFilingDraft
  assert.ok(
    restoreCode.includes("setCurrentStep(gstFilingDraft.stepIndex)"),
    "useGstFilingRestore must restore stepIndex from gstFilingDraft"
  );

  // Verify step restoration from AsyncStorage
  assert.ok(
    restoreCode.includes("setCurrentStep(parsed.step)"),
    "useGstFilingRestore must restore step from AsyncStorage draft"
  );

  const hookPath = path.join(ROOT, "src/modules/gst/gst-filing/hooks/useGstFiling.ts");
  const hookCode = fs.readFileSync(hookPath, "utf-8");

  // Verify currentStep is saved on draft sync
  assert.ok(
    hookCode.includes("stepIndex: currentStep"),
    "useGstFiling must persist currentStep in gstFilingDraft"
  );
});

test("3. GST Compliance: stores and restores exact step index across Form and Review", () => {
  const storagePath = path.join(ROOT, "src/modules/gst/gst-compliance/hooks/useComplianceDraftStorage.ts");
  const storageCode = fs.readFileSync(storagePath, "utf-8");

  // Verify readComplianceDraft returns step
  assert.ok(
    storageCode.includes("step: typeof draft.step === \"number\" ? draft.step : undefined"),
    "readComplianceDraft must return the saved step"
  );

  // Verify saveComplianceDraft persists step
  assert.ok(
    storageCode.includes("step: currentStep"),
    "saveComplianceDraft must persist currentStep"
  );

  const hookPath = path.join(ROOT, "src/modules/gst/gst-compliance/hooks/useComplianceForm.ts");
  const hookCode = fs.readFileSync(hookPath, "utf-8");

  // Verify useComplianceForm restores step and updates review entered state
  assert.ok(
    hookCode.includes("setCurrentStep(saved.step)"),
    "useComplianceForm must restore saved.step on mount"
  );
  assert.ok(
    hookCode.includes("if (saved.step === 1) setHasEnteredReview(true)"),
    "useComplianceForm must set review state when resuming step 1"
  );
});

test("4. GST Amendment: preserves and resumes exact step (Landing, Edit, Review)", () => {
  const restorePath = path.join(ROOT, "src/modules/gst/gst-amendment/hooks/useGstAmendmentDraftRestore.ts");
  const restoreCode = fs.readFileSync(restorePath, "utf-8");

  // Verify restore handles targetStep when resuming draft
  assert.ok(
    restoreCode.includes("hasSavedState"),
    "restoreAmendmentDraftFromStorage must detect saved state"
  );
  assert.ok(
    restoreCode.includes("initialStep"),
    "restoreAmendmentDraftFromStorage must set initialStep to targetStep on resume"
  );

  const hookPath = path.join(ROOT, "src/modules/gst/gst-amendment/hooks/useGstAmendmentWorkflow.ts");
  const hookCode = fs.readFileSync(hookPath, "utf-8");

  // Verify currentStep is saved in draft
  assert.ok(
    hookCode.includes("step: currentStep"),
    "useGstAmendmentWorkflow must persist currentStep"
  );
});

test("5. Deep-link resume routes: getDraftResumeRoute maps steps correctly for all 5 GST modules", () => {
  const mappersPath = path.join(ROOT, "src/store/applicationDraftMappers.ts");
  const mappersCode = fs.readFileSync(mappersPath, "utf-8");

  // Verify getDraftResumeRoute handles all 5 GST modules with exact step query params
  assert.ok(
    mappersCode.includes("serviceKey === \"gst-registration\""),
    "getDraftResumeRoute must handle gst-registration"
  );
  assert.ok(
    mappersCode.includes("serviceKey === \"gst-filing\""),
    "getDraftResumeRoute must handle gst-filing"
  );
  assert.ok(
    mappersCode.includes("serviceKey === \"gst-compliance\""),
    "getDraftResumeRoute must handle gst-compliance"
  );
  assert.ok(
    mappersCode.includes("serviceKey === \"gst-amendment\""),
    "getDraftResumeRoute must handle gst-amendment"
  );
  assert.ok(
    mappersCode.includes("serviceKey === \"gst-certificate\""),
    "getDraftResumeRoute must handle gst-certificate"
  );
});

test("6. Code Quality: All modified files are strictly below 400 lines", () => {
  const files = [
    "src/modules/gst/gst-registration/hooks/useGstRegistrationDraftGuard.ts",
    "src/modules/gst/gst-filing/hooks/useGstFilingRestore.ts",
    "src/modules/gst/gst-filing/hooks/useGstFiling.ts",
    "src/modules/gst/gst-compliance/hooks/useComplianceDraftStorage.ts",
    "src/modules/gst/gst-compliance/hooks/useComplianceForm.ts",
    "src/modules/gst/gst-amendment/hooks/useGstAmendmentDraftRestore.ts",
    "src/modules/gst/gst-amendment/hooks/useGstAmendmentWorkflow.ts",
    "src/store/applicationDraftMappers.ts",
  ];

  for (const rel of files) {
    const full = path.join(ROOT, rel);
    const lines = fs.readFileSync(full, "utf-8").split("\n").length;
    assert.ok(lines < 400, `${rel} has ${lines} lines, which must be < 400`);
  }
});
