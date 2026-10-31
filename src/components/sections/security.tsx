import Reveal from "@/components/reveal";
import SectionHeader from "@/components/section-header";
import { ArrowRight } from "@/components/icons";
import { site } from "@/lib/site";

const levels = [
  { name: "READ", text: "No side effects", color: "var(--level-read)", gated: false },
  { name: "LOW", text: "Small, easy to undo", color: "var(--level-low)", gated: false },
  { name: "MEDIUM", text: "Changes files or state", color: "var(--level-medium)", gated: false },
  { name: "HIGH", text: "Hard to undo or visible to others", color: "var(--level-high)", gated: true },
  { name: "DESTRUCTIVE", text: "Deletes or cannot be reversed", color: "var(--level-destructive)", gated: true },
];

const controls = [
  {
    title: "Workspace limit",
    text: "Confine file and command tools to the folders you choose. Symbolic links are resolved first.",
  },
  {
    title: "Command safety",
    text: "Catastrophic shell commands are blocked. Risky ones are flagged in the audit log.",
  },
  {
    title: "Secret redaction",
    text: "Tokens and passwords are removed from inputs and errors before anything is logged.",
  },
  {
    title: "Encrypted secrets",
    text: "A local store using AES-256-GCM, under a master key only you hold.",
  },
  {
    title: "Activity log",
    text: "One structured line for every tool call, including the ones that were blocked.",
  },
  {
    title: "Local-first",
    text: "No Causly cloud or account. Data only leaves for services you configured yourself.",
  },
];

export default function Security() {
  return (
    <section id="security" className="border-b border-border py-24 sm:py-28">
      <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8">
        <Reveal>
          <SectionHeader
            index="03"
            eyebrow="Security"
            title="Built so one bad call cannot cost you a day."
            description="Every tool has a risk level. The server enforces it, whichever agent or editor is calling."
          />
        </Reveal>

        <Reveal className="mt-14">
          <div className="grid overflow-hidden rounded-xl border border-border bg-surface sm:grid-cols-5">
            {levels.map((l) => (
              <div
                key={l.name}
                className="border-b border-border p-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0"
              >
                <p className="font-mono text-[13px] font-semibold" style={{ color: l.color }}>
                  {l.name}
                </p>
                <p className="mt-2 text-[13px] leading-5 text-text-secondary">{l.text}</p>
                <p className="mt-4 font-mono text-[11px] text-text-muted">
                  {l.gated ? "needs confirm: true" : "runs immediately"}
                </p>
              </div>
            ))}
          </div>
        </Reveal>

        <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {controls.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.04}>
              <div className="h-full rounded-xl border border-border bg-surface p-6">
                <h3 className="text-[17px] font-semibold text-text-primary">{c.title}</h3>
                <p className="mt-2 text-sm leading-6 text-text-secondary">{c.text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-8">
          <div className="flex flex-col gap-4 rounded-xl border border-border-strong bg-surface-raised p-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-[720px] text-sm leading-6 text-text-secondary">
              <span className="font-semibold text-text-primary">Guardrails, not a sandbox.</span>{" "}
              The approval gate is a flag the agent must pass, and the workspace limit checks path
              arguments. Use scoped keys and an agent you trust. The docs list exactly what is and
              is not protected.
            </p>
            <a
              href={site.security}
              className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-accent transition-colors hover:text-accent-bright"
            >
              Read the security model
              <ArrowRight />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
