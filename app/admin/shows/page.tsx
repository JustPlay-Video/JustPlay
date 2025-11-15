import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function ShowsListPage() {
  const supabase = await createClient();

  const { data: shows } = await supabase
    .from('shows')
    .select('*, episodes(count)')
    .order('created_at', { ascending: false });

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Shows</h1>
        <Link
          href="/admin/shows/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500"
        >
          + Create Show
        </Link>
      </div>

      {!shows || shows.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            No shows yet. Create your first show to get started!
          </p>
          <Link
            href="/admin/shows/new"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500"
          >
            Create First Show
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {shows.map((show) => (
              <li key={show.id}>
                <Link
                  href={`/admin/shows/${show.id}`}
                  className="block hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-lg font-medium text-blue-600 dark:text-blue-400 truncate">
                          {show.title}
                        </p>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          {show.description || 'No description'}
                        </p>
                      </div>
                      <div className="ml-4 flex-shrink-0 flex items-center space-x-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {Array.isArray(show.episodes) ? show.episodes.length : 0} episodes
                        </div>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            show.status === 'published'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}
                        >
                          {show.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
