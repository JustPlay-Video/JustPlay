import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import LineupManager from '@/components/LineupManager';

interface LineupPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function LineupPage({ params }: LineupPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch lineup with shows
  const { data: lineup, error } = await supabase
    .from('lineups')
    .select(`
      *,
      lineup_shows (
        id,
        position,
        show_id,
        shows (
          *
        )
      )
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !lineup) {
    notFound();
  }

  // Sort shows by position
  if (lineup.lineup_shows) {
    lineup.lineup_shows.sort((a: any, b: any) => a.position - b.position);
  }

  // Fetch all available shows for adding
  const { data: allShows } = await supabase
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
              <Link href="/dashboard" className="text-2xl font-bold hover:text-blue-600">
                JustPlay
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/lineups"
                className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600"
              >
                My Lineups
              </Link>
              <Link
                href="/dashboard"
                className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
        <LineupManager
          initialLineup={lineup}
          availableShows={allShows || []}
        />
      </main>
    </div>
  );
}
