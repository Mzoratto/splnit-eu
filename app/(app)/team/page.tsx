import Link from "next/link";
import { ArrowRight, GraduationCap, ShieldCheck, UsersRound } from "lucide-react";

const modules = [
  {
    description: "Quarterly keep/revoke/modify workflow for Microsoft 365 and GitHub users.",
    href: "/team/access-reviews",
    icon: ShieldCheck,
    title: "Access reviews",
  },
  {
    description: "Role ownership, admins and contractor access inventory.",
    href: "/team",
    icon: UsersRound,
    title: "Role assignments",
  },
  {
    description: "Security and AI literacy attendance evidence for auditors.",
    href: "/team",
    icon: GraduationCap,
    title: "Training log",
  },
];

export default function TeamPage() {
  return (
    <section className="space-y-8">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">
          Tým
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal">
          Přístupy a školení
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground/64">
          Evidence přístupových revizí, rolí a školení na jednom místě.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {modules.map((module) => (
          <Link
            key={module.title}
            href={module.href}
            className="rounded-lg border border-border bg-surface p-5 hover:bg-surface-muted"
          >
            <module.icon className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="mt-4 text-lg font-semibold">{module.title}</h2>
            <p className="mt-2 text-sm leading-6 text-foreground/64">
              {module.description}
            </p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium">
              Otevřít
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
