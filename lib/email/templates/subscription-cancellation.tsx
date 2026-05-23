import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "@react-email/components";

export type SubscriptionCancellationProps = {
  canceledAt: string;
  orgName: string;
  plan: "sme" | "agency";
};

export function subscriptionCancellationSubject() {
  return "Předplatné Splnit.eu bylo zrušeno";
}

function billingUrl() {
  return `${process.env.NEXT_PUBLIC_APP_URL ?? "https://splnit.eu"}/settings/billing`;
}

function planLabel(plan: "sme" | "agency") {
  return plan === "agency" ? "Agency" : "SME";
}

export function plainText(props: SubscriptionCancellationProps) {
  return [
    `Organizace: ${props.orgName}`,
    `Plán: ${planLabel(props.plan)}`,
    `Datum zrušení: ${props.canceledAt}`,
    "",
    `Fakturace: ${billingUrl()}`,
  ].join("\n");
}

export default function SubscriptionCancellationEmail(
  props: SubscriptionCancellationProps,
) {
  return (
    <Html>
      <Head />
      <Preview>{subscriptionCancellationSubject()}</Preview>
      <Body style={{ backgroundColor: "#f8fafc", fontFamily: "Arial, sans-serif" }}>
        <Container style={{ backgroundColor: "#ffffff", margin: "24px auto", padding: "24px", width: "560px" }}>
          <Heading as="h1" style={{ color: "#0f172a", fontSize: "22px" }}>
            Předplatné bylo zrušeno
          </Heading>
          <Text style={{ color: "#334155", fontSize: "14px", lineHeight: "22px" }}>
            Organizace {props.orgName} už nemá aktivní plán {planLabel(props.plan)}.
          </Text>
          <Text style={{ color: "#334155", fontSize: "14px" }}>
            Datum zrušení: {props.canceledAt}
          </Text>
          <Button href={billingUrl()} style={{ backgroundColor: "#0f766e", borderRadius: "6px", color: "#ffffff", padding: "12px 16px" }}>
            Otevřít fakturaci
          </Button>
        </Container>
      </Body>
    </Html>
  );
}
