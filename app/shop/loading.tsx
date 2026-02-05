import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";

export default function ShopLoading() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-5">
          <Skeleton className="h-px w-10" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-px w-10" />
        </div>
        <Skeleton className="h-10 w-48 mb-3" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonCard key={i} className="h-48" />
        ))}
      </div>
    </div>
  );
}
