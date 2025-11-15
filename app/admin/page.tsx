import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Get counts
  const { count: showsCount } = await supabase
    .from('shows')
    .select('*', { count: 'exact', head: true });

  const { count: episodesCount } = await supabase
    .from('episodes')
    .select('*', { count: 'exact', head: true });

  const { count: usersCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  return (
    <div className="px-4 py-6 sm:px-0">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
              Total Shows
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
              {showsCount ?? 0}
            </dd>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
              Total Episodes
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
              {episodesCount ?? 0}
            </dd>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
              Total Users
            </dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">
              {usersCount ?? 0}
            </dd>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="space-y-3">
          <Link
            href="/admin/shows/new"
            className="block w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 text-center"
          >
            + Create New Show
          </Link>
        </div>
      </div>

      <div className="mt-8 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Getting Started</h2>
        <div className="prose dark:prose-invert max-w-none">
          <h3 className="text-lg font-medium">Phase 1: Add Content</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
            <li>Create shows (click &quot;Create New Show&quot; above)</li>
            <li>Add episodes to shows</li>
            <li>Upload videos (coming soon: Cloudflare Stream/Mux integration)</li>
            <li>Publish shows to make them visible to users</li>
          </ol>

          <h3 className="text-lg font-medium mt-6">Next Steps</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
            <li>Video upload and hosting (Cloudflare Stream or Mux)</li>
            <li>Public browse catalog page</li>
            <li>Lineup builder for users</li>
            <li>Video player implementation</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
