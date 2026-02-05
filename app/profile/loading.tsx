import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";

export default function ProfileLoading() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-5">
          <Skeleton className="h-px w-10" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-px w-10" />
        </div>
        <Skeleton className="h-10 w-56 mb-3" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-b from-[#111120] to-[#0c0c18] border border-[#1a1a2e] rounded-2xl p-6">
            <div className="flex flex-col items-center">
              <Skeleton className="w-24 h-24 rounded-full mb-4" />
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </div>
        <div className="lg:col-span-2 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <SkeletonCard className="h-32" />
        </div>
      </div>
    </div>
  );
}
