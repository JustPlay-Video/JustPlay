import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import FeatureFlagsManager from '@/components/admin/FeatureFlagsManager';

export default async function AdminFeatureFlagsPage() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check admin status
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (!profile?.is_admin) {
    redirect('/dashboard');
  }

  // Fetch all feature flags
  const { data: flags } = await supabase
    .from('feature_flags')
    .select('*')
    .order('flag_key', { ascending: true });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex items-center space-x-8">
              <a href="/admin" className="text-2xl font-bold hover:text-blue-600">
                JustPlay Admin
              </a>
              <a
                href="/admin/settings/features"
                className="text-sm font-medium text-blue-600"
              >
                Feature Flags
              </a>
            </div>
            <div className="flex items-center space-x-4">
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
            Feature Flags Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Control feature rollout and access across the platform
          </p>
        </div>

        <FeatureFlagsManager initialFlags={flags || []} />
      </main>
    </div>
  );
}
