import { Skeleton, SkeletonRoot } from "@heroui/react";

export default function ProfileSkeleton() {
  return (
    <div className="min-h-dvh bg-gray-50/50 pb-12">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        {/* Banner Skeleton */}
        <Skeleton className="h-44 w-full rounded-3xl" />

        {/* Main Profile Card Skeleton */}
        <div className="relative z-10 -mt-16 rounded-3xl border border-gray-100 bg-white p-6 shadow-xl sm:p-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            {/* Left Info Skeleton */}
            <div className="flex-1 space-y-4">
              <div className="flex items-start gap-5">
                <Skeleton className="h-24 w-24 rounded-full shrink-0" />
                <div className="space-y-2 pt-2 flex-1">
                  <Skeleton className="h-7 w-48 rounded-lg" />
                  <Skeleton className="h-4 w-32 rounded-lg" />
                  <Skeleton className="h-6 w-28 rounded-full" />
                </div>
              </div>
              <Skeleton className="h-24 w-full rounded-2xl" />
            </div>

            {/* Right Stats Skeleton */}
            <div className="flex w-full flex-col gap-4 lg:w-[480px]">
              <div className="grid grid-cols-3 gap-3">
                <Skeleton className="h-20 rounded-2xl" />
                <Skeleton className="h-20 rounded-2xl" />
                <Skeleton className="h-20 rounded-2xl" />
              </div>
              <Skeleton className="h-14 rounded-2xl" />
              <Skeleton className="h-14 rounded-2xl" />
            </div>
          </div>
        </div>

        {/* Tabs Skeleton */}
        <Skeleton className="mt-6 h-14 w-full rounded-2xl" />

        {/* Posts Area Skeleton */}
        <div className="mt-6 space-y-4">
          <SkeletonRoot className="h-48 w-full rounded-3xl" />
        </div>
      </div>
    </div>
  );
}
