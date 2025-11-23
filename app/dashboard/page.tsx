import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import EpisodeCard from '@/components/EpisodeCard';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Fetch continue watching (recent watch history, not completed)
  const { data: continueWatching } = await supabase
    .from('watch_history')
    .select(`
      *,
      episodes (
        *,
        shows (
          title
        )
      )
    `)
    .eq('profile_id', user.id)
    .eq('completed', false)
    .order('watched_at', { ascending: false })
    .limit(6);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <h1 className="text-2xl font-bold">JustPlay</h1>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {profile?.full_name || user.email}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold dark:text-white mb-2">
              Welcome back, {profile?.full_name || 'there'}!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Ready to watch something great?
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Link
              href="/browse"
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center mb-3">
                <svg
                  className="h-8 w-8 text-blue-600 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <h3 className="text-xl font-semibold dark:text-white">Browse Shows</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Discover new shows and episodes
              </p>
            </Link>

            <Link
              href="/dashboard/lineups"
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center mb-3">
                <svg
                  className="h-8 w-8 text-green-600 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
                <h3 className="text-xl font-semibold dark:text-white">My Lineups</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Manage your viewing schedules
              </p>
            </Link>

            <Link
              href="/dashboard/favorites"
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center mb-3">
                <svg
                  className="h-8 w-8 text-yellow-600 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
                <h3 className="text-xl font-semibold dark:text-white">Favorites</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Your favorite shows
              </p>
            </Link>
          </div>

          {/* Continue Watching Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
            <h3 className="text-2xl font-bold dark:text-white mb-4">
              Continue Watching
            </h3>
            {continueWatching && continueWatching.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {continueWatching.map((history) => {
                  const episode = Array.isArray(history.episodes) ? history.episodes[0] : history.episodes;
                  const show = episode?.shows ? (Array.isArray(episode.shows) ? episode.shows[0] : episode.shows) : null;
                  const progressPercent = episode ? (history.progress_seconds / episode.duration_seconds) * 100 : 0;

                  if (!episode) return null;

                  return (
                    <EpisodeCard
                      key={history.id}
                      episode={episode}
                      showTitle={show?.title}
                      progressPercent={progressPercent}
                    />
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">
                Episodes you start watching will appear here
              </p>
            )}
          </div>

          {/* Recently Added Section - Placeholder */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-2xl font-bold dark:text-white mb-4">
              Recently Added
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              New episodes will appear here (Coming soon)
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
