import CopyCommand from "@/components/copy-command";
import { ArrowRight, GithubIcon } from "@/components/icons";
import { site } from "@/lib/site";

const stats = [
  { value: "230+", label: "Tools across build, sell and operate" },
  { value: "5", label: "Permission levels on every tool" },
  { value: "0", label: "Cloud accounts to create" },
  { value: "MIT", label: "Open source, free to use" },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-[70px]">
      <div
        aria-hidden
        className="causly-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_72%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[460px] w-[900px] -translate-x-1/2 rounded-full bg-accent/10 blur-[130px]"
      />

      <div className="relative mx-auto grid w-full max-w-[1200px] gap-14 px-5 pb-16 pt-16 sm:px-8 sm:pt-24 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-14 lg:pb-24">
        <div>
          <a
            href={site.changelog}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-accent-soft px-3.5 py-1.5 font-mono text-[11.5px] tracking-wide text-accent transition-colors hover:border-accent/50"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Open source · MIT · MCP server
          </a>

          <h1 className="mt-6 text-[40px] font-semibold leading-[1.04] tracking-tight text-text-primary sm:text-[56px]">
            Turn any AI agent into your technical co-founder.
          </h1>

          <p className="mt-6 max-w-[560px] text-base leading-7 text-text-secondary sm:text-lg sm:leading-8">
            Causly Server gives your agent hands. Ship code, find clients, track deals, take
            meeting notes and run your calendar from one local MCP server, with guardrails
            on every risky action.
          </p>

          <div className="mt-8 max-w-[520px] space-y-2.5">
            <CopyCommand command={site.installCommand} />
            <CopyCommand command={site.initCommand} />
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href={site.quickstart}
              className="inline-flex h-12 items-center gap-2 rounded-lg bg-accent px-6 text-[15px] font-semibold text-[#031012] transition-colors hover:bg-accent-bright"
            >
              Read the quickstart
              <ArrowRight />
            </a>
            <a
              href={site.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center gap-2 rounded-lg border border-border-strong px-6 text-[15px] font-medium text-text-primary transition-colors hover:bg-surface-hover"
            >
              <GithubIcon className="h-4 w-4" />
              View on GitHub
            </a>
          </div>
        </div>

        <Terminal />
      </div>

      <div className="relative border-y border-border bg-background-soft/60">
        <dl className="mx-auto grid w-full max-w-[1200px] grid-cols-2 gap-y-8 px-5 py-9 sm:px-8 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="lg:border-l lg:border-border lg:pl-8 lg:first:border-l-0 lg:first:pl-0">
              <dt className="text-3xl font-semibold tracking-tight text-text-primary">{s.value}</dt>
              <dd className="mt-1.5 max-w-[200px] text-[13px] leading-5 text-text-muted">{s.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function Row({
  who,
  children,
}: {
  who: "you" | "tool";
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <span
        className={`w-9 shrink-0 select-none ${who === "you" ? "text-text-dim" : "text-accent"}`}
      >
        {who === "you" ? "you" : "tool"}
      </span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function Terminal() {
  return (
    <div className="overflow-hidden rounded-xl border border-border-strong bg-code-background shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="ml-3 font-mono text-xs text-text-muted">agent session · example</span>
      </div>

      <div className="space-y-3.5 p-5 font-mono text-[12.5px] leading-6 sm:text-[13px]">
        <Row who="you">
          <p className="text-text-primary">Ship this change and open a pull request.</p>
        </Row>

        <Row who="tool">
          <p className="text-code-text">ship_change</p>
          <p className="text-level-high">Blocked: HIGH risk action, needs confirm: true</p>
        </Row>

        <Row who="you">
          <p className="text-text-primary">Go ahead.</p>
        </Row>

        <Row who="tool">
          <p className="text-code-text">ship_change {"{ confirm: true }"}</p>
          <p className="text-text-secondary">✓ tests ✓ lint ✓ build</p>
          <p className="text-text-secondary">✓ branch pushed, pull request opened</p>
        </Row>

        <Row who="you">
          <p className="text-text-primary">
            Find companies hiring React developers and add the best three to my pipeline.
          </p>
        </Row>

        <Row who="tool">
          <p className="text-code-text">lead_hn_hiring → pipeline_add_lead ×3</p>
          <p className="text-text-secondary">✓ leads saved, follow-up reminder set</p>
          <p className="text-accent">
            ▍<span className="cursor-blink" />
          </p>
        </Row>
      </div>
    </div>
  );
}
