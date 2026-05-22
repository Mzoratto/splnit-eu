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

export type GapAlertProps = {
  controlKey: string;
  controlTitle: string;
  orgName: string;
  reference: string;
};

export function gapAlertSubject(props: GapAlertProps) {
  return `Nová mezera v plnění ZoKB: ${props.controlTitle}`;
}

function controlUrl(controlKey: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL ?? "https://splnit.eu"}/controls/${controlKey}`;
}

export function plainText(props: GapAlertProps) {
  return [
    `Organizace: ${props.orgName}`,
    `Kontrola: ${props.controlTitle}`,
    `Reference: ${props.reference}`,
    "",
    `Otevřít kontrolu: ${controlUrl(props.controlKey)}`,
  ].join("\n");
}

export default function GapAlertEmail(props: GapAlertProps) {
  return (
    <Html>
      <Head />
      <Preview>{gapAlertSubject(props)}</Preview>
      <Body style={{ backgroundColor: "#f8fafc", fontFamily: "Arial, sans-serif" }}>
        <Container style={{ backgroundColor: "#ffffff", margin: "24px auto", padding: "24px", width: "560px" }}>
          <Heading as="h1" style={{ color: "#0f172a", fontSize: "22px" }}>
            Nová mezera v plnění ZoKB
          </Heading>
          <Text style={{ color: "#334155", fontSize: "14px", lineHeight: "22px" }}>
            U organizace {props.orgName} je kontrola {props.controlTitle} v mezeře.
          </Text>
          <Text style={{ color: "#334155", fontSize: "14px" }}>
            Reference: {props.reference}
          </Text>
          <Button href={controlUrl(props.controlKey)} style={{ backgroundColor: "#0f766e", borderRadius: "6px", color: "#ffffff", padding: "12px 16px" }}>
            Otevřít kontrolu
          </Button>
        </Container>
      </Body>
    </Html>
  );
}
