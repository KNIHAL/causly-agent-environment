import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="px-5 pb-24 pt-[130px] sm:px-8">
        <article className="mx-auto max-w-[760px]">
          <p className="font-mono text-xs tracking-[0.2em] text-accent">CAUSLY SERVER</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-text-primary sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 text-sm text-text-muted">Last updated: {updated}</p>
          <div className="mt-12 space-y-10 text-[15px] leading-7 text-text-secondary">{children}</div>
        </article>
      </main>
      <Footer />
    </>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-text-primary">{title}</h2>
      <div className="mt-3 space-y-4">{children}</div>
    </section>
  );
}

export function LegalList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5 marker:text-text-dim">
      {items.map((i) => (
        <li key={i}>{i}</li>
      ))}
    </ul>
  );
}
