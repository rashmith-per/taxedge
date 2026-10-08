import { gstAmendmentApi } from "@/modules/gst/services/gstAmendmentApi";
import { logger } from "@/core/logging/logger";
import type { AmendmentFormData, SupportingDoc } from "../types/gstAmendmentTypes";

interface PersistAmendmentParams {
  /** True when the user came back from Review to edit an existing amendment. */
  isEditMode: boolean;
  amendmentId: number | null;
  sectionId: string;
  targetGstId: string;
  formData: AmendmentFormData;
  supportingDoc: SupportingDoc | null;
}

interface PersistAmendmentCallbacks {
  /** Called right after a new record is saved, before it is re-fetched. */
  onSaved: (amendmentId: number | null) => void;
  /** Called with the record to show on the Review step. */
  onReviewData: (data: unknown) => void;
}

/**
 * Saves (POST) or updates (PUT) the amendment record, then re-fetches it by id
 * so the Review step shows what the database holds.
 */
export const persistAmendmentForReview = async (
  { isEditMode, amendmentId, sectionId, targetGstId, formData, supportingDoc }: PersistAmendmentParams,
  { onSaved, onReviewData }: PersistAmendmentCallbacks
): Promise<void> => {
  if (isEditMode) {
    if (amendmentId !== null && amendmentId !== undefined) {
      // Review Updated Changes: PUT fetch to update record by id only
      await gstAmendmentApi.updateAmendmentRecord(sectionId, amendmentId, formData, supportingDoc);
      logger.debug("[Review] Updated record in DB by ID:", { amendmentId });
      // Retrieve updated details from database by ID only
      const fetched = await gstAmendmentApi.getAmendmentRecordById(sectionId, amendmentId);
      logger.debug("[Review] Retrieved updated record from DB", { hasRecord: !!fetched });
      onReviewData(fetched);
      return;
    }

    const saved = await gstAmendmentApi.saveAmendmentRecord(sectionId, targetGstId, formData, supportingDoc);
    const newId: number | null = saved?.id ?? null;
    onSaved(newId);
    logger.debug("[Review] Saved new record in DB, ID:", { newId });
    if (newId !== null) {
      const fetched = await gstAmendmentApi.getAmendmentRecordById(sectionId, newId);
      logger.debug("[Review] Retrieved record from DB", { hasRecord: !!fetched });
      onReviewData(fetched);
    }
    return;
  }

  // Review Changes: POST fetch to save data in database
  const saved = await gstAmendmentApi.saveAmendmentRecord(sectionId, targetGstId, formData, supportingDoc);
  const newId: number | null = saved?.id ?? null;
  onSaved(newId);
  logger.debug("[Review] Saved amendment in DB, ID:", { newId });

  // Retrieve from database in review section by ID only
  if (newId !== null) {
    const fetched = await gstAmendmentApi.getAmendmentRecordById(sectionId, newId);
    logger.debug("[Review] Retrieved record from DB by ID", { hasRecord: !!fetched });
    onReviewData(fetched);
  } else {
    onReviewData(saved);
  }
};
