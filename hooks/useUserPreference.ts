/**
 * useUserPreference Hook
 *
 * Get and update user preferences
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

interface UserPreferences {
  autoplay_next_episode: boolean;
  thumbnail_preview: boolean;
  playback_speed: number;
  preferred_quality: string;
  default_volume: number;
  captions_enabled: boolean;
  preferred_caption_language: string;
  skip_intro_enabled: boolean;
  theater_mode: boolean;
}

/**
 * Hook to manage user preferences
 *
 * @returns Object with { preferences, loading, updatePreference }
 *
 * @example
 * ```tsx
 * const { preferences, loading, updatePreference } = useUserPreference();
 *
 * const handleToggle = async () => {
 *   await updatePreference({ autoplay_next_episode: !preferences.autoplay_next_episode });
 * };
 * ```
 */
export function useUserPreference() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPreferences() {
      try {
        const response = await fetch('/api/user/preferences');

        if (!response.ok) {
          console.error('Failed to fetch user preferences');
          setLoading(false);
          return;
        }

        const { data } = await response.json();
        setPreferences(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user preferences:', error);
        setLoading(false);
      }
    }

    fetchPreferences();
  }, []);

  const updatePreference = useCallback(
    async (updates: Partial<UserPreferences>) => {
      try {
        const response = await fetch('/api/user/preferences', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          console.error('Failed to update user preferences');
          return false;
        }

        const { data } = await response.json();
        setPreferences(data);
        return true;
      } catch (error) {
        console.error('Error updating user preferences:', error);
        return false;
      }
    },
    []
  );

  return { preferences, loading, updatePreference };
}
