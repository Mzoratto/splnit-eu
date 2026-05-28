import { expect, test } from "@playwright/test";
import registrationFixture from "../../scripts/fixtures/nukib-registration-fixture.json";

const registrationPayload = {
  ...registrationFixture,
};

test.use({ locale: "cs-CZ" });

test.describe("NÚKIB registration API", () => {
  test("POST creates an artifact, GET returns it, and PDF export responds with a PDF", async ({
    request,
  }) => {
    const createResponse = await request.post("/api/compliance/nukib-registration", {
      data: registrationPayload,
    });

    expect(createResponse.status()).toBe(200);
    const createBody = (await createResponse.json()) as { id?: string };
    expect(createBody.id).toEqual(expect.any(String));

    const getResponse = await request.get("/api/compliance/nukib-registration");
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
    );
    expect(pdfResponse.status()).toBe(200);
    expect(pdfResponse.headers()["content-type"]).toContain("application/pdf");
    expect((await pdfResponse.body()).byteLength).toBeGreaterThan(100);
  });

  test("POST with missing IČO returns 400", async ({ request }) => {
    const invalidPayload: Partial<typeof registrationPayload> = {
      ...registrationPayload,
    };
    delete invalidPayload.ico;

    const response = await request.post("/api/compliance/nukib-registration", {
      data: invalidPayload,
    });

    expect(response.status()).toBe(400);
    const body = (await response.json()) as { error?: string; issues?: unknown };
    expect(body.error).toBe("Invalid NÚKIB registration payload");
    expect(body.issues).toBeTruthy();
  });
});
