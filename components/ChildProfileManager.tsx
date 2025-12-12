'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ChildProfile {
  id: string;
  name: string;
  avatar_url: string | null;
  birth_year: number | null;
  max_daily_minutes: number | null;
}

interface ChildProfileManagerProps {
  profiles: ChildProfile[];
}

export default function ChildProfileManager({ profiles: initialProfiles }: ChildProfileManagerProps) {
  const router = useRouter();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    birth_year: new Date().getFullYear() - 6,
    max_daily_minutes: 120,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/profiles/children', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const { error } = await response.json();
        setError(error || 'Failed to create profile');
        return;
      }

      router.refresh();
      setShowAddForm(false);
      setFormData({ name: '', birth_year: new Date().getFullYear() - 6, max_daily_minutes: 120 });
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (profileId: string) => {
    if (!confirm('Are you sure you want to delete this profile?')) {
      return;
    }

    try {
      const response = await fetch(`/api/profiles/children/${profileId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        alert('Failed to delete profile');
        return;
      }

      router.refresh();
    } catch (err) {
      alert('An error occurred');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Child Profiles
        </h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add Child Profile
        </button>
      </div>

      {/* Add Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Add Child Profile
            </h3>

            {error && (
              <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full rounded-md border-0 py-2 px-3 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Birth Year
                </label>
                <input
                  type="number"
                  value={formData.birth_year}
                  onChange={(e) => setFormData(prev => ({ ...prev, birth_year: parseInt(e.target.value) }))}
                  min={2000}
                  max={new Date().getFullYear()}
                  className="w-full rounded-md border-0 py-2 px-3 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Daily Time Limit (minutes)
                </label>
                <input
                  type="number"
                  value={formData.max_daily_minutes}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_daily_minutes: parseInt(e.target.value) }))}
                  min={0}
                  max={480}
                  className="w-full rounded-md border-0 py-2 px-3 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Set to 0 for unlimited
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialProfiles.map(profile => {
          const age = new Date().getFullYear() - (profile.birth_year || 0);

          return (
            <div
              key={profile.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                  {profile.name[0].toUpperCase()}
                </div>
                <button
                  onClick={() => handleDelete(profile.id)}
                  className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {profile.name}
              </h3>

              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <p>Age: {age} years</p>
                {profile.max_daily_minutes && profile.max_daily_minutes > 0 ? (
                  <p>Daily limit: {profile.max_daily_minutes} minutes</p>
                ) : (
                  <p>No daily limit</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {initialProfiles.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No child profiles yet
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Your First Child Profile
          </button>
        </div>
      )}
    </div>
  );
}
