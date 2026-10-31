import Reveal from "@/components/reveal";
import CopyCommand from "@/components/copy-command";
import { ArrowRight, GithubIcon } from "@/components/icons";
import { site } from "@/lib/site";

export default function FinalCta() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/2 h-[360px] w-[800px] -translate-x-1/2 rounded-full bg-accent/10 blur-[120px]"
      />
      <div className="relative mx-auto w-full max-w-[1200px] px-5 sm:px-8">
        <Reveal>
          <div className="rounded-2xl border border-border-strong bg-surface px-6 py-14 text-center sm:px-12 sm:py-16">
            <h2 className="mx-auto max-w-[720px] text-3xl font-semibold leading-[1.1] tracking-tight text-text-primary sm:text-[44px]">
              Give your agent hands.
            </h2>
            <p className="mx-auto mt-5 max-w-[560px] text-base leading-7 text-text-secondary sm:text-lg">
              Install it, connect your editor, and ask for the first thing on your list.
            </p>

            <div className="mx-auto mt-8 max-w-[460px]">
              <CopyCommand command={site.installCommand} className="text-left" />
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
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
                Star on GitHub
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
