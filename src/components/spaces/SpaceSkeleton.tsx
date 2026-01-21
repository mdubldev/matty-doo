import { Skeleton } from '@/components/ui/skeleton';

export function SpaceSkeleton() {
  return (
    <div className="flex items-center gap-2 px-2 py-1.5">
      {/* Drag handle placeholder */}
      <div className="w-4 h-4 -ml-1" />
      {/* Color dot */}
      <Skeleton className="w-3 h-3 rounded-full shrink-0" />
      {/* Emoji */}
      <Skeleton className="w-5 h-5 rounded shrink-0" />
      {/* Name */}
      <Skeleton className="h-4 flex-1" />
    </div>
  );
}

export function SpaceListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-1">
      {Array.from({ length: count }).map((_, i) => (
        <SpaceSkeleton key={i} />
      ))}
    </div>
  );
}
