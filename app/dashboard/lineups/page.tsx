import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function LineupsPage() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user's lineups
  const { data: lineups } = await supabase
    .from('lineups')
    .select(`
      *,
      lineup_shows (
        id,
        position,
        shows (
          id,
          title,
          thumbnail_url
        )
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex items-center">
              <a href="/dashboard" className="text-2xl font-bold hover:text-blue-600">
                JustPlay
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/browse"
                className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600"
              >
                Browse
              </a>
              <a
                href="/dashboard"
                className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600"
              >
                Dashboard
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold dark:text-white mb-2">
              My Lineups
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your custom viewing schedules
            </p>
          </div>
          <Link
            href="/dashboard/lineups/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            + Create New Lineup
          </Link>
        </div>

        {/* Lineups Grid */}
        {!lineups || lineups.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
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
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No lineups yet. Create your first lineup to get started!
            </p>
            <Link
              href="/dashboard/lineups/new"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Create Your First Lineup
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lineups.map((lineup) => {
              const showCount = lineup.lineup_shows?.length || 0;
              const shows = lineup.lineup_shows
                ?.sort((a: any, b: any) => a.position - b.position)
                .slice(0, 3)
                .map((ls: any) => (Array.isArray(ls.shows) ? ls.shows[0] : ls.shows));

              return (
                <Link
                  key={lineup.id}
                  href={`/dashboard/lineups/${lineup.id}`}
                  className="group block"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-xl transition-all p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                          {lineup.name}
                        </h3>
                        {lineup.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {lineup.description}
                          </p>
                        )}
                      </div>
                      {!lineup.is_active && (
                        <span className="ml-2 px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                          Inactive
                        </span>
                      )}
                    </div>

                    <div className="mb-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {showCount} {showCount === 1 ? 'show' : 'shows'}
                      </div>
                    </div>

                    {/* Show Thumbnails */}
                    {shows && shows.length > 0 && (
                      <div className="flex -space-x-2 mb-4">
                        {shows.slice(0, 3).map((show: any, index: number) => (
                          <div
                            key={index}
                            className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-800 overflow-hidden"
                          >
                            {show?.thumbnail_url ? (
                              <img
                                src={show.thumbnail_url}
                                alt={show.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                ?
                              </div>
                            )}
                          </div>
                        ))}
                        {showCount > 3 && (
                          <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-medium">
                            +{showCount - 3}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        ▶ Play Lineup
                      </button>
                      <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors">
                        Manage
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
