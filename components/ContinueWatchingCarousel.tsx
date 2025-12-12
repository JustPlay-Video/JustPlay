import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

/**
 * ContinueWatchingCarousel shows in-progress episodes
 * Server component that fetches watch history from database
 */
export default async function ContinueWatchingCarousel() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Fetch watch history with progress < 100%
  const { data: watchHistory } = await supabase
    .from('watch_history')
    .select(`
      id,
      progress_seconds,
      watched_at,
      episode:episodes (
        id,
        title,
        thumbnail_url,
        duration_seconds,
        season_number,
        episode_number,
        show:shows (
          id,
          title
        )
      )
    `)
    .eq('profile_id', user.id)
    .eq('completed', false)
    .order('watched_at', { ascending: false })
    .limit(6);

  if (!watchHistory || watchHistory.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Continue Watching
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {watchHistory.map(wh => {
          // Handle Supabase nested query types
          const episode = Array.isArray(wh.episode) ? wh.episode[0] : wh.episode;
          if (!episode) return null;
          const progressPercent = (wh.progress_seconds / episode.duration_seconds) * 100;

          // Handle nested show type
          const show = Array.isArray(episode.show) ? episode.show[0] : episode.show;
          if (!show) return null;

          return (
            <Link
              key={wh.id}
              href={`/watch/${episode.id}`}
              className="group relative"
            >
              <div className="aspect-video relative overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700">
                {episode.thumbnail_url && (
                  <img
                    src={episode.thumbnail_url}
                    alt={episode.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600">
                  <div
                    className="h-full bg-blue-600"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white truncate">
                {episode.title}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                {show.title}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
