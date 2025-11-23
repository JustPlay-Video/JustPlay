/**
 * LineupManager Component
 *
 * Manage a lineup: add/remove shows, reorder, rename, delete
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Show {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  genre: string | null;
}

interface LineupShow {
  id: string;
  position: number;
  show_id: string;
  shows: Show;
}

interface Lineup {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  lineup_shows: LineupShow[];
}

interface LineupManagerProps {
  initialLineup: Lineup;
  availableShows: Show[];
}

export default function LineupManager({
  initialLineup,
  availableShows,
}: LineupManagerProps) {
  const router = useRouter();
  const [lineup, setLineup] = useState(initialLineup);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(lineup.name);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const shows = lineup.lineup_shows.map((ls) =>
    Array.isArray(ls.shows) ? ls.shows[0] : ls.shows
  );

  // Filter out shows already in lineup
  const showsToAdd = availableShows.filter(
    (show) => !lineup.lineup_shows.some((ls) => ls.show_id === show.id)
  );

  const handleRename = async () => {
    if (newName.trim() === lineup.name) {
      setEditingName(false);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/lineups/${lineup.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName.trim() }),
      });

      if (response.ok) {
        const { data } = await response.json();
        setLineup({ ...lineup, name: data.name });
        setEditingName(false);
      } else {
        alert('Failed to rename lineup');
      }
    } catch (error) {
      console.error('Error renaming lineup:', error);
      alert('Failed to rename lineup');
    }

    setLoading(false);
  };

  const handleAddShow = async (showId: string) => {
    setLoading(true);

    try {
      const response = await fetch(`/api/lineups/${lineup.id}/shows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ show_id: showId }),
      });

      if (response.ok) {
        // Refresh page to get updated lineup
        router.refresh();
        setShowAddModal(false);
      } else {
        const { error } = await response.json();
        alert(error || 'Failed to add show');
      }
    } catch (error) {
      console.error('Error adding show:', error);
      alert('Failed to add show');
    }

    setLoading(false);
  };

  const handleRemoveShow = async (showId: string) => {
    if (!confirm('Remove this show from the lineup?')) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/lineups/${lineup.id}/shows?show_id=${showId}`,
        {
          method: 'DELETE',
        }
      );

      if (response.ok) {
        router.refresh();
      } else {
        alert('Failed to remove show');
      }
    } catch (error) {
      console.error('Error removing show:', error);
      alert('Failed to remove show');
    }

    setLoading(false);
  };

  const handleDeleteLineup = async () => {
    if (!confirm(`Delete "${lineup.name}"? This cannot be undone.`)) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/lineups/${lineup.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/dashboard/lineups');
      } else {
        alert('Failed to delete lineup');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error deleting lineup:', error);
      alert('Failed to delete lineup');
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {editingName ? (
            <div className="flex items-center gap-3 flex-1">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="text-4xl font-bold bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 dark:text-white"
                disabled={loading}
              />
              <button
                onClick={handleRename}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setNewName(lineup.name);
                  setEditingName(false);
                }}
                disabled={loading}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold dark:text-white">{lineup.name}</h1>
              <button
                onClick={() => setEditingName(true)}
                className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors"
              >
                ✏️ Rename
              </button>
            </div>
          )}

          <button
            onClick={handleDeleteLineup}
            disabled={loading}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            🗑️ Delete Lineup
          </button>
        </div>

        <p className="text-gray-600 dark:text-gray-400">
          {shows.length} {shows.length === 1 ? 'show' : 'shows'} in lineup
        </p>
      </div>

      {/* Shows List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold dark:text-white">Shows</h2>
            <button
              onClick={() => setShowAddModal(true)}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              + Add Show
            </button>
          </div>
        </div>

        {shows.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No shows in this lineup yet
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Add Your First Show
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {shows.map((show, index) => (
              <div
                key={show.id}
                className="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="text-gray-500 dark:text-gray-400 font-medium w-8">
                  {index + 1}
                </div>

                {show.thumbnail_url && (
                  <img
                    src={show.thumbnail_url}
                    alt={show.title}
                    className="w-20 h-20 object-cover rounded"
                  />
                )}

                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {show.title}
                  </h3>
                  {show.genre && (
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {show.genre}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => handleRemoveShow(show.id)}
                  disabled={loading}
                  className="px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-700 dark:text-red-200 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Show Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold dark:text-white">Add Show to Lineup</h3>
            </div>

            <div className="p-6 overflow-y-auto max-h-64">
              {showsToAdd.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400">
                  All available shows are already in this lineup
                </p>
              ) : (
                <div className="space-y-2">
                  {showsToAdd.map((show) => (
                    <button
                      key={show.id}
                      onClick={() => handleAddShow(show.id)}
                      disabled={loading}
                      className="w-full p-4 flex items-center gap-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors text-left disabled:opacity-50"
                    >
                      {show.thumbnail_url && (
                        <img
                          src={show.thumbnail_url}
                          alt={show.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {show.title}
                        </div>
                        {show.genre && (
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {show.genre}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowAddModal(false)}
                disabled={loading}
                className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
