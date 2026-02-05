export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-[#1a1a2e]/60 ${className}`} />
  );
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`bg-gradient-to-b from-[#111120] to-[#0c0c18] border border-[#1a1a2e] rounded-2xl p-6 ${className}`}>
      <Skeleton className="h-3 w-24 mb-4" />
      <Skeleton className="h-8 w-32 mb-2" />
      <Skeleton className="h-2 w-20" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-5 py-4 border-b border-[#1a1a2e]">
      <Skeleton className="w-8 h-8 rounded-lg" />
      <div className="flex-1">
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-2 w-24" />
      </div>
      <Skeleton className="h-6 w-16 rounded-md" />
    </div>
  );
}

export function PageSkeleton({ cards = 4, rows = 0 }: { cards?: number; rows?: number }) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      {/* Header skeleton */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-5">
          <Skeleton className="h-px w-10" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-px w-10" />
        </div>
        <Skeleton className="h-10 w-64 mb-3" />
        <Skeleton className="h-4 w-80" />
      </div>

      {/* Card grid */}
      {cards > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: cards }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Row list */}
      {rows > 0 && (
        <div className="bg-gradient-to-b from-[#111120] to-[#0c0c18] border border-[#1a1a2e] rounded-2xl overflow-hidden">
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      )}
    </div>
  );
}
