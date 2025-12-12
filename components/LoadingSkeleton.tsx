/**
 * Loading skeleton components for various content types
 */

export function ShowCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden animate-pulse">
      <div className="aspect-video bg-gray-200 dark:bg-gray-700" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
      </div>
    </div>
  );
}

export function EpisodeCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden animate-pulse">
      <div className="aspect-video bg-gray-200 dark:bg-gray-700" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
      </div>
    </div>
  );
}

export function LineupCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 animate-pulse">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-6" />
      <div className="grid grid-cols-4 gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="aspect-video bg-gray-200 dark:bg-gray-700 rounded" />
        ))}
      </div>
    </div>
  );
}
