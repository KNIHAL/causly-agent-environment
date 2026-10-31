import Reveal from "@/components/reveal";
import SectionHeader from "@/components/section-header";

const faqs = [
  {
    q: "Is Causly Server free?",
    a: "Yes. It is open source under the MIT license. You pay only for the third-party services you choose to connect, such as GitHub or Groq, under their own terms.",
  },
  {
    q: "Does my data leave my machine?",
    a: "Causly has no cloud and no account. Your keys live in ~/.causly/.env and your pipeline, meetings and reminders are in a local SQLite file. Data goes only to services you configured, and only when a tool for that service runs. The status and doctor commands check the npm registry for a newer version at most once a day, and you can turn that off.",
  },
  {
    q: "Which agents and editors work with it?",
    a: "Any client that can start a stdio MCP server. The init command sets up Claude Desktop, Cursor and Windsurf, and prints a one-line command for Claude Code. It has also been tested with a plain JavaScript MCP client and LangChain (JS).",
  },
  {
    q: "Do I need API keys to start?",
    a: "No. Files, git, shell, Docker and Terraform work without any keys, and so do the pipeline, leads and research tools. Add keys later, one service at a time, with causly-server setup.",
  },
  {
    q: "Can an agent delete things or push code without asking me?",
    a: "High-risk and destructive tools are refused unless the call includes confirm: true, and a well-behaved agent asks you first. That gate is a safety measure, not a separate approval screen, so scope your keys and use the workspace limit for a harder boundary.",
  },
  {
    q: "Which operating systems are supported?",
    a: "Windows, macOS and Linux. The test suite runs on all three on every change, and Windows has had the most hands-on use. It needs Node.js 22.13 or newer.",
  },
];

export default function Faq() {
  return (
    <section id="faq" className="border-b border-border py-24 sm:py-28">
      <div className="mx-auto grid w-full max-w-[1200px] gap-12 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr]">
        <Reveal>
          <SectionHeader index="05" eyebrow="FAQ" title="Questions, answered." />
        </Reveal>

        <Reveal>
          <div className="divide-y divide-border rounded-xl border border-border bg-surface">
            {faqs.map((f) => (
              <details key={f.q} className="group p-5 sm:p-6">
                <summary className="flex cursor-pointer items-center justify-between gap-4 text-[16px] font-medium text-text-primary">
                  {f.q}
                  <span
                    aria-hidden
                    className="font-mono text-lg text-text-muted transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 text-[15px] leading-7 text-text-secondary">{f.a}</p>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
