interface PageHeaderProps {
  tag: string;
  title: string;
  subtitle: string;
}

export function PageHeader({ tag, title, subtitle }: PageHeaderProps) {
  return (
    <div className="mb-12">
      {/* Tag line with decorative rules */}
      <div className="flex items-center gap-3 mb-5">
        <div className="h-px flex-1 max-w-[40px] bg-crunch/40" />
        <span className="font-mono text-[10px] text-crunch/70 tracking-[0.25em] uppercase">
          {tag}
        </span>
        <div className="h-px flex-1 max-w-[40px] bg-crunch/40" />
      </div>

      {/* Title */}
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-50 font-display tracking-tight leading-[0.95] mb-3">
        {title}
      </h1>

      {/* Subtitle */}
      <p className="text-[15px] text-slate-500 font-body max-w-lg leading-relaxed">
        {subtitle}
      </p>
    </div>
  );
}
