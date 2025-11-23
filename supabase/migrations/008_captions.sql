-- Migration 008: Multi-Language Captions
-- Support for episode subtitles in multiple languages

-- ============================================================================
-- Episode Captions Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS episode_captions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL, -- ISO 639-1 codes: 'en', 'es', 'fr', etc.
  language_name TEXT NOT NULL, -- Display names: 'English', 'Spanish', 'French'
  caption_url TEXT NOT NULL, -- Supabase storage URL for VTT/SRT file
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(episode_id, language_code)
);

-- ============================================================================
-- RLS Policies
-- ============================================================================

ALTER TABLE episode_captions ENABLE ROW LEVEL SECURITY;

-- Everyone can read captions for published episodes
CREATE POLICY "Captions are publicly viewable"
  ON episode_captions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM episodes
      WHERE episodes.id = episode_captions.episode_id
      AND episodes.status IN ('published', 'ready')
    )
  );

-- Only admins can insert captions
CREATE POLICY "Only admins can insert captions"
  ON episode_captions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Only admins can update captions
CREATE POLICY "Only admins can update captions"
  ON episode_captions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Only admins can delete captions
CREATE POLICY "Only admins can delete captions"
  ON episode_captions FOR DELETE
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

CREATE INDEX IF NOT EXISTS idx_episode_captions_episode_id ON episode_captions(episode_id);
CREATE INDEX IF NOT EXISTS idx_episode_captions_language_code ON episode_captions(language_code);
CREATE INDEX IF NOT EXISTS idx_episode_captions_default ON episode_captions(episode_id, is_default) WHERE is_default = true;
