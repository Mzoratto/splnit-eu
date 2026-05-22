const baseUrl = process.env.DEMO_ROUTES_BASE_URL ?? "http://127.0.0.1:3000";

const routes = [
  "/demo",
  "/demo/controls",
  "/demo/workspaces/pohoda",
  "/demo/workspaces/hetzner",
  "/demo/export",
];

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function absoluteUrl(path: string) {
  return new URL(path, baseUrl).toString();
}

async function main() {
  for (const route of routes) {
    const response = await fetch(absoluteUrl(route), {
      redirect: "manual",
    });
    const location = response.headers.get("location");
    const clerkRedirect = response.headers.get("x-clerk-redirect-to");
    const clerkAuthReason = response.headers.get("x-clerk-auth-reason");

    assert(
      response.status === 200,
      `${route} expected 200 but received ${response.status}${location ? ` with location ${location}` : ""}`,
    );
    assert(!location, `${route} returned a redirect location header: ${location}`);
    assert(!clerkRedirect, `${route} returned Clerk redirect header: ${clerkRedirect}`);
    assert(!clerkAuthReason, `${route} returned Clerk auth reason header: ${clerkAuthReason}`);
    assert(
      !response.url.includes("/sign-in"),
      `${route} resolved to sign-in URL: ${response.url}`,
    );
  }

  console.log(`Demo routes smoke passed for ${routes.length} routes at ${baseUrl}`);
}

void main();
