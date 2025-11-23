/**
 * useFeatureFlag Hook
 *
 * Check if a feature is enabled and accessible to current user
 */

'use client';

import { useState, useEffect } from 'react';

interface FeatureFlag {
  id: string;
  flag_key: string;
  enabled: boolean;
  min_role: 'admin' | 'user' | 'public';
  description: string | null;
}

/**
 * Hook to check if a feature flag is enabled for the current user
 *
 * @param flagKey - The feature flag key to check
 * @param isAdmin - Whether the current user is an admin
 * @returns Object with { enabled, loading }
 *
 * @example
 * ```tsx
 * const { enabled, loading } = useFeatureFlag('autoplay_next_episode', user.isAdmin);
 *
 * if (enabled) {
 *   return <AutoplayControls />;
 * }
 * ```
 */
export function useFeatureFlag(flagKey: string, isAdmin: boolean = false) {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkFeatureFlag() {
      try {
        const response = await fetch('/api/feature-flags');

        if (!response.ok) {
          console.error('Failed to fetch feature flags');
          setEnabled(false);
          setLoading(false);
          return;
        }

        const { data: flags } = await response.json();
        const flag = flags.find((f: FeatureFlag) => f.flag_key === flagKey);

        if (!flag) {
          setEnabled(false);
          setLoading(false);
          return;
        }

        // Check if feature is enabled
        if (!flag.enabled) {
          setEnabled(false);
          setLoading(false);
          return;
        }

        // Check role requirements
        if (flag.min_role === 'public') {
          setEnabled(true);
        } else if (flag.min_role === 'user') {
          setEnabled(true); // Any authenticated user
        } else if (flag.min_role === 'admin') {
          setEnabled(isAdmin);
        } else {
          setEnabled(false);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error checking feature flag:', error);
        setEnabled(false);
        setLoading(false);
      }
    }

    checkFeatureFlag();
  }, [flagKey, isAdmin]);

  return { enabled, loading };
}

/**
 * Hook to get all feature flags
 *
 * @returns Object with { flags, loading }
 */
export function useAllFeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFlags() {
      try {
        const response = await fetch('/api/feature-flags');

        if (!response.ok) {
          console.error('Failed to fetch feature flags');
          setFlags([]);
          setLoading(false);
          return;
        }

        const { data } = await response.json();
        setFlags(data || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching feature flags:', error);
        setFlags([]);
        setLoading(false);
      }
    }

    fetchFlags();
  }, []);

  return { flags, loading };
}
