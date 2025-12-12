import { createClient } from '@/lib/supabase/server';
import SearchBar from '@/components/SearchBar';
import FilterPanel from '@/components/FilterPanel';
import RecentlyAdded from '@/components/RecentlyAdded';
import Link from 'next/link';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; genre?: string; minAge?: string; maxAge?: string; sortBy?: string }>;
}) {
  const supabase = await createClient();

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Await searchParams in Next.js 15
  const params = await searchParams;

  // Fetch genres for filter panel
  const { data: genreData } = await supabase
    .from('shows')
    .select('genre')
    .eq('status', 'published')
    .not('genre', 'is', null);

  const genres = [...new Set(genreData?.map(s => s.genre) || [])].sort();

  // Build query based on search params
  let query = supabase
    .from('shows')
    .select('id, title, description, thumbnail_url, genre, target_age_min, target_age_max, created_at')
    .eq('status', 'published');

  if (params.q) {
    query = query.or(`title.ilike.%${params.q}%,description.ilike.%${params.q}%`);
  }

  if (params.genre && params.genre !== 'all') {
    query = query.eq('genre', params.genre);
  }

  if (params.minAge) {
    query = query.gte('target_age_min', parseInt(params.minAge));
  }

  if (params.maxAge) {
    query = query.lte('target_age_max', parseInt(params.maxAge));
  }

  // Sorting
  const sortBy = params.sortBy || 'newest';
  switch (sortBy) {
    case 'title':
      query = query.order('title', { ascending: true });
      break;
    case 'popular':
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false });
  }

  const { data: shows } = await query;

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
                className="text-sm font-medium text-blue-600 dark:text-blue-400"
              >
                Browse
              </Link>
              <Link
                href="/dashboard"
                className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Browse Shows
        </h1>

        {/* Recently Added (only show when no filters) */}
        {!params.q && !params.genre && !params.minAge && !params.maxAge && (
          <Suspense fallback={<div className="mb-12 h-48 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />}>
            <RecentlyAdded />
          </Suspense>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="mb-6 lg:hidden">
              <SearchBar />
            </div>
            <FilterPanel genres={genres} />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="mb-6 hidden lg:block">
              <SearchBar />
            </div>

            {/* Results */}
            {shows && shows.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {shows.map(show => (
                  <Link
                    key={show.id}
                    href={`/shows/${show.id}`}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden group"
                  >
                    <div className="aspect-video relative bg-gray-200 dark:bg-gray-700 overflow-hidden">
                      {show.thumbnail_url ? (
                        <img
                          src={show.thumbnail_url}
                          alt={show.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
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
                      {show.genre && (
                        <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                          {show.genre}
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {show.title}
                      </h3>
                      {show.genre && (
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full mb-2">
                          {show.genre}
                        </span>
                      )}
                      {show.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {show.description}
                        </p>
                      )}
                      {(show.target_age_min || show.target_age_max) && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                          Ages {show.target_age_min || 0}-{show.target_age_max || '12+'}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
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
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  No shows found matching your criteria
                </p>
                <Link
                  href="/browse"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Clear filters
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
