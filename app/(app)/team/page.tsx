import Link from "next/link";
import { getLocale } from "next-intl/server";
import {
  ArrowRight,
  GraduationCap,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { getMessagesForLocale } from "@/i18n/messages";
import { normalizeLocale } from "@/i18n/routing";

const moduleIcons = {
  accessReviews: ShieldCheck,
  roleAssignments: UsersRound,
  trainingLog: GraduationCap,
} as const;

export default async function TeamPage() {
  const locale = normalizeLocale(await getLocale()) ?? "cs-CZ";
  const copy = getMessagesForLocale(locale).teamPage;
  const modules = [
    {
      ...copy.modules.accessReviews,
      href: "/team/access-reviews",
      icon: moduleIcons.accessReviews,
      status: "available",
    },
    {
      ...copy.modules.roleAssignments,
      href: null,
      icon: moduleIcons.roleAssignments,
      status: "coming_soon",
    },
    {
      ...copy.modules.trainingLog,
      href: null,
      icon: moduleIcons.trainingLog,
      status: "coming_soon",
    },
  ];

  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">
          {copy.eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">
          {copy.title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground/64">
          {copy.subtitle}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {modules.map((module) => {
          const Icon = module.icon;
          const content = (
            <>
              <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
              <h2 className="mt-4 text-lg font-semibold">{module.title}</h2>
              <p className="mt-2 text-sm leading-6 text-foreground/64">
                {module.description}
              </p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium">
                {module.status === "available" ? copy.open : copy.comingSoon}
                {module.status === "available" ? (
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                ) : null}
              </span>
            </>
          );

          return module.status === "available" ? (
            <Link
              key={module.title}
              href={module.href ?? "/team"}
              className="rounded-lg border border-border bg-surface p-5 hover:bg-surface-muted"
            >
              {content}
            </Link>
          ) : (
            <article
              key={module.title}
              data-disabled="true"
              className="rounded-lg border border-border bg-surface p-5 opacity-72"
            >
              {content}
            </article>
          );
        })}
      </div>
    </section>
  );
}
