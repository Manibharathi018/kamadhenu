import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <div className="space-y-4 gpu-accelerated">
      <Skeleton className="aspect-[4/5] w-full rounded-md bg-royal/5" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-1/3 bg-royal/5" />
        <Skeleton className="h-5 w-3/4 bg-royal/5" />
        <Skeleton className="h-4 w-1/2 bg-royal/5" />
      </div>
    </div>
  );
}
