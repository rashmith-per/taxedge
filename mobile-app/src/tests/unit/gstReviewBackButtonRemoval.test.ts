import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "../../..");

test("1. GST Registration: Review screen has no Back button, earlier steps retain Back button", () => {
  const filePath = path.join(
    ROOT,
    "src/modules/gst/gst-registration/screens/GstRegistrationScreen/GstRegistrationScreen.tsx"
  );
  assert.ok(fs.existsSync(filePath), "GstRegistrationScreen.tsx must exist");
  const content = fs.readFileSync(filePath, "utf-8");

  // Verify showBack and onBack are disabled on Review step (screenIndex === 2)
  assert.ok(
    content.includes("showBack={!isEditMode && screenIndex !== 2}"),
    "GstRegistrationScreen must pass showBack={!isEditMode && screenIndex !== 2} to GstStepHeader"
  );
  assert.ok(
    content.includes("onBack={isEditMode || screenIndex === 2 ? undefined : handleBack}"),
    "GstRegistrationScreen must pass undefined for onBack when on Review step"
  );
});

test("2. GST Filing: Review screen has no Back button, earlier steps retain Back button", () => {
  const filePath = path.join(
    ROOT,
    "src/modules/gst/gst-filing/screens/GstFilingScreen/GstFilingScreen.tsx"
  );
  assert.ok(fs.existsSync(filePath), "GstFilingScreen.tsx must exist");
  const content = fs.readFileSync(filePath, "utf-8");

  assert.ok(
    content.includes("showBack={!isEditMode && currentStep !== 2}"),
    "GstFilingScreen must pass showBack={!isEditMode && currentStep !== 2} to GstStepHeader"
  );
  assert.ok(
    content.includes("onBack={isEditMode ? undefined : handleBack}"),
    "GstFilingScreen must pass onBack={isEditMode ? undefined : handleBack} to GstStepHeader"
  );
});

test("3. GST Compliance: Review screen has no Back button, Step 0 retains Back button", () => {
  const filePath = path.join(
    ROOT,
    "src/modules/gst/gst-compliance/screens/GstComplianceScreen/GstComplianceScreen.tsx"
  );
  assert.ok(fs.existsSync(filePath), "GstComplianceScreen.tsx must exist");
  const content = fs.readFileSync(filePath, "utf-8");

  assert.ok(
    content.includes("showBack={!isEditMode && currentStep !== 1}"),
    "GstComplianceScreen must pass showBack={!isEditMode && currentStep !== 1} to ComplianceHeader"
  );
});

test("4. GST Amendment: Review screen has no Back button", () => {
  const filePath = path.join(
    ROOT,
    "src/modules/gst/gst-amendment/components/GstAmendmentReview/GstAmendmentReview.tsx"
  );
  assert.ok(fs.existsSync(filePath), "GstAmendmentReview.tsx must exist");
  const content = fs.readFileSync(filePath, "utf-8");

  // Verify header has no back button
  assert.ok(
    !content.includes("chevron-back") && !content.includes("arrow-back"),
    "GstAmendmentReview header must not include back icon"
  );
  assert.ok(
    content.includes("Review Amendment"),
    "GstAmendmentReview must retain title 'Review Amendment'"
  );
});

test("5. GST Cancellation: Review screen has no Back button, Step 1 retains Back button", () => {
  const reviewPath = path.join(
    ROOT,
    "src/modules/gst/gst-cancellation/components/GstCancellationReview/GstCancellationReview.tsx"
  );
  assert.ok(fs.existsSync(reviewPath), "GstCancellationReview.tsx must exist");
  const reviewContent = fs.readFileSync(reviewPath, "utf-8");

  assert.ok(
    reviewContent.includes("showBack={false}"),
    "GstCancellationReview must pass showBack={false} to GstStepHeader"
  );

  const screenPath = path.join(
    ROOT,
    "src/modules/gst/gst-cancellation/screens/GstCancellationScreen/GstCancellationScreen.tsx"
  );
  assert.ok(fs.existsSync(screenPath), "GstCancellationScreen.tsx must exist");
  const screenContent = fs.readFileSync(screenPath, "utf-8");

  assert.ok(
    screenContent.includes("onBack={() => {"),
    "Step 1 in GstCancellationScreen must retain onBack navigation"
  );
});

test("6. Code Quality: All modified files are strictly below 400 lines", () => {
  const files = [
    "src/modules/gst/gst-registration/screens/GstRegistrationScreen/GstRegistrationScreen.tsx",
    "src/modules/gst/gst-filing/screens/GstFilingScreen/GstFilingScreen.tsx",
    "src/modules/gst/gst-compliance/screens/GstComplianceScreen/GstComplianceScreen.tsx",
    "src/modules/gst/gst-amendment/components/GstAmendmentReview/GstAmendmentReview.tsx",
    "src/modules/gst/gst-cancellation/components/GstCancellationReview/GstCancellationReview.tsx",
  ];

  files.forEach((file) => {
    const fullPath = path.join(ROOT, file);
    const lineCount = fs.readFileSync(fullPath, "utf-8").split("\n").length;
    assert.ok(
      lineCount < 400,
      `File ${file} exceeds 400 lines (current: ${lineCount})`
    );
  });
});
