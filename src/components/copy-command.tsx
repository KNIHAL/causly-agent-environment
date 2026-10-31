"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon } from "@/components/icons";

export default function CopyCommand({
  command,
  className = "",
}: {
  command: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-xl border border-border-strong bg-code-background px-4 py-3 ${className}`}
    >
      <code className="overflow-x-auto whitespace-nowrap text-[13.5px] text-code-text sm:text-sm">
        <span className="select-none text-text-dim">$ </span>
        {command}
      </code>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy command"}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border text-text-secondary transition-colors hover:border-border-strong hover:text-white"
      >
        {copied ? <CheckIcon className="h-4 w-4 text-accent" /> : <CopyIcon />}
      </button>
    </div>
  );
}
