import Reveal from "@/components/reveal";
import SectionHeader from "@/components/section-header";

const clients = [
  { name: "Claude Desktop", note: "Wired by init" },
  { name: "Cursor", note: "Wired by init" },
  { name: "Windsurf", note: "Wired by init" },
  { name: "Claude Code", note: "One command, printed by init" },
  { name: "Your own agent", note: "Tested with plain JavaScript and LangChain (JS)" },
];

const requirements = [
  { label: "Runtime", value: "Node.js 22.13 or newer" },
  { label: "Platforms", value: "Windows, macOS and Linux, tested in CI on all three" },
  { label: "Keys", value: "None to start. Add them per service when you need them" },
  { label: "License", value: "MIT" },
];

export default function WorksWith() {
  return (
    <section id="works-with" className="border-b border-border bg-background-soft/50 py-24 sm:py-28">
      <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8">
        <Reveal>
          <SectionHeader
            index="04"
            eyebrow="Works with"
            title="Any MCP client. Set up for the ones you already use."
          />
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {clients.map((c, i) => (
            <Reveal key={c.name} delay={i * 0.04}>
              <div className="h-full rounded-xl border border-border bg-surface p-5">
                <p className="text-[15px] font-semibold text-text-primary">{c.name}</p>
                <p className="mt-2 text-[13px] leading-5 text-text-muted">{c.note}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-8">
          <dl className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {requirements.map((r) => (
              <div key={r.label} className="bg-surface p-5">
                <dt className="font-mono text-[11px] tracking-[0.14em] text-text-muted">
                  {r.label.toUpperCase()}
                </dt>
                <dd className="mt-2 text-sm leading-6 text-text-primary">{r.value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
