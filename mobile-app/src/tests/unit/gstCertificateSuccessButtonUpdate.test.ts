import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "../../..");

const SCREEN_FILE = path.join(
  ROOT,
  "src/modules/gst/gst-certificate/screens/GstCertificateScreen/GstCertificateScreen.tsx"
);
const STYLES_FILE = path.join(
  ROOT,
  "src/modules/gst/gst-certificate/screens/GstCertificateScreen/GstCertificateScreen.styles.ts"
);
const HOOK_FILE = path.join(
  ROOT,
  "src/modules/gst/gst-certificate/hooks/useGstCertificateFlow.ts"
);

test("1. GST Certificate Success Screen: Replaces 'Go to My Applications' with 'Go to Dashboard'", () => {
  assert.ok(fs.existsSync(SCREEN_FILE), "GstCertificateScreen.tsx must exist");
  const content = fs.readFileSync(SCREEN_FILE, "utf-8");

  // Removed old button text
  assert.ok(
    !content.includes("Go to My Applications"),
    "Screen must not contain 'Go to My Applications' button"
  );

  // Contains new button text
  assert.ok(
    content.includes("Go to Dashboard"),
    "Screen must contain 'Go to Dashboard' button"
  );

  // Navigates to home dashboard
  assert.ok(
    content.includes('flow.router.replace("/(main)/home")'),
    "Go to Dashboard button must replace route with /(main)/home"
  );

  // Share / Save Certificate is preserved
  assert.ok(
    content.includes("Share / Save Certificate"),
    "Share / Save Certificate button must remain intact"
  );
});

test("2. GST Certificate Hook: Android BackHandler redirects to dashboard on completion", () => {
  const hookContent = fs.readFileSync(HOOK_FILE, "utf-8");

  assert.ok(
    hookContent.includes('router.replace("/(main)/home")'),
    "BackHandler in hook must navigate to /(main)/home when completed"
  );
});

test("3. GST Certificate Styles & UI: Navy card and GST Compliance matching buttons", () => {
  const stylesContent = fs.readFileSync(STYLES_FILE, "utf-8");
  const screenContent = fs.readFileSync(SCREEN_FILE, "utf-8");

  // Details card styling (dark navy blue)
  assert.ok(
    stylesContent.includes('backgroundColor: "#083B75"'),
    "detailsCard must have dark navy-blue background (#083B75)"
  );
  assert.ok(
    stylesContent.includes('borderRadius: 20'),
    "detailsCard must have borderRadius 20"
  );
  assert.ok(
    stylesContent.includes('color: "rgba(255, 255, 255, 0.75)"'),
    "detailLabel must have light blue/translucent white text"
  );
  assert.ok(
    stylesContent.includes('color: "#FFFFFF"'),
    "detailVal must have white text"
  );

  // Button 1: Share / Save Certificate (Orange filled)
  assert.ok(
    stylesContent.includes("primaryShareBtn:"),
    "Styles must define primaryShareBtn"
  );
  assert.ok(
    stylesContent.includes('backgroundColor: "#FF7A00"'),
    "primaryShareBtn must have orange background (#FF7A00)"
  );
  assert.ok(
    stylesContent.includes("primaryShareBtnText:"),
    "Styles must define primaryShareBtnText"
  );

  // Button 2: Go to Dashboard (Light blue filled)
  assert.ok(
    stylesContent.includes("secondaryDashboardBtn:"),
    "Styles must define secondaryDashboardBtn"
  );
  assert.ok(
    stylesContent.includes('backgroundColor: "#EAF1FE"'),
    "secondaryDashboardBtn must have light blue background (#EAF1FE)"
  );
  assert.ok(
    stylesContent.includes('borderColor: "rgba(8, 59, 117, 0.18)"'),
    "secondaryDashboardBtn must have navy border"
  );
  assert.ok(
    stylesContent.includes('color: "#083B75"'),
    "secondaryDashboardBtnText must have dark navy-blue text (#083B75)"
  );

  // Exactly two buttons rendered
  assert.ok(
    screenContent.includes("primaryShareBtn"),
    "Screen must render primaryShareBtn"
  );
  assert.ok(
    screenContent.includes("secondaryDashboardBtn"),
    "Screen must render secondaryDashboardBtn"
  );
  assert.ok(
    !screenContent.includes("Track in My Applications"),
    "Must not contain 'Track in My Applications'"
  );
  assert.ok(
    !screenContent.includes("Contact Support"),
    "Must not contain 'Contact Support'"
  );
});

test("4. Code Quality: All files must be strictly under 400 lines", () => {
  const files = [
    "src/modules/gst/gst-certificate/screens/GstCertificateScreen/GstCertificateScreen.tsx",
    "src/modules/gst/gst-certificate/screens/GstCertificateScreen/GstCertificateScreen.styles.ts",
    "src/modules/gst/gst-certificate/hooks/useGstCertificateFlow.ts",
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
