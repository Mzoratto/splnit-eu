import assert from "node:assert/strict";
import {
  getVendorQuestionnaireDeliveryStatus,
  type VendorQuestionnaireDeliveryResult,
} from "../lib/vendors/delivery-status";

function status(input: VendorQuestionnaireDeliveryResult) {
  return getVendorQuestionnaireDeliveryStatus(input);
}

assert.deepEqual(
  status({ emailsSent: 1, failed: null, skipped: null }),
  {
    assessmentStatus: "sent",
    vendorStatus: "questionnaire_sent",
    deliveryStatus: "sent",
    deliveryMessage: null,
  },
);

assert.deepEqual(
  status({ emailsSent: 0, failed: null, skipped: "Resend is not configured." }),
  {
    assessmentStatus: "email_skipped",
    vendorStatus: "questionnaire_delivery_skipped",
    deliveryStatus: "skipped",
    deliveryMessage: "Resend is not configured.",
  },
);

assert.deepEqual(
  status({ emailsSent: 0, failed: "Resend rejected the recipient.", skipped: null }),
  {
    assessmentStatus: "email_failed",
    vendorStatus: "questionnaire_delivery_failed",
    deliveryStatus: "failed",
    deliveryMessage: "Resend rejected the recipient.",
  },
);

assert.deepEqual(
  status({ emailsSent: 0, failed: null, skipped: null }),
  {
    assessmentStatus: "email_skipped",
    vendorStatus: "questionnaire_delivery_skipped",
    deliveryStatus: "skipped",
    deliveryMessage: "Email delivery did not run.",
  },
);

console.log("Vendor questionnaire delivery status smoke passed.");
