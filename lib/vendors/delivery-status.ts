export type VendorQuestionnaireDeliveryStatus = "sent" | "skipped" | "failed";

export type VendorQuestionnaireDeliveryResult = {
  emailsSent: number;
  failed?: string | null;
  skipped?: string | null;
};

export type VendorQuestionnaireDeliveryState = {
  assessmentStatus: "sent" | "email_skipped" | "email_failed";
  deliveryMessage: string | null;
  deliveryStatus: VendorQuestionnaireDeliveryStatus;
  vendorStatus:
    | "questionnaire_sent"
    | "questionnaire_delivery_skipped"
    | "questionnaire_delivery_failed";
};

export function getVendorQuestionnaireDeliveryStatus(
  result: VendorQuestionnaireDeliveryResult,
): VendorQuestionnaireDeliveryState {
  if (result.failed) {
    return {
      assessmentStatus: "email_failed",
      deliveryMessage: result.failed,
      deliveryStatus: "failed",
      vendorStatus: "questionnaire_delivery_failed",
    };
  }

  if (result.skipped) {
    return {
      assessmentStatus: "email_skipped",
      deliveryMessage: result.skipped,
      deliveryStatus: "skipped",
      vendorStatus: "questionnaire_delivery_skipped",
    };
  }

  if (result.emailsSent > 0) {
    return {
      assessmentStatus: "sent",
      deliveryMessage: null,
      deliveryStatus: "sent",
      vendorStatus: "questionnaire_sent",
    };
  }

  return {
    assessmentStatus: "email_skipped",
    deliveryMessage: "Email delivery did not run.",
    deliveryStatus: "skipped",
    vendorStatus: "questionnaire_delivery_skipped",
  };
}

export function getVendorQuestionnaireDeliveryMetadata(input: {
  result: VendorQuestionnaireDeliveryResult;
  sentAt?: string;
  to: string;
}) {
  const state = getVendorQuestionnaireDeliveryStatus(input.result);

  return {
    deliveryMessage: state.deliveryMessage,
    deliveryStatus: state.deliveryStatus,
    deliveryTo: input.to,
    deliveryUpdatedAt: input.sentAt ?? new Date().toISOString(),
  };
}
