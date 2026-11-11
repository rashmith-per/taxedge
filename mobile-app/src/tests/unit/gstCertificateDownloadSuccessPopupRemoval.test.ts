import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "../../..");

const HOOK_FILE = path.join(
  ROOT,
  "src/modules/gst/gst-certificate/hooks/useGstCertificateFlow.ts"
);
const SCREEN_FILE = path.join(
  ROOT,
  "src/modules/gst/gst-certificate/screens/GstCertificateScreen/GstCertificateScreen.tsx"
);

test("1. GST Certificate Flow: handleGenerateCertificate transitions directly to completed state without success Alert popup", () => {
  assert.ok(fs.existsSync(HOOK_FILE), "useGstCertificateFlow.ts must exist");
  const content = fs.readFileSync(HOOK_FILE, "utf-8");

  // In handleGenerateCertificate, setIsCompleted(true) is called
  assert.ok(
    content.includes("setIsCompleted(true)"),
    "handleGenerateCertificate must set isCompleted to true"
  );

  // handleGenerateCertificate should not automatically invoke downloadAndSharePdf or show success Alert
  const generateFuncBody = content.substring(
    content.indexOf("const handleGenerateCertificate"),
    content.indexOf("return {", content.indexOf("const handleGenerateCertificate"))
  );

  assert.ok(
    !generateFuncBody.includes("await downloadAndSharePdf("),
    "handleGenerateCertificate must not auto-trigger downloadAndSharePdf popup/share dialog on download click"
  );

  // Error alert is preserved for failed generation
  assert.ok(
    generateFuncBody.includes('Alert.alert("Generation Failed"'),
    "Error alerts must be preserved on generation failure"
  );
  assert.ok(
    generateFuncBody.includes('Alert.alert("Invalid GSTIN"'),
    "Validation alerts must be preserved for invalid GSTIN"
  );
});

test("2. GST Certificate Screen: Share / Save Certificate and Success Screen are preserved", () => {
  assert.ok(fs.existsSync(SCREEN_FILE), "GstCertificateScreen.tsx must exist");
  const screenContent = fs.readFileSync(SCREEN_FILE, "utf-8");

  assert.ok(
    screenContent.includes("Share / Save Certificate"),
    "Share / Save Certificate button must remain accessible on the success screen"
  );
  assert.ok(
    screenContent.includes("Certificate Ready!"),
    "Certificate Ready success screen header must remain intact"
  );
  assert.ok(
    screenContent.includes("flow.downloadAndSharePdf("),
    "Share / Save Certificate button must trigger downloadAndSharePdf when clicked"
  );
});
