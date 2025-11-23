/**
 * FeatureFlagsManager Component
 *
 * Admin interface for managing feature flags
 */

'use client';

import { useState } from 'react';

interface FeatureFlag {
  id: string;
  flag_key: string;
  enabled: boolean;
  min_role: 'admin' | 'user' | 'public';
  description: string | null;
}

interface FeatureFlagsManagerProps {
  initialFlags: FeatureFlag[];
}

export default function FeatureFlagsManager({
  initialFlags,
}: FeatureFlagsManagerProps) {
  const [flags, setFlags] = useState<FeatureFlag[]>(initialFlags);
  const [updating, setUpdating] = useState<string | null>(null);

  const handleToggleEnabled = async (flagKey: string, currentlyEnabled: boolean) => {
    setUpdating(flagKey);

    try {
      const response = await fetch('/api/feature-flags', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          flag_key: flagKey,
          enabled: !currentlyEnabled,
        }),
      });

      if (!response.ok) {
        alert('Failed to update feature flag');
        setUpdating(null);
        return;
      }

      const { data } = await response.json();

      // Update local state
      setFlags(
        flags.map((flag) =>
          flag.flag_key === flagKey ? { ...flag, enabled: data.enabled } : flag
        )
      );
    } catch (error) {
      console.error('Error updating feature flag:', error);
      alert('Failed to update feature flag');
    }

    setUpdating(null);
  };

  const handleChangeRole = async (flagKey: string, newRole: string) => {
    setUpdating(flagKey);

    try {
      const response = await fetch('/api/feature-flags', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          flag_key: flagKey,
          min_role: newRole,
        }),
      });

      if (!response.ok) {
        alert('Failed to update feature flag');
        setUpdating(null);
        return;
      }

      const { data } = await response.json();

      // Update local state
      setFlags(
        flags.map((flag) =>
          flag.flag_key === flagKey ? { ...flag, min_role: data.min_role } : flag
        )
      );
    } catch (error) {
      console.error('Error updating feature flag:', error);
      alert('Failed to update feature flag');
    }

    setUpdating(null);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Feature
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Description
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Min Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {flags.map((flag) => (
            <tr key={flag.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {flag.flag_key}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {flag.description || 'No description'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    flag.enabled
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}
                >
                  {flag.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <select
                  value={flag.min_role}
                  onChange={(e) => handleChangeRole(flag.flag_key, e.target.value)}
                  disabled={updating === flag.flag_key}
                  className="text-sm border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                >
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                  <option value="public">Public</option>
                </select>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <button
                  onClick={() => handleToggleEnabled(flag.flag_key, flag.enabled)}
                  disabled={updating === flag.flag_key}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    flag.enabled
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {updating === flag.flag_key
                    ? 'Updating...'
                    : flag.enabled
                    ? 'Disable'
                    : 'Enable'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
