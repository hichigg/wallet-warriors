import { Skeleton, SkeletonRow } from "@/components/ui/Skeleton";

export default function LeaderboardLoading() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-5">
          <Skeleton className="h-px w-10" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-px w-10" />
        </div>
        <Skeleton className="h-10 w-56 mb-3" />
        <Skeleton className="h-4 w-72" />
      </div>
      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-28 rounded-xl" />
        ))}
      </div>
      {/* Table */}
      <div className="bg-gradient-to-b from-[#111120] to-[#0c0c18] border border-[#1a1a2e] rounded-2xl overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    </div>
  );
}
