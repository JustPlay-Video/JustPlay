import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function BrowsePage() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch all published shows
  const { data: shows } = await supabase
    .from('shows')
    .select('*')
    .eq('status', 'published')
    .order('title', { ascending: true });

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
                className="text-sm font-medium text-blue-600"
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold dark:text-white mb-2">
            Browse Shows
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover your next favorite show
          </p>
        </div>

        {/* Shows Grid */}
        {!shows || shows.length === 0 ? (
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
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <p className="text-gray-600 dark:text-gray-400">
              No shows available yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {shows.map((show) => (
              <Link
                key={show.id}
                href={`/shows/${show.id}`}
                className="group block"
              >
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all overflow-hidden">
                  {/* Show Thumbnail */}
                  <div className="relative aspect-video bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    {show.thumbnail_url ? (
                      <img
                        src={show.thumbnail_url}
                        alt={show.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg
                          className="h-16 w-16 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}

                    {/* Genre Badge */}
                    {show.genre && (
                      <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                        {show.genre}
                      </div>
                    )}
                  </div>

                  {/* Show Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 line-clamp-1">
                      {show.title}
                    </h3>

                    {show.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {show.description}
                      </p>
                    )}

                    {show.target_age_min && show.target_age_max && (
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                        Ages {show.target_age_min}-{show.target_age_max}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
