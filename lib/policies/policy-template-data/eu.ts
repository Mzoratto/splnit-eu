import type { PolicyTemplate } from "@/lib/policies/policy-template-types";

export const EU_POLICY_TEMPLATES: PolicyTemplate[] = [
  {
      type: "ai_policy",
      templateFamily: "ai_policy",
      jurisdiction: "EU",
      locale: "en-EU",
      titleCs: "Artificial intelligence policy",
      description:
        "Baseline EU AI Act policy for AI inventory, prohibited practices, responsibilities, high-risk use, and AI literacy.",
      sourceDocument: "tpl-001-ai-policy-en-eu.pdf",
      controlKeys: [
        "ctrl_ai_system_inventory",
        "ctrl_ai_literacy_training",
        "ctrl_ai_prohibited_practices_review",
        "ctrl_ai_human_oversight",
        "ctrl_ai_log_retention",
      ],
      sections: [
        {
          title: "Document identification",
          fields: [
            "Organisation",
            "Legal identifier",
            "Document version",
            "Issue date",
            "Approved by",
            "Next review",
          ],
        },
        {
          title: "Purpose and scope",
          body: "Rules, responsibilities, and procedures for using AI systems in the organisation.",
        },
        {
          title: "Definitions",
          fields: ["AI system", "Deployer", "High-risk AI system", "AI literacy"],
        },
        {
          title: "AI system inventory",
          fields: [
            "System name and version",
            "Provider",
            "Purpose",
            "Organisation role",
            "Risk classification",
            "Last review date",
          ],
        },
        {
          title: "Prohibited practices",
          body: "The organisation must not use AI systems for prohibited practices under Article 5 of the EU AI Act.",
        },
        {
          title: "Responsibilities",
          fields: ["Management", "AI owner", "Department leads", "Employees", "IT team"],
        },
        {
          title: "AI literacy training",
          body: "Baseline training at onboarding and annual refresh training for employees working with AI systems.",
        },
        {
          title: "Incident reporting",
          body: "Procedure for reporting unexpected, harmful, discriminatory, or unsafe AI outputs.",
        },
        {
          title: "Review and approval",
          fields: ["Approver name", "Role", "Date", "Signature"],
        },
      ],
    },
  {
      type: "security_policy",
      templateFamily: "security_policy",
      jurisdiction: "EU",
      locale: "en-EU",
      titleCs: "Information security policy",
      description:
        "Baseline security policy for access control, encryption, vulnerability management, backups, suppliers, and evidence ownership.",
      sourceDocument: "tpl-004-security-policy-en-eu.pdf",
      controlKeys: [
        "ctrl_mfa_all_users",
        "ctrl_privileged_access_reviewed",
        "ctrl_incident_plan_documented",
        "ctrl_data_encrypted_at_rest",
        "ctrl_patch_management",
        "ctrl_backup_tested",
        "ctrl_logging_monitoring",
        "ctrl_vendor_security_assessment",
        "ctrl_asset_inventory",
      ],
      sections: [
        {
          title: "Document identification",
          fields: ["Organisation", "Legal identifier", "Version", "Issue date", "Approved by"],
        },
        {
          title: "Scope and objectives",
          body: "This policy defines minimum security rules for people, systems, data, suppliers, and cloud services.",
        },
        {
          title: "Access control",
          body: "User accounts use MFA, privileged roles are limited, and access rights are reviewed periodically.",
        },
        {
          title: "Data protection",
          body: "Sensitive data is classified, encrypted, and protected according to processing purpose and legal obligations.",
        },
        {
          title: "Vulnerabilities and change",
          body: "Critical vulnerabilities are prioritized, changes are approved, and implementation evidence is retained.",
        },
        {
          title: "Suppliers",
          body: "Suppliers with access to systems or data are assessed and bound by security requirements.",
        },
        {
          title: "Review",
          fields: ["Policy owner", "Review date", "Next review date"],
        },
      ],
    },
  {
      type: "gdpr_privacy_notice",
      templateFamily: "gdpr_privacy_notice",
      jurisdiction: "EU",
      locale: "en-EU",
      titleCs: "GDPR privacy notice",
      description:
        "Privacy notice covering processing purposes, legal bases, recipients, retention periods, and data subject rights.",
      sourceDocument: "tpl-005-gdpr-privacy-notice-en-eu.pdf",
      controlKeys: [
        "ctrl_privacy_notice_current",
        "ctrl_data_processing_inventory",
        "ctrl_dsr_process",
        "ctrl_data_retention_schedule",
        "ctrl_dpia_process",
        "ctrl_supplier_contract_security",
      ],
      sections: [
        {
          title: "Controller identification",
          fields: ["Organisation name", "Legal identifier", "Address", "Contact email"],
        },
        {
          title: "Purposes and legal bases",
          fields: ["Processing purpose", "Data categories", "Legal basis", "Retention period"],
        },
        {
          title: "Recipients and processors",
          body: "Personal data may be disclosed to suppliers acting as processors under a data processing agreement.",
        },
        {
          title: "Data subject rights",
          body: "Data subjects may request access, rectification, erasure, restriction, portability, or object to processing where GDPR allows.",
        },
        {
          title: "Security",
          body: "The organisation applies technical and organisational measures including access control, encryption, and incident response.",
        },
        {
          title: "Supervisory authority",
          body: "Data subjects may lodge a complaint with the competent data protection authority.",
        },
      ],
    },
  {
      type: "training_log",
      templateFamily: "training_log",
      jurisdiction: "EU",
      locale: "en-EU",
      titleCs: "AI literacy training record",
      description:
        "Training evidence template for EU AI Act Article 4 and security awareness training records.",
      sourceDocument: "tpl-002-training-log-en-eu.pdf",
      controlKeys: ["ctrl_ai_literacy_training", "ctrl_security_training_annual"],
      sections: [
        {
          title: "Identification",
          fields: ["Organisation", "Legal identifier", "Year", "Training owner"],
        },
        {
          title: "Training records",
          fields: ["Employee name", "Department", "Training type", "Date", "Confirmation"],
        },
        {
          title: "Training types",
          fields: ["AI literacy baseline", "Security awareness", "Role-specific training", "Annual refresh"],
        },
        {
          title: "Owner signature",
          fields: ["Name", "Role", "Date", "Signature"],
        },
      ],
    },
  {
      type: "record_of_use",
      templateFamily: "record_of_use",
      jurisdiction: "EU",
      locale: "en-EU",
      titleCs: "AI system use record",
      description:
        "Manual record template for high-risk AI use where automated logs are not available.",
      sourceDocument: "tpl-003-record-of-use-en-eu.pdf",
      controlKeys: ["ctrl_ai_log_retention", "ctrl_ai_human_oversight"],
      sections: [
        {
          title: "AI system identification",
          fields: [
            "System name",
            "Version",
            "Provider",
            "Annex III category",
            "Purpose",
            "Responsible owner",
            "Department",
            "Start date",
          ],
        },
        {
          title: "Use log",
          fields: ["Date", "Use case", "AI output", "Human review", "Operator"],
        },
        {
          title: "Incident records",
          fields: ["Date", "Incident description", "Measures taken", "Reported to authority"],
        },
        {
          title: "Record review",
          fields: ["Reviewer", "Review date", "Next review date", "Signature"],
        },
      ],
    },
  {
      type: "incident_response",
      templateFamily: "incident_response",
      jurisdiction: "EU",
      locale: "en-EU",
      titleCs: "Incident response plan",
      description:
        "Incident response document for NIS2 and GDPR projects, including escalation, impact evidence, and notification timelines.",
      sourceDocument: "tpl-006-incident-response-en-eu.pdf",
      controlKeys: [
        "ctrl_incident_plan_documented",
        "ctrl_incident_72h_notification",
        "ctrl_logging_monitoring",
        "ctrl_security_event_alerting",
        "ctrl_business_continuity_plan",
      ],
      sections: [
        {
          title: "Scope and roles",
          fields: ["Incident manager", "IT owner", "Legal contact", "Management"],
        },
        {
          title: "Incident classification",
          fields: ["Low", "Medium", "High", "Critical"],
        },
        {
          title: "First response",
          body: "Protect people and systems, limit impact, preserve evidence, and activate responsible roles.",
        },
        {
          title: "Notification duties",
          body: "Personal data breaches are assessed under GDPR Article 33; significant cybersecurity incidents are assessed under NIS2 and applicable local law.",
        },
        {
          title: "Evidence and communication",
          fields: ["Detection time", "Impact", "Affected systems", "Measures taken", "External communication"],
        },
        {
          title: "Post-incident review",
          fields: ["Root cause", "Corrective measures", "Owner", "Deadline"],
        },
      ],
    },
];
