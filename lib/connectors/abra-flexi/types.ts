export type AbraFlexiCheckResult = "pass" | "gap" | "manual_review" | "error";

export type AbraFlexiListResponse<T extends Record<string, unknown>> = {
  winstrom?: {
    [key: string]: T[] | unknown;
  };
};

export type AbraFlexiUser = Record<string, unknown> & {
  id?: string | number;
  kod?: string;
  role?: string;
  uzivatel?: string;
  zablokovan?: boolean | string;
};

export type AbraFlexiSettings = Record<string, unknown> & {
  id?: string | number;
  nazev?: string;
};
