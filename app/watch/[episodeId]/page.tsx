import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import VideoPlayerSection from '@/components/VideoPlayerSection';

interface WatchPageProps {
  params: Promise<{
    episodeId: string;
  }>;
}

export default async function WatchPage({ params }: WatchPageProps) {
  const { episodeId } = await params;
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch episode with show information
  const { data: episode, error } = await supabase
    .from('episodes')
    .select(`
      *,
      shows (
        id,
        title,
        description,
        thumbnail_url
      )
    `)
    .eq('id', episodeId)
    .single();

  if (error || !episode) {
    notFound();
  }

  // Fetch watch history to resume playback
  const { data: watchHistory } = await supabase
    .from('watch_history')
    .select('*')
    .eq('profile_id', user.id)
    .eq('episode_id', episodeId)
    .maybeSingle();

  const startTime = watchHistory?.progress_seconds || 0;

  // Handle different video states
  const renderVideoPlayer = () => {
    // Video is still processing
    if (episode.status === 'processing') {
      return (
        <div className="w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white text-lg">Video is processing...</p>
            <p className="text-gray-400 text-sm mt-2">This usually takes a few minutes</p>
          </div>
        </div>
      );
    }

    // Video processing failed
    if (episode.status === 'error' || episode.status === 'failed') {
      return (
        <div className="w-full aspect-video bg-red-900 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-red-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-white text-lg">Video unavailable</p>
            <p className="text-gray-300 text-sm mt-2">There was an error processing this video</p>
          </div>
        </div>
      );
    }

    // No playback ID available
    if (!episode.mux_playback_id) {
      return (
        <div className="w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <p className="text-white text-lg">Video not ready</p>
            <p className="text-gray-400 text-sm mt-2">
              This episode hasn&apos;t been uploaded yet
            </p>
          </div>
        </div>
      );
    }

    // Video is ready - render player
    return (
      <VideoPlayerSection
        playbackId={episode.mux_playback_id}
        episodeId={episode.id}
        title={episode.title}
        thumbnailUrl={episode.thumbnail_url || undefined}
        durationSeconds={episode.duration_seconds}
        startTime={startTime}
      />
    );
  };

  const show = Array.isArray(episode.shows) ? episode.shows[0] : episode.shows;

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
      <main className="mx-auto max-w-6xl py-8 px-4 sm:px-6 lg:px-8">
        {/* Video Player */}
        <div className="mb-8">
          {renderVideoPlayer()}
        </div>

        {/* Episode Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h1 className="text-3xl font-bold mb-2 dark:text-white">
            {episode.title}
          </h1>

          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
            <a
              href={`/shows/${show?.id}`}
              className="hover:text-blue-600 font-medium"
            >
              {show?.title}
            </a>
            <span className="mx-2">•</span>
            <span>
              Season {episode.season_number} Episode {episode.episode_number}
            </span>
            <span className="mx-2">•</span>
            <span>
              {Math.floor(episode.duration_seconds / 60)} min
            </span>
          </div>

          {episode.description && (
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {episode.description}
            </p>
          )}
        </div>

        {/* More Episodes Section (Placeholder) */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4 dark:text-white">
            More Episodes from {show?.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Coming soon: Related episodes will appear here
          </p>
        </div>
      </main>
    </div>
  );
}
