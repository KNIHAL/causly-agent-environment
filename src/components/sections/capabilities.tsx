import Reveal from "@/components/reveal";
import SectionHeader from "@/components/section-header";
import { ArrowRight } from "@/components/icons";
import { site } from "@/lib/site";

type Pack = { name: string; tools: number };
type Category = { title: string; blurb: string; packs: Pack[] };

const categories: Category[] = [
  {
    title: "Build and ship",
    blurb: "From a local edit to a verified deploy, without leaving the conversation.",
    packs: [
      { name: "Files, git, shell, project", tools: 42 },
      { name: "GitHub", tools: 27 },
      { name: "Terraform", tools: 20 },
      { name: "Docker", tools: 18 },
      { name: "Vercel", tools: 11 },
      { name: "Postgres and MySQL", tools: 8 },
      { name: "Supabase", tools: 6 },
      { name: "Workflows", tools: 4 },
    ],
  },
  {
    title: "Sell and grow",
    blurb: "Find clients, keep a pipeline, and fix your SEO from the same place you code.",
    packs: [
      { name: "Pipeline", tools: 9 },
      { name: "SEO", tools: 4 },
      { name: "Leads", tools: 3 },
      { name: "Research", tools: 2 },
    ],
  },
  {
    title: "Operate",
    blurb: "Meetings, reminders and tickets that survive the end of a chat.",
    packs: [
      { name: "Notion", tools: 15 },
      { name: "Meetings", tools: 9 },
      { name: "Calendar", tools: 8 },
      { name: "Sentry", tools: 8 },
      { name: "Linear", tools: 7 },
      { name: "Reminders", tools: 3 },
    ],
  },
  {
    title: "Communicate",
    blurb: "Read and send, with a confirmation step before anything leaves your machine.",
    packs: [
      { name: "Gmail", tools: 8 },
      { name: "Slack", tools: 8 },
      { name: "Telegram", tools: 5 },
    ],
  },
];

const workflows = [
  { name: "ship_change", text: "Checks, branch, commit, push and an open pull request." },
  { name: "fix_ci", text: "Finds the failing run and pulls logs for every failed job." },
  { name: "verify_ci_fix", text: "Pushes the fix and waits for the new run to pass or fail." },
  { name: "deploy_project", text: "Tests, build, deploy, then a live health check." },
];

export default function Capabilities() {
  return (
    <section id="capabilities" className="border-b border-border py-24 sm:py-28">
      <div className="mx-auto w-full max-w-[1200px] px-5 sm:px-8">
        <Reveal>
          <SectionHeader
            index="01"
            eyebrow="Capabilities"
            title="One server for the whole founder workflow."
            description="Code is only part of a founder's week. Causly Server covers building, selling and operating, so your agent can carry work from one step to the next."
          />
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {categories.map((cat, i) => {
            const total = cat.packs.reduce((n, p) => n + p.tools, 0);
            return (
              <Reveal key={cat.title} delay={i * 0.05}>
                <article className="h-full rounded-xl border border-border bg-surface p-6 transition-colors hover:border-border-strong sm:p-7">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="text-xl font-semibold text-text-primary">{cat.title}</h3>
                    <span className="font-mono text-xs text-text-muted">{total} tools</span>
                  </div>
                  <p className="mt-2 text-[15px] leading-6 text-text-secondary">{cat.blurb}</p>

                  <ul className="mt-6 flex flex-wrap gap-2">
                    {cat.packs.map((p) => (
                      <li
                        key={p.name}
                        className="flex items-center gap-2 rounded-md border border-border bg-background-soft px-3 py-1.5 text-[13px] text-text-primary"
                      >
                        {p.name}
                        <span className="font-mono text-[11px] text-text-muted">{p.tools}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            );
          })}
        </div>

        <Reveal className="mt-5">
          <div className="rounded-xl border border-border-strong bg-surface-raised p-6 sm:p-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-text-primary">Workflows, not just tools</h3>
                <p className="mt-2 max-w-[620px] text-[15px] leading-6 text-text-secondary">
                  Four tools chain several steps into one verified outcome. If a step fails, they
                  stop and tell you exactly which one.
                </p>
              </div>
              <a
                href={site.tools}
                className="inline-flex items-center gap-2 text-sm font-medium text-accent transition-colors hover:text-accent-bright"
              >
                Browse every tool
                <ArrowRight />
              </a>
            </div>

            <dl className="mt-7 grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {workflows.map((w) => (
                <div key={w.name} className="border-t border-border pt-4">
                  <dt className="font-mono text-[13px] text-code-text">{w.name}</dt>
                  <dd className="mt-1.5 text-sm leading-6 text-text-secondary">{w.text}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
