# Audit Log Export SOP

Last updated: 2026-06-02

Status: support procedure for counsel and business-owner review. Use only from an authorised organisation admin or approved support-access session.

## Purpose

This procedure returns all organisation-scoped `audit_logs` rows without relying on the default first page. It supports customer offboarding, legal-hold review, and auditor evidence requests.

Audit logs are retained after organisation deletion under the documented legal/security/compliance retention exception. Export audit logs before triggering organisation deletion when they are part of a customer offboarding package; after deletion they are no longer available through the normal authenticated organisation route.

## Route

`/api/audit-log/export`

Supported query parameters:

- `action` - optional exact audit action filter.
- `entityType` - optional exact entity type filter.
- `from` - optional UTC start date or timestamp. `YYYY-MM-DD` starts at `00:00:00.000Z`.
- `to` - optional UTC end date or timestamp. `YYYY-MM-DD` ends at `23:59:59.999Z`.
- `limit` - optional page size from 1 to 5000. Default is 1000.
- `cursor` - optional cursor returned in `X-Audit-Log-Next-Cursor`.

Response headers:

- `X-Audit-Log-Truncated: true` means another page is available.
- `X-Audit-Log-Next-Cursor` contains the cursor for the next page.

## Browser Export

1. Open `/settings/audit-log` while scoped to the customer organisation.
2. Set the narrowest practical `Od` and `Do` dates for the request.
3. Apply any action or entity filter required by the ticket.
4. Download `CSV export`.
5. If the export is for a large customer, use the API pagination procedure below or slice by smaller date windows until each response is not truncated.

## API Pagination

Use an approved authenticated session for the target organisation. Do not use a personal account unless the support-access process has approved it for that ticket.

1. Request the first page:

```bash
curl -sS -D headers-001.txt \
  -o audit-log-001.csv \
  "https://splnit.eu/api/audit-log/export?from=2026-01-01&to=2026-01-31&limit=5000"
```

2. If `headers-001.txt` contains `X-Audit-Log-Truncated: true`, copy `X-Audit-Log-Next-Cursor` into the next request:

```bash
curl -sS -D headers-002.txt \
  -o audit-log-002.csv \
  "https://splnit.eu/api/audit-log/export?from=2026-01-01&to=2026-01-31&limit=5000&cursor=<cursor>"
```

3. Repeat until `X-Audit-Log-Truncated` is `false`.
4. Record the file names, date range, filters, and page count in the offboarding ticket.
5. Keep each CSV page as a separate evidence item unless the requester specifically asks for a combined file.

## Checks

- Confirm every request was made while scoped to the correct Clerk organisation.
- Confirm the date range covers the customer request.
- Confirm no page returned `X-Audit-Log-Truncated: true` without a follow-up page.
- Store the headers with the export package so the cursor chain can be audited.
