import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "../../..");

const SIGNATORY_SECTION_FILE = path.join(
  ROOT,
  "src/modules/gst/gst-registration/components/GstBusinessStep/GstSignatorySection.tsx"
);
const FLOW_HOOK_FILE = path.join(
  ROOT,
  "src/modules/gst/gst-registration/hooks/useGstRegistrationFlow.ts"
);
const VALIDATORS_FILE = path.join(
  ROOT,
  "src/modules/gst/validators/dobValidators.ts"
);

test("1. GST Registration DOB: Calendar date restriction (maximumDate) is removed", () => {
  assert.ok(fs.existsSync(SIGNATORY_SECTION_FILE), "GstSignatorySection.tsx must exist");
  const content = fs.readFileSync(SIGNATORY_SECTION_FILE, "utf-8");

  // renderDatePicker for signatoryDob does not restrict maximumDate or block calendar
  assert.ok(
    !content.includes("getMaxDobForEighteen"),
    "GstSignatorySection must not restrict calendar using getMaxDobForEighteen"
  );
  assert.ok(
    content.includes('renderDatePicker("signatoryDob", "Date of Birth *")'),
    "renderDatePicker for signatoryDob must allow unconstrained date selection"
  );
});

test("2. GST Registration DOB: Validation rules and exact error messages", async () => {
  const { validateGstDob, DOB_ERROR_MESSAGES } = await import(
    "../../modules/gst/validators/dobValidators.ts"
  );

  const referenceDate = new Date(2026, 10, 11); // 11 Nov 2026

  // Case 1: Below 18 years
  const underageDob = "12-11-2008"; // Turns 18 on 12 Nov 2026 (tomorrow)
  const underageMsg = validateGstDob(underageDob, referenceDate);
  assert.equal(
    underageMsg,
    DOB_ERROR_MESSAGES.UNDERAGE,
    "Should return underage error message"
  );
  assert.equal(
    underageMsg,
    "You must be at least 18 years old to proceed.",
    "Exact message match for underage"
  );

  // Exactly 18 today: should be valid
  const exact18Dob = "11-11-2008"; // Turns 18 today
  const exact18Msg = validateGstDob(exact18Dob, referenceDate);
  assert.equal(exact18Msg, "", "Exact 18th birthday today must be valid");

  // 18+ years: valid
  const adultDob = "01-01-2000";
  assert.equal(validateGstDob(adultDob, referenceDate), "", "Adult DOB must be valid");

  // Case 2: Future date
  const futureDob = "12-11-2026";
  const futureMsg = validateGstDob(futureDob, referenceDate);
  assert.equal(
    futureMsg,
    DOB_ERROR_MESSAGES.FUTURE,
    "Should return future date error"
  );
  assert.equal(
    futureMsg,
    "Date of Birth cannot be in the future.",
    "Exact message match for future date"
  );

  // Case 3: Empty DOB
  const emptyMsg = validateGstDob("", referenceDate);
  assert.equal(emptyMsg, DOB_ERROR_MESSAGES.EMPTY, "Should return empty DOB error");
  assert.equal(
    emptyMsg,
    "Please enter your Date of Birth.",
    "Exact message match for empty DOB"
  );
});

test("3. GST Registration Flow: Validates DOB immediately upon change / selection", () => {
  const hookContent = fs.readFileSync(FLOW_HOOK_FILE, "utf-8");

  // Validates immediately when signatoryDob is changed
  assert.ok(
    hookContent.includes('key === "signatoryDob" && strVal'),
    "Flow hook must evaluate validation immediately when signatoryDob changes"
  );

  // Blocks continue when business validation fails
  assert.ok(
    hookContent.includes("if (!validateBusinessDetails()) return;"),
    "Continue to documents must be blocked if validation fails"
  );
});

test("4. Code Quality: Modified files must be under 400 lines", () => {
  const files = [
    "src/modules/gst/gst-registration/components/GstBusinessStep/GstSignatorySection.tsx",
    "src/modules/gst/gst-registration/hooks/useGstRegistrationFlow.ts",
  ];

  files.forEach((file) => {
    const fullPath = path.join(ROOT, file);
    const lineCount = fs.readFileSync(fullPath, "utf-8").split("\n").length;
    assert.ok(
      lineCount < 400,
      `File ${file} exceeds 400 lines limit (current: ${lineCount})`
    );
  });
});
