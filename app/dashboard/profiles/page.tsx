import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ChildProfileManager from '@/components/ChildProfileManager';
import Link from 'next/link';

export default async function ProfilesPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Fetch child profiles
  const { data: profiles } = await supabase
    .from('child_profiles')
    .select('*')
    .eq('parent_id', user.id)
    .order('created_at', { ascending: true });

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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Parental Controls
        </h1>

        <ChildProfileManager profiles={profiles || []} />
      </div>
    </div>
  );
}
