function sectionRange(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export const CZECH_CYBER_DECREE_SOURCES = [
  {
    citation: "Vyhláška č. 409/2025 Sb. - extraction draft from Zákony pro lidi PDF",
    effectiveDate: "2025-11-01",
    filename: "cz/zakonyprolidi_cs_2025_409_v20251101.pdf",
    jurisdiction: "CZ",
    locale: "cs-CZ",
    number: "409",
    sections: sectionRange(3, 27).map((sectionNumber) => ({
      citation: `Vyhláška č. 409/2025 Sb., § ${sectionNumber}`,
      sectionNumber,
    })),
    title:
      "Vyhláška č. 409/2025 Sb. - bezpečnostní opatření v režimu vyšších povinností",
    url: "https://www.zakonyprolidi.cz/cs/2025-409",
  },
  {
    citation: "Vyhláška č. 410/2025 Sb. - extraction draft from Zákony pro lidi PDF",
    effectiveDate: "2025-11-01",
    filename: "cz/zakonyprolidi_cs_2025_410_v20251101.pdf",
    jurisdiction: "CZ",
    locale: "cs-CZ",
    number: "410",
    sections: sectionRange(3, 14).map((sectionNumber) => ({
      citation: `Vyhláška č. 410/2025 Sb., § ${sectionNumber}`,
      sectionNumber,
    })),
    title:
      "Vyhláška č. 410/2025 Sb. - bezpečnostní opatření v režimu nižších povinností",
    url: "https://www.zakonyprolidi.cz/cs/2025-410",
  },
] as const;

export type CzechCyberDecreeSource =
  (typeof CZECH_CYBER_DECREE_SOURCES)[number];
