'use client';

import { useState, useEffect, use } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function EditShowPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const supabase = createClient();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    creator_name: '',
    genre: '',
    target_age_min: '',
    target_age_max: '',
    is_public_domain: false,
    status: 'draft',
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Load existing show data
  useEffect(() => {
    async function loadShow() {
      try {
        const { data: show, error: fetchError } = await supabase
          .from('shows')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;

        setFormData({
          title: show.title || '',
          description: show.description || '',
          creator_name: show.creator_name || '',
          genre: show.genre || '',
          target_age_min: show.target_age_min?.toString() || '',
          target_age_max: show.target_age_max?.toString() || '',
          is_public_domain: show.is_public_domain || false,
          status: show.status || 'draft',
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load show');
      } finally {
        setLoadingData(false);
      }
    }

    loadShow();
  }, [id, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: updateError } = await supabase
        .from('shows')
        .update({
          title: formData.title,
          description: formData.description,
          creator_name: formData.creator_name,
          genre: formData.genre,
          target_age_min: formData.target_age_min ? parseInt(formData.target_age_min) : null,
          target_age_max: formData.target_age_max ? parseInt(formData.target_age_max) : null,
          is_public_domain: formData.is_public_domain,
          status: formData.status,
        })
        .eq('id', id);

      if (updateError) throw updateError;

      router.push(`/admin/shows/${id}`);
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
      <h1 className="text-3xl font-bold mb-8">Edit Show</h1>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
              <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Title *
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
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-md border-0 py-2 px-3 text-gray-900 dark:text-white dark:bg-gray-700 ring-1 ring-inset ring-gray-300 dark:ring-gray-600"
            />
          </div>

          <div>
            <label htmlFor="creator_name" className="block text-sm font-medium mb-2">
              Creator Name
            </label>
            <input
              type="text"
              id="creator_name"
              value={formData.creator_name}
              onChange={(e) => setFormData({ ...formData, creator_name: e.target.value })}
              className="w-full rounded-md border-0 py-2 px-3 text-gray-900 dark:text-white dark:bg-gray-700 ring-1 ring-inset ring-gray-300 dark:ring-gray-600"
            />
          </div>

          <div>
            <label htmlFor="genre" className="block text-sm font-medium mb-2">
              Genre
            </label>
            <input
              type="text"
              id="genre"
              value={formData.genre}
              onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
              placeholder="e.g., Animation, Comedy, Adventure"
              className="w-full rounded-md border-0 py-2 px-3 text-gray-900 dark:text-white dark:bg-gray-700 ring-1 ring-inset ring-gray-300 dark:ring-gray-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="target_age_min" className="block text-sm font-medium mb-2">
                Target Age (Min)
              </label>
              <input
                type="number"
                id="target_age_min"
                min="0"
                max="100"
                value={formData.target_age_min}
                onChange={(e) => setFormData({ ...formData, target_age_min: e.target.value })}
                className="w-full rounded-md border-0 py-2 px-3 text-gray-900 dark:text-white dark:bg-gray-700 ring-1 ring-inset ring-gray-300 dark:ring-gray-600"
              />
            </div>

            <div>
              <label htmlFor="target_age_max" className="block text-sm font-medium mb-2">
                Target Age (Max)
              </label>
              <input
                type="number"
                id="target_age_max"
                min="0"
                max="100"
                value={formData.target_age_max}
                onChange={(e) => setFormData({ ...formData, target_age_max: e.target.value })}
                className="w-full rounded-md border-0 py-2 px-3 text-gray-900 dark:text-white dark:bg-gray-700 ring-1 ring-inset ring-gray-300 dark:ring-gray-600"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_public_domain"
              checked={formData.is_public_domain}
              onChange={(e) => setFormData({ ...formData, is_public_domain: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-blue-600"
            />
            <label htmlFor="is_public_domain" className="ml-2 block text-sm">
              Public Domain Content
            </label>
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
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
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
