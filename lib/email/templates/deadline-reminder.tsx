import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { getAppUrl } from "@/lib/env";

export type DeadlineReminderProps = {
  controlsAtRisk: Array<{ reference: string; title: string }>;
  daysUntil: number;
  orgName: string;
};

export function deadlineReminderSubject(props: DeadlineReminderProps) {
  return `Blíží se termín plnění ZoKB — ${props.daysUntil} dní`;
}

function controlsUrl() {
  return `${getAppUrl()}/controls`;
}

export function plainText(props: DeadlineReminderProps) {
  return [
    `Organizace: ${props.orgName}`,
    `Do termínu plnění ZoKB zbývá ${props.daysUntil} dní.`,
    "",
    "Kontroly k dořešení:",
    ...props.controlsAtRisk.map(
      (control) => `- ${control.reference}: ${control.title}`,
    ),
    "",
    `Otevřít kontroly: ${controlsUrl()}`,
  ].join("\n");
}

export default function DeadlineReminderEmail(props: DeadlineReminderProps) {
  return (
    <Html>
      <Head />
      <Preview>{deadlineReminderSubject(props)}</Preview>
      <Body style={{ backgroundColor: "#f8fafc", fontFamily: "Arial, sans-serif" }}>
        <Container style={{ backgroundColor: "#ffffff", margin: "24px auto", padding: "24px", width: "560px" }}>
          <Heading as="h1" style={{ color: "#0f172a", fontSize: "22px" }}>
            Blíží se termín plnění ZoKB
          </Heading>
          <Text style={{ color: "#334155", fontSize: "14px", lineHeight: "22px" }}>
            Organizace {props.orgName} má {props.daysUntil} dní do termínu plnění.
          </Text>
          <Section>
            {props.controlsAtRisk.map((control) => (
              <Text key={`${control.reference}-${control.title}`} style={{ color: "#334155", fontSize: "14px" }}>
                {control.reference}: {control.title}
              </Text>
            ))}
          </Section>
          <Button href={controlsUrl()} style={{ backgroundColor: "#0f766e", borderRadius: "6px", color: "#ffffff", padding: "12px 16px" }}>
            Otevřít kontroly
          </Button>
        </Container>
      </Body>
    </Html>
  );
}
