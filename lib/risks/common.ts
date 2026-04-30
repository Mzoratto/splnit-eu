export type CommonRisk = {
  category: string;
  description: string;
  impact: number;
  likelihood: number;
  owner: string;
  title: string;
};

export const COMMON_CZECH_SME_RISKS: CommonRisk[] = [
  {
    category: "identity",
    description: "MFA není vynucené pro všechny cloudové a administrátorské účty.",
    impact: 5,
    likelihood: 4,
    owner: "IT owner",
    title: "Chybějící MFA u klíčových účtů",
  },
  {
    category: "backup",
    description: "Zálohy nejsou pravidelně testované a obnova nemusí splnit RTO.",
    impact: 5,
    likelihood: 3,
    owner: "Operations",
    title: "Neověřená obnova ze záloh",
  },
  {
    category: "vendor",
    description: "Kritický SaaS dodavatel nemá bezpečnostní assessment ani DPA.",
    impact: 4,
    likelihood: 4,
    owner: "Procurement",
    title: "Nedostatečně řízený dodavatel",
  },
  {
    category: "incident",
    description: "Incident response role nejsou nacvičené a hlášení může překročit 72h.",
    impact: 4,
    likelihood: 3,
    owner: "Security owner",
    title: "Nepřipravené incident response řízení",
  },
  {
    category: "data",
    description: "Osobní údaje jsou uložené v nástrojích bez jasné retence a přístupů.",
    impact: 4,
    likelihood: 4,
    owner: "DPO",
    title: "Neřízená retence osobních údajů",
  },
  {
    category: "endpoint",
    description: "Notebooky nemají jednotnou správu šifrování, EDR a patchingu.",
    impact: 4,
    likelihood: 3,
    owner: "IT owner",
    title: "Slabá správa koncových zařízení",
  },
  {
    category: "access",
    description: "Přístupová práva bývalých zaměstnanců a dodavatelů nejsou revidovaná.",
    impact: 4,
    likelihood: 4,
    owner: "HR + IT",
    title: "Nepravidelné access reviews",
  },
  {
    category: "ai",
    description: "Zaměstnanci používají AI nástroje bez pravidel pro citlivá data.",
    impact: 3,
    likelihood: 5,
    owner: "AI owner",
    title: "Nekontrolované použití AI nástrojů",
  },
  {
    category: "logging",
    description: "Auditní logy nejsou centralizované nebo nemají dostatečnou retenci.",
    impact: 3,
    likelihood: 4,
    owner: "IT owner",
    title: "Nedostatečná auditní stopa",
  },
  {
    category: "training",
    description: "Bezpečnostní školení není doložitelné pro všechny zaměstnance.",
    impact: 3,
    likelihood: 3,
    owner: "HR",
    title: "Chybějící evidence školení",
  },
];
