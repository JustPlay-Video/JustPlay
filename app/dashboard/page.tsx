import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ContinueWatchingCarousel from '@/components/ContinueWatchingCarousel';
import Link from 'next/link';
import { Suspense } from 'react';
import { LineupCardSkeleton } from '@/components/LoadingSkeleton';

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Fetch user's lineups
  const { data: lineups } = await supabase
    .from('lineups')
    .select(`
      id,
      name,
      description,
      lineup_shows (
        show:shows (
          thumbnail_url
        )
      )
    `)
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false })
    .limit(3);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-2xl font-bold hover:text-blue-600 dark:text-white dark:hover:text-blue-400">
                JustPlay
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/browse"
                className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              >
                Browse
              </Link>
              <Link
                href="/dashboard/lineups"
                className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              >
                Lineups
              </Link>
              <Link
                href="/dashboard/settings"
                className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              >
                Settings
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          My Dashboard
        </h1>

        {/* Continue Watching */}
        <Suspense fallback={<div className="mb-12 h-48 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />}>
          <ContinueWatchingCarousel />
        </Suspense>

        {/* My Lineups */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              My Lineups
            </h2>
            <Link
              href="/dashboard/lineups/new"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Lineup
            </Link>
          </div>

          {lineups && lineups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {lineups.map(lineup => (
                <Link
                  key={lineup.id}
                  href={`/dashboard/lineups/${lineup.id}`}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {lineup.name}
                  </h3>
                  {lineup.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {lineup.description}
                    </p>
                  )}
                  <div className="grid grid-cols-4 gap-2">
                    {lineup.lineup_shows.slice(0, 4).map((ls: any, i: number) => (
                      <div key={i} className="aspect-video bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                        {ls.show.thumbnail_url && (
                          <img
                            src={ls.show.thumbnail_url}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    {lineup.lineup_shows.length} shows
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You haven&apos;t created any lineups yet
              </p>
              <Link
                href="/dashboard/lineups/new"
                className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Your First Lineup
              </Link>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/browse"
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Browse Shows
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Discover new cartoons to add to your lineups
            </p>
          </Link>

          <Link
            href="/dashboard/favorites"
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              My Favorites
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              View all your favorited shows
            </p>
          </Link>

          <Link
            href="/dashboard/profiles"
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Parental Controls
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage child profiles and time limits
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
