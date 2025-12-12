'use client';

interface Show {
  id: string;
  title: string;
  episode_count?: number;
}

interface RotationPreviewProps {
  shows: Show[];
}

/**
 * RotationPreview component displays the round-robin rotation order
 * Shows how episodes will be played in the first round
 *
 * @component
 * @param {Show[]} shows - Array of shows in lineup order
 */
export default function RotationPreview({ shows }: RotationPreviewProps) {
  if (shows.length === 0) {
    return null;
  }

  // Generate preview of first round
  const previewRound = shows.map((show, index) => ({
    showTitle: show.title,
    episodeNum: 1,
    position: index + 1,
  }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Rotation Preview (Round 1)
      </h3>

      <div className="space-y-2">
        {previewRound.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {item.showTitle}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Episode {item.episodeNum}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-xs text-blue-800 dark:text-blue-300">
          After all shows play their Episode 1, Round 2 will start with Episode 2 from each show.
        </p>
      </div>
    </div>
  );
}
