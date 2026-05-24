export function isLocalDemoDataEnabled() {
  const testRoutesEnabled =
    process.env.ENABLE_TEST_ROUTES === "true" ||
    process.env.NEXT_PUBLIC_ENABLE_TEST_ROUTES === "true";

  return (
    process.env.ENABLE_LOCAL_DEMO_DATA === "true" &&
    (process.env.NODE_ENV !== "production" || testRoutesEnabled)
  );
}
