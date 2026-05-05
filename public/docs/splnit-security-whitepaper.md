# Splnit.eu Security Whitepaper

Status: early-access public security summary. Last updated: 2026-05-05.

Splnit.eu is an EU compliance automation platform for SMBs. This document
summarizes the current security posture for procurement and security review.
It does not claim ISO 27001, SOC 2, or any certification that has not been
completed.

## Production Hosting

- Application hosting: Vercel.
- Production region commitment: AWS eu-central-1, Frankfurt.
- Office productivity boundary: Microsoft 365 EU Data Boundary.
- Public status page: https://status.splnit.eu.

## Access And Authentication

- Customer access is authenticated through Clerk.
- Organisation membership and roles are synchronized into the application
  database for authorization decisions.
- Administrative access is limited to the operator and reviewed as part of
  the early-access operating checklist.

## Data Protection

- Privacy Policy: https://splnit.eu/soukromi.
- DPA and sub-processor overview: https://splnit.eu/dpa.
- Privacy contact: privacy@splnit.eu.

## Security Operations

- Security contact: security@splnit.eu.
- Responsible disclosure reports should be sent to security@splnit.eu.
- PGP key is available on request.
- Incident response and breach-notification procedures are maintained as
  internal runbooks and are being refined during early access.

## Current Limitations

- Splnit.eu is not yet ISO 27001 certified.
- SOC 2 Type II is not complete.
- Penetration-test summaries are shared only when available and appropriate
  for the requester.

## Review Cadence

This whitepaper is updated when the production architecture, subprocessors,
security contacts, or certification status changes.
