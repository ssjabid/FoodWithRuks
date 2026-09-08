import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn("animate-pulse rounded-[var(--radius-sm)] bg-[var(--color-secondary)]", className)} />;
}

export function RecipeCardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-[5/4] w-full rounded-[var(--radius-md)]" />
      <div className="pt-3 space-y-2.5">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
}
