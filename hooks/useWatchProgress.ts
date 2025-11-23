/**
 * useWatchProgress Hook
 *
 * Client-side hook for tracking video playback progress
 * Debounces API calls to avoid excessive requests
 */

'use client';

import { useCallback, useRef } from 'react';

interface UseWatchProgressOptions {
  episodeId: string;
  durationSeconds: number;
  lineupId?: string | null;
  childProfileId?: string | null;
}

/**
 * Hook for tracking and saving video watch progress
 *
 * @param options - Configuration options
 * @returns Object with saveProgress function
 *
 * @example
 * ```tsx
 * const { saveProgress } = useWatchProgress({
 *   episodeId: 'abc123',
 *   durationSeconds: 1440,
 * });
 *
 * <MuxPlayer
 *   onTimeUpdate={(time) => saveProgress(time)}
 * />
 * ```
 */
export function useWatchProgress(options: UseWatchProgressOptions) {
  const { episodeId, durationSeconds, lineupId, childProfileId } = options;
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedTimeRef = useRef<number>(0);

  /**
   * Save watch progress to database
   * Debounced to avoid excessive API calls (saves every 10 seconds)
   */
  const saveProgress = useCallback(
    (currentTime: number) => {
      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Only save if progress has changed significantly (10 seconds)
      const timeDiff = Math.abs(currentTime - lastSavedTimeRef.current);
      if (timeDiff < 10 && currentTime < durationSeconds * 0.9) {
        return;
      }

      // Debounce the API call
      debounceTimerRef.current = setTimeout(async () => {
        try {
          const response = await fetch('/api/watch-history', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              episode_id: episodeId,
              progress_seconds: Math.floor(currentTime),
              duration_seconds: durationSeconds,
              lineup_id: lineupId,
              child_profile_id: childProfileId,
            }),
          });

          if (!response.ok) {
            console.error('Failed to save watch progress');
          } else {
            lastSavedTimeRef.current = currentTime;
          }
        } catch (error) {
          console.error('Error saving watch progress:', error);
        }
      }, 2000); // Wait 2 seconds before saving
    },
    [episodeId, durationSeconds, lineupId, childProfileId]
  );

  return { saveProgress };
}
