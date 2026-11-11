import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { describeUploadError } from "../../modules/itr/revisedItr/utils/revisedDocumentUploadHelper.ts";

describe("Batch 19 — Revised ITR Native XHR Upload & Draft Route Unmatched Fix", () => {
  const rootDir = process.cwd();

  describe("Part 1: Elimination of Expo Winter fetch on FormData (Image 1)", () => {
    const apiServicePath = path.join(
      rootDir,
      "mobile-app/src/modules/itr/revisedItr/services/RevisedItrApiService.ts"
    );
    const code = fs.readFileSync(apiServicePath, "utf-8");

    it("imports executeXhrUpload from gstUploadHelper", () => {
      assert.ok(
        code.includes('import { normalizeDocumentUri, executeXhrUpload } from "@/modules/gst/services/gstUploadHelper";') ||
        code.includes("executeXhrUpload"),
        "Must import executeXhrUpload"
      );
    });

    it("saveRevisedDocuments uses executeXhrUpload instead of fetch with body: formData", () => {
      assert.ok(
        code.includes('executeXhrUpload(targetUrl, "POST", formData)'),
        "saveRevisedDocuments must use executeXhrUpload with POST"
      );
      assert.ok(
        !code.includes('fetch(targetUrl, {\n        method: "POST",\n        headers:'),
        "Must not use fetch for multipart saveRevisedDocuments"
      );
    });

    it("updateRevisedDocuments uses executeXhrUpload instead of fetch with body: formData", () => {
      assert.ok(
        code.includes('executeXhrUpload(targetUrl, "PUT", formData)'),
        "updateRevisedDocuments must use executeXhrUpload with PUT"
      );
      assert.ok(
        !code.includes('fetch(targetUrl, {\n        method: "PUT",\n        headers:'),
        "Must not use fetch for multipart updateRevisedDocuments"
      );
    });

    it("prepares local files to ensure Android content:// gallery files are cached with valid binary bytes", () => {
      assert.ok(
        code.includes("prepareLocalFileForUpload(doc.fileUri, fileName)"),
        "Must prepare local files before appending to formData"
      );
    });
  });

  describe("Part 2: Elimination of Unmatched Route on Save to Draft (Images 2 & 3)", () => {
    const hookPath = path.join(
      rootDir,
      "mobile-app/src/modules/itr/revisedItr/hooks/useRevisedItrDraft.ts"
    );
    const code = fs.readFileSync(hookPath, "utf-8");

    it("does not pass invalid destination /(tabs)/services to useUniversalDraftGuard", () => {
      assert.ok(
        !code.includes('discardDestination: "/(tabs)/services"'),
        "Must not have invalid discardDestination /(tabs)/services"
      );
      assert.ok(
        !code.includes('saveDestination: "/(tabs)/services"'),
        "Must not have invalid saveDestination /(tabs)/services"
      );
    });

    it("matches GST Filing useUniversalDraftGuard parameter signature", () => {
      assert.ok(code.includes("isDirty,"), "Passes isDirty");
      assert.ok(code.includes("onSaveDraft,"), "Passes onSaveDraft");
      assert.ok(code.includes("onDiscardDraft,"), "Passes onDiscardDraft");
      assert.ok(code.includes("isSubmitted: () => isSubmitted"), "Passes isSubmitted");
    });
  });

  describe("Part 3: describeUploadError XHR Error Parsing", () => {
    it("extracts clean error message from GstApiUploadError status string", () => {
      const err = new Error("Upload failed with status 400: Invalid JPEG file content");
      const result = describeUploadError(err);
      assert.strictEqual(result, "Invalid JPEG file content");
    });

    it("handles standard network and validation errors gracefully", () => {
      assert.strictEqual(
        describeUploadError(new Error("Network request failed")),
        "Network connection issue. Please check your internet connection and try again."
      );
      assert.strictEqual(
        describeUploadError(new Error("At least one document is required")),
        "At least one document is required before proceeding."
      );
    });
  });
});
