import { Skeleton } from "@/components/ui/Skeleton";

export default function GachaLoading() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-5">
          <Skeleton className="h-px w-10" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-px w-10" />
        </div>
        <Skeleton className="h-10 w-56 mb-3" />
        <Skeleton className="h-4 w-72" />
      </div>
      {/* Rates box */}
      <div className="bg-gradient-to-b from-[#111120] to-[#0c0c18] border border-[#1a1a2e] rounded-2xl p-5 mb-8">
        <Skeleton className="h-3 w-24 mb-4" />
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      </div>
      {/* Pull button area */}
      <div className="bg-gradient-to-b from-[#111120] to-[#0c0c18] border border-[#1a1a2e] rounded-2xl p-8 text-center">
        <Skeleton className="h-12 w-48 mx-auto rounded-xl" />
      </div>
    </div>
  );
}
