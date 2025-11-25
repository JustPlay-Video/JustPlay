'use client';

import { useState, useEffect, use } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function EditEpisodePage({
  params,
}: {
  params: Promise<{ showId: string; episodeId: string }>;
}) {
  const { showId, episodeId } = use(params);
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    season_number: '1',
    episode_number: '1',
    duration_seconds: '',
    video_url: '',
    status: 'processing',
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Load existing episode data
  useEffect(() => {
    async function loadEpisode() {
      try {
        const { data: episode, error: fetchError } = await supabase
          .from('episodes')
          .select('*')
          .eq('id', episodeId)
          .single();

        if (fetchError) throw fetchError;

        setFormData({
          title: episode.title || '',
          description: episode.description || '',
          season_number: episode.season_number?.toString() || '1',
          episode_number: episode.episode_number?.toString() || '1',
          duration_seconds: episode.duration_seconds?.toString() || '',
          video_url: episode.video_url || '',
          status: episode.status || 'processing',
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load episode');
      } finally {
        setLoadingData(false);
      }
    }

    loadEpisode();
  }, [episodeId, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: updateError } = await supabase
        .from('episodes')
        .update({
          title: formData.title,
          description: formData.description,
          season_number: parseInt(formData.season_number),
          episode_number: parseInt(formData.episode_number),
          duration_seconds: parseInt(formData.duration_seconds),
          video_url: formData.video_url || null,
          status: formData.status,
        })
        .eq('id', episodeId);

      if (updateError) throw updateError;

      router.push(`/admin/shows/${showId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <h1 className="text-3xl font-bold mb-8">Edit Episode</h1>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
              <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Episode Title *
            </label>
            <input
              type="text"
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-md border-0 py-2 px-3 text-gray-900 dark:text-white dark:bg-gray-700 ring-1 ring-inset ring-gray-300 dark:ring-gray-600"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-md border-0 py-2 px-3 text-gray-900 dark:text-white dark:bg-gray-700 ring-1 ring-inset ring-gray-300 dark:ring-gray-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="season_number" className="block text-sm font-medium mb-2">
                Season Number *
              </label>
              <input
                type="number"
                id="season_number"
                min="1"
                required
                value={formData.season_number}
                onChange={(e) => setFormData({ ...formData, season_number: e.target.value })}
                className="w-full rounded-md border-0 py-2 px-3 text-gray-900 dark:text-white dark:bg-gray-700 ring-1 ring-inset ring-gray-300 dark:ring-gray-600"
              />
            </div>

            <div>
              <label htmlFor="episode_number" className="block text-sm font-medium mb-2">
                Episode Number *
              </label>
              <input
                type="number"
                id="episode_number"
                min="1"
                required
                value={formData.episode_number}
                onChange={(e) => setFormData({ ...formData, episode_number: e.target.value })}
                className="w-full rounded-md border-0 py-2 px-3 text-gray-900 dark:text-white dark:bg-gray-700 ring-1 ring-inset ring-gray-300 dark:ring-gray-600"
              />
            </div>
          </div>

          <div>
            <label htmlFor="duration_seconds" className="block text-sm font-medium mb-2">
              Duration (seconds) *
            </label>
            <input
              type="number"
              id="duration_seconds"
              min="1"
              required
              value={formData.duration_seconds}
              onChange={(e) => setFormData({ ...formData, duration_seconds: e.target.value })}
              placeholder="e.g., 660 for 11 minutes"
              className="w-full rounded-md border-0 py-2 px-3 text-gray-900 dark:text-white dark:bg-gray-700 ring-1 ring-inset ring-gray-300 dark:ring-gray-600"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Hint: 11 minutes = 660 seconds, 22 minutes = 1320 seconds
            </p>
          </div>

          <div>
            <label htmlFor="video_url" className="block text-sm font-medium mb-2">
              Video URL
            </label>
            <input
              type="url"
              id="video_url"
              value={formData.video_url}
              onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
              placeholder="https://example.com/video.mp4"
              className="w-full rounded-md border-0 py-2 px-3 text-gray-900 dark:text-white dark:bg-gray-700 ring-1 ring-inset ring-gray-300 dark:ring-gray-600"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Note: Mux videos use mux_playback_id, not video_url
            </p>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium mb-2">
              Status
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full rounded-md border-0 py-2 px-3 text-gray-900 dark:text-white dark:bg-gray-700 ring-1 ring-inset ring-gray-300 dark:ring-gray-600"
            >
              <option value="processing">Processing</option>
              <option value="ready">Ready</option>
              <option value="published">Published</option>
              <option value="error">Error</option>
            </select>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
