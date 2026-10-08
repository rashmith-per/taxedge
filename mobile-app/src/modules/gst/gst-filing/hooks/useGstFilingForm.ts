import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { GstValidators } from "@/modules/gst/utils/gstValidators";
import { GstFilingPeriodData } from "@/modules/gst/gst-filing/components/GstFilingPeriodStep/GstFilingPeriodStep";
import {
  INITIAL_FILING_DOCS,
  FilingDocItem,
} from "@/modules/gst/gst-filing/config/gstFilingDocumentsConfig";
import { useApplicationStore } from "@/store/applicationStore";
import { applicationService } from "@/modules/applications/services/applicationService";
import { logger } from "@/core/logging/logger";

export function useGstFilingForm(createdAppId: string) {
  const [periodData, setPeriodData] = useState<GstFilingPeriodData>({
    periodType: "",
    financialYear: "FY 2025-26",
    filingPeriod: "",
    filingMonth: "",
    gstin: "",
    filingType: "",
    filingNature: "Regular Return",
    calculationMethod: "ca_assisted",
  });
  const [periodErrors, setPeriodErrors] = useState<Record<string, string>>({});
  const [documents, setDocuments] = useState<FilingDocItem[]>(INITIAL_FILING_DOCS);

  const validatePeriodStep = useCallback((): boolean => {
    const errs: Record<string, string> = {};
    if (!GstValidators.isNotEmpty(periodData.periodType)) {
      errs.periodType = "Please select a filing frequency";
    }
    if (
      !periodData.financialYear ||
      !GstValidators.isNotEmpty(periodData.financialYear)
    ) {
      errs.financialYear = "Please select a financial year";
    }
    const periodVal = periodData.filingPeriod || periodData.filingMonth;
    if (!periodVal || !GstValidators.isNotEmpty(periodVal)) {
      errs.filingPeriod = "Please select a filing return period";
    }
    if (!GstValidators.isValidGstin(periodData.gstin)) {
      errs.gstin = "Enter a valid 15-character GSTIN (e.g. 29AAAAA0000A1Z5)";
    }
    if (!GstValidators.isNotEmpty(periodData.filingType)) {
      errs.filingType = "Please select a return type";
    }

    setPeriodErrors(errs);
    if (Object.keys(errs).length > 0) {
      const labels: Record<string, string> = {
        periodType: "Filing frequency",
        financialYear: "Financial year",
        filingPeriod: "Filing period",
        gstin: "GSTIN",
        filingType: "Return type",
      };
      const errKeys = Object.keys(errs);
      const buildBulletLines = (
        keys: readonly string[],
        idx = 0,
        acc: string[] = [],
      ): string => {
        if (idx >= keys.length) return acc.join("\n");
        const key = keys[idx];
        const label = labels[key] || key;
        acc.push(`• ${label}`);
        return buildBulletLines(keys, idx + 1, acc);
      };
      Alert.alert(
        "Review Filing Details",
        `Please correct the following fields:\n\n${buildBulletLines(errKeys)}`,
      );
      return false;
    }
    return true;
  }, [periodData]);

  const handleUpdateDocuments = useCallback(
    (updatedDocs: FilingDocItem[]) => {
      setDocuments(updatedDocs);
      if (createdAppId) {
        const existing = useApplicationStore
          .getState()
          .applications.find((a) => a.id === createdAppId);
        if (existing) {
          const buildAppDocs = (
            docs: readonly FilingDocItem[],
            idx = 0,
            acc: {
              name: string;
              status: "Uploaded" | "Pending";
              fileUri?: string;
            }[] = [],
          ) => {
            if (idx >= docs.length) return acc;
            const d = docs[idx];
            acc.push({
              name: d.name,
              status: (d.fileUri ? "Uploaded" : "Pending") as
                | "Uploaded"
                | "Pending",
              fileUri: d.fileUri,
            });
            return buildAppDocs(docs, idx + 1, acc);
          };
          const appDocs = buildAppDocs(updatedDocs);
          applicationService
            .updateApplication({
              ...existing,
              documents: appDocs,
            })
            .catch((err) => {
              logger.warn("[useGstFilingForm] Failed to sync document changes to application:", { error: err, createdAppId });
            });
        }
      }
    },
    [createdAppId],
  );

  const isNilReturn = periodData.filingNature === "Nil Return";
  const requiredDocs = isNilReturn ? [] : documents.filter((d) => d.required);
  const missingDocs = requiredDocs.filter((d) => !d.fileUri);
  const missingDocsCount = missingDocs.length;
  const uploadedDocsCount = documents.filter((d) => Boolean(d.fileUri)).length;

  const validateDocumentsStep = useCallback((): boolean => {
    switch (periodData.filingNature) {
      case "Nil Return":
        return true;
      case "Regular Return":
      default: {
        const mandatoryMissing = documents.filter((d) => d.required && !d.fileUri);
        if (mandatoryMissing.length > 0) {
          const missingNames = mandatoryMissing.map((d) => d.name).join("\n• ");
          Alert.alert(
            "Required Documents Missing",
            `Please upload all required documents before proceeding:\n\n• ${missingNames}`,
            [{ text: "OK" }],
          );
          return false;
        }
        return true;
      }
    }
  }, [periodData.filingNature, documents]);

  return {
    periodData,
    setPeriodData,
    periodErrors,
    setPeriodErrors,
    documents,
    setDocuments,
    validatePeriodStep,
    validateDocumentsStep,
    handleUpdateDocuments,
    requiredDocs,
    missingDocsCount,
    uploadedDocsCount,
  };
}
