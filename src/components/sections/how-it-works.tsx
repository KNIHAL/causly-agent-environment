import Reveal from "@/components/reveal";
import SectionHeader from "@/components/section-header";
import { ArrowRight } from "@/components/icons";
import { site } from "@/lib/site";

const steps = [
  {
    title: "Install",
    text: "One npm package. Needs Node.js 22.13 or newer and no API keys to start.",
    code: "npm install -g causly-server",
  },
  {
    title: "Connect",
    text: "init finds Claude Desktop, Cursor and Windsurf and wires them up for you.",
    code: "causly-server init",
  },
  {
    title: "Ask",
    text: "Your agent searches the tools, loads what it needs, and calls them by name.",
    code: "“Prep me for my next meeting.”",
  },
  {
    title: "Approve",
    text: "High-risk actions need an explicit confirm. Every call lands in an activity log.",
    code: "confirm: true",
  },
];

const inner = [
  { name: "Tool router", text: "search_tools, load_toolset, use_tool" },
  { name: "Safety layer", text: "Permissions, workspace limit, redaction" },
  { name: "Tool packs", text: "Loaded on demand, not all at once" },
  { name: "Local store", text: "SQLite, encrypted secrets, your keys" },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="border-b border-border bg-background-soft/50 py-24 sm:py-28">
      <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8">
        <Reveal>
          <SectionHeader
            index="02"
            eyebrow="How it works"
            title="Set up in minutes. Runs on your machine."
            description="Causly Server is a single Node.js process your editor starts over stdio. There is no network listener, no Causly cloud and no account."
          />
        </Reveal>

        <ol className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.06}>
              <li className="h-full list-none rounded-xl border border-border bg-surface p-6">
                <span className="font-mono text-xs text-accent">0{i + 1}</span>
                <h3 className="mt-3 text-lg font-semibold text-text-primary">{s.title}</h3>
                <p className="mt-2 text-sm leading-6 text-text-secondary">{s.text}</p>
                <code className="mt-5 block overflow-x-auto whitespace-nowrap rounded-md border border-border bg-code-background px-3 py-2 text-[12px] text-code-text">
                  {s.code}
                </code>
              </li>
            </Reveal>
          ))}
        </ol>

        <Reveal className="mt-14">
          <figure
            aria-label="Architecture: your agent talks to Causly Server over MCP, which calls your services"
            className="grid items-stretch gap-4 rounded-xl border border-border bg-surface p-5 sm:p-7 lg:grid-cols-[170px_1fr_170px] lg:gap-6"
          >
            <Node label="Your agent" sub="Claude Desktop, Cursor, Windsurf, your own" />

            <div className="rounded-lg border border-accent/30 bg-accent-soft p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-text-primary">Causly Server</p>
                <p className="font-mono text-[11px] text-accent">MCP over stdio</p>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {inner.map((n) => (
                  <div key={n.name} className="rounded-md border border-border bg-background-soft p-3.5">
                    <p className="text-[13.5px] font-medium text-text-primary">{n.name}</p>
                    <p className="mt-1 text-xs leading-5 text-text-muted">{n.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <Node label="Your services" sub="GitHub, Vercel, Google, Slack, Telegram, more" />
          </figure>
        </Reveal>

        <Reveal className="mt-8">
          <a
            href="/docs/server/architecture"
            className="inline-flex items-center gap-2 text-sm font-medium text-accent transition-colors hover:text-accent-bright"
          >
            Read the architecture guide
            <ArrowRight />
          </a>
          <span className="sr-only">{site.name}</span>
        </Reveal>
      </div>
    </section>
  );
}

function Node({ label, sub }: { label: string; sub: string }) {
  return (
    <div className="flex flex-col justify-center rounded-lg border border-border bg-background-soft p-4 text-center">
      <p className="text-sm font-semibold text-text-primary">{label}</p>
      <p className="mt-1.5 text-xs leading-5 text-text-muted">{sub}</p>
    </div>
  );
}
