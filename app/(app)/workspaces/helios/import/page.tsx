import Link from "next/link";
import { ArrowLeft, FileUp } from "lucide-react";
import { importHeliosCsvAction } from "@/app/(app)/workspaces/helios/import/actions";

const templates = [
  {
    columns: "username, display_name, active, last_login_at, role, employee_type, shared_account_flag",
    kind: "users",
    title: "Uživatelé Heliosu",
  },
  {
    columns: "role, module, permission, business_owner",
    kind: "roles",
    title: "Role a moduly",
  },
  {
    columns: "job_name, backup_type, last_success_at, encrypted, offsite_or_immutable, restore_tested_at",
    kind: "backups",
    title: "Zálohy",
  },
  {
    columns: "name, type (MES|SCADA|EDI|OTHER), protocol, auth_type, tls_enabled, network_restricted, credentials_rotated_at",
    kind: "integrations",
    title: "Integrace",
  },
] as const;

export default function HeliosCsvImportPage() {
  const formAction = importHeliosCsvAction as unknown as (formData: FormData) => Promise<void>;

  return (
    <section className="space-y-6">
      <Link
        href="/workspaces/helios"
        className="inline-flex items-center gap-1.5 text-sm text-foreground/58 hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Zpět na Helios workspace
      </Link>

      <div className="rounded-lg border border-border bg-white p-5 shadow-xs">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-teal-600 text-white">
            <FileUp className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-primary">
              CSV-assisted evidence import
            </p>
            <h1 className="text-2xl font-semibold">Import důkazů Helios ze šablony Splnit</h1>
            <p className="max-w-3xl text-sm leading-6 text-foreground/68">
              Stáhněte šablonu Splnit, namapujte export z Heliosu do této šablony a nahrajte vyplněné CSV.
              Import nepředstavuje automatické napojení na Helios API. Hodnoty jsou evidovány jako customer-reported
              a výsledek může být pouze manual review nebo gap, nikdy automatický pass.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
        <div className="rounded-lg border border-border bg-white p-5 shadow-xs">
          <h2 className="text-lg font-semibold">Podporované Splnit CSV šablony</h2>
          <div className="mt-4 space-y-3">
            {templates.map((template) => (
              <div key={template.kind} className="rounded-md border border-border bg-surface p-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-medium">{template.title}</h3>
                  <code className="rounded bg-white px-2 py-1 text-xs">{template.kind}.csv</code>
                </div>
                <p className="mt-2 break-words text-xs leading-5 text-foreground/64">{template.columns}</p>
              </div>
            ))}
          </div>
        </div>

        <form action={formAction} className="rounded-lg border border-border bg-white p-5 shadow-xs">
          <h2 className="text-lg font-semibold">Nahrát CSV</h2>
          <p className="mt-2 text-sm leading-6 text-foreground/64">
            Nahrajte pouze CSV podle šablony Splnit. Nevkládejte hesla, tokeny ani API klíče; sloupce s názvem
            password/secret/token/api_key se redigují.
          </p>

          <label className="mt-4 block text-sm font-medium" htmlFor="kind">
            Typ šablony
          </label>
          <select id="kind" name="kind" className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm" required>
            {templates.map((template) => (
              <option key={template.kind} value={template.kind}>
                {template.title}
              </option>
            ))}
          </select>

          <label className="mt-4 block text-sm font-medium" htmlFor="file">
            CSV soubor
          </label>
          <input
            id="file"
            name="file"
            type="file"
            accept=".csv,text/csv"
            className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
            required
          />

          <button
            type="submit"
            className="mt-5 inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            Importovat customer-reported CSV
          </button>
        </form>
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        <Link href="/workspaces/helios" className="text-primary hover:underline">
          Zpět na Helios
        </Link>
        <Link href="/evidence" className="text-primary hover:underline">
          Otevřít evidence vault
        </Link>
      </div>
    </section>
  );
}
