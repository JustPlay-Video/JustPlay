import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import DraggableLineupList from '@/components/DraggableLineupList';
import NextEpisodeCard from '@/components/NextEpisodeCard';
import RotationPreview from '@/components/RotationPreview';
import Link from 'next/link';

interface LineupPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function LineupDetailPage({ params }: LineupPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Fetch user's profile to get profile_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single();

  if (!profile) {
    redirect('/login');
  }

  // Fetch lineup with shows
  const { data: lineup, error } = await supabase
    .from('lineups')
    .select(`
      id,
      name,
      description,
      is_active,
      lineup_shows (
        id,
        position,
        show:shows (
          id,
          title,
          thumbnail_url
        )
      )
    `)
    .eq('id', id)
    .eq('profile_id', profile.id)
    .single();

  if (error || !lineup) {
    notFound();
  }

  // Transform shows with position
  const shows = lineup.lineup_shows
    .sort((a: any, b: any) => a.position - b.position)
    .map((ls: any) => ({
      id: ls.show.id,
      title: ls.show.title,
      thumbnail_url: ls.show.thumbnail_url,
      position: ls.position,
    }));

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
                href="/dashboard/lineups"
                className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              >
                My Lineups
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
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/lineups"
            className="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block"
          >
            ← Back to Lineups
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {lineup.name}
              </h1>
              {lineup.description && (
                <p className="text-gray-600 dark:text-gray-400">
                  {lineup.description}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Show Rotation Order
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Drag shows to reorder. Your lineup plays one episode from each show in order (Round 1), then repeats with the next episodes (Round 2), and so on.
              </p>
            </div>

            {shows.length > 0 ? (
              <DraggableLineupList
                shows={shows}
                lineupId={id}
              />
            ) : (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  No shows in this lineup yet
                </p>
                <Link
                  href="/browse"
                  className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Browse Shows
                </Link>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <NextEpisodeCard lineupId={id} />
            <RotationPreview shows={shows} />
          </div>
        </div>
      </div>
    </div>
  );
}
