export type ToolInventoryItem = {
  key: string;
  name: string;
  category: string;
};

export const TOOL_INVENTORY_LIBRARY: ToolInventoryItem[] = [
  { key: "chatgpt", name: "ChatGPT", category: "AI assistant" },
  { key: "microsoft-copilot", name: "Microsoft Copilot", category: "AI assistant" },
  { key: "github-copilot", name: "GitHub Copilot", category: "Developer tool" },
  { key: "claude", name: "Claude", category: "AI assistant" },
  { key: "gemini", name: "Gemini", category: "AI assistant" },
  { key: "notion-ai", name: "Notion AI", category: "Knowledge base" },
  { key: "slack-ai", name: "Slack AI", category: "Collaboration" },
  { key: "zapier", name: "Zapier", category: "Automation" },
  { key: "make", name: "Make", category: "Automation" },
  { key: "personio", name: "Personio", category: "HR" },
  { key: "hubspot", name: "HubSpot", category: "CRM" },
  { key: "salesforce", name: "Salesforce", category: "CRM" },
  { key: "intercom", name: "Intercom", category: "Support" },
  { key: "zendesk", name: "Zendesk", category: "Support" },
  { key: "jira", name: "Jira", category: "Project management" },
  { key: "linear", name: "Linear", category: "Project management" },
  { key: "figma-ai", name: "Figma AI", category: "Design" },
  { key: "canva", name: "Canva", category: "Design" },
  { key: "deepl", name: "DeepL", category: "Translation" },
  { key: "grammarly", name: "Grammarly", category: "Writing" },
];
