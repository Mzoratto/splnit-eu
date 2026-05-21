# OVHcloud API auth flow

OVHcloud does not use a single bearer token. The connector must store three encrypted parts per organisation:

- `application key`
- `application secret`
- `consumer key`

The consumer key is created through a browser validation flow.

## Required connect sequence

1. User enters the OVHcloud application key and application secret in Splnit.eu.
2. Splnit.eu requests a consumer key:

```http
POST https://api.ovh.com/1.0/auth/credential
X-Ovh-Application: <application key>
Content-Type: application/json

{
  "redirection": "https://splnit.eu/integrations/ovhcloud",
  "accessRules": [
    { "method": "GET", "path": "/dedicated/server/*" },
    { "method": "GET", "path": "/dedicated/server/*/firewall" },
    { "method": "GET", "path": "/dedicated/server/*/backupStorage" }
  ]
}
```

3. OVHcloud returns a pending credential response:

```json
{
  "state": "pendingValidation",
  "consumerKey": "...",
  "validationUrl": "https://..."
}
```

4. Splnit.eu stores the pending consumer key only after encrypting it per organisation, then redirects the user to `validationUrl`.
5. User validates the requested rights in OVHcloud.
6. User returns to Splnit.eu. Splnit.eu performs a health check using all three parts:
   - `X-Ovh-Application`
   - `X-Ovh-Consumer`
   - `X-Ovh-Timestamp`
   - `X-Ovh-Signature`
7. If the health check succeeds, the integration is marked `connected`.
8. If the health check returns `401`, mark `invalid_key`.
9. If the health check returns `403`, mark `insufficient_scope`.
10. If the API times out or cannot be reached, mark `unreachable`.

## Storage mapping

Follow the existing Microsoft 365 encrypted integration storage pattern:

- `integrations.access_token_enc`: encrypted application key
- `integrations.refresh_token_enc`: encrypted application secret
- `integrations.config.consumerKeyEnc`: encrypted consumer key
- `integrations.config.serviceName`: OVHcloud service name for dedicated-server checks
- `integrations.provider`: `ovhcloud`
- `integrations.token_expires_at`: `null`

## Signature format

For signed OVHcloud API requests, compute:

```text
$1$ + SHA1(applicationSecret + "+" + consumerKey + "+" + method + "+" + url + "+" + body + "+" + timestamp)
```

Use an empty string for `body` on `GET` requests.

## Conservative implementation notes

- Do not log any of the three key parts.
- Do not store the consumer key before encrypting it.
- Keep the rights read-only for this tranche.
- If validation is incomplete or ambiguous, show the manual attestation fallback instead of a blank automated state.
- TODO: Confirm the exact production `redirection` route before implementing the callback page.
