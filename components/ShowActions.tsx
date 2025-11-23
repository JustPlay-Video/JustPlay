/**
 * ShowActions Component
 *
 * Favorite and rating buttons for shows
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Lineup {
  id: string;
  name: string;
  lineup_shows: any[];
}

interface ShowActionsProps {
  showId: string;
}

export default function ShowActions({ showId }: ShowActionsProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentRating, setCurrentRating] = useState<'dislike' | 'like' | 'love' | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLineupModal, setShowLineupModal] = useState(false);
  const [lineups, setLineups] = useState<Lineup[]>([]);
  const [addingToLineup, setAddingToLineup] = useState(false);

  useEffect(() => {
    async function fetchStatus() {
      try {
        // Fetch favorite status
        const favResponse = await fetch('/api/favorites');
        if (favResponse.ok) {
          const { data: favorites } = await favResponse.json();
          const isFav = favorites.some((f: any) => f.show_id === showId);
          setIsFavorite(isFav);
        }

        // Fetch rating
        const ratingResponse = await fetch(`/api/ratings?show_id=${showId}`);
        if (ratingResponse.ok) {
          const { data: rating } = await ratingResponse.json();
          setCurrentRating(rating?.rating || null);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching show status:', error);
        setLoading(false);
      }
    }

    fetchStatus();
  }, [showId]);

  const handleOpenLineupModal = async () => {
    setShowLineupModal(true);

    // Fetch user's lineups
    try {
      const response = await fetch('/api/lineups');
      if (response.ok) {
        const { data } = await response.json();
        setLineups(data || []);
      }
    } catch (error) {
      console.error('Error fetching lineups:', error);
    }
  };

  const handleAddToLineup = async (lineupId: string) => {
    setAddingToLineup(true);

    try {
      const response = await fetch(`/api/lineups/${lineupId}/shows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ show_id: showId }),
      });

      if (response.ok) {
        alert('Show added to lineup!');
        setShowLineupModal(false);
      } else {
        const { error } = await response.json();
        alert(error || 'Failed to add show to lineup');
      }
    } catch (error) {
      console.error('Error adding to lineup:', error);
      alert('Failed to add show to lineup');
    }

    setAddingToLineup(false);
  };

  const handleToggleFavorite = async () => {
    try {
      if (isFavorite) {
        // Remove favorite
        const response = await fetch(`/api/favorites?show_id=${showId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setIsFavorite(false);
        }
      } else {
        // Add favorite
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ show_id: showId }),
        });

        if (response.ok) {
          setIsFavorite(true);
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleRating = async (rating: 'dislike' | 'like' | 'love') => {
    try {
      if (currentRating === rating) {
        // Remove rating if clicking the same one
        const response = await fetch(`/api/ratings?show_id=${showId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setCurrentRating(null);
        }
      } else {
        // Add or update rating
        const response = await fetch('/api/ratings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            show_id: showId,
            rating,
          }),
        });

        if (response.ok) {
          setCurrentRating(rating);
        }
      }
    } catch (error) {
      console.error('Error updating rating:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex gap-3">
        <div className="bg-gray-200 dark:bg-gray-700 px-6 py-2 rounded-lg animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 flex-wrap">
      {/* Favorite Button */}
      <button
        onClick={handleToggleFavorite}
        className={`px-6 py-2 rounded-lg font-medium transition-colors ${
          isFavorite
            ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
            : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200'
        }`}
      >
        ⭐ {isFavorite ? 'Favorited' : 'Favorite'}
      </button>

      {/* Add to Lineup Button */}
      <button
        onClick={handleOpenLineupModal}
        className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-6 py-2 rounded-lg font-medium transition-colors"
      >
        + Add to Lineup
      </button>

      {/* Rating Buttons */}
      <div className="flex gap-2 ml-auto">
        <button
          onClick={() => handleRating('dislike')}
          className={`px-4 py-2 rounded-lg transition-all ${
            currentRating === 'dislike'
              ? 'bg-red-500 text-white scale-110'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          title="Dislike"
        >
          👎
        </button>
        <button
          onClick={() => handleRating('like')}
          className={`px-4 py-2 rounded-lg transition-all ${
            currentRating === 'like'
              ? 'bg-blue-500 text-white scale-110'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          title="Like"
        >
          👍
        </button>
        <button
          onClick={() => handleRating('love')}
          className={`px-4 py-2 rounded-lg transition-all ${
            currentRating === 'love'
              ? 'bg-pink-500 text-white scale-110'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          title="Love"
        >
          💙
        </button>
      </div>

      {/* Lineup Selection Modal */}
      {showLineupModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => !addingToLineup && setShowLineupModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold dark:text-white">
                Add to Lineup
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Select a lineup to add this show
              </p>
            </div>

            <div className="p-6 max-h-96 overflow-y-auto">
              {lineups.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    You don&apos;t have any lineups yet
                  </p>
                  <Link
                    href="/dashboard/lineups/new"
                    className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Create Your First Lineup
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {lineups.map((lineup) => (
                    <button
                      key={lineup.id}
                      onClick={() => handleAddToLineup(lineup.id)}
                      disabled={addingToLineup}
                      className="w-full p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {lineup.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {lineup.lineup_shows?.length || 0} shows
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowLineupModal(false)}
                disabled={addingToLineup}
                className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
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
