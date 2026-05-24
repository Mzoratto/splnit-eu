"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  AlertCircle,
  Download,
  FileText,
  Loader2,
  Plus,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import {
  CONTACT_ROLE_OPTIONS,
  ENTITY_SIZE_OPTIONS,
  GEOGRAPHIC_SCOPE_OPTIONS,
  REGIME_OPTIONS,
  SERVICE_CATEGORY_OPTIONS,
} from "@/lib/compliance/nukib/registration-labels";
import type { NukibRegistration } from "@/lib/compliance/nukib/registration-schema";

type ContactForm = NukibRegistration["contacts"][number];

type RegistrationFormState = Omit<
  NukibRegistration,
  | "affectedMemberStates"
  | "cyberSecurityManagerAppointed"
  | "legalBasis"
  | "preparedAt"
  | "preparedBy"
> & {
  affectedMemberStates: string;
  cyberSecurityManagerAppointed: "" | "false" | "true";
};

type RegistrationArtifact = {
  content: NukibRegistration;
  createdAt: string | null;
  id: string;
  title: string;
};

const emptyContact = (role: ContactForm["role"]): ContactForm => ({
  email: "",
  name: "",
  phone: "",
  position: "",
  role,
});

const initialFormState: RegistrationFormState = {
  affectedMemberStates: "",
  contacts: [emptyContact("primary"), emptyContact("technical")],
  crossBorderDependencies: "",
  cyberSecurityManagerAppointed: "",
  dataBoxId: "",
  entitySize: "medium",
  geographicScope: "cz_only",
  ico: "",
  organisationName: "",
  ownershipChain: "",
  regime: "nizsi",
  serviceCategory: "energetika",
  serviceDescription: "",
};

function fieldClass(extra = "") {
  return `h-10 rounded-md border border-border-default bg-[var(--bg-input)] px-3 text-sm text-foreground ${extra}`;
}

function textAreaClass(extra = "") {
  return `min-h-24 rounded-md border border-border-default bg-[var(--bg-input)] px-3 py-2 text-sm text-foreground ${extra}`;
}

function optionalString(value: string) {
  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : undefined;
}

function formFromRegistration(registration: NukibRegistration): RegistrationFormState {
  return {
    ...registration,
    affectedMemberStates: registration.affectedMemberStates?.join(", ") ?? "",
    contacts: registration.contacts.map((contact) => ({
      ...contact,
      position: contact.position ?? "",
    })),
    crossBorderDependencies: registration.crossBorderDependencies ?? "",
    cyberSecurityManagerAppointed:
      registration.cyberSecurityManagerAppointed === undefined
        ? ""
        : registration.cyberSecurityManagerAppointed
          ? "true"
          : "false",
    dataBoxId: registration.dataBoxId ?? "",
    ownershipChain: registration.ownershipChain ?? "",
  };
}

function payloadFromForm(form: RegistrationFormState) {
  const affectedMemberStates = form.affectedMemberStates
    .split(",")
    .map((state) => state.trim().toUpperCase())
    .filter(Boolean);

  return {
    contacts: form.contacts.map((contact) => ({
      email: contact.email.trim(),
      name: contact.name.trim(),
      phone: contact.phone.trim(),
      position: optionalString(contact.position ?? ""),
      role: contact.role,
    })),
    crossBorderDependencies: optionalString(form.crossBorderDependencies ?? ""),
    cyberSecurityManagerAppointed:
      form.cyberSecurityManagerAppointed === ""
        ? undefined
        : form.cyberSecurityManagerAppointed === "true",
    dataBoxId: optionalString(form.dataBoxId ?? ""),
    entitySize: form.entitySize,
    geographicScope: form.geographicScope,
    ico: form.ico.trim(),
    organisationName: form.organisationName.trim(),
    ownershipChain: optionalString(form.ownershipChain ?? ""),
    regime: form.regime,
    serviceCategory: form.serviceCategory,
    serviceDescription: form.serviceDescription.trim(),
    ...(form.geographicScope === "cross_border" && affectedMemberStates.length > 0
      ? { affectedMemberStates }
      : {}),
  };
}

function formatDate(value: string | null) {
  if (!value) {
    return "n/a";
  }

  return new Intl.DateTimeFormat("cs-CZ", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function filenameFromDisposition(disposition: string | null) {
  const match = disposition?.match(/filename="([^"]+)"/);

  return match?.[1] ?? "nukib-registrace.pdf";
}

export default function NukibRegistrationPage() {
  const [artifact, setArtifact] = useState<RegistrationArtifact | null>(null);
  const [form, setForm] = useState<RegistrationFormState>(initialFormState);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pdfHref = artifact
    ? `/api/compliance/nukib-registration/${artifact.id}/pdf`
    : null;
  const hasRequiredContacts = useMemo(
    () =>
      form.contacts.some((contact) => contact.role === "primary") &&
      form.contacts.some((contact) => contact.role === "technical"),
    [form.contacts],
  );

  const loadArtifact = useCallback(async () => {
    setError(null);

    try {
      const response = await fetch("/api/compliance/nukib-registration");

      if (response.status === 401 || response.status === 404) {
        setArtifact(null);
        return;
      }

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error ?? "Nepodařilo se načíst záznam.");
      }

      const nextArtifact = (await response.json()) as RegistrationArtifact;

      setArtifact(nextArtifact);
      setForm(formFromRegistration(nextArtifact.content));
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Nepodařilo se načíst záznam.",
      );
    }
  }, []);

  useEffect(() => {
    void loadArtifact().finally(() => setIsLoading(false));
  }, [loadArtifact]);

  function updateField<Key extends keyof RegistrationFormState>(
    key: Key,
    value: RegistrationFormState[Key],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateContact<Key extends keyof ContactForm>(
    index: number,
    field: Key,
    value: ContactForm[Key],
  ) {
    setForm((current) => ({
      ...current,
      contacts: current.contacts.map((contact, contactIndex) =>
        contactIndex === index ? { ...contact, [field]: value } : contact,
      ),
    }));
  }

  function addContact() {
    setForm((current) => ({
      ...current,
      contacts: [...current.contacts, emptyContact("security_manager")],
    }));
  }

  function removeContact(index: number) {
    setForm((current) => ({
      ...current,
      contacts:
        current.contacts.length <= 2
          ? current.contacts
          : current.contacts.filter((_, contactIndex) => contactIndex !== index),
    }));
  }

  async function submitRegistration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!hasRequiredContacts) {
      setError("Vyplňte alespoň jeden primární a jeden technický kontakt.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/compliance/nukib-registration", {
        body: JSON.stringify(payloadFromForm(form)),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error ?? "Registraci se nepodařilo připravit.");
      }

      await loadArtifact();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Registraci se nepodařilo připravit.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function downloadPdf() {
    if (!pdfHref) {
      return;
    }

    setIsDownloading(true);
    setError(null);

    try {
      const response = await fetch(pdfHref);

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error ?? "PDF se nepodařilo vytvořit.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = filenameFromDisposition(
        response.headers.get("Content-Disposition"),
      );
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (downloadError) {
      setError(
        downloadError instanceof Error
          ? downloadError.message
          : "PDF se nepodařilo vytvořit.",
      );
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">
          NÚKIB
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">
          Registrace regulované služby
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-foreground/64">
          Přípravný podklad pro údaje, které organizace přepisuje do formuláře
          na Portálu NÚKIB.
        </p>
      </div>

      <section className="rounded-lg border border-border bg-surface p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <ShieldCheck
              className="mt-0.5 h-5 w-5 text-primary"
              aria-hidden="true"
              strokeWidth={1.7}
            />
            <div>
              <h2 className="text-lg font-semibold">Stav přípravy</h2>
              <p className="mt-1 text-sm text-foreground/62">
                {isLoading
                  ? "Načítám poslední záznam..."
                  : artifact
                    ? `Poslední příprava: ${formatDate(artifact.createdAt)}`
                    : "Dosud nebyl vytvořen žádný záznam."}
              </p>
            </div>
          </div>
          {artifact ? (
            <button
              type="button"
              className="btn btn-secondary w-full sm:w-auto"
              disabled={isDownloading}
              onClick={downloadPdf}
            >
              {isDownloading ? (
                <Loader2
                  className="h-4 w-4 animate-spin"
                  aria-hidden="true"
                  strokeWidth={1.7}
                />
              ) : (
                <Download className="h-4 w-4" aria-hidden="true" strokeWidth={1.7} />
              )}
              Stáhnout PDF
            </button>
          ) : null}
        </div>
      </section>

      {error ? (
        <p className="flex items-start gap-2 rounded-md border border-[var(--status-fail-border)] bg-[var(--status-fail-subtle)] p-3 text-sm text-[var(--status-fail)]">
          <AlertCircle className="mt-0.5 h-4 w-4" aria-hidden="true" />
          <span>{error}</span>
        </p>
      ) : null}

      <form onSubmit={submitRegistration} className="space-y-6">
        <section className="rounded-lg border border-border bg-surface p-5">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Identifikace organizace</h2>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <label className="grid gap-2 text-sm">
              IČO
              <input
                className={fieldClass("font-mono")}
                inputMode="numeric"
                pattern="\\d{8}"
                required
                value={form.ico}
                onChange={(event) => updateField("ico", event.target.value)}
              />
            </label>
            <label className="grid gap-2 text-sm md:col-span-2">
              Název organizace
              <input
                className={fieldClass()}
                required
                value={form.organisationName}
                onChange={(event) =>
                  updateField("organisationName", event.target.value)
                }
              />
            </label>
            <label className="grid gap-2 text-sm">
              Datová schránka
              <input
                className={fieldClass("font-mono")}
                value={form.dataBoxId ?? ""}
                onChange={(event) => updateField("dataBoxId", event.target.value)}
              />
            </label>
          </div>
        </section>

        <section className="rounded-lg border border-border bg-surface p-5">
          <h2 className="text-lg font-semibold">Klasifikace služby</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm">
              Kategorie služby
              <select
                className={fieldClass()}
                value={form.serviceCategory}
                onChange={(event) =>
                  updateField(
                    "serviceCategory",
                    event.target.value as RegistrationFormState["serviceCategory"],
                  )
                }
              >
                {SERVICE_CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm">
              Režim povinností
              <select
                className={fieldClass()}
                value={form.regime}
                onChange={(event) =>
                  updateField(
                    "regime",
                    event.target.value as RegistrationFormState["regime"],
                  )
                }
              >
                {REGIME_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm">
              Velikost subjektu
              <select
                className={fieldClass()}
                value={form.entitySize}
                onChange={(event) =>
                  updateField(
                    "entitySize",
                    event.target.value as RegistrationFormState["entitySize"],
                  )
                }
              >
                {ENTITY_SIZE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm md:col-span-2">
              Popis služby
              <textarea
                className={textAreaClass()}
                required
                value={form.serviceDescription}
                onChange={(event) =>
                  updateField("serviceDescription", event.target.value)
                }
              />
            </label>
          </div>
        </section>

        <section className="rounded-lg border border-border bg-surface p-5">
          <h2 className="text-lg font-semibold">Geografický rozsah</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm">
              Rozsah
              <select
                className={fieldClass()}
                value={form.geographicScope}
                onChange={(event) =>
                  updateField(
                    "geographicScope",
                    event.target.value as RegistrationFormState["geographicScope"],
                  )
                }
              >
                {GEOGRAPHIC_SCOPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm">
              Dotčené členské státy
              <input
                className={fieldClass("font-mono")}
                placeholder="SK, DE"
                value={form.affectedMemberStates}
                onChange={(event) =>
                  updateField("affectedMemberStates", event.target.value)
                }
              />
            </label>
          </div>
        </section>

        <section className="rounded-lg border border-border bg-surface p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold">Kontaktní osoby</h2>
            <button
              type="button"
              className="btn btn-secondary w-full sm:w-auto"
              onClick={addContact}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Přidat kontakt
            </button>
          </div>

          <div className="mt-5 space-y-4">
            {form.contacts.map((contact, index) => (
              <div
                key={index}
                className="rounded-md border border-border bg-background p-4"
              >
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[170px_1fr_1fr_150px_1fr_auto]">
                  <label className="grid gap-2 text-sm">
                    Role
                    <select
                      className={fieldClass()}
                      value={contact.role}
                      onChange={(event) =>
                        updateContact(
                          index,
                          "role",
                          event.target.value as ContactForm["role"],
                        )
                      }
                    >
                      {CONTACT_ROLE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-2 text-sm">
                    Jméno
                    <input
                      className={fieldClass()}
                      required
                      value={contact.name}
                      onChange={(event) =>
                        updateContact(index, "name", event.target.value)
                      }
                    />
                  </label>
                  <label className="grid gap-2 text-sm">
                    E-mail
                    <input
                      className={fieldClass()}
                      required
                      type="email"
                      value={contact.email}
                      onChange={(event) =>
                        updateContact(index, "email", event.target.value)
                      }
                    />
                  </label>
                  <label className="grid gap-2 text-sm">
                    Telefon
                    <input
                      className={fieldClass()}
                      required
                      value={contact.phone}
                      onChange={(event) =>
                        updateContact(index, "phone", event.target.value)
                      }
                    />
                  </label>
                  <label className="grid gap-2 text-sm">
                    Pozice
                    <input
                      className={fieldClass()}
                      value={contact.position ?? ""}
                      onChange={(event) =>
                        updateContact(index, "position", event.target.value)
                      }
                    />
                  </label>
                  <div className="flex items-end">
                    <button
                      type="button"
                      className="btn btn-ghost h-10 w-full text-[var(--status-fail)] xl:w-10 xl:px-0"
                      disabled={form.contacts.length <= 2}
                      title="Odebrat kontakt"
                      onClick={() => removeContact(index)}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      <span className="xl:sr-only">Odebrat</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!hasRequiredContacts ? (
            <p className="mt-3 text-sm text-[var(--status-fail)]">
              Vyžaduje se alespoň jeden primární a jeden technický kontakt.
            </p>
          ) : null}
        </section>

        <section className="rounded-lg border border-border bg-surface p-5">
          <h2 className="text-lg font-semibold">
            Doplňující údaje (30denní lhůta)
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm">
              Vlastnická struktura
              <textarea
                className={textAreaClass()}
                value={form.ownershipChain ?? ""}
                onChange={(event) =>
                  updateField("ownershipChain", event.target.value)
                }
              />
            </label>
            <label className="grid gap-2 text-sm">
              Přeshraniční závislosti
              <textarea
                className={textAreaClass()}
                value={form.crossBorderDependencies ?? ""}
                onChange={(event) =>
                  updateField("crossBorderDependencies", event.target.value)
                }
              />
            </label>
            <label className="grid gap-2 text-sm">
              Manažer kybernetické bezpečnosti
              <select
                className={fieldClass()}
                value={form.cyberSecurityManagerAppointed}
                onChange={(event) =>
                  updateField(
                    "cyberSecurityManagerAppointed",
                    event.target
                      .value as RegistrationFormState["cyberSecurityManagerAppointed"],
                  )
                }
              >
                <option value="">Neuvedeno</option>
                <option value="true">Ano</option>
                <option value="false">Ne</option>
              </select>
            </label>
          </div>
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            className="btn btn-primary w-full sm:w-auto"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2
                className="h-4 w-4 animate-spin"
                aria-hidden="true"
                strokeWidth={1.7}
              />
            ) : (
              <ShieldCheck className="h-4 w-4" aria-hidden="true" strokeWidth={1.7} />
            )}
            Připravit registraci
          </button>
        </div>
      </form>

      <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
        Tento podklad slouží jako příprava pro vyplnění formuláře na Portálu
        NÚKIB. Podání probíhá přímo na portálu NÚKIB s autentizací přes BankID /
        NIA. Splnit.eu nepodává formulář za vás.
      </section>
    </section>
  );
}
