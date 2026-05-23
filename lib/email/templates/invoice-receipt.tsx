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

export type InvoiceReceiptProps = {
  amountPaid: string;
  invoiceNumber: string;
  invoiceUrl: string;
  orgName: string;
  paidAt: string;
};

export function invoiceReceiptSubject(props: InvoiceReceiptProps) {
  return `Faktura Splnit.eu ${props.invoiceNumber} je zaplacená`;
}

export function plainText(props: InvoiceReceiptProps) {
  return [
    `Organizace: ${props.orgName}`,
    `Faktura: ${props.invoiceNumber}`,
    `Částka: ${props.amountPaid}`,
    `Datum platby: ${props.paidAt}`,
    "",
    `PDF faktura: ${props.invoiceUrl}`,
  ].join("\n");
}

export default function InvoiceReceiptEmail(props: InvoiceReceiptProps) {
  return (
    <Html>
      <Head />
      <Preview>{invoiceReceiptSubject(props)}</Preview>
      <Body style={{ backgroundColor: "#f8fafc", fontFamily: "Arial, sans-serif" }}>
        <Container style={{ backgroundColor: "#ffffff", margin: "24px auto", padding: "24px", width: "560px" }}>
          <Heading as="h1" style={{ color: "#0f172a", fontSize: "22px" }}>
            Faktura je zaplacená
          </Heading>
          <Text style={{ color: "#334155", fontSize: "14px", lineHeight: "22px" }}>
            Platba za organizaci {props.orgName} byla přijata.
          </Text>
          <Text style={{ color: "#334155", fontSize: "14px" }}>
            Faktura: {props.invoiceNumber}
          </Text>
          <Text style={{ color: "#334155", fontSize: "14px" }}>
            Částka: {props.amountPaid}
          </Text>
          <Text style={{ color: "#334155", fontSize: "14px" }}>
            Datum platby: {props.paidAt}
          </Text>
          <Button href={props.invoiceUrl} style={{ backgroundColor: "#0f766e", borderRadius: "6px", color: "#ffffff", padding: "12px 16px" }}>
            Stáhnout PDF fakturu
          </Button>
        </Container>
      </Body>
    </Html>
  );
}
