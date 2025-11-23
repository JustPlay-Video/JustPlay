import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import UserSettingsForm from '@/components/UserSettingsForm';

export default async function SettingsPage() {
  const supabase = await createClient();

  // Check authentication
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

  // Fetch all feature flags to determine what settings to show
  const { data: flags } = await supabase
    .from('feature_flags')
    .select('*');

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
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {profile?.full_name || user.email}
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold dark:text-white mb-2">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your video playback preferences
          </p>
        </div>

        <UserSettingsForm
          featureFlags={flags || []}
          isAdmin={profile?.is_admin || false}
        />
      </main>
    </div>
  );
}
