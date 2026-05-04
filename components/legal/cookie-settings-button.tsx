"use client";

export function CookieSettingsButton({
  label,
}: {
  label: string;
}) {
  function openCookieSettings() {
    window.dispatchEvent(new Event("splnit:open-cookie-settings"));
  }

  return (
    <button
      type="button"
      onClick={openCookieSettings}
      className="rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground"
    >
      {label}
    </button>
  );
}
