import { expect, test, type TestInfo } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import registrationFixture from "../../scripts/fixtures/nukib-registration-fixture.json";

const registrationPayload = {
  ...registrationFixture,
};

const unknownValidUuid = "00000000-0000-4000-8000-000000000000";

function nukibTestHeaders(testInfo: TestInfo) {
  const slug = testInfo
    .titlePath
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48);

  return {
    "x-nukib-registration-test-org-id": `org_e2e_nukib_registration_${testInfo.workerIndex}_${slug}`,
  };
}

test.use({ locale: "cs-CZ" });

test.describe("NÚKIB registration API", () => {
  test("GET before any artifact returns 404 for an isolated test org", async ({
    request,
  }, testInfo) => {
    const response = await request.get("/api/compliance/nukib-registration", {
      headers: nukibTestHeaders(testInfo),
    });

    expect(response.status()).toBe(404);
    const body = (await response.json()) as { error?: string };
    expect(body.error).toBe("NÚKIB registration artifact not found");
  });

  test("POST creates an artifact, GET returns it, and PDF export responds with a PDF", async ({
    request,
  }, testInfo) => {
    const headers = nukibTestHeaders(testInfo);
    const createResponse = await request.post("/api/compliance/nukib-registration", {
      data: registrationPayload,
      headers,
    });

    expect(createResponse.status()).toBe(200);
    const createBody = (await createResponse.json()) as { id?: string };
    expect(createBody.id).toEqual(expect.any(String));

    const getResponse = await request.get("/api/compliance/nukib-registration", {
      headers,
    });
    expect(getResponse.status()).toBe(200);
    const getBody = (await getResponse.json()) as {
      content?: { ico?: string; organisationName?: string };
      id?: string;
      title?: string;
    };

    expect(getBody.id).toBe(createBody.id);
    expect(getBody.content?.ico).toBe(registrationPayload.ico);
    expect(getBody.content?.organisationName).toBe(registrationPayload.organisationName);
    expect(getBody.title).toContain(registrationPayload.organisationName);

    const pdfResponse = await request.get(
      `/api/compliance/nukib-registration/${createBody.id}/pdf`,
      { headers },
    );
    expect(pdfResponse.status()).toBe(200);
    expect(pdfResponse.headers()["content-type"]).toContain("application/pdf");
    expect((await pdfResponse.body()).byteLength).toBeGreaterThan(100);
  });

  test("POST with missing IČO returns 400", async ({ request }, testInfo) => {
    const invalidPayload: Partial<typeof registrationPayload> = {
      ...registrationPayload,
    };
    delete invalidPayload.ico;

    const response = await request.post("/api/compliance/nukib-registration", {
      data: invalidPayload,
      headers: nukibTestHeaders(testInfo),
    });

    expect(response.status()).toBe(400);
    const body = (await response.json()) as { error?: string; issues?: unknown };
    expect(body.error).toBe("Invalid NÚKIB registration payload");
    expect(body.issues).toBeTruthy();
  });

  test("POST invalid JSON returns 400", async ({ request }, testInfo) => {
    const response = await request.post("/api/compliance/nukib-registration", {
      data: "{not valid json",
      headers: {
        ...nukibTestHeaders(testInfo),
        "content-type": "application/json",
      },
    });

    expect(response.status()).toBe(400);
    const body = (await response.json()) as { error?: string };
    expect(body.error).toBe("Invalid JSON body");
  });

  test("PDF invalid UUID returns 400", async ({ request }, testInfo) => {
    const response = await request.get(
      "/api/compliance/nukib-registration/not-a-uuid/pdf",
      { headers: nukibTestHeaders(testInfo) },
    );

    expect(response.status()).toBe(400);
    const body = (await response.json()) as { error?: string };
    expect(body.error).toBe("Invalid artifact id");
  });

  test("PDF unknown valid UUID returns 403", async ({ request }, testInfo) => {
    const response = await request.get(
      `/api/compliance/nukib-registration/${unknownValidUuid}/pdf`,
      { headers: nukibTestHeaders(testInfo) },
    );

    expect(response.status()).toBe(403);
    const body = (await response.json()) as { error?: string };
    expect(body.error).toBe("Forbidden");
  });

  test("downloaded PDF text contains submitted registration fields", async ({
    request,
  }, testInfo) => {
    const headers = nukibTestHeaders(testInfo);
    const createResponse = await request.post("/api/compliance/nukib-registration", {
      data: registrationPayload,
      headers,
    });

    expect(createResponse.status()).toBe(200);
    const createBody = (await createResponse.json()) as { id?: string };
    expect(createBody.id).toEqual(expect.any(String));

    const pdfResponse = await request.get(
      `/api/compliance/nukib-registration/${createBody.id}/pdf`,
      { headers },
    );
    expect(pdfResponse.status()).toBe(200);
    expect(pdfResponse.headers()["content-type"]).toContain("application/pdf");

    const pdfPath = testInfo.outputPath("nukib-registration.pdf");
    writeFileSync(pdfPath, await pdfResponse.body());

    const text = execFileSync("pdftotext", [pdfPath, "-"], {
      encoding: "utf8",
    });

    expect(text).toContain(registrationPayload.ico);
    expect(text).toContain(registrationPayload.organisationName);
    expect(text).toContain(registrationPayload.contacts[0]?.name);
    expect(text).toContain(registrationPayload.contacts[0]?.email);
    expect(text).toContain(registrationPayload.serviceNetworkScope.ipRanges[0]);
    expect(text).toContain(registrationPayload.serviceNetworkScope.domainNames[0]);
  });

  test("unauthorized path returns 401 when explicit test mode is disabled", async ({
    request,
  }) => {
    test.fixme(
      true,
      "Requires a separate app server process with NUKIB_REGISTRATION_TEST_MODE disabled and no Clerk session; the explicit test-mode server used by this suite intentionally authenticates via isolated test org headers.",
    );

    const response = await request.get("/api/compliance/nukib-registration");
    expect(response.status()).toBe(401);
  });
});
