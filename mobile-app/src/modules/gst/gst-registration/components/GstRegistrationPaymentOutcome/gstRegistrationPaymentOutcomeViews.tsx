import React from "react";
import type { PaymentOutcomeViews } from "@/shared/types/paymentOutcome.types";
import { GstPaymentSuccessStep } from "@/modules/gst/gst-filing/components/payment/GstPaymentSuccessStep/GstPaymentSuccessStep";
import { GstPaymentReceiptStep } from "@/modules/gst/gst-filing/components/payment/GstPaymentReceiptStep/GstPaymentReceiptStep";
import { GstApplicationStatusStep } from "@/modules/gst/gst-status/components/GstApplicationStatusStep/GstApplicationStatusStep";

/** Post-payment views for the GST Registration checkout. */
export const gstRegistrationPaymentOutcomeViews: PaymentOutcomeViews = {
  renderSuccess: ({ onViewReceipt, onViewApplication }) => (
    <GstPaymentSuccessStep
      amount="Amount unavailable"
      serviceName="GST Registration"
      onViewReceipt={onViewReceipt}
      onViewApplication={onViewApplication}
    />
  ),
  renderReceipt: () => (
    <GstPaymentReceiptStep
      amount="Amount unavailable"
      serviceName="GST Registration Service"
      invoiceNo="INV-2026-00001"
    />
  ),
  renderStatus: () => <GstApplicationStatusStep />,
};
