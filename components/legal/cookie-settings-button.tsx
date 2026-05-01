"use client";

export function CookieSettingsButton() {
  function openCookieSettings() {
    window.dispatchEvent(new Event("splnit:open-cookie-settings"));
  }

  return (
    <button
      type="button"
      onClick={openCookieSettings}
      className="rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground"
    >
      Změnit nastavení cookies
    </button>
  );
}
