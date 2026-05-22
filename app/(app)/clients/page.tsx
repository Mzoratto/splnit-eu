import { redirect } from "next/navigation";

export default function ClientsCompatibilityRedirect() {
  redirect("/agency/dashboard");
}
