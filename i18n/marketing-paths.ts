import type { Locale } from "@/i18n/routing";

const localePrefixes: Record<Locale, string> = {
  "cs-CZ": "",
  "en-EU": "/en",
  "it-IT": "/it",
};

function splitHash(path: string) {
  const hashIndex = path.indexOf("#");

  if (hashIndex === -1) {
    return { base: path, hash: "" };
  }

  return {
    base: path.slice(0, hashIndex),
    hash: path.slice(hashIndex),
  };
}

function stripKnownPrefix(path: string) {
  for (const prefix of ["/it", "/en", "/cs"]) {
    if (path === prefix) {
      return "/";
    }

    if (path.startsWith(`${prefix}/`)) {
      return path.slice(prefix.length) || "/";
    }
  }

  return path || "/";
}

export function toInternalMarketingPath(path: string) {
  const { base, hash } = splitHash(path);
  const unprefixed = stripKnownPrefix(base);

  if (unprefixed === "/normative" || unprefixed.startsWith("/normative/")) {
    return unprefixed.replace("/normative", "/predpisy") + hash;
  }

  if (unprefixed === "/regulations" || unprefixed.startsWith("/regulations/")) {
    return unprefixed.replace("/regulations", "/predpisy") + hash;
  }

  if (unprefixed === "/prezzi" || unprefixed.startsWith("/prezzi/")) {
    return unprefixed.replace("/prezzi", "/cenik") + hash;
  }

  if (unprefixed === "/chi-siamo" || unprefixed.startsWith("/chi-siamo/")) {
    return unprefixed.replace("/chi-siamo", "/about") + hash;
  }

  if (
    unprefixed === "/accesso-anticipato" ||
    unprefixed.startsWith("/accesso-anticipato/")
  ) {
    return unprefixed.replace("/accesso-anticipato", "/early-access") + hash;
  }

  if (unprefixed === "/sicurezza" || unprefixed.startsWith("/sicurezza/")) {
    return unprefixed.replace("/sicurezza", "/security") + hash;
  }

  if (unprefixed === "/strumenti" || unprefixed.startsWith("/strumenti/")) {
    return unprefixed.replace("/strumenti", "/tools") + hash;
  }

  if (unprefixed === "/nastroje" || unprefixed.startsWith("/nastroje/")) {
    return unprefixed.replace("/nastroje", "/tools") + hash;
  }

  if (unprefixed === "/pricing" || unprefixed.startsWith("/pricing/")) {
    return unprefixed.replace("/pricing", "/cenik") + hash;
  }

  return unprefixed + hash;
}

export function getLocalizedMarketingPath(path: string, locale: Locale) {
  const { base, hash } = splitHash(toInternalMarketingPath(path));
  const prefix = localePrefixes[locale];

  if (locale === "it-IT") {
    if (base === "/") {
      return "/it" + hash;
    }

    if (base === "/predpisy" || base.startsWith("/predpisy/")) {
      return `${prefix}${base.replace("/predpisy", "/normative")}${hash}`;
    }

    if (base === "/cenik" || base.startsWith("/cenik/")) {
      return `${prefix}${base.replace("/cenik", "/prezzi")}${hash}`;
    }

    if (base === "/about" || base.startsWith("/about/")) {
      return `${prefix}${base.replace("/about", "/chi-siamo")}${hash}`;
    }

    if (base === "/early-access" || base.startsWith("/early-access/")) {
      return `${prefix}${base.replace("/early-access", "/accesso-anticipato")}${hash}`;
    }

    if (base === "/security" || base.startsWith("/security/")) {
      return `${prefix}${base.replace("/security", "/sicurezza")}${hash}`;
    }

    if (base === "/tools" || base.startsWith("/tools/")) {
      return `${prefix}${base.replace("/tools", "/strumenti")}${hash}`;
    }

    return `${prefix}${base}${hash}`;
  }

  if (locale === "en-EU") {
    if (base === "/") {
      return "/en" + hash;
    }

    if (base === "/predpisy" || base.startsWith("/predpisy/")) {
      return `${prefix}${base.replace("/predpisy", "/regulations")}${hash}`;
    }

    if (base === "/cenik" || base.startsWith("/cenik/")) {
      return `${prefix}${base.replace("/cenik", "/pricing")}${hash}`;
    }

    return `${prefix}${base}${hash}`;
  }

  if (base === "/tools" || base.startsWith("/tools/")) {
    return `${base.replace("/tools", "/nastroje")}${hash}`;
  }

  return `${base}${hash}`;
}
