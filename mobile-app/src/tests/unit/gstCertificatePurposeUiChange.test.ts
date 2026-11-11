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

test("1. GST Certificate: Request Purpose displays directly on main screen with no dropdown modal", () => {
  assert.ok(fs.existsSync(SCREEN_FILE), "GstCertificateScreen.tsx must exist");
  const content = fs.readFileSync(SCREEN_FILE, "utf-8");

  // No GstSelectModal imported or rendered
  assert.ok(
    !content.includes("GstSelectModal"),
    "GstCertificateScreen must not import or render GstSelectModal"
  );

  // No dropdown arrow icon
  assert.ok(
    !content.includes('name="chevron-down"'),
    "GstCertificateScreen must not render chevron-down dropdown arrow"
  );

  // No modal trigger onPress
  assert.ok(
    !content.includes("setShowTypeModal"),
    "GstCertificateScreen must not call setShowTypeModal"
  );

  // Contains selectedOptionBox
  assert.ok(
    content.includes("selectedOptionBox"),
    "GstCertificateScreen must use selectedOptionBox"
  );

  // Contains checkmark-circle icon
  assert.ok(
    content.includes('name="checkmark-circle"') && content.includes('color="#FF7A00"'),
    "GstCertificateScreen must render orange checkmark-circle"
  );
});

test("2. GST Certificate: Default request purpose retains canonical value", () => {
  const hookContent = fs.readFileSync(HOOK_FILE, "utf-8");
  assert.ok(
    hookContent.includes('"Download Existing Certificate (Form REG-06)"'),
    "Hook must default requestType to 'Download Existing Certificate (Form REG-06)'"
  );
});

test("3. GST Certificate Styles: selectedOptionBox has orange theme matching reference", () => {
  const styleContent = fs.readFileSync(STYLES_FILE, "utf-8");

  assert.ok(
    styleContent.includes("selectedOptionBox:"),
    "Styles must define selectedOptionBox"
  );
  assert.ok(
    styleContent.includes('backgroundColor: "#FFF7ED"'),
    "selectedOptionBox must have light orange background (#FFF7ED)"
  );
  assert.ok(
    styleContent.includes('borderColor: "#FF7A00"'),
    "selectedOptionBox must have orange border (#FF7A00)"
  );
  assert.ok(
    styleContent.includes('color: "#FF7A00"'),
    "selectedOptionText must have orange text (#FF7A00)"
  );
});

test("4. Code Quality: Modified files must be strictly below 400 lines", () => {
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
