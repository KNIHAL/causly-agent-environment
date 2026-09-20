# Causly Agent Environment (agenv)

**Where AI agents get a real environment — not just a chat window.**

`agenv` is part of [Causly](https://causly.in) — a Business Operator | AI Automation Lab.

This repo is the landing page and documentation hub for the **Causly Agent Environment**: the
family of tools and products Causly builds so an AI agent has a real environment to work in —
filesystem, git, cloud, databases, deployment, and more — instead of just a chat window.

It lists every product in that environment and hosts and maintains their documentation, all in
one place. This repo is updated continuously as the environment grows.

## Products

| Product | What it is | Status |
| --- | --- | --- |
| **[Server](https://github.com/KNIHAL/causly-server)** | Open-source MCP tool server — 181 tools spanning filesystem, git, GitHub, Docker, Terraform, databases, and more | Available (OSS) |
| **Hosted** | Managed, cloud-hosted version of the agent environment | Waitlist |
| **Runtime** | Execution runtime for agents | Coming soon |
| **IDE** | Agent-native development environment | Coming soon |

Docs for every product live at [`/docs`](https://agenv.causly.in/docs), organized by product in
the sidebar.

## Docs

Documentation is built with [Docusaurus](https://docusaurus.io) (`website/`) and published as a
static site under `/docs` on the same domain as the landing page.

To run the docs locally:

```bash
cd website
npm install
npm start
```

## Contributing

Contributions are welcome — for docs content, and for improvements to the landing page itself.
See [CONTRIBUTING.md](./CONTRIBUTING.md).

## Security

See [SECURITY.md](./SECURITY.md) for how to report a vulnerability.

## License

[MIT](./LICENSE) © Kumar Nihal
