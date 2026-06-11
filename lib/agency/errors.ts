/**
 * Typed agency access errors so callers can distinguish "you are not an
 * agency consultant" (403-shaped) from "this client org does not exist or
 * is not managed by your agency" (404-shaped), instead of catching every
 * failure — including DB outages — and masking it as a 404.
 */
export class AgencyAccessError extends Error {
  constructor(message = "Agency consultant membership required.") {
    super(message);
    this.name = "AgencyAccessError";
  }
}

export class ManagedClientNotFoundError extends Error {
  constructor(message = "Managed client organisation required.") {
    super(message);
    this.name = "ManagedClientNotFoundError";
  }
}
