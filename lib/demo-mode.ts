export function isLocalDemoDataEnabled() {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.ENABLE_LOCAL_DEMO_DATA === "true"
  );
}
