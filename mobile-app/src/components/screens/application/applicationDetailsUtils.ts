import type { Application, TimelineStep } from "@/types/domain";
import { logger } from "@/core/logging/logger";
import { getErrorMessage } from "@/core/error-handling/errorMessage";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

export function formatDisplayDate(dateStr?: string): string {
  if (!dateStr) return "Today";
  if (MONTH_NAMES.some((m) => dateStr.includes(m))) return dateStr;
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
    }
  } catch (error) {
    logger.debug("Failed to format date string", { dateStr, error: getErrorMessage(error) });
  }
  return dateStr;
}

export function calculateExpectedDate(dateStr?: string): string {
  try {
    const d = dateStr ? new Date(dateStr) : new Date();
    if (!isNaN(d.getTime())) {
      d.setDate(d.getDate() + 2);
      return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
    }
  } catch (error) {
    logger.debug("Failed to calculate expected date", { dateStr, error: getErrorMessage(error) });
  }
  return "1–2 Business Days";
}

export function getGstAmendmentTimeline(appliedDate: string, isCore: boolean): TimelineStep[] {
  return [
    { title: "Submitted", description: "Amendment request created", status: "completed", date: appliedDate },
    { title: "Under Verification", description: "TaxEdge review in progress", status: "current", date: appliedDate },
    { title: "Officer Review", description: isCore ? "Assessing officer reviewing the change" : "Assessing system reviewing the change", status: "pending" },
    { title: "Action Required", description: "If clarification is requested", status: "pending" },
    { title: "Approved / Updated", description: "Amended registration issued", status: "pending" },
  ];
}

export function getDefaultTimeline(app: Application, appliedDate: string): TimelineStep[] {
  if (app.serviceId === "gst-filing") {
    return [
      { title: "Application Submitted", description: "Application filed online with documents", status: "completed", date: appliedDate },
      { title: "Staff Verification", description: "CA reviewing invoices & reconciliation", status: "current", date: appliedDate },
      { title: "Filing Submission", description: "Submission to GST portal", status: "pending" },
      { title: "Filing Completed", description: "ARN generated and confirmation delivered", status: "pending" },
    ];
  }
  return [
    { title: "Application Submitted", description: "Application filed online with documents", status: "completed", date: appliedDate },
    { title: "Document Verification", description: "Review of premises and identity documents", status: "current", date: appliedDate },
    { title: "TRN Generation", description: "Temporary Reference Number creation", status: "pending" },
    { title: "GST Certificate Issuance", description: "Final GSTIN approval from Department", status: "pending" },
  ];
}
