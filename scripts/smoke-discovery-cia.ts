import assert from "node:assert/strict";
import { suggestCia } from "../lib/discovery/cia-heuristics";

function assertRating(
  name: string,
  actual: unknown,
  expected: unknown,
) {
  assert.equal(actual, expected, name);
  console.log(`PASS ${name}`);
}

{
  const { rating, rationale } = suggestCia({
    blastRadius: 5,
    handlesSensitiveData: true,
    internetFacing: false,
    privileged: false,
    production: true,
  });

  assertRating("sensitive data raises confidentiality high", rating.confidentiality, "high");
  assert.ok(rationale.includes("personal or financial data"), "rationale explains sensitive-data signal");
}

{
  const { rating } = suggestCia({
    blastRadius: 0,
    handlesSensitiveData: false,
    internetFacing: false,
    privileged: true,
    production: true,
  });

  assertRating("privileged production raises integrity high", rating.integrity, "high");
}

{
  const { rating } = suggestCia({
    blastRadius: 50,
    handlesSensitiveData: false,
    internetFacing: false,
    privileged: false,
    production: true,
  });

  assertRating("large production blast radius raises availability high", rating.availability, "high");
}

{
  const { rating } = suggestCia({
    blastRadius: 0,
    handlesSensitiveData: false,
    internetFacing: true,
    privileged: false,
    production: false,
  });

  assert.notEqual(rating.confidentiality, "low", "internet-facing floors confidentiality at medium");
  assert.notEqual(rating.integrity, "low", "internet-facing floors integrity at medium");
  assertRating("internet-facing without production leaves availability low", rating.availability, "low");
}

{
  const { rating, rationale } = suggestCia({
    blastRadius: 0,
    handlesSensitiveData: false,
    internetFacing: false,
    privileged: false,
    production: false,
  });

  assert.deepEqual(
    rating,
    { availability: "low", confidentiality: "low", integrity: "low" },
    "no-signal asset stays low in all CIA dimensions",
  );
  assert.ok(rationale.length > 0, "rationale is always present");
}

console.log("discovery CIA smoke passed");
