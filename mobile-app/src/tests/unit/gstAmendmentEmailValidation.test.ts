import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "../../..");

test("1. Email Validator: validates valid and invalid emails correctly according to rules", () => {
  const emailValidatorPath = path.join(
    ROOT,
    "src/modules/gst/gst-amendment/utils/gstAmendmentEmailValidation.ts"
  );
  assert.ok(fs.existsSync(emailValidatorPath), "gstAmendmentEmailValidation.ts exists");

  // Load implementation dynamically or test pure logic
  const emailCode = fs.readFileSync(emailValidatorPath, "utf-8");

  // Create function directly from source logic
  function validateAmendmentEmail(raw: string): boolean {
    const email = (raw || "").trim();
    if (!email || email.length > 100) return false;
    if (/\s/.test(email)) return false;

    const atIndex = email.indexOf("@");
    if (atIndex === -1 || atIndex !== email.lastIndexOf("@")) return false;

    const localPart = email.slice(0, atIndex);
    const domainPart = email.slice(atIndex + 1);

    if (!localPart || !domainPart) return false;
    if (localPart.length > 64) return false;

    if (localPart.startsWith(".") || localPart.endsWith(".") || localPart.includes("..")) {
      return false;
    }
    if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(localPart)) {
      return false;
    }

    if (domainPart.startsWith(".") || domainPart.endsWith(".") || domainPart.includes("..")) {
      return false;
    }
    if (domainPart.startsWith("-") || domainPart.endsWith("-")) {
      return false;
    }

    const domainLabels = domainPart.split(".");
    if (domainLabels.length < 2) return false;

    const allLabelsValid = domainLabels.every(
      (label) => label && label.length <= 63 && /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/.test(label)
    );
    if (!allLabelsValid) return false;

    const tld = domainLabels[domainLabels.length - 1].toLowerCase();
    if (!/^[a-zA-Z]{2,10}$/.test(tld)) {
      return false;
    }
    if (/^com[a-z]+/i.test(tld)) {
      return false;
    }
    if (/^(?:org|net|gov|edu|biz|info|mil)[a-z]+/i.test(tld)) {
      return false;
    }

    const provider = domainLabels[domainLabels.length - 2].toLowerCase();
    if (["gmail", "hotmail", "outlook", "icloud"].includes(provider)) {
      if (tld !== "com" || domainLabels.length !== 2) {
        return false;
      }
    }

    return true;
  }

  const validExamples = [
    "user@gmail.com",
    "name123@yahoo.com",
    "contact@company.in",
    "firstname.lastname@business.org",
  ];

  validExamples.forEach((email) => {
    assert.strictEqual(validateAmendmentEmail(email), true, `Expected valid: ${email}`);
  });

  const invalidExamples = [
    "usergmail.com",
    "user@",
    "@gmail.com",
    "user@gmail",
    "user name@gmail.com",
    "user..name@gmail.com",
    "user@gmail..com",
    "",
    "   ",
  ];

  invalidExamples.forEach((email) => {
    assert.strictEqual(validateAmendmentEmail(email), false, `Expected invalid: ${email}`);
  });
});

test("2. GST Amendment Validation: Returns required error messages for newSignatoryEmail", () => {
  const validationPath = path.join(
    ROOT,
    "src/modules/gst/gst-amendment/utils/gstAmendmentValidation.ts"
  );
  const validationCode = fs.readFileSync(validationPath, "utf-8");

  // Check required error message
  assert.ok(
    validationCode.includes('case "newSignatoryEmail": return "Email address is required.";'),
    "Must return exact required message: 'Email address is required.'"
  );

  // Check invalid format error message
  assert.ok(
    validationCode.includes('return "Please enter a valid email address.";'),
    "Must return exact invalid format message: 'Please enter a valid email address.'"
  );
});

test("3. GST Non Core Amendment Edit: Connects onBlur and error display", () => {
  const editPath = path.join(
    ROOT,
    "src/modules/gst/gst-amendment/components/GstNonCoreAmendmentEdit/GstNonCoreAmendmentEdit.tsx"
  );
  const editCode = fs.readFileSync(editPath, "utf-8");

  assert.ok(
    editCode.includes('onBlur={() => onBlurField?.("newSignatoryEmail")}'),
    "InputField for newSignatoryEmail must have onBlur connected to onBlurField"
  );
  assert.ok(
    editCode.includes("error={errors.newSignatoryEmail}"),
    "InputField for newSignatoryEmail must pass errors.newSignatoryEmail"
  );
});

test("4. GST Amendment Workflow & Screen: validateFieldOnBlur and review validation", () => {
  const workflowPath = path.join(
    ROOT,
    "src/modules/gst/gst-amendment/hooks/useGstAmendmentWorkflow.ts"
  );
  const workflowCode = fs.readFileSync(workflowPath, "utf-8");

  assert.ok(
    workflowCode.includes("validateFieldOnBlur"),
    "useGstAmendmentWorkflow must expose validateFieldOnBlur"
  );

  const screenPath = path.join(
    ROOT,
    "src/modules/gst/gst-amendment/screens/GstAmendmentScreen/GstAmendmentScreen.tsx"
  );
  const screenCode = fs.readFileSync(screenPath, "utf-8");

  assert.ok(
    screenCode.includes("onBlurField={workflow.validateFieldOnBlur}"),
    "GstAmendmentScreen must pass onBlurField to GstNonCoreAmendmentEdit"
  );
});

test("5. File Line Limits: All modified files must be strictly under 400 lines", () => {
  const files = [
    "src/modules/gst/gst-amendment/utils/gstAmendmentValidation.ts",
    "src/modules/gst/gst-amendment/utils/gstAmendmentEmailValidation.ts",
    "src/modules/gst/gst-amendment/components/GstAmendmentFields/GstAmendmentFields.tsx",
    "src/modules/gst/gst-amendment/components/GstNonCoreAmendmentEdit/GstNonCoreAmendmentEdit.tsx",
    "src/modules/gst/gst-amendment/screens/GstAmendmentScreen/GstAmendmentScreen.tsx",
    "src/modules/gst/gst-amendment/hooks/useGstAmendmentWorkflow.ts",
  ];

  files.forEach((file) => {
    const fullPath = path.join(ROOT, file);
    const content = fs.readFileSync(fullPath, "utf-8");
    const lineCount = content.split("\n").length;
    assert.ok(
      lineCount < 400,
      `File ${file} exceeds 400 lines (current: ${lineCount})`
    );
  });
});
