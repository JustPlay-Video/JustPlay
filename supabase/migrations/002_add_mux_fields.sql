-- Migration: Add Mux video fields to episodes table
-- Purpose: Support Mux video upload, playback, and processing tracking
-- Date: 2024-11-14

-- Add Mux-specific columns to episodes table
ALTER TABLE episodes
  ADD COLUMN mux_asset_id TEXT,
  ADD COLUMN mux_playback_id TEXT,
  ADD COLUMN mux_upload_id TEXT;

-- Add index for Mux asset lookups (improves query performance)
CREATE INDEX idx_episodes_mux_asset_id ON episodes(mux_asset_id);
CREATE INDEX idx_episodes_mux_playback_id ON episodes(mux_playback_id);

-- Add comments explaining field usage
COMMENT ON COLUMN episodes.mux_asset_id IS 'Mux Asset ID for API operations (e.g., updating, deleting video)';
COMMENT ON COLUMN episodes.mux_playback_id IS 'Mux Playback ID for video player (public, used in <MuxPlayer>)';
COMMENT ON COLUMN episodes.mux_upload_id IS 'Mux Direct Upload ID for tracking upload status';

-- Note: video_url column remains for backward compatibility and manual URL entry
-- Episodes can have either Mux fields OR video_url, or both
