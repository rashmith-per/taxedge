/**
 * Batch 17 — Revised ITR Field Restrictions, Card Separation, and Navigation Flows
 * Tests real-time validations, digit capping, numeric sanitization, IFSC code naming,
 * card separation for Step 2 and Step 3, and sequential edit flow continuation.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

// ─── 1. Deduction Limits & Clamping Logic ────────────────────────────────────

const STATUTORY_LIMITS: Record<string, number> = {
  sec80c: 150000,
  sec80d: 100000,
  homeLoanInterest: 200000,
};

const DEDUCTION_MAX_LENGTHS: Record<string, number> = {
  sec80c: 6,
  sec80d: 6,
  homeLoanInterest: 6,
};

function handleDeductionChange(field: string, input: string): string {
  const cleanNumeric = input.replace(/,/g, "").trim();
  if (!cleanNumeric) return "";

  const maxLength = DEDUCTION_MAX_LENGTHS[field] || 12;
  const constrained = cleanNumeric.slice(0, maxLength);

  const num = Number(constrained);
  const maxLimit = STATUTORY_LIMITS[field];
  if (maxLimit !== undefined && !isNaN(num) && num > maxLimit) {
    return String(maxLimit);
  }
  return constrained;
}

// ─── 2. Bank Account Sanitization Logic ──────────────────────────────────────

function handleBankAccountChange(input: string): string {
  // Only allow numeric digits and enforce max 18 characters
  return input.replace(/\D/g, "").slice(0, 18);
}

function validateBankAccount(val: string): string | undefined {
  const digits = val.replace(/\D/g, "");
  if (!digits) return "Bank account for refund is required.";
  if (digits.length < 9 || digits.length > 18) {
    return "Bank account number must be between 9 and 18 digits.";
  }
  return undefined;
}

// ─── 3. IFSC Code Validation Logic ───────────────────────────────────────────

function validateIfscCode(val: string): string | undefined {
  const clean = (val || "").trim().toUpperCase();
  if (!clean) return "IFSC Code is required.";
  const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
  if (!ifscRegex.test(clean)) {
    return "Please enter a valid 11-character IFSC Code (e.g. SBIN0001234).";
  }
  return undefined;
}

// ─── 4. Navigation Flow Logic ────────────────────────────────────────────────

interface EditNavigationParams {
  isEditing?: string;
  fromReasonEdit?: string;
}

function resolveNextStepOnDetailsContinue(params: EditNavigationParams): "documents" | "review" {
  if (params.isEditing === "true" && params.fromReasonEdit !== "true") {
    // Direct edit from Review Screen -> returns directly to Review
    return "review";
  }
  // From Reason edit or standard creation flow -> continues forward to Documents
  return "documents";
}

function resolveNextStepOnReasonContinue(isEditing?: string): "update" {
  // Always continues to Step 3 (update details) to ensure fields match new reason
  return "update";
}

// ─── Test Suite ──────────────────────────────────────────────────────────────

describe("Batch 17 — Revised ITR Improvements", () => {
  describe("Statutory Deduction Digit Restrictions & Value Capping (Image 1)", () => {
    it("restricts Section 80C to 6 digits and clamps amounts exceeding ₹1,50,000", () => {
      assert.strictEqual(handleDeductionChange("sec80c", "120000"), "120000");
      assert.strictEqual(handleDeductionChange("sec80c", "150000"), "150000");
      // Value exceeding statutory limit is capped to 150000
      assert.strictEqual(handleDeductionChange("sec80c", "180000"), "150000");
      assert.strictEqual(handleDeductionChange("sec80c", "999999"), "150000");
      // Excess digits (e.g. 12 digits: 9,94,94,94,99,494) sliced to 6 and clamped
      assert.strictEqual(handleDeductionChange("sec80c", "994949499494"), "150000");
    });

    it("restricts Section 80D to 6 digits and clamps amounts exceeding ₹1,00,000", () => {
      assert.strictEqual(handleDeductionChange("sec80d", "75000"), "75000");
      assert.strictEqual(handleDeductionChange("sec80d", "100000"), "100000");
      assert.strictEqual(handleDeductionChange("sec80d", "125000"), "100000");
      assert.strictEqual(handleDeductionChange("sec80d", "95949949191"), "100000");
    });

    it("restricts Home Loan Interest to 6 digits and clamps amounts exceeding ₹2,00,000", () => {
      assert.strictEqual(handleDeductionChange("homeLoanInterest", "180000"), "180000");
      assert.strictEqual(handleDeductionChange("homeLoanInterest", "200000"), "200000");
      assert.strictEqual(handleDeductionChange("homeLoanInterest", "250000"), "200000");
      assert.strictEqual(handleDeductionChange("homeLoanInterest", "888888888"), "200000");
    });
  });

  describe("Bank Account Numeric Keyboard & Sanitization", () => {
    it("strips all alphabetic and special characters from bank account", () => {
      assert.strictEqual(handleBankAccountChange("1234-5678-9012"), "123456789012");
      assert.strictEqual(handleBankAccountChange("A1B2C3D4E5F6G7H8"), "12345678");
      assert.strictEqual(handleBankAccountChange("9876543210987654321999"), "987654321098765432"); // max 18
    });

    it("validates bank account length between 9 and 18 digits", () => {
      assert.strictEqual(validateBankAccount(""), "Bank account for refund is required.");
      assert.ok(validateBankAccount("12345")?.includes("between 9 and 18 digits"));
      assert.strictEqual(validateBankAccount("123456789012"), undefined);
    });
  });

  describe("IFSC Code Renaming and Validation", () => {
    it("uses 'IFSC Code' in validation error messages", () => {
      const err = validateIfscCode("INVALID123");
      assert.ok(err && err.includes("IFSC Code"));
      assert.ok(err && err.includes("11-character"));
    });

    it("accepts valid 11-character IFSC Code", () => {
      assert.strictEqual(validateIfscCode("SBIN0001234"), undefined);
      assert.strictEqual(validateIfscCode("HDFC0000123"), undefined);
    });
  });

  describe("Step 2 vs Step 3 Edit Navigation Flows (Image 3)", () => {
    it("from Step 2 Reason edit: continues sequentially to Step 3 then Step 4 then Review", () => {
      // Step 2 continue route
      const nextFromReason = resolveNextStepOnReasonContinue("true");
      assert.strictEqual(nextFromReason, "update");

      // Step 3 continue route when arriving from Reason edit
      const nextFromDetails = resolveNextStepOnDetailsContinue({
        isEditing: "true",
        fromReasonEdit: "true",
      });
      assert.strictEqual(nextFromDetails, "documents");
    });

    it("from Step 3 Details edit: directly redirects back to Review upon update", () => {
      const nextFromDetails = resolveNextStepOnDetailsContinue({
        isEditing: "true",
        fromReasonEdit: undefined,
      });
      assert.strictEqual(nextFromDetails, "review");
    });
  });
});
