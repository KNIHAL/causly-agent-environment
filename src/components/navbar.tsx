"use client";

import Link from "next/link";
import { useState } from "react";
import { navItems, site } from "@/lib/site";
import { ArrowRight, GithubIcon } from "@/components/icons";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/85 backdrop-blur-xl">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-[70px] w-full max-w-[1200px] items-center justify-between px-5 sm:px-8"
      >
        <Link href="/" className="flex shrink-0 items-center" aria-label="Causly Server home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Causly" className="h-auto w-[120px] object-contain sm:w-[136px]" />
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-[14.5px] font-medium text-text-secondary transition-colors hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href={site.github}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 items-center gap-2 rounded-lg border border-border px-3.5 text-[13.5px] font-medium text-text-secondary transition-colors hover:border-border-strong hover:text-white"
          >
            <GithubIcon className="h-4 w-4" />
            GitHub
          </a>
          <a
            href={site.quickstart}
            className="flex h-10 items-center gap-2 rounded-lg bg-accent px-4 text-[13.5px] font-semibold text-[#031012] transition-colors hover:bg-accent-bright"
          >
            Get started
            <ArrowRight />
          </a>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-white lg:hidden"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            {isOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </nav>

      {isOpen ? (
        <div className="border-t border-border bg-background px-5 pb-6 pt-2 lg:hidden">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="block border-b border-border py-4 text-[15px] font-medium text-text-secondary hover:text-white"
            >
              {item.label}
            </a>
          ))}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <a
              href={site.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 items-center justify-center gap-2 rounded-lg border border-border-strong text-sm font-medium text-white"
            >
              <GithubIcon className="h-4 w-4" />
              GitHub
            </a>
            <a
              href={site.quickstart}
              className="flex h-11 items-center justify-center gap-2 rounded-lg bg-accent text-sm font-semibold text-[#031012]"
            >
              Get started
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
}
