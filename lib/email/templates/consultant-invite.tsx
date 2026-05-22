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

export type ConsultantInviteProps = {
  acceptUrl: string;
  agencyName: string;
  inviterName: string;
};

export function consultantInviteSubject(props: ConsultantInviteProps) {
  return `${props.agencyName} vás zve ke konzultantskému portálu Splnit.eu`;
}

export function plainText(props: ConsultantInviteProps) {
  return [
    `${props.agencyName} vás zve ke konzultantskému portálu Splnit.eu.`,
    `Pozvánku poslal(a): ${props.inviterName}`,
    "",
    `Přijmout pozvánku: ${props.acceptUrl}`,
  ].join("\n");
}

export default function ConsultantInviteEmail(props: ConsultantInviteProps) {
  return (
    <Html>
      <Head />
      <Preview>{consultantInviteSubject(props)}</Preview>
      <Body style={{ backgroundColor: "#f8fafc", fontFamily: "Arial, sans-serif" }}>
        <Container style={{ backgroundColor: "#ffffff", margin: "24px auto", padding: "24px", width: "560px" }}>
          <Heading as="h1" style={{ color: "#0f172a", fontSize: "22px" }}>
            Pozvánka do konzultantského portálu
          </Heading>
          <Text style={{ color: "#334155", fontSize: "14px", lineHeight: "22px" }}>
            {props.agencyName} vás zve ke konzultantskému portálu Splnit.eu.
          </Text>
          <Text style={{ color: "#334155", fontSize: "14px" }}>
            Pozvánku poslal(a): {props.inviterName}
          </Text>
          <Button href={props.acceptUrl} style={{ backgroundColor: "#0f766e", borderRadius: "6px", color: "#ffffff", padding: "12px 16px" }}>
            Přijmout pozvánku
          </Button>
        </Container>
      </Body>
    </Html>
  );
}
