/**
 * UserSettingsForm Component
 *
 * User preference management with dynamic feature visibility
 */

'use client';

import { useState, useEffect } from 'react';
import { useUserPreference } from '@/hooks/useUserPreference';

interface FeatureFlag {
  id: string;
  flag_key: string;
  enabled: boolean;
  min_role: 'admin' | 'user' | 'public';
  description: string | null;
}

interface UserSettingsFormProps {
  featureFlags: FeatureFlag[];
  isAdmin: boolean;
}

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

export default function UserSettingsForm({
  featureFlags,
  isAdmin,
}: UserSettingsFormProps) {
  const { preferences, loading, updatePreference } = useUserPreference();
  const [saving, setSaving] = useState(false);

  // Check if a feature is accessible to the user
  const isFeatureAccessible = (flagKey: string) => {
    const flag = featureFlags.find((f) => f.flag_key === flagKey);
    if (!flag || !flag.enabled) return false;

    if (flag.min_role === 'public') return true;
    if (flag.min_role === 'user') return true;
    if (flag.min_role === 'admin') return isAdmin;

    return false;
  };

  const handleToggle = async (key: keyof UserPreferences, value: boolean) => {
    setSaving(true);
    await updatePreference({ [key]: value });
    setSaving(false);
  };

  const handleValueChange = async (key: keyof UserPreferences, value: any) => {
    setSaving(true);
    await updatePreference({ [key]: value });
    setSaving(false);
  };

  if (loading || !preferences) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <p className="text-gray-600 dark:text-gray-400">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Video Playback Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold dark:text-white mb-4">Video Playback</h2>

        <div className="space-y-4">
          {/* Autoplay Next Episode - Always accessible if enabled */}
          {isFeatureAccessible('autoplay_next_episode') && (
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium dark:text-white">
                  Autoplay next episode
                </label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Automatically play the next episode when current one ends
                </p>
              </div>
              <button
                onClick={() =>
                  handleToggle(
                    'autoplay_next_episode',
                    !preferences.autoplay_next_episode
                  )
                }
                disabled={saving}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.autoplay_next_episode
                    ? 'bg-blue-600'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.autoplay_next_episode
                      ? 'translate-x-6'
                      : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          )}

          {/* Thumbnail Preview */}
          {isFeatureAccessible('thumbnail_preview') && (
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium dark:text-white">
                  Show thumbnail previews on hover
                </label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Preview episodes when hovering over cards
                </p>
              </div>
              <button
                onClick={() =>
                  handleToggle('thumbnail_preview', !preferences.thumbnail_preview)
                }
                disabled={saving}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.thumbnail_preview
                    ? 'bg-blue-600'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.thumbnail_preview
                      ? 'translate-x-6'
                      : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          )}

          {/* Skip Intro */}
          {isFeatureAccessible('skip_intro') && (
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium dark:text-white">Skip intro</label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Show skip intro button when available
                </p>
              </div>
              <button
                onClick={() =>
                  handleToggle('skip_intro_enabled', !preferences.skip_intro_enabled)
                }
                disabled={saving}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.skip_intro_enabled
                    ? 'bg-blue-600'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.skip_intro_enabled
                      ? 'translate-x-6'
                      : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          )}

          {/* Theater Mode */}
          {isFeatureAccessible('theater_mode') && (
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium dark:text-white">Theater mode</label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Wider player view for better immersion
                </p>
              </div>
              <button
                onClick={() =>
                  handleToggle('theater_mode', !preferences.theater_mode)
                }
                disabled={saving}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.theater_mode
                    ? 'bg-blue-600'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.theater_mode
                      ? 'translate-x-6'
                      : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          )}

          {/* Playback Speed */}
          {isFeatureAccessible('playback_speed_control') && (
            <div>
              <label className="font-medium dark:text-white block mb-2">
                Playback Speed
              </label>
              <select
                value={preferences.playback_speed}
                onChange={(e) =>
                  handleValueChange('playback_speed', parseFloat(e.target.value))
                }
                disabled={saving}
                className="w-full md:w-48 border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              >
                <option value="0.75">0.75x</option>
                <option value="1.0">Normal (1.0x)</option>
                <option value="1.25">1.25x</option>
                <option value="1.5">1.5x</option>
              </select>
            </div>
          )}

          {/* Quality Selector */}
          {isFeatureAccessible('quality_selector') && (
            <div>
              <label className="font-medium dark:text-white block mb-2">
                Default Quality
              </label>
              <select
                value={preferences.preferred_quality}
                onChange={(e) =>
                  handleValueChange('preferred_quality', e.target.value)
                }
                disabled={saving}
                className="w-full md:w-48 border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              >
                <option value="auto">Auto (Adaptive)</option>
                <option value="720p">720p</option>
                <option value="1080p">1080p</option>
              </select>
            </div>
          )}

          {/* Default Volume */}
          <div>
            <label className="font-medium dark:text-white block mb-2">
              Default Volume: {preferences.default_volume}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={preferences.default_volume}
              onChange={(e) =>
                handleValueChange('default_volume', parseInt(e.target.value))
              }
              disabled={saving}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Captions Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold dark:text-white mb-4">Captions</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium dark:text-white">
                Enable captions
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Show subtitles when available
              </p>
            </div>
            <button
              onClick={() =>
                handleToggle('captions_enabled', !preferences.captions_enabled)
              }
              disabled={saving}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.captions_enabled
                  ? 'bg-blue-600'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.captions_enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div>
            <label className="font-medium dark:text-white block mb-2">
              Preferred Language
            </label>
            <select
              value={preferences.preferred_caption_language}
              onChange={(e) =>
                handleValueChange('preferred_caption_language', e.target.value)
              }
              disabled={saving}
              className="w-full md:w-48 border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="ja">Japanese</option>
            </select>
          </div>
        </div>
      </div>

      {saving && (
        <div className="text-center text-gray-600 dark:text-gray-400">
          Saving...
        </div>
      )}
    </div>
  );
}
