import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const REVIEW_STEP_PATH = path.resolve(
  process.cwd(),
  "src/modules/gst/gst-compliance/components/GstComplianceReviewStep/GstComplianceReviewStep.tsx"
);

test("formatGstr2bReference implementation in GstComplianceReviewStep matches requirements", () => {
  const content = fs.readFileSync(REVIEW_STEP_PATH, "utf8");

  // Validate presence of formatGstr2bReference
  assert.ok(
    content.includes("formatGstr2bReference"),
    "Must define formatGstr2bReference"
  );

  // Validate fallback is 'Not Provided'
  assert.ok(
    content.includes('return "Not Provided";'),
    "Fallback must be 'Not Provided'"
  );

  // Validate that 'Not specified' or 'NOT_SPECIFIED' is never returned as fallback
  assert.ok(
    !content.includes('|| "Not specified"'),
    "Should not contain 'Not specified' fallback"
  );
  assert.ok(
    !content.includes('|| "NOT_SPECIFIED"'),
    "Should not contain 'NOT_SPECIFIED' fallback"
  );

  // Check the table mapping rules:
  // 1. Actual reference/period -> Display actual value
  // 2. null -> Not Provided
  // 3. undefined -> Not Provided
  // 4. Empty string -> Not Provided
  // 5. NOT_SPECIFIED -> Not Provided
  // 6. NOT_PROVIDED -> Not Provided
  const isValidValue = (v: string | null | undefined): boolean => {
    if (!v) return false;
    const upper = v.trim().toUpperCase();
    return upper !== "NOT_SPECIFIED" && upper !== "NOT_PROVIDED" && upper !== "NOT SPECIFIED" && upper !== "NOT PROVIDED";
  };
  const formatGstr2b = (f?: string | null, d?: string | null) => {
    const cf = typeof f === "string" ? f.trim() : "";
    const cd = typeof d === "string" ? d.trim() : "";
    if (isValidValue(cf)) return cf;
    if (isValidValue(cd)) return cd;
    return "Not Provided";
  };

  assert.equal(formatGstr2b("GSTR2B-2025-01", null), "GSTR2B-2025-01");
  assert.equal(formatGstr2b(null, "GSTR2B-2025-01"), "GSTR2B-2025-01");
  assert.equal(formatGstr2b(null, null), "Not Provided");
  assert.equal(formatGstr2b(undefined, undefined), "Not Provided");
  assert.equal(formatGstr2b("", ""), "Not Provided");
  assert.equal(formatGstr2b("   ", "   "), "Not Provided");
  assert.equal(formatGstr2b("NOT_SPECIFIED", null), "Not Provided");
  assert.equal(formatGstr2b(null, "NOT_SPECIFIED"), "Not Provided");
  assert.equal(formatGstr2b("NOT_PROVIDED", null), "Not Provided");
  assert.equal(formatGstr2b(null, "NOT_PROVIDED"), "Not Provided");
  assert.equal(formatGstr2b("NOT_SPECIFIED", "NOT_PROVIDED"), "Not Provided");
  assert.equal(formatGstr2b("GSTR2B-Q3", "NOT_PROVIDED"), "GSTR2B-Q3");
});
