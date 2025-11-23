/**
 * EpisodeCard Component
 *
 * Reusable card component for displaying episode information
 * with thumbnail, metadata, and play button.
 *
 * @component
 * @example
 * ```tsx
 * <EpisodeCard
 *   episode={episodeData}
 *   showTitle="Show Name"
 * />
 * ```
 */

'use client';

import Link from 'next/link';
import { Database } from '@/lib/types/database.types';
import AgeRatingBadge from './AgeRatingBadge';

type Episode = Database['public']['Tables']['episodes']['Row'] & {
  age_rating?: string | null;
};

interface EpisodeCardProps {
  /**
   * Episode data from database
   */
  episode: Episode;

  /**
   * Show title (optional, for display)
   */
  showTitle?: string;

  /**
   * Progress percentage (0-100, optional)
   */
  progressPercent?: number;
}

/**
 * EpisodeCard - Display episode with thumbnail and metadata
 *
 * Features:
 * - Thumbnail with play button overlay
 * - Episode metadata (title, season/episode, duration)
 * - Optional progress bar
 * - Links to watch page
 * - Hover effects
 *
 * @param {EpisodeCardProps} props - Component props
 */
export default function EpisodeCard({
  episode,
  showTitle,
  progressPercent,
}: EpisodeCardProps) {
  const durationMinutes = Math.floor(episode.duration_seconds / 60);

  return (
    <Link href={`/watch/${episode.id}`} className="group block">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden">
        {/* Thumbnail Container */}
        <div className="relative aspect-video bg-gray-200 dark:bg-gray-700 overflow-hidden">
          {episode.thumbnail_url ? (
            <img
              src={episode.thumbnail_url}
              alt={episode.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg
                className="h-16 w-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}

          {/* Play Button Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="bg-white rounded-full p-4 shadow-lg">
                <svg
                  className="h-8 w-8 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {progressPercent !== undefined && progressPercent > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-300 dark:bg-gray-600">
              <div
                className="h-full bg-blue-600"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}

          {/* Status Badge */}
          {episode.status === 'processing' && (
            <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
              Processing
            </div>
          )}
          {episode.status === 'error' && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
              Error
            </div>
          )}

          {/* Age Rating Badge */}
          {episode.age_rating && (
            <div className="absolute top-2 left-2">
              <AgeRatingBadge rating={episode.age_rating} size="sm" />
            </div>
          )}
        </div>

        {/* Episode Info */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
            {episode.title}
          </h3>

          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 space-x-2">
            {showTitle && (
              <>
                <span className="truncate">{showTitle}</span>
                <span>•</span>
              </>
            )}
            <span>
              S{episode.season_number}E{episode.episode_number}
            </span>
            <span>•</span>
            <span>{durationMinutes} min</span>
          </div>

          {episode.description && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {episode.description}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
