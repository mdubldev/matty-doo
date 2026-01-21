import { Skeleton } from '@/components/ui/skeleton';

export function TodoSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      {/* Drag handle placeholder */}
      <div className="w-5 -ml-1" />
      {/* Checkbox */}
      <Skeleton className="h-4 w-4 rounded shrink-0" />
      {/* Title */}
      <Skeleton className="h-4 flex-1" />
    </div>
  );
}

export function TodoListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-1">
      {Array.from({ length: count }).map((_, i) => (
        <TodoSkeleton key={i} />
      ))}
    </div>
  );
}
