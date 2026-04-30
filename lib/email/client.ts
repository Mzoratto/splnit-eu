import { Resend } from "resend";

let resend: Resend | null = null;

export function hasResendConfig() {
  return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM);
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
  if (!process.env.RESEND_FROM) {
    throw new Error("RESEND_FROM is required to send email.");
  }

  return process.env.RESEND_FROM;
}
