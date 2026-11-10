import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const VALIDATION_PATH = path.resolve(
  process.cwd(),
  "src/modules/gst/gst-filing/utils/gstFilingValidation.ts"
);
const CALC_SECTION_PATH = path.resolve(
  process.cwd(),
  "src/modules/gst/gst-filing/components/GstFilingPeriodStep/GstCalculationMethodSection.tsx"
);
const STEP_PATH = path.resolve(
  process.cwd(),
  "src/modules/gst/gst-filing/components/GstFilingPeriodStep/GstFilingPeriodStep.tsx"
);
const HOOK_PATH = path.resolve(
  process.cwd(),
  "src/modules/gst/gst-filing/hooks/useGstFilingForm.ts"
);

test("gstFilingValidation contains MAX_ESTIMATED_AMOUNT = 9990000000 and 10-digit regex", () => {
  const content = fs.readFileSync(VALIDATION_PATH, "utf8");
  assert.ok(
    content.includes("export const MAX_ESTIMATED_AMOUNT = 9990000000;"),
    "MAX_ESTIMATED_AMOUNT must be 9990000000"
  );
  assert.ok(
    content.includes(
      "export const ESTIMATED_AMOUNT_REGEX = /^\\d{1,10}(\\.\\d{1,2})?$/;"
    ),
    "Regex must match ^\\d{1,10}(\\.\\d{1,2})?$"
  );
  assert.ok(
    content.includes("Amount exceeds the permitted limit (Max: ₹999 Cr)."),
    "Includes exact limit error message"
  );
  assert.ok(
    content.includes("Maximum 2 decimal places allowed."),
    "Includes exact 2 decimal places error message"
  );
  assert.ok(
    content.includes("Maximum 10 digits allowed before decimal."),
    "Includes exact 10 digits error message"
  );
  assert.ok(
    content.includes("Negative amounts are not allowed."),
    "Includes exact negative amount error message"
  );
  assert.ok(
    content.includes("Please enter a valid amount."),
    "Includes exact valid amount error message"
  );
});

test("GstCalculationMethodSection validates all three fields during input and onBlur", () => {
  const content = fs.readFileSync(CALC_SECTION_PATH, "utf8");
  assert.ok(content.includes('onBlurField?.("taxableSales")'));
  assert.ok(content.includes('onBlurField?.("taxablePurchases")'));
  assert.ok(content.includes('onBlurField?.("eligibleItc")'));
});

test("GstFilingPeriodStep wires onError for all three fields", () => {
  const content = fs.readFileSync(STEP_PATH, "utf8");
  assert.ok(content.includes('onError?.("taxableSales"'));
  assert.ok(content.includes('onError?.("taxablePurchases"'));
  assert.ok(content.includes('onError?.("eligibleItc"'));
});

test("useGstFilingForm validates all three fields before submission / Continue", () => {
  const content = fs.readFileSync(HOOK_PATH, "utf8");
  assert.ok(content.includes('validateEstimatedAmount(periodData.taxableSales, "sales"'));
  assert.ok(content.includes('validateEstimatedAmount(periodData.taxablePurchases, "purchases"'));
  assert.ok(content.includes('validateEstimatedAmount(periodData.eligibleItc, "eligible ITC"'));
});
