import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import EpisodeCard from '@/components/EpisodeCard';
import ShowActions from '@/components/ShowActions';

interface ShowPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ShowPage({ params }: ShowPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch show data
  const { data: show, error: showError } = await supabase
    .from('shows')
    .select('*')
    .eq('id', id)
    .single();

  if (showError || !show) {
    notFound();
  }

  // Fetch all episodes for this show, ordered by season and episode number
  const { data: episodes } = await supabase
    .from('episodes')
    .select('*')
    .eq('show_id', id)
    .order('season_number', { ascending: true })
    .order('episode_number', { ascending: true });

  // Group episodes by season
  const episodesBySeason = (episodes || []).reduce((acc, episode) => {
    const season = episode.season_number;
    if (!acc[season]) {
      acc[season] = [];
    }
    acc[season].push(episode);
    return acc;
  }, {} as Record<number, typeof episodes>);

  const seasons = Object.keys(episodesBySeason)
    .map(Number)
    .sort((a, b) => a - b);

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
        {/* Show Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-8">
          {show.banner_url && (
            <div className="w-full h-64 bg-gray-200 dark:bg-gray-700">
              <img
                src={show.banner_url}
                alt={show.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-6">
            <div className="flex items-start gap-6">
              {show.thumbnail_url && (
                <img
                  src={show.thumbnail_url}
                  alt={show.title}
                  className="w-32 h-32 rounded-lg object-cover shadow-md"
                />
              )}

              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-2 dark:text-white">
                  {show.title}
                </h1>

                {show.description && (
                  <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                    {show.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                  {show.genre && (
                    <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full">
                      {show.genre}
                    </span>
                  )}
                  {show.creator_name && (
                    <span>Created by {show.creator_name}</span>
                  )}
                  {show.target_age_min && show.target_age_max && (
                    <span>
                      Ages {show.target_age_min}-{show.target_age_max}
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-4">
                  <ShowActions showId={show.id} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Episodes by Season */}
        {seasons.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              No episodes available yet
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {seasons.map((seasonNum) => (
              <div key={seasonNum}>
                <h2 className="text-2xl font-bold mb-4 dark:text-white">
                  Season {seasonNum}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {episodesBySeason[seasonNum].map((episode: any) => (
                    <EpisodeCard
                      key={episode.id}
                      episode={episode}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
