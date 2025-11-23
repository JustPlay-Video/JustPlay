-- Migration 009: Episode Markers
-- Intro/outro timestamps for skip functionality

-- ============================================================================
-- Episode Markers Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS episode_markers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
  marker_type TEXT NOT NULL CHECK (marker_type IN ('intro_start', 'intro_end', 'outro_start', 'credits_start')),
  timestamp_seconds INTEGER NOT NULL CHECK (timestamp_seconds >= 0),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(episode_id, marker_type)
);

-- ============================================================================
-- RLS Policies
-- ============================================================================

ALTER TABLE episode_markers ENABLE ROW LEVEL SECURITY;

-- Everyone can read markers for published episodes
CREATE POLICY "Markers are publicly viewable"
  ON episode_markers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM episodes
      WHERE episodes.id = episode_markers.episode_id
      AND episodes.status IN ('published', 'ready')
    )
  );

-- Only admins can manage markers
CREATE POLICY "Only admins can manage markers"
  ON episode_markers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- ============================================================================
-- Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_episode_markers_episode_id ON episode_markers(episode_id);
CREATE INDEX IF NOT EXISTS idx_episode_markers_type ON episode_markers(episode_id, marker_type);
