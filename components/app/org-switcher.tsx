"use client";

import { OrganizationSwitcher } from "@clerk/nextjs";

export function OrgSwitcher({ enabled }: { enabled: boolean }) {
  if (!enabled) {
    return null;
  }

  return (
    <OrganizationSwitcher
      afterCreateOrganizationUrl="/dashboard"
      afterSelectOrganizationUrl="/dashboard"
      hidePersonal
    />
  );
}
