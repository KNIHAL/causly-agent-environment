export const site = {
  name: "Causly Server",
  url: "https://agenv.causly.in",
  tagline: "The open-source MCP server that turns any AI agent into your technical co-founder",
  description:
    "Causly Server is an open-source MCP server that turns any AI agent into your technical co-founder. Ship code, find clients, track deals and run your day from one local server with built-in safety.",
  github: "https://github.com/KNIHAL/causly-server",
  npm: "https://www.npmjs.com/package/causly-server",
  changelog: "https://github.com/KNIHAL/causly-server/blob/master/CHANGELOG.md",
  roadmap: "https://github.com/KNIHAL/causly-server/blob/master/ROADMAP.md",
  license: "https://github.com/KNIHAL/causly-server/blob/master/LICENSE",
  docs: "/docs",
  quickstart: "/docs/server/getting-started",
  security: "/docs/server/security",
  tools: "/docs/server/tools/overview",
  installCommand: "npm install -g causly-server",
  initCommand: "causly-server init",
  email: "nihal@causly.in",
} as const;

export const navItems = [
  { label: "Capabilities", href: "/#capabilities" },
  { label: "How it works", href: "/#how-it-works" },
  { label: "Security", href: "/#security" },
  { label: "FAQ", href: "/#faq" },
  { label: "Docs", href: site.docs },
] as const;
