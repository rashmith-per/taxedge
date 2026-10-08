import React from "react";
import { PaymentsHomeScreen } from "@/modules/payments/screens/PaymentsHomeScreen";
import { gstRegistrationPaymentOutcomeViews } from "@/modules/gst/gst-registration";

export default function PaymentsRoute() {
  return <PaymentsHomeScreen outcomeViews={gstRegistrationPaymentOutcomeViews} />;
}
