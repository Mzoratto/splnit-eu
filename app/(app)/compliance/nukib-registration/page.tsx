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
import { useLocale, useTranslations } from "next-intl";
import {
  CONTACT_ROLE_OPTIONS,
  ENTITY_SIZE_OPTIONS,
  GEOGRAPHIC_SCOPE_OPTIONS,
  REGIME_OPTIONS,
  SERVICE_CATEGORY_OPTIONS,
} from "@/lib/compliance/nukib/registration-labels";
import {
  NUKIB_REGISTRATION_LEGAL_BASIS,
  NukibRegistrationSchema,
  type NukibRegistration,
} from "@/lib/compliance/nukib/registration-schema";

type ContactForm = NukibRegistration["contacts"][number];
type NetworkScopeForm = {
  domainNames: string[];
  ipRanges: string[];
};

type RegistrationFormState = Omit<
  NukibRegistration,
  | "affectedMemberStates"
  | "cyberSecurityManagerAppointed"
  | "legalBasis"
  | "preparedAt"
  | "preparedBy"
  | "serviceNetworkScope"
> & {
  affectedMemberStates: string;
  cyberSecurityManagerAppointed: "" | "false" | "true";
  serviceNetworkScope: NetworkScopeForm;
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

const emptyNetworkScope = (): NetworkScopeForm => ({
  domainNames: [""],
  ipRanges: [""],
});

const initialFormState: RegistrationFormState = {
  affectedMemberStates: "",
  contacts: [
    emptyContact("primary"),
    emptyContact("technical"),
    emptyContact("statutory"),
  ],
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
  serviceNetworkScope: emptyNetworkScope(),
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

function compactFormArray(values: string[]) {
  const indexes: number[] = [];
  const compactValues: string[] = [];

  values.forEach((value, index) => {
    const trimmed = value.trim();

    if (trimmed.length > 0) {
      indexes.push(index);
      compactValues.push(trimmed);
    }
  });

  return {
    indexes,
    values: compactValues,
  };
}

function formFromRegistration(registration: NukibRegistration): RegistrationFormState {
  const ipRanges = registration.serviceNetworkScope?.ipRanges ?? [];
  const domainNames = registration.serviceNetworkScope?.domainNames ?? [];

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
    serviceNetworkScope: {
      domainNames: domainNames.length > 0 ? domainNames : [""],
      ipRanges: ipRanges.length > 0 ? ipRanges : [""],
    },
  };
}

function payloadFromForm(form: RegistrationFormState) {
  const affectedMemberStates = form.affectedMemberStates
    .split(",")
    .map((state) => state.trim().toUpperCase())
    .filter(Boolean);
  const ipRanges = compactFormArray(form.serviceNetworkScope.ipRanges).values;
  const domainNames = compactFormArray(form.serviceNetworkScope.domainNames).values;

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
    ...(ipRanges.length > 0 || domainNames.length > 0
      ? {
          serviceNetworkScope: {
            domainNames,
            ipRanges,
          },
        }
      : {}),
    ...(form.geographicScope === "cross_border" && affectedMemberStates.length > 0
      ? { affectedMemberStates }
      : {}),
  };
}

function validationPayloadFromForm(form: RegistrationFormState) {
  return {
    ...payloadFromForm(form),
    legalBasis: NUKIB_REGISTRATION_LEGAL_BASIS,
    preparedAt: new Date().toISOString(),
    preparedBy: "client_validation",
  };
}

function formErrorsFromIssues(
  issues: { message: string; path: PropertyKey[] }[],
  networkScopeIndexMap: Record<keyof NetworkScopeForm, number[]>,
) {
  const errors: Record<string, string> = {};

  for (const issue of issues) {
    const [first, second, third] = issue.path;

    if (
      first === "serviceNetworkScope" &&
      (second === "ipRanges" || second === "domainNames") &&
      typeof third === "number"
    ) {
      const originalIndex = networkScopeIndexMap[second][third] ?? third;

      errors[`serviceNetworkScope.${second}.${originalIndex}`] = issue.message;
      continue;
    }

    if (first === "contacts") {
      errors.contacts = issue.message;
      continue;
    }

    errors[issue.path.join(".")] = issue.message;
  }

  return errors;
}

function formatDate(
  value: string | null,
  formatter: Intl.DateTimeFormat,
  emptyValue: string,
) {
  if (!value) {
    return emptyValue;
  }

  return formatter.format(new Date(value));
}

function filenameFromDisposition(disposition: string | null) {
  const match = disposition?.match(/filename="([^"]+)"/);

  return match?.[1] ?? "nukib-registrace.pdf";
}

export default function NukibRegistrationPage() {
  const locale = useLocale();
  const t = useTranslations("nukibRegistration");
  const [artifact, setArtifact] = useState<RegistrationArtifact | null>(null);
  const [form, setForm] = useState<RegistrationFormState>(initialFormState);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const pdfHref = artifact
    ? `/api/compliance/nukib-registration/${artifact.id}/pdf`
    : null;
  const hasRequiredContacts = useMemo(
    () =>
      form.contacts.some((contact) => contact.role === "primary") &&
      form.contacts.some((contact) => contact.role === "technical") &&
      form.contacts.some((contact) => contact.role === "statutory"),
    [form.contacts],
  );
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    [locale],
  );
  const serviceCategoryOptions = useMemo(
    () =>
      SERVICE_CATEGORY_OPTIONS.map((option) => ({
        ...option,
        label: t(`serviceCategories.${option.value}`),
      })),
    [t],
  );
  const regimeOptions = useMemo(
    () =>
      REGIME_OPTIONS.map((option) => ({
        ...option,
        label: t(`regimes.${option.value}`),
      })),
    [t],
  );
  const entitySizeOptions = useMemo(
    () =>
      ENTITY_SIZE_OPTIONS.map((option) => ({
        ...option,
        label: t(`entitySizes.${option.value}`),
      })),
    [t],
  );
  const geographicScopeOptions = useMemo(
    () =>
      GEOGRAPHIC_SCOPE_OPTIONS.map((option) => ({
        ...option,
        label: t(`geographicScopes.${option.value}`),
      })),
    [t],
  );
  const contactRoleOptions = useMemo(
    () =>
      CONTACT_ROLE_OPTIONS.map((option) => ({
        ...option,
        label: t(`contactRoles.${option.value}`),
      })),
    [t],
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
        throw new Error(body?.error ?? t("errors.load"));
      }

      const nextArtifact = (await response.json()) as RegistrationArtifact;

      setArtifact(nextArtifact);
      setFormErrors({});
      setForm(formFromRegistration(nextArtifact.content));
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : t("errors.load"),
      );
    }
  }, [t]);

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

  function updateNetworkScopeField(
    field: keyof NetworkScopeForm,
    index: number,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      serviceNetworkScope: {
        ...current.serviceNetworkScope,
        [field]: current.serviceNetworkScope[field].map((item, itemIndex) =>
          itemIndex === index ? value : item,
        ),
      },
    }));
  }

  function addNetworkScopeRow(field: keyof NetworkScopeForm) {
    setForm((current) => ({
      ...current,
      serviceNetworkScope: {
        ...current.serviceNetworkScope,
        [field]: [...current.serviceNetworkScope[field], ""],
      },
    }));
  }

  function removeNetworkScopeRow(field: keyof NetworkScopeForm, index: number) {
    setForm((current) => ({
      ...current,
      serviceNetworkScope: {
        ...current.serviceNetworkScope,
        [field]:
          current.serviceNetworkScope[field].length <= 1
            ? current.serviceNetworkScope[field]
            : current.serviceNetworkScope[field].filter(
                (_, itemIndex) => itemIndex !== index,
              ),
      },
    }));
  }

  async function submitRegistration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validation = NukibRegistrationSchema.safeParse(
      validationPayloadFromForm(form),
    );

    if (!validation.success) {
      setFormErrors(
        formErrorsFromIssues(validation.error.issues, {
          domainNames: compactFormArray(form.serviceNetworkScope.domainNames)
            .indexes,
          ipRanges: compactFormArray(form.serviceNetworkScope.ipRanges).indexes,
        }),
      );
      setError(null);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setFormErrors({});

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
        throw new Error(body?.error ?? t("errors.submit"));
      }

      await loadArtifact();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : t("errors.submit"),
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
        throw new Error(body?.error ?? t("errors.pdf"));
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
          : t("errors.pdf"),
      );
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">
          {t("hero.eyebrow")}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">
          {t("hero.title")}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-foreground/64">
          {t("hero.subtitle")}
        </p>
      </div>

      <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
        <p className="font-semibold">{t("betaBanner.title")}</p>
        <p className="mt-1">{t("betaBanner.body")}</p>
      </section>

      <section className="rounded-lg border border-border bg-surface p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <ShieldCheck
              className="mt-0.5 h-5 w-5 text-primary"
              aria-hidden="true"
              strokeWidth={1.7}
            />
            <div>
              <h2 className="text-lg font-semibold">{t("status.title")}</h2>
              <p className="mt-1 text-sm text-foreground/62">
                {isLoading
                  ? t("status.loading")
                  : artifact
                    ? t("status.lastPreparation", {
                        date: formatDate(
                          artifact.createdAt,
                          dateFormatter,
                          t("common.noDate"),
                        ),
                      })
                    : t("status.empty")}
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
              {t("actions.downloadPdf")}
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
            <h2 className="text-lg font-semibold">{t("sections.organisation")}</h2>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <label className="grid gap-2 text-sm">
              {t("fields.ico")}
              <input
                className={fieldClass("font-mono")}
                inputMode="numeric"
                pattern="[0-9]{8}"
                required
                value={form.ico}
                onChange={(event) => updateField("ico", event.target.value)}
              />
            </label>
            <label className="grid gap-2 text-sm md:col-span-2">
              {t("fields.organisationName")}
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
              {t("fields.dataBoxId")}
              <input
                className={fieldClass("font-mono")}
                value={form.dataBoxId ?? ""}
                onChange={(event) => updateField("dataBoxId", event.target.value)}
              />
            </label>
          </div>
        </section>

        <section className="rounded-lg border border-border bg-surface p-5">
          <h2 className="text-lg font-semibold">{t("sections.serviceClassification")}</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm">
              {t("fields.serviceCategory")}
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
                {serviceCategoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm">
              {t("fields.regime")}
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
                {regimeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm">
              {t("fields.entitySize")}
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
                {entitySizeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm md:col-span-2">
              {t("fields.serviceDescription")}
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
          <h2 className="text-lg font-semibold">{t("sections.geographicScope")}</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm">
              {t("fields.scope")}
              <select
                aria-label={t("fields.scope")}
                className={fieldClass()}
                value={form.geographicScope}
                onChange={(event) =>
                  updateField(
                    "geographicScope",
                    event.target.value as RegistrationFormState["geographicScope"],
                  )
                }
              >
                {geographicScopeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm">
              {t("fields.affectedMemberStates")}
              <input
                className={fieldClass("font-mono")}
                placeholder={t("placeholders.affectedMemberStates")}
                value={form.affectedMemberStates}
                onChange={(event) =>
                  updateField("affectedMemberStates", event.target.value)
                }
              />
            </label>
          </div>
        </section>

        <section className="rounded-lg border border-border bg-surface p-5">
          <h2 className="text-lg font-semibold">
            {t("networkScope.sectionLabel")}
          </h2>
          <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-950">
            {t("networkScope.sectionHint")}
          </p>

          <div className="mt-5 grid gap-6 lg:grid-cols-2">
            <div className="space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold">
                    {t("networkScope.ipRanges.label")}
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-foreground/58">
                    {t("networkScope.ipRanges.hint")}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary w-full sm:w-auto"
                  onClick={() => addNetworkScopeRow("ipRanges")}
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  {t("actions.addIp")}
                </button>
              </div>

              {form.serviceNetworkScope.ipRanges.map((value, index) => {
                const errorKey = `serviceNetworkScope.ipRanges.${index}`;

                return (
                  <div key={index} className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        className={fieldClass("w-full font-mono")}
                        placeholder={t("networkScope.ipRanges.placeholder")}
                        value={value}
                        onChange={(event) =>
                          updateNetworkScopeField(
                            "ipRanges",
                            index,
                            event.target.value,
                          )
                        }
                      />
                      <button
                        type="button"
                        className="btn btn-ghost h-10 w-10 shrink-0 px-0 text-[var(--status-fail)]"
                        disabled={form.serviceNetworkScope.ipRanges.length <= 1}
                        title={t("actions.removeIp")}
                        onClick={() => removeNetworkScopeRow("ipRanges", index)}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                    {formErrors[errorKey] ? (
                      <p className="text-xs leading-5 text-[var(--status-fail)]">
                        {formErrors[errorKey]}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>

            <div className="space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold">
                    {t("networkScope.domainNames.label")}
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-foreground/58">
                    {t("networkScope.domainNames.hint")}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary w-full sm:w-auto"
                  onClick={() => addNetworkScopeRow("domainNames")}
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  {t("actions.addDomain")}
                </button>
              </div>

              {form.serviceNetworkScope.domainNames.map((value, index) => {
                const errorKey = `serviceNetworkScope.domainNames.${index}`;

                return (
                  <div key={index} className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        className={fieldClass("w-full font-mono")}
                        placeholder={t("networkScope.domainNames.placeholder")}
                        value={value}
                        onChange={(event) =>
                          updateNetworkScopeField(
                            "domainNames",
                            index,
                            event.target.value,
                          )
                        }
                      />
                      <button
                        type="button"
                        className="btn btn-ghost h-10 w-10 shrink-0 px-0 text-[var(--status-fail)]"
                        disabled={form.serviceNetworkScope.domainNames.length <= 1}
                        title={t("actions.removeDomain")}
                        onClick={() => removeNetworkScopeRow("domainNames", index)}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                    {formErrors[errorKey] ? (
                      <p className="text-xs leading-5 text-[var(--status-fail)]">
                        {formErrors[errorKey]}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-border bg-surface p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">{t("sections.contacts")}</h2>
              <p className="mt-2 text-sm leading-6 text-foreground/62">
                {t("contacts.help")}
              </p>
            </div>
            <button
              type="button"
              className="btn btn-secondary w-full sm:w-auto"
              onClick={addContact}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              {t("actions.addContact")}
            </button>
          </div>

          {formErrors.contacts ? (
            <p className="mt-4 rounded-md border border-[var(--status-fail-border)] bg-[var(--status-fail-subtle)] p-3 text-sm text-[var(--status-fail)]">
              {formErrors.contacts}
            </p>
          ) : null}

          <div className="mt-5 space-y-4">
            {form.contacts.map((contact, index) => (
              <div
                key={index}
                className="rounded-md border border-border bg-background p-4"
              >
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[170px_1fr_1fr_150px_1fr_auto]">
                  <label className="grid gap-2 text-sm">
                    {t("fields.role")}
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
                      {contactRoleOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-2 text-sm">
                    {t("fields.name")}
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
                    {t("fields.email")}
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
                    {t("fields.phone")}
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
                    {t("fields.position")}
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
                      title={t("actions.removeContact")}
                      onClick={() => removeContact(index)}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                      <span className="xl:sr-only">{t("actions.remove")}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!hasRequiredContacts ? (
            <p className="mt-3 text-sm text-[var(--status-fail)]">
              {t("contacts.missingRoles")}
            </p>
          ) : null}
        </section>

        <section className="rounded-lg border border-border bg-surface p-5">
          <h2 className="text-lg font-semibold">
            {t("sections.additionalData")}
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm">
              {t("fields.ownershipChain")}
              <textarea
                className={textAreaClass()}
                value={form.ownershipChain ?? ""}
                onChange={(event) =>
                  updateField("ownershipChain", event.target.value)
                }
              />
            </label>
            <label className="grid gap-2 text-sm">
              {t("fields.crossBorderDependencies")}
              <textarea
                className={textAreaClass()}
                value={form.crossBorderDependencies ?? ""}
                onChange={(event) =>
                  updateField("crossBorderDependencies", event.target.value)
                }
              />
            </label>
            <label className="grid gap-2 text-sm">
              {t("fields.cyberSecurityManagerAppointed")}
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
                <option value="">{t("boolean.unspecified")}</option>
                <option value="true">{t("boolean.yes")}</option>
                <option value="false">{t("boolean.no")}</option>
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
            {t("actions.prepareRegistration")}
          </button>
        </div>
      </form>

      <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
        {t("submissionNotice")}
      </section>
    </section>
  );
}
