import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

/**
 * RecentlyAdded component displays the latest published shows
 * Server component that fetches data from Supabase
 *
 * @component
 * @example
 * ```tsx
 * <RecentlyAdded />
 * ```
 */
export default async function RecentlyAdded() {
  const supabase = await createClient();

  const { data: shows } = await supabase
    .from('shows')
    .select('id, title, thumbnail_url, genre, target_age_min, target_age_max')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(6);

  if (!shows || shows.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Recently Added
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {shows.map(show => (
          <Link
            key={show.id}
            href={`/shows/${show.id}`}
            className="group"
          >
            <div className="aspect-video relative overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700">
              {show.thumbnail_url && (
                <img
                  src={show.thumbnail_url}
                  alt={show.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              )}
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white truncate">
              {show.title}
            </h3>
            {show.genre && (
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {show.genre}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
