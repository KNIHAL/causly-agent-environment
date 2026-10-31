export default function SectionHeader({
  index,
  eyebrow,
  title,
  description,
}: {
  index: string;
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-[720px]">
      <p className="font-mono text-xs tracking-[0.18em] text-accent">
        {index} <span className="text-text-dim">/</span> {eyebrow.toUpperCase()}
      </p>
      <h2 className="mt-4 text-3xl font-semibold leading-[1.1] tracking-tight text-text-primary sm:text-[40px]">
        {title}
      </h2>
      {description ? (
        <p className="mt-5 text-base leading-7 text-text-secondary sm:text-lg sm:leading-8">
          {description}
        </p>
      ) : null}
    </div>
  );
}
