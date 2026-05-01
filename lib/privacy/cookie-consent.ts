export const cookieConsentChangedEvent = "splnit:cookie-consent-changed";
export const cookieConsentName = "cc-cookie-consent";

export type CookieConsentValue = "accepted" | "rejected";

export function getCookieConsent(): CookieConsentValue | null {
  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${cookieConsentName}=`));

  if (!match) {
    return null;
  }

  const value = match.split("=")[1];
  return value === "accepted" || value === "rejected" ? value : null;
}

export function hasOptionalAnalyticsConsent() {
  return getCookieConsent() === "accepted";
}

export function setCookieConsent(value: CookieConsentValue) {
  if (typeof document === "undefined") {
    return;
  }

  const maxAge = 60 * 60 * 24 * 180;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${cookieConsentName}=${value}; Max-Age=${maxAge}; Path=/; SameSite=Lax${secure}`;
  window.dispatchEvent(
    new CustomEvent(cookieConsentChangedEvent, { detail: value }),
  );
}
