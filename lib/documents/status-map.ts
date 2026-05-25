export function mapControlStatus(status: string | null | undefined) {
  if (status === "pass") {
    return "✅ Zavedeno";
  }

  if (status === "not_applicable") {
    return "N/A";
  }

  if (status === "in_progress" || status === "manual_review" || status === "warning") {
    return "⚠️ Částečně";
  }

  return "❌ Chybí";
}

export function mapVendorRiskTier(riskTier: string | null | undefined) {
  if (riskTier === "critical") {
    return "Kritický";
  }

  if (riskTier === "high") {
    return "Vysoký";
  }

  if (riskTier === "medium") {
    return "Střední";
  }

  if (riskTier === "low") {
    return "Nízký";
  }

  return riskTier ?? "";
}

export function mapVendorStatus(status: string | null | undefined) {
  if (status === "active") {
    return "Aktivní";
  }

  if (status === "inactive") {
    return "Neaktivní";
  }

  if (status === "pending") {
    return "Čeká na hodnocení";
  }

  return status ?? "";
}
