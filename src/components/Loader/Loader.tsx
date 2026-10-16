import { Skeleton } from "@heroui/react";

export default function PostSkeleton() {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      {/* User Info */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Skeleton className="h-12 w-12 shrink-0 rounded-full" />

          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32 rounded-md" />
            <Skeleton className="h-3 w-24 rounded-md" />
            <Skeleton className="h-3 w-36 rounded-md" />
          </div>
        </div>

        <Skeleton className="h-8 w-8 rounded-full" />
      </div>

      {/* Post Text */}
      <div className="my-5 space-y-3">
        <Skeleton className="h-4 w-full rounded-md" />
        <Skeleton className="h-4 w-11/12 rounded-md" />
        <Skeleton className="h-4 w-2/3 rounded-md" />
      </div>

      {/* Post Image */}
      <Skeleton className="mb-4 h-56 w-full rounded-xl" />

      {/* Post Actions */}
      <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
        <Skeleton className="h-4 w-12 rounded-md" />
        <Skeleton className="h-4 w-24 rounded-md" />
        <Skeleton className="h-4 w-20 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>

      {/* Top Comment */}
      <div className="mt-4 rounded-xl bg-gray-50 p-3">
        <Skeleton className="mb-3 h-3 w-24 rounded-md" />

        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
          <Skeleton className="h-4 flex-1 rounded-md" />
        </div>
      </div>
    </article>
  );
}
