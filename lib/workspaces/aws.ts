import type {
  FrameworkMapping,
  NukibControlTier,
  NukibPriority,
} from "@/lib/compliance/nukib/types";
import type { PlatformWorkspace } from "@/lib/workspaces/types";

function metadata(input: {
  nis2Reference: "Article 21(2)(c)" | "Article 21(2)(h)" | "Article 21(2)(i)" | "Article 21(2)(j)";
  officialBaselineRefs?: readonly string[];
  priority: NukibPriority;
  reference: string;
  tier: NukibControlTier;
  title: string;
}) {
  const mappings: FrameworkMapping[] = [
    {
      frameworkId: "zokb",
      reference: input.reference,
      title: input.title,
    },
    {
      frameworkId: "nis2",
      reference: input.nis2Reference,
    },
  ];

  return {
    frameworkMappings: mappings,
    nukibPriority: input.priority,
    nukibTier: input.tier,
    officialBaselineRefs: input.officialBaselineRefs ? [...input.officialBaselineRefs] : [input.reference],
  };
}

const ZOKB_CONTINUITY = {
  officialBaselineRefs: ["§ 6", "§ 6 písm. c)"],
  priority: "high",
  reference: "§ 6",
  tier: "mandatory_minimum",
  title: "Řízení kontinuity činností",
} as const;

const ZOKB_ACCESS = {
  priority: "unset",
  reference: "§ 7",
  tier: "assessable",
  title: "Řízení přístupu",
} as const;

const ZOKB_IDENTITY = {
  priority: "unset",
  reference: "§ 8",
  tier: "assessable",
  title: "Řízení identit a jejich oprávnění",
} as const;

const ZOKB_CRYPTO = {
  priority: "unset",
  reference: "§ 9",
  tier: "assessable",
  title: "Kryptografické prostředky",
} as const;

const ZOKB_NETWORK = {
  priority: "high",
  reference: "§ 11",
  tier: "assessable",
  title: "Bezpečnost komunikačních sítí",
} as const;

const ZOKB_APPLICATION_SECURITY = {
  priority: "unset",
  reference: "§ 12",
  tier: "assessable",
  title: "Aplikační bezpečnost",
} as const;

// AWS workspace configuration for Czech NIS2/ZoKB SME readiness.
// Layer 1 mirrors the connector automation plan, while every API-backed
// control keeps manual evidence guidance for blocked-permission fallback.
export const awsWorkspace: PlatformWorkspace = {
  platformId: "aws",
  platformName: "AWS",
  platformVendor: "Amazon Web Services EMEA SARL",
  layers: [
    {
      id: "infrastructure",
      nukibBlock: {
        blockTitle: "§ Technická opatření",
        sectionTitle: "Zajištění úrovně dostupnosti",
      },
      title: "Infrastruktura a zabezpečení úložiště",
      controls: [
        {
          apiEndpoint: "@aws-sdk/client-ec2 DescribeInstancesCommand",
          apiExpected: "at least one instance state is running",
          apiField: "Reservations[*].Instances[*].State.Name",
          automatable: true,
          controlKey: "aws-infra-ec2-running",
          evidenceType: "both",
          guidance:
            "Automatická kontrola ověří, že v účtu AWS běží alespoň jedna EC2 instance ve stavu running. Pokud API kontrola selže, doložte ručně snímek z AWS Console nebo export aws ec2 describe-instances s datem kontroly a odpovědnou osobou.",
          nis2ArticleRef: "Article 21(2)(c)",
          question:
            "Běží v účtu AWS alespoň jedna produkční EC2 instance potřebná pro provoz služby?",
          zobkSectionRef: "§ 6 odst. 1 písm. b)",
          ...metadata({
            ...ZOKB_CONTINUITY,
            nis2Reference: "Article 21(2)(c)",
          }),
        },
        {
          apiEndpoint: "@aws-sdk/client-ec2 DescribeSecurityGroupsCommand",
          apiExpected: "IpPermissions.length > 0 or IpPermissionsEgress.length > 0",
          apiField: "SecurityGroups[*].IpPermissions | SecurityGroups[*].IpPermissionsEgress",
          automatable: true,
          controlKey: "aws-infra-security-group-rules-present",
          evidenceType: "both",
          guidance:
            "Automatická kontrola ověří, že alespoň jedna AWS security group má definované příchozí nebo odchozí pravidlo. Pokud API kontrola selže, doložte ručně anonymizovaný export security group pravidel nebo snímek nastavení z AWS Console.",
          nis2ArticleRef: "Article 21(2)(h)",
          question:
            "Jsou pro AWS prostředí definovaná security group pravidla pro síťový přístup?",
          zobkSectionRef: "§ 5 odst. 1 písm. e)",
          ...metadata({
            ...ZOKB_NETWORK,
            nis2Reference: "Article 21(2)(h)",
          }),
        },
        {
          apiEndpoint: "@aws-sdk/client-s3 ListObjectsV2Command",
          apiExpected: "Contents[*].LastModified within 7 days in configured backupBucketName",
          apiField: "Contents[*].LastModified",
          automatable: true,
          controlKey: "aws-infra-s3-backup-recent",
          evidenceType: "both",
          guidance:
            "Automatická kontrola ověří, že v nakonfigurovaném backupBucketName existuje objekt změněný v posledních 7 dnech. Pokud backupBucketName není vyplněný nebo API kontrola selže, doložte ručně snímek S3 bucketu, export seznamu objektů nebo výstup zálohovacího nástroje s datem poslední zálohy.",
          nis2ArticleRef: "Article 21(2)(c)",
          question:
            "Obsahuje nastavený S3 backup bucket zálohu vytvořenou nebo změněnou v posledních 7 dnech?",
          zobkSectionRef: "§ 8 odst. 1",
          ...metadata({
            ...ZOKB_CONTINUITY,
            nis2Reference: "Article 21(2)(c)",
          }),
        },
        {
          apiEndpoint: "@aws-sdk/client-cloudtrail DescribeTrailsCommand + GetTrailStatusCommand",
          apiExpected: "at least one trail status has IsLogging === true",
          apiField: "trailList[*].TrailARN -> GetTrailStatusCommand.IsLogging",
          automatable: true,
          controlKey: "aws-infra-cloudtrail-logging-enabled",
          evidenceType: "both",
          guidance:
            "Automatická kontrola ověří, že existuje alespoň jeden CloudTrail trail a jeho stav IsLogging je true. Pokud API kontrola selže, doložte ručně snímek nastavení CloudTrail nebo výstup aws cloudtrail get-trail-status s datem kontroly.",
          nis2ArticleRef: "Article 21(2)(h)",
          question:
            "Je v účtu AWS zapnutý CloudTrail trail, který aktivně zaznamenává události?",
          zobkSectionRef: "§ 11 odst. 1 písm. b)",
          ...metadata({
            ...ZOKB_NETWORK,
            nis2Reference: "Article 21(2)(h)",
          }),
        },
      ],
    },
    {
      id: "iam",
      nukibBlock: {
        blockTitle: "§ Technická opatření",
        sectionTitle: "Správa přístupových oprávnění",
      },
      title: "Řízení přístupu a správa identit",
      controls: [
        {
          controlKey: "aws-iam-readonly-least-privilege",
          evidenceType: "attestation",
          guidance:
            "Zkontrolujte, že IAM access key používaný pro Splnit.eu má pouze čtecí oprávnění potřebná pro EC2, security groups, S3 backup bucket, CloudTrail a STS. Nepřidávejte zápis ani administrátorská oprávnění.",
          nis2ArticleRef: "Article 21(2)(i)",
          question:
            "Jsou AWS IAM přístupové klíče pro Splnit.eu omezené na minimální potřebná čtecí oprávnění?",
          zobkSectionRef: "§ 7 odst. 2",
          ...metadata({
            ...ZOKB_ACCESS,
            nis2Reference: "Article 21(2)(i)",
          }),
        },
        {
          controlKey: "aws-iam-root-access-keys-deleted",
          evidenceType: "attestation",
          guidance:
            "Doložte, že root účet AWS nemá aktivní access keys. Vhodný důkaz je snímek sekce Security credentials pro root účet nebo interní kontrolní záznam bez zveřejnění tajných hodnot.",
          nis2ArticleRef: "Article 21(2)(i)",
          question:
            "Jsou access keys pro AWS root účet odstraněné a administrace probíhá přes samostatné IAM účty?",
          zobkSectionRef: "§ 8 odst. 2",
          ...metadata({
            ...ZOKB_IDENTITY,
            nis2Reference: "Article 21(2)(i)",
          }),
        },
        {
          controlKey: "aws-iam-console-mfa-enabled",
          evidenceType: "attestation",
          guidance:
            "Doložte, že všichni IAM uživatelé s přístupem do AWS Console mají zapnuté MFA. Vhodný důkaz je anonymizovaný report z IAM Credential reportu nebo interní záznam kontroly.",
          nis2ArticleRef: "Article 21(2)(i)",
          question:
            "Mají všichni IAM uživatelé s konzolovým přístupem zapnuté MFA?",
          zobkSectionRef: "§ 7 odst. 1",
          ...metadata({
            ...ZOKB_ACCESS,
            nis2Reference: "Article 21(2)(i)",
          }),
        },
        {
          controlKey: "aws-iam-inactive-users-audited",
          evidenceType: "attestation",
          guidance:
            "Doložte pravidelný audit neaktivních IAM uživatelů a přístupových klíčů. Záznam má uvádět datum auditu, odpovědnou osobu, nalezené účty a provedené odebrání nebo rotaci přístupu.",
          nis2ArticleRef: "Article 21(2)(i)",
          question:
            "Jsou neaktivní IAM uživatelé a nepoužívané access keys pravidelně auditované a odstraňované?",
          zobkSectionRef: "§ 8 odst. 3",
          ...metadata({
            ...ZOKB_IDENTITY,
            nis2Reference: "Article 21(2)(i)",
          }),
        },
      ],
    },
    {
      id: "backup_dr",
      nukibBlock: {
        blockTitle: "§ Technická opatření",
        sectionTitle: "Zajištění úrovně dostupnosti",
      },
      title: "Zálohy a obnova po havárii",
      controls: [
        {
          apiEndpoint: "@aws-sdk/client-s3 GetBucketVersioningCommand",
          apiExpected: "Status === Enabled for configured backupBucketName",
          apiField: "Status",
          automatable: true,
          controlKey: "aws-backup-s3-versioning-enabled",
          evidenceType: "both",
          guidance:
            "Automatická kontrola ověří, že pro nakonfigurovaný backupBucketName je zapnuté S3 versioning. Pokud bucket není nastavený nebo API kontrola selže, doložte ručně snímek vlastností bucketu nebo výstup aws s3api get-bucket-versioning.",
          nis2ArticleRef: "Article 21(2)(c)",
          question:
            "Je na S3 bucketu používaném pro zálohy zapnuté versioning?",
          zobkSectionRef: "§ 8 odst. 2",
          ...metadata({
            ...ZOKB_CONTINUITY,
            nis2Reference: "Article 21(2)(c)",
          }),
        },
        {
          controlKey: "aws-backup-cross-region-copy",
          evidenceType: "attestation",
          guidance:
            "Doložte, že existuje kopie záloh mimo primární AWS region nebo mimo stejné provozní prostředí. Vhodný důkaz je konfigurace replikace, backup plán nebo smluvní zajištění externí kopie.",
          nis2ArticleRef: "Article 21(2)(c)",
          question:
            "Existuje off-site nebo cross-region kopie klíčových AWS záloh?",
          zobkSectionRef: "§ 8 odst. 3",
          ...metadata({
            ...ZOKB_CONTINUITY,
            nis2Reference: "Article 21(2)(c)",
          }),
        },
        {
          controlKey: "aws-backup-recovery-test",
          evidenceType: "attestation",
          guidance:
            "Doložte protokol testu obnovy provedeného v posledních 12 měsících. Protokol má uvádět rozsah obnovy, výsledek, dobu obnovy, zjištěné problémy a odpovědnou osobu.",
          nis2ArticleRef: "Article 21(2)(c)",
          question:
            "Byl v posledních 12 měsících proveden a zdokumentován test obnovy z AWS záloh?",
          zobkSectionRef: "§ 8 odst. 4",
          ...metadata({
            ...ZOKB_CONTINUITY,
            nis2Reference: "Article 21(2)(c)",
          }),
        },
      ],
    },
    {
      id: "api_connectivity",
      nukibBlock: {
        blockTitle: "§ Technická opatření",
        sectionTitle: "Kryptografické prostředky",
      },
      title: "Zabezpečení API a propojení",
      controls: [
        {
          controlKey: "aws-api-keys-secrets-manager",
          evidenceType: "attestation",
          guidance:
            "Doložte, že AWS access key ID a secret access key nejsou uložené ve zdrojovém kódu, repozitáři ani sdílených dokumentech. Vhodný důkaz je popis použití secrets manageru nebo chráněných proměnných prostředí.",
          nis2ArticleRef: "Article 21(2)(j)",
          question:
            "Jsou AWS access keys uložené v bezpečném úložišti tajemství, nikoli ve zdrojovém kódu?",
          zobkSectionRef: "§ 9 odst. 1",
          ...metadata({
            ...ZOKB_CRYPTO,
            nis2Reference: "Article 21(2)(j)",
          }),
        },
        {
          controlKey: "aws-api-key-rotation-schedule",
          evidenceType: "attestation",
          guidance:
            "Doložte pravidlo rotace AWS access keys nejpozději každých 90 dní nebo při změně odpovědné osoby. Přiložte datum poslední rotace bez zveřejnění samotných tajných hodnot.",
          nis2ArticleRef: "Article 21(2)(i)",
          question:
            "Je definován harmonogram rotace AWS access keys nejpozději každých 90 dní?",
          zobkSectionRef: "§ 8 odst. 2",
          ...metadata({
            ...ZOKB_IDENTITY,
            nis2Reference: "Article 21(2)(i)",
          }),
        },
        {
          controlKey: "aws-cloudtrail-log-review-scheduled",
          evidenceType: "attestation",
          guidance:
            "Doložte plán pravidelné kontroly CloudTrail logů nebo alertingu nad bezpečnostními událostmi. Uveďte četnost kontroly, odpovědnou osobu a kde se evidují zjištění.",
          nis2ArticleRef: "Article 21(2)(j)",
          question:
            "Je naplánovaná a dokumentovaná pravidelná kontrola CloudTrail logů?",
          zobkSectionRef: "§ 12 odst. 1",
          ...metadata({
            ...ZOKB_APPLICATION_SECURITY,
            nis2Reference: "Article 21(2)(j)",
          }),
        },
      ],
    },
  ],
};
