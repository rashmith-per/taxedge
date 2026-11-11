import { TdsCustomerIncomeFormData } from "../../types/customerIncome.types";
import { TdsChecklistItem } from "../../types/checklist.types";
import { TaxCalculationBreakdown } from "../../types/estimate.types";
import { tdsDraftService } from "../../services/tdsDraftService";
import { tdsCalculationService } from "../../services/tdsCalculationService";
import { tdsApiService } from "../../services/tdsApiService";

export interface LoadedTdsReviewData {
  appId: string | null;
  formData: TdsCustomerIncomeFormData;
  documents: TdsChecklistItem[];
  calculation: TaxCalculationBreakdown;
}

interface LocalReviewBase {
  existingAppId: string | undefined;
  custId: string;
  finalForm: TdsCustomerIncomeFormData;
  finalDocs: TdsChecklistItem[];
}

/** Reads the draft stored on the device. No network, so it completes in milliseconds. */
async function readLocalReviewBase(routeId?: string, routeAppId?: string): Promise<LocalReviewBase> {
  const routeProvidedId = routeId || routeAppId;
  const [savedForm, savedDocs, storedAppId] = await Promise.all([
    tdsDraftService.getFormDraft(),
    tdsDraftService.getDocumentsDraft(),
    routeProvidedId ? Promise.resolve<string | null>(null) : tdsDraftService.getApplicationId(),
  ]);
  const existingAppId = routeProvidedId || storedAppId || undefined;

  const custId = savedForm.personal?.mobileNumber
    ? savedForm.personal.mobileNumber.replace(/\D/g, "")
    : "CUST-DEFAULT";

  const finalForm: TdsCustomerIncomeFormData = {
    ...savedForm,
    business: { ...(savedForm.business || { legalName: "", pan: "", aadhaar: "", mobileNumber: "" }) },
    bank: { ...savedForm.bank },
    personal: { ...savedForm.personal },
    income: { ...savedForm.income },
  };
  const finalDocs: TdsChecklistItem[] = savedDocs && savedDocs.length > 0 ? [...savedDocs] : [];

  return { existingAppId, custId, finalForm, finalDocs };
}

/**
 * The Review data exactly as saved on the device, with the tax calculation. The screen shows this
 * straight away and replaces it with `loadTdsReviewData` once the server refresh finishes.
 */
export async function loadLocalTdsReviewData(
  routeId?: string,
  routeAppId?: string
): Promise<LoadedTdsReviewData> {
  const { existingAppId, finalForm, finalDocs } = await readLocalReviewBase(routeId, routeAppId);
  return {
    appId: existingAppId || null,
    formData: finalForm,
    documents: finalDocs,
    calculation: tdsCalculationService.calculate(finalForm),
  };
}

/** The local draft refreshed with the application stored on the server. */
export async function loadTdsReviewData(
  routeId?: string,
  routeAppId?: string
): Promise<LoadedTdsReviewData> {
  const { existingAppId, custId, finalForm, finalDocs } = await readLocalReviewBase(routeId, routeAppId);

  let appId: string | null = existingAppId || null;

  // The two server lookups do not depend on each other, so they run together instead of one after
  // the other.
  const [byIdResult, backendApp] = await Promise.all([
    existingAppId
      ? tdsApiService.getTdsRefund(existingAppId).catch((getErr) => {
          console.warn(`[TDS Review] Warning calling GET /tds-refund/get/${existingAppId}:`, getErr);
          return null;
        })
      : Promise.resolve(null),
    tdsApiService.fetchFullTdsApplication(custId, existingAppId).catch((err) => {
      console.warn("[TDS Estimate Screen] Backend fetch warning:", err);
      return null;
    }),
  ]);

  let dbDetails: any = byIdResult;
  if (!dbDetails && custId && custId !== "CUST-DEFAULT") {
    try {
      dbDetails = await tdsApiService.getBankAccountByCustId(custId);
    } catch (custErr) {
      console.warn("[TDS Review] Fallback custId fetch warning:", custErr);
    }
  }

  if (dbDetails) {
    if (dbDetails.id) {
      appId = dbDetails.id;
      await tdsDraftService.saveApplicationId(dbDetails.id);
    }
    finalForm.business = {
      legalName: dbDetails.legalBusinessName || finalForm.business?.legalName || "",
      pan: dbDetails.businessPan || finalForm.business?.pan || "",
      aadhaar: dbDetails.aadhaarNumber || finalForm.business?.aadhaar || "",
      mobileNumber: dbDetails.mobileNumber || finalForm.business?.mobileNumber || "",
    };

    finalForm.bank = {
      accountHolderName: dbDetails.accountHolderName || finalForm.bank?.accountHolderName || "",
      accountNumber: dbDetails.accountNumber || finalForm.bank?.accountNumber || "",
      confirmAccountNumber: dbDetails.confirmAccountNumber || dbDetails.accountNumber || finalForm.bank?.confirmAccountNumber || "",
      ifscCode: dbDetails.ifscCode || finalForm.bank?.ifscCode || "",
      bankName: dbDetails.bankName || finalForm.bank?.bankName || "",
      branchName: dbDetails.branchName || finalForm.bank?.branchName || "",
      accountType: (dbDetails.accountType?.toLowerCase() === "current" ? "current" : "savings") as any,
      isIfscVerified: Boolean(dbDetails.bankName),
    };

    finalForm.personal = {
      ...finalForm.personal,
      fullName: finalForm.personal?.fullName || dbDetails.accountHolderName || dbDetails.legalBusinessName || "",
      pan: finalForm.personal?.pan || dbDetails.businessPan || "",
      mobileNumber: finalForm.personal?.mobileNumber || dbDetails.mobileNumber || "",
      aadhaar: finalForm.personal?.aadhaar || dbDetails.aadhaarNumber || "",
    };

    if (dbDetails.businessPanDocument) {
      const existingPan = finalDocs.find((d: any) => d.id === "pan");
      if (existingPan) {
        existingPan.status = "uploaded";
        existingPan.fileName = existingPan.fileName || "Business_PAN.pdf";
      } else {
        finalDocs.push({
          id: "pan",
          title: "Business PAN",
          subtitle: "Stored in Database",
          status: "uploaded",
          fileName: "Business_PAN.pdf",
          isMandatory: true,
        } as any);
      }
    }

    if (dbDetails.aadhaarDocument) {
      const existingAadhaar = finalDocs.find((d: any) => d.id === "aadhaar");
      if (existingAadhaar) {
        existingAadhaar.status = "uploaded";
        existingAadhaar.fileName = existingAadhaar.fileName || "Aadhaar_Card.pdf";
      } else {
        finalDocs.push({
          id: "aadhaar",
          title: "Aadhaar Card",
          subtitle: "Stored in Database",
          status: "uploaded",
          fileName: "Aadhaar_Card.pdf",
          isMandatory: true,
        } as any);
      }
    }
  }

  if (backendApp?.income) {
    finalForm.income = { ...finalForm.income, ...backendApp.income };
  }

  const calculation = tdsCalculationService.calculate(finalForm);

  return {
    appId,
    formData: finalForm,
    documents: finalDocs,
    calculation,
  };
}
