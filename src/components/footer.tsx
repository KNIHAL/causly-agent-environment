import Link from "next/link";
import { site } from "@/lib/site";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Capabilities", href: "/#capabilities" },
      { label: "How it works", href: "/#how-it-works" },
      { label: "Security", href: "/#security" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: site.docs },
      { label: "GitHub", href: site.github },
      { label: "npm", href: site.npm },
      { label: "Changelog", href: site.changelog },
      { label: "Roadmap", href: site.roadmap },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "MIT License", href: site.license },
    ],
  },
];

const linkClass =
  "w-fit text-sm text-text-muted transition-colors duration-200 hover:text-white";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-[#020708]">
      <div className="mx-auto w-full max-w-[1200px] px-5 py-14 sm:px-8 sm:py-16">
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="col-span-2 max-w-[320px] md:col-span-1">
            <Link href="/" className="inline-flex items-center" aria-label="Causly Server home">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Causly" className="h-auto w-[120px]" />
            </Link>
            <p className="mt-5 text-sm leading-6 text-text-muted">
              The open-source MCP server that turns any AI agent into your technical co-founder.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="font-mono text-[11px] font-semibold tracking-[0.18em] text-text-dim">
                {col.title.toUpperCase()}
              </h3>
              <ul className="mt-5 flex flex-col gap-3">
                {col.links.map((link) => {
                  const external = link.href.startsWith("http");
                  const internalPage = link.href === "/privacy" || link.href === "/terms";
                  return (
                    <li key={link.label}>
                      {external ? (
                        <a href={link.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                          {link.label}
                        </a>
                      ) : internalPage ? (
                        <Link href={link.href} className={linkClass}>
                          {link.label}
                        </Link>
                      ) : (
                        <a href={link.href} className={linkClass}>
                          {link.label}
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} Causly. Causly Server is MIT licensed.
          </p>
          <p className="text-xs text-text-dim">Built by Kumar Nihal.</p>
        </div>
      </div>
    </footer>
  );
}
