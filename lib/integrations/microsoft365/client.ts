import { Client } from "@microsoft/microsoft-graph-client";
import { decryptSecret } from "@/lib/crypto";
import type { Integration } from "@/lib/db/schema";

export function getGraphClient(integration: Integration) {
  if (!integration.accessTokenEnc) {
    throw new Error("Microsoft 365 integration is missing an access token.");
  }

  const token = decryptSecret(integration.accessTokenEnc, integration.clerkOrgId);

  return Client.initWithMiddleware({
    authProvider: {
      getAccessToken: async () => token,
    },
  });
}
