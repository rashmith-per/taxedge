import type {
  Application,
  ApplicationDocument,
  ApplicationTimelineStep,
  ServiceCategoryId,
} from "@/types/domain";
import { logger } from "@/core/logging/logger";
import { getErrorMessage } from "@/core/error-handling/errorMessage";

/**
 * Normalizes various representations of a draft step into a zero-based number.
 */
export function normalizeDraftStep(step: unknown): number {
  if (typeof step === "number" && Number.isFinite(step)) return step;
  if (typeof step !== "string") return 0;

  const stepMap: Record<string, number> = {
    FORM: 0,
    DETAILS: 0,
    UPLOAD: 1,
    DOCUMENTS: 1,
    SUMMARY: 2,
    REVIEW: 3,
    ESTIMATE: 2,
    PAYMENT: 3,
  };

  return stepMap[step.toUpperCase()] ?? 0;
}

/**
 * Returns the deep-link resume route for a draft based on service and step.
 */
export function getDraftResumeRoute(serviceKey: string, step: unknown): string {
  if (serviceKey === "tds-refund") {
    const routeMap: Record<string, string> = {
      DOCUMENTS: "/service/tds-checklist",
      ESTIMATE: "/service/tds-estimate",
      PAYMENT: "/service/tds-payment",
    };
    return routeMap[String(step || "").toUpperCase()] || "/service/tds-form";
  }

  const routeMap: Record<string, string> = {
    "tax-notice": "/service/tax-notice-assistance",
    "previous-year-itr": "/service/previous-year-itr",
    "revised-itr": "/service/revised-itr",
  };

  return routeMap[serviceKey] || `/service/${serviceKey}`;
}

/**
 * Safely extracts documents from draft payloads of any service.
 */
export function normalizeDraftDocuments(draft: Record<string, unknown>): ApplicationDocument[] {
  try {
    const rawDocs = Array.isArray(draft.documents)
      ? draft.documents
      : draft.formData && typeof draft.formData === "object" && Array.isArray((draft.formData as Record<string, unknown>).documents)
        ? ((draft.formData as Record<string, unknown>).documents as unknown[])
        : [];

    return rawDocs.map((item) => {
      const doc = (item && typeof item === "object") ? (item as Record<string, unknown>) : {};
      const name = String(doc.name || doc.title || doc.id || "Required Document");
      const isUploaded =
        String(doc.status || "").toLowerCase() === "uploaded" || Boolean(doc.fileUri);
      return {
        name,
        status: isUploaded ? ("Uploaded" as const) : ("Pending" as const),
        fileUri: typeof doc.fileUri === "string" ? doc.fileUri : typeof doc.uri === "string" ? doc.uri : undefined,
      };
    });
  } catch (error) {
    logger.warn("Failed to normalize draft documents", { error: getErrorMessage(error) });
    return [];
  }
}

/**
 * Converts a raw stored service draft into an Application domain entity.
 */
export function draftToApplication(
  draft: Record<string, unknown>,
  cleanMobile: string
): Application {
  const sid = String(draft.serviceKey || draft.serviceId || "service");
  const cat: ServiceCategoryId =
    (draft.category as ServiceCategoryId) ||
    (sid.startsWith("gst") ? "GST" : "ITR");
  const serviceName =
    String(draft.serviceName || "") ||
    sid
      .split("-")
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const rawStep = draft.step ?? draft.stepIndex ?? draft.savedStep;
  const stepNum = normalizeDraftStep(rawStep);
  const documents = normalizeDraftDocuments(draft);
  const updatedAt = typeof draft.updatedAt === "string" ? draft.updatedAt : new Date().toISOString();

  return {
    id: String(draft.id || `DRAFT-${sid.toUpperCase()}-${cleanMobile.slice(-4) || "USER"}`),
    serviceId: sid,
    serviceName,
    category: cat,
    status: "Draft",
    progress: Math.min(95, Math.max(5, Math.round(((stepNum + 1) / 5) * 100))),
    assignedExecutive: "",
    paymentAmount: 0,
    paymentStatus: "Pending",
    createdAt: updatedAt,
    formData: {
      ...((draft.formData as Record<string, unknown>) || {}),
      isDraft: true,
      savedStep: rawStep,
      resumeRoute: getDraftResumeRoute(sid, rawStep),
    },
    documents,
    timeline: [],
    chatHistory: [],
  };
}

/**
 * Returns service-specific default timeline milestones.
 */
export function getServiceTimeline(serviceId: string): ApplicationTimelineStep[] {
  if (serviceId === "gst-filing") {
    return [
      { title: "Customer Request", description: "Filing request initiated", status: "completed", date: "Today" },
      { title: "Document Upload", description: "Sales & purchase records submitted", status: "completed", date: "Today" },
      { title: "Staff Verification", description: "CA reviewing invoices & reconciliation", status: "current", date: "Today" },
      { title: "Data Preparation", description: "Accounting integration & ledger extraction", status: "pending" },
      { title: "Return Preparation", description: "Tax computation & ITC calculation", status: "pending" },
      { title: "Customer Review", description: "Return draft shared with customer", status: "pending" },
      { title: "Customer Approval", description: "Sign-off received from business", status: "pending" },
      { title: "GST Filing", description: "Submission to GST portal", status: "pending" },
      { title: "Acknowledgement Receipt", description: "ARN generated & filed copy delivered", status: "pending" },
      { title: "Completed", description: "Filing process closed", status: "pending" },
    ];
  }

  if (serviceId === "itr-filing") {
    return [
      { title: "Application Submitted", description: "Return information & documents received", status: "completed", date: "Today" },
      { title: "Staff Verification", description: "Tax Executive verifying documents & Form 26AS/AIS", status: "current", date: "Today" },
      { title: "ITR Preparation & Tax Calculation", description: "Tax computation & dual-regime optimization", status: "pending" },
      { title: "Internal Tax Review", description: "Senior CA verification & quality audit", status: "pending" },
      { title: "Customer Review & Approval", description: "Customer signs off on final computation", status: "pending" },
      { title: "ITR Submission", description: "Filing return with Income Tax e-Filing portal", status: "pending" },
      { title: "E-Verification", description: "Aadhaar OTP / EVC verification pending", status: "pending" },
      { title: "Income Tax Department Processing", description: "Central Processing Center (CPC) return processing & refund/tax closure", status: "pending" },
    ];
  }

  if (serviceId === "tds-refund") {
    return [
      { title: "New Request Received", description: "TDS refund claim initiated", status: "completed", date: "Today" },
      { title: "Documents Received", description: "All documents uploaded", status: "completed", date: "Today" },
      { title: "Under Verification", description: "Documents being verified by CA", status: "current", date: "Today" },
      { title: "ITR Preparation", description: "Return computation by CA", status: "pending" },
      { title: "Customer Approval", description: "Review and approve the return", status: "pending" },
      { title: "ITR Filed", description: "Submitted on IT Department portal", status: "pending" },
      { title: "E-Verification Pending", description: "Verify using Aadhaar OTP / DSC", status: "pending" },
      { title: "Processing by IT Dept.", description: "Department processing", status: "pending" },
      { title: "Refund / Tax Payable", description: "Final status communicated", status: "pending" },
    ];
  }

  return [
    { title: "Application Submitted", description: "Application filed online", status: "completed", date: "Today" },
    { title: "Document Collection", description: "Checking uploaded and pending files", status: "current", date: "Today" },
    { title: "Verification", description: "Verification by executive", status: "pending" },
    { title: "Completed", description: "Filing/Approval confirmation", status: "pending" },
  ];
}
