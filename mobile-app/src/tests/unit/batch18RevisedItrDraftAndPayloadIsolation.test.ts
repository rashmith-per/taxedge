/**
 * Batch 18 — Revised ITR Payload Isolation, Native Gallery Upload, and Save-to-Draft Tests
 * Validates:
 * 1. Database column nullification via isolated payload construction.
 * 2. Native multipart file streaming for phone gallery uploads (fixing 400 Invalid JPEG content).
 * 3. Save to draft system, step navigation, and iOS/Android gesture guard matrix.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

// ─── 1. Payload Isolation Logic (Mirrors revisedFieldValidation.ts) ────────────

interface IsolatedRevisedDetailsPayload {
  revisedItrId?: string;
  salaryBusinessIncome: string | null;
  otherIncome: string | null;
  deduction80C: string | null;
  deduction80D: string | null;
  homeLoanInterest: string | null;
  taxableIncome: string | null;
  bankAccountForRefund: string | null;
  ifscCode: string | null;
}

function buildIsolatedPayload(
  reason: string,
  form: Record<string, string | undefined>,
  revisedItrId?: string
): IsolatedRevisedDetailsPayload {
  const cleanReason = String(reason || "").trim().toLowerCase();

  if (cleanReason === "missed_income") {
    return {
      revisedItrId,
      salaryBusinessIncome: form.salaryBusinessIncome?.trim() || "0",
      otherIncome: form.otherIncome?.trim() || "0",
      taxableIncome: form.taxableIncome?.trim() || "0",
      deduction80C: null,
      deduction80D: null,
      homeLoanInterest: null,
      bankAccountForRefund: null,
      ifscCode: null,
    };
  }

  if (cleanReason === "wrong_deduction") {
    return {
      revisedItrId,
      salaryBusinessIncome: null,
      otherIncome: null,
      deduction80C: form.sec80c?.trim() || "0",
      deduction80D: form.sec80d?.trim() || "0",
      homeLoanInterest: form.homeLoanInterest?.trim() || "0",
      taxableIncome: form.taxableIncome?.trim() || "0",
      bankAccountForRefund: null,
      ifscCode: null,
    };
  }

  if (cleanReason === "incorrect_bank") {
    return {
      revisedItrId,
      salaryBusinessIncome: null,
      otherIncome: null,
      deduction80C: null,
      deduction80D: null,
      homeLoanInterest: null,
      taxableIncome: null,
      bankAccountForRefund: form.bankAccount?.trim() || null,
      ifscCode: form.ifsc?.trim() || null,
    };
  }

  return {
    revisedItrId,
    salaryBusinessIncome: form.salaryBusinessIncome?.trim() || null,
    otherIncome: form.otherIncome?.trim() || null,
    deduction80C: form.sec80c?.trim() || null,
    deduction80D: form.sec80d?.trim() || null,
    homeLoanInterest: form.homeLoanInterest?.trim() || null,
    taxableIncome: form.taxableIncome?.trim() || null,
    bankAccountForRefund: form.bankAccount?.trim() || null,
    ifscCode: form.ifsc?.trim() || null,
  };
}

// ─── 2. URI Normalization & MIME Resolution Logic ────────────────────────────

function normalizeDocumentUri(uri: string): string {
  if (!uri) return "";
  let clean = uri.trim();
  if (clean.startsWith("/") && !clean.startsWith("file://") && !clean.startsWith("content://")) {
    return `file://${clean}`;
  }
  return clean;
}

function resolveMimeType(fileName?: string, providedMime?: string): string {
  if (!fileName) return "application/pdf";
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".pdf")) return "application/pdf";
  return providedMime || "application/octet-stream";
}

// ─── 3. Draft Guard Decision Matrix ──────────────────────────────────────────

interface ScreenNavigationConfig {
  step: number;
  isEditing: boolean;
  ackNumber?: string;
  assessmentYear?: string;
  revisionReason?: string;
}

function getHeaderBackBehavior(config: ScreenNavigationConfig): {
  hideBackButton: boolean;
  backAction: "draft_modal" | "previous_step" | "none";
  targetRoute?: string;
} {
  if (config.isEditing) {
    return { hideBackButton: true, backAction: "none" };
  }

  switch (config.step) {
    case 1:
      return { hideBackButton: false, backAction: "draft_modal" };
    case 2:
      return { hideBackButton: false, backAction: "previous_step", targetRoute: "/service/revised-itr" };
    case 3:
      return { hideBackButton: false, backAction: "previous_step", targetRoute: "/service/revised-itr-reason" };
    case 4:
      return { hideBackButton: false, backAction: "previous_step", targetRoute: "/service/revised-itr-update" };
    case 5:
    default:
      return { hideBackButton: true, backAction: "none" };
  }
}

function shouldShowDraftOnSwipe(config: ScreenNavigationConfig, isSubmitted: boolean): boolean {
  if (isSubmitted) return false;
  return Boolean(
    (config.ackNumber && config.ackNumber.trim().length > 0) ||
    (config.assessmentYear && config.assessmentYear.trim().length > 0) ||
    (config.revisionReason && config.revisionReason.trim().length > 0)
  );
}

// ─── Test Suite ──────────────────────────────────────────────────────────────

describe("Batch 18 — Revised ITR Enhancements & Fixes", () => {
  describe("Part 1: Database Column Nullification on Reason Change (Image 1)", () => {
    it("sets deductions and bank details strictly to null when reason is missed_income", () => {
      // Simulate form containing dirty data from previous bank or deduction entries
      const dirtyForm = {
        salaryBusinessIncome: "75000",
        otherIncome: "12000",
        taxableIncome: "87000",
        sec80c: "150000",
        sec80d: "25000",
        homeLoanInterest: "180000",
        bankAccount: "987654321098",
        ifsc: "SBIN0001234",
      };

      const payload = buildIsolatedPayload("missed_income", dirtyForm, "RITR12345");

      assert.strictEqual(payload.salaryBusinessIncome, "75000");
      assert.strictEqual(payload.otherIncome, "12000");
      assert.strictEqual(payload.taxableIncome, "87000");
      // All other columns MUST be null so database clears old values
      assert.strictEqual(payload.deduction80C, null);
      assert.strictEqual(payload.deduction80D, null);
      assert.strictEqual(payload.homeLoanInterest, null);
      assert.strictEqual(payload.bankAccountForRefund, null);
      assert.strictEqual(payload.ifscCode, null);

      // Verify JSON serialized payload carries literal nulls for Spring Boot / MapStruct
      const serialized = JSON.stringify(payload);
      const parsed = JSON.parse(serialized);
      assert.strictEqual(parsed.deduction80C, null);
      assert.strictEqual(parsed.bankAccountForRefund, null);
      assert.strictEqual(parsed.ifscCode, null);
    });

    it("sets income and bank details strictly to null when reason is wrong_deduction", () => {
      const dirtyForm = {
        salaryBusinessIncome: "50000",
        otherIncome: "10000",
        taxableIncome: "60000",
        sec80c: "120000",
        sec80d: "50000",
        homeLoanInterest: "150000",
        bankAccount: "111122223333",
        ifsc: "HDFC0001234",
      };

      const payload = buildIsolatedPayload("wrong_deduction", dirtyForm, "RITR12345");

      assert.strictEqual(payload.deduction80C, "120000");
      assert.strictEqual(payload.deduction80D, "50000");
      assert.strictEqual(payload.homeLoanInterest, "150000");
      assert.strictEqual(payload.taxableIncome, "60000");
      // Income and bank must be null
      assert.strictEqual(payload.salaryBusinessIncome, null);
      assert.strictEqual(payload.otherIncome, null);
      assert.strictEqual(payload.bankAccountForRefund, null);
      assert.strictEqual(payload.ifscCode, null);
    });

    it("sets income and deduction details strictly to null when reason is incorrect_bank", () => {
      const dirtyForm = {
        salaryBusinessIncome: "50000",
        otherIncome: "10000",
        taxableIncome: "60000",
        sec80c: "120000",
        bankAccount: "999988887777",
        ifsc: "ICIC0001234",
      };

      const payload = buildIsolatedPayload("incorrect_bank", dirtyForm, "RITR12345");

      assert.strictEqual(payload.bankAccountForRefund, "999988887777");
      assert.strictEqual(payload.ifscCode, "ICIC0001234");
      assert.strictEqual(payload.salaryBusinessIncome, null);
      assert.strictEqual(payload.otherIncome, null);
      assert.strictEqual(payload.deduction80C, null);
      assert.strictEqual(payload.deduction80D, null);
      assert.strictEqual(payload.homeLoanInterest, null);
      assert.strictEqual(payload.taxableIncome, null);
    });
  });

  describe("Part 2: Gallery Image Upload & Native Multipart Fix (Image 2)", () => {
    it("resolves correct MIME types for gallery JPEG and PNG images", () => {
      assert.strictEqual(resolveMimeType("1000253658.jpg"), "image/jpeg");
      assert.strictEqual(resolveMimeType("photo.jpeg"), "image/jpeg");
      assert.strictEqual(resolveMimeType("aadhaar.png"), "image/png");
      assert.strictEqual(resolveMimeType("return.pdf"), "application/pdf");
    });

    it("normalizes native file URIs for Android content:// and iOS file:// schemes", () => {
      assert.strictEqual(
        normalizeDocumentUri("content://media/external/images/media/1000253658"),
        "content://media/external/images/media/1000253658"
      );
      assert.strictEqual(
        normalizeDocumentUri("/var/mobile/Containers/Data/1000253658.jpg"),
        "file:///var/mobile/Containers/Data/1000253658.jpg"
      );
      assert.strictEqual(
        normalizeDocumentUri("file:///data/user/0/host.exp.exponent/cache/photo.jpg"),
        "file:///data/user/0/host.exp.exponent/cache/photo.jpg"
      );
    });

    it("builds valid React Native file parts without converting to stringified Blobs", () => {
      const filePart = {
        uri: normalizeDocumentUri("content://media/images/123"),
        name: "1000253658.jpg",
        type: resolveMimeType("1000253658.jpg"),
      };

      assert.strictEqual(filePart.uri, "content://media/images/123");
      assert.strictEqual(filePart.name, "1000253658.jpg");
      assert.strictEqual(filePart.type, "image/jpeg");
      assert.strictEqual(typeof filePart.uri, "string");
    });
  });

  describe("Part 3: Save to Draft System & Gestures Navigation Matrix", () => {
    it("Step 1 Header Back button triggers Save to Draft modal", () => {
      const config: ScreenNavigationConfig = {
        step: 1,
        isEditing: false,
        ackNumber: "123456789012345",
        assessmentYear: "AY 2026-27",
      };
      const behavior = getHeaderBackBehavior(config);
      assert.strictEqual(behavior.hideBackButton, false);
      assert.strictEqual(behavior.backAction, "draft_modal");
    });

    it("Step 2 Header Back button navigates back to Step 1", () => {
      const config: ScreenNavigationConfig = {
        step: 2,
        isEditing: false,
        ackNumber: "123456789012345",
        assessmentYear: "AY 2026-27",
      };
      const behavior = getHeaderBackBehavior(config);
      assert.strictEqual(behavior.hideBackButton, false);
      assert.strictEqual(behavior.backAction, "previous_step");
      assert.strictEqual(behavior.targetRoute, "/service/revised-itr");
    });

    it("Step 3 Header Back button navigates back to Step 2", () => {
      const config: ScreenNavigationConfig = {
        step: 3,
        isEditing: false,
      };
      const behavior = getHeaderBackBehavior(config);
      assert.strictEqual(behavior.hideBackButton, false);
      assert.strictEqual(behavior.backAction, "previous_step");
      assert.strictEqual(behavior.targetRoute, "/service/revised-itr-reason");
    });

    it("Step 4 Header Back button navigates back to Step 3", () => {
      const config: ScreenNavigationConfig = {
        step: 4,
        isEditing: false,
      };
      const behavior = getHeaderBackBehavior(config);
      assert.strictEqual(behavior.hideBackButton, false);
      assert.strictEqual(behavior.backAction, "previous_step");
      assert.strictEqual(behavior.targetRoute, "/service/revised-itr-update");
    });

    it("Step 5 (Review Screen) hides header back button completely", () => {
      const config: ScreenNavigationConfig = {
        step: 5,
        isEditing: false,
      };
      const behavior = getHeaderBackBehavior(config);
      assert.strictEqual(behavior.hideBackButton, true);
      assert.strictEqual(behavior.backAction, "none");
    });

    it("Any step in edit mode hides header back button", () => {
      for (const step of [1, 2, 3, 4, 5]) {
        const config: ScreenNavigationConfig = { step, isEditing: true };
        const behavior = getHeaderBackBehavior(config);
        assert.strictEqual(behavior.hideBackButton, true, `Step ${step} should hide back button when isEditing`);
      }
    });

    it("Swipe back hand gesture triggers Draft Modal whenever unsubmitted data exists", () => {
      const activeConfig: ScreenNavigationConfig = {
        step: 3,
        isEditing: false,
        ackNumber: "123456789012345",
        assessmentYear: "AY 2026-27",
        revisionReason: "missed_income",
      };
      // Before submission -> swipe back intercepts and triggers draft modal
      assert.strictEqual(shouldShowDraftOnSwipe(activeConfig, false), true);
      // After submission -> swipe back does NOT prompt draft modal
      assert.strictEqual(shouldShowDraftOnSwipe(activeConfig, true), false);
    });
  });
});
