import { Resend } from "resend";

let resend: Resend | null = null;

export const FROM_ADDRESS = "noreply@splnit.eu";
export const REPLY_TO = "podpora@splnit.eu";

export function hasResendConfig() {
  return Boolean(process.env.RESEND_API_KEY);
}

export function getResend() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is required to send email.");
  }

  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }

  return resend;
}

export function getResendFrom() {
  return process.env.RESEND_FROM?.trim() || FROM_ADDRESS;
}
