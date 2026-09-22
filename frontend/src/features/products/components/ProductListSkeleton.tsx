/**
 * ProductListSkeleton Component
 * Loading skeleton cho ProductList
 */

export function ProductListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
        >
          {/* Image Skeleton */}
          <div className="aspect-square animate-pulse bg-gray-200" />

          {/* Content Skeleton */}
          <div className="p-4">
            <div className="h-6 w-3/4 animate-pulse rounded bg-gray-200" />
            <div className="mt-2 h-4 w-full animate-pulse rounded bg-gray-200" />
            <div className="mt-1 h-4 w-2/3 animate-pulse rounded bg-gray-200" />

            <div className="mt-4 flex items-center justify-between">
              <div className="h-8 w-24 animate-pulse rounded bg-gray-200" />
              <div className="h-6 w-16 animate-pulse rounded-full bg-gray-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
