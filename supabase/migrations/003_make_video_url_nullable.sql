-- Migration: Make video_url nullable for Mux uploads
-- Purpose: Mux uploads don't have video_url until playback_id is generated
-- Date: 2024-11-21

-- Make video_url nullable (supports both Mux uploads and manual URLs)
ALTER TABLE episodes
  ALTER COLUMN video_url DROP NOT NULL;

-- Add comment explaining usage
COMMENT ON COLUMN episodes.video_url IS 'Manual video URL (optional if using Mux). Populated for manual uploads, null for Mux uploads until playback ready.';
