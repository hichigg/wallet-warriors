interface PageHeaderProps {
  tag: string;
  title: string;
  subtitle: string;
}

export function PageHeader({ tag, title, subtitle }: PageHeaderProps) {
  return (
    <div className="mb-10">
      {/* Category tag */}
      <div className="inline-block px-3 py-1 bg-crunch-subtle border border-crunch-border/50 rounded-md mb-4">
        <span className="font-mono text-[10px] text-crunch tracking-[0.15em] uppercase">
          {tag}
        </span>
      </div>

      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-extrabold text-slate-100 font-display tracking-tight mb-2">
        {title}
      </h1>

      {/* Subtitle */}
      <p className="text-[15px] text-slate-500 font-body">{subtitle}</p>
    </div>
  );
}
