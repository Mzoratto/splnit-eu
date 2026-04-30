"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon } from "@iconify/react";

const links = [
  { href: "/platform", label: "Platforma" },
  { href: "/predpisy", label: "EU Předpisy" },
  { href: "/zakaznici", label: "Zákazníci" },
  { href: "/cenik", label: "Ceník" },
];

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="nav-blur fixed left-0 right-0 top-0 z-50 h-16 border-b border-zinc-200/60 transition-all duration-300">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-5">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2"
          onClick={() => setOpen(false)}
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 shadow-sm shadow-blue-200">
            <Icon
              icon="solar:shield-keyhole-linear"
              className="text-sm text-white"
              aria-hidden="true"
            />
          </div>
          <span className="font-semibold tracking-tight text-zinc-900">
            Splnit<span className="text-blue-600">.eu</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-zinc-100/70 hover:text-zinc-900 ${
                  active
                    ? "font-medium text-zinc-900"
                    : "font-medium text-zinc-500"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="hidden text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 md:block"
          >
            Přihlásit se
          </Link>
          <div className="rounded-full bg-gradient-to-b from-blue-400 to-blue-700 p-px shadow-sm shadow-blue-200/60 transition-shadow hover:shadow-blue-200">
            <Link
              href="/sign-up"
              className="flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-500"
            >
              Začít zdarma
              <Icon
                icon="solar:arrow-right-linear"
                className="text-xs opacity-75"
                aria-hidden="true"
              />
            </Link>
          </div>
          <button
            type="button"
            className="p-1 text-zinc-600 transition-colors hover:text-zinc-900 md:hidden"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            <Icon
              icon={open ? "solar:close-circle-linear" : "solar:hamburger-menu-linear"}
              className="text-xl"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-b border-zinc-200/70 bg-stone-50/95 px-5 py-4 shadow-lg shadow-zinc-200/40 backdrop-blur md:hidden">
          <div className="mx-auto grid max-w-7xl gap-1">
            {links.map((link) => {
              const active =
                pathname === link.href || pathname.startsWith(`${link.href}/`);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-xl px-3 py-3 text-sm ${
                    active
                      ? "bg-blue-50 font-medium text-blue-700"
                      : "text-zinc-600 hover:bg-white"
                  }`}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/sign-in"
              className="rounded-xl px-3 py-3 text-sm text-zinc-600 hover:bg-white"
              onClick={() => setOpen(false)}
            >
              Přihlásit se
            </Link>
          </div>
        </div>
      ) : null}
    </nav>
  );
}
