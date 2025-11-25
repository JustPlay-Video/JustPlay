-- Migration 004: Settings Infrastructure
-- Feature flags, user preferences, and playback settings

-- ============================================================================
-- Feature Flags Table
-- ============================================================================
-- Admin-controlled feature toggles with role-based access

CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_key TEXT UNIQUE NOT NULL,
  enabled BOOLEAN DEFAULT false,
  min_role TEXT DEFAULT 'admin' CHECK (min_role IN ('admin', 'user', 'public')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed initial feature flags
INSERT INTO feature_flags (flag_key, enabled, min_role, description) VALUES
  ('autoplay_next_episode', true, 'user', 'Auto-advance to next episode after current finishes'),
  ('thumbnail_preview', false, 'admin', 'Show video preview on hover over episode cards'),
  ('playback_speed_control', false, 'admin', 'Allow playback speed adjustment'),
  ('quality_selector', false, 'admin', 'Manual quality selection in player'),
  ('theater_mode', false, 'admin', 'Wider player view without fullscreen'),
  ('skip_intro', true, 'user', 'Skip intro button when timestamps exist'),
  ('seek_bar_thumbnails', true, 'user', 'Thumbnail preview on seek bar hover')
ON CONFLICT (flag_key) DO NOTHING;

-- RLS policies for feature_flags
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- Anyone can read feature flags
CREATE POLICY "Feature flags are viewable by everyone"
  ON feature_flags FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can modify feature flags
CREATE POLICY "Only admins can modify feature flags"
  ON feature_flags FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- ============================================================================
-- User Preferences Table
-- ============================================================================
-- User-specific settings and preferences

CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Video playback preferences
  autoplay_next_episode BOOLEAN DEFAULT true,
  thumbnail_preview BOOLEAN DEFAULT false,
  playback_speed NUMERIC DEFAULT 1.0 CHECK (playback_speed >= 0.5 AND playback_speed <= 2.0),
  preferred_quality TEXT DEFAULT 'auto',
  default_volume INTEGER DEFAULT 80 CHECK (default_volume >= 0 AND default_volume <= 100),

  -- Caption preferences
  captions_enabled BOOLEAN DEFAULT false,
  preferred_caption_language TEXT DEFAULT 'en',

  -- Enhanced playback features
  skip_intro_enabled BOOLEAN DEFAULT true,
  theater_mode BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(user_id)
);

-- RLS policies for user_preferences
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Users can only view their own preferences
CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own preferences
CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- Playback Settings Table
-- ============================================================================
-- Global playback configuration (admin-controlled)

CREATE TABLE IF NOT EXISTS playback_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed default playback settings
INSERT INTO playback_settings (setting_key, setting_value, description) VALUES
  ('allowed_playback_speeds', '["0.75", "1.0", "1.25", "1.5"]', 'Available playback speed options'),
  ('max_playback_speed', '"1.5"', 'Maximum allowed playback speed'),
  ('allowed_quality_levels', '["auto", "720p", "1080p"]', 'Available quality options')
ON CONFLICT (setting_key) DO NOTHING;

-- RLS policies for playback_settings
ALTER TABLE playback_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read playback settings
CREATE POLICY "Playback settings are viewable by everyone"
  ON playback_settings FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can modify playback settings
CREATE POLICY "Only admins can modify playback settings"
  ON playback_settings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- ============================================================================
-- Indexes for Performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled ON feature_flags(enabled);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_playback_settings_key ON playback_settings(setting_key);

-- ============================================================================
-- Updated At Triggers
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_feature_flags_updated_at
  BEFORE UPDATE ON feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_playback_settings_updated_at
  BEFORE UPDATE ON playback_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
-- Migration 005: User Engagement
-- Favorites and rating system for shows

-- ============================================================================
-- Favorites Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  show_id UUID REFERENCES shows(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, show_id)
);

-- RLS policies for favorites
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Users can view their own favorites
CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can add their own favorites
CREATE POLICY "Users can add own favorites"
  ON favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can remove their own favorites
CREATE POLICY "Users can remove own favorites"
  ON favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- Show Ratings Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS show_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  show_id UUID REFERENCES shows(id) ON DELETE CASCADE,
  rating TEXT NOT NULL CHECK (rating IN ('dislike', 'like', 'love')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, show_id)
);

-- RLS policies for show_ratings
ALTER TABLE show_ratings ENABLE ROW LEVEL SECURITY;

-- Users can view their own ratings
CREATE POLICY "Users can view own ratings"
  ON show_ratings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can add their own ratings
CREATE POLICY "Users can add own ratings"
  ON show_ratings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own ratings
CREATE POLICY "Users can update own ratings"
  ON show_ratings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can delete their own ratings
CREATE POLICY "Users can delete own ratings"
  ON show_ratings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- Indexes for Performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_show_id ON favorites(show_id);
CREATE INDEX IF NOT EXISTS idx_show_ratings_user_id ON show_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_show_ratings_show_id ON show_ratings(show_id);
CREATE INDEX IF NOT EXISTS idx_show_ratings_rating ON show_ratings(rating);

-- ============================================================================
-- Updated At Trigger
-- ============================================================================

CREATE TRIGGER update_show_ratings_updated_at
  BEFORE UPDATE ON show_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
-- Migration 006: Multiple Lineups System
-- Support for user-created lineups with round-robin playback

-- ============================================================================
-- Lineup Shows Table (Many-to-Many)
-- ============================================================================
-- Links shows to lineups with ordering

CREATE TABLE IF NOT EXISTS lineup_shows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lineup_id UUID REFERENCES lineups(id) ON DELETE CASCADE,
  show_id UUID REFERENCES shows(id) ON DELETE CASCADE,
  position INTEGER NOT NULL, -- Order in the lineup rotation (1, 2, 3...)
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(lineup_id, show_id),
  UNIQUE(lineup_id, position)
);

-- ============================================================================
-- Lineup Progress Table
-- ============================================================================
-- Track each user's progress through each lineup

CREATE TABLE IF NOT EXISTS lineup_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lineup_id UUID REFERENCES lineups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  current_round INTEGER DEFAULT 1, -- Which episode number we're on (E1, E2, E3...)
  current_show_position INTEGER DEFAULT 1, -- Which show in the rotation (1, 2, 3...)
  last_watched_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(lineup_id, user_id)
);

-- ============================================================================
-- Update Lineups Table
-- ============================================================================
-- Ensure lineups table allows multiple per user (remove UNIQUE if exists)

-- Add description field if doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lineups' AND column_name = 'description'
  ) THEN
    ALTER TABLE lineups ADD COLUMN description TEXT;
  END IF;
END $$;

-- Add is_active field if doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lineups' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE lineups ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
END $$;

-- ============================================================================
-- RLS Policies for lineup_shows
-- ============================================================================

ALTER TABLE lineup_shows ENABLE ROW LEVEL SECURITY;

-- Users can view shows in their lineups
CREATE POLICY "Users can view shows in own lineups"
  ON lineup_shows FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lineups
      WHERE lineups.id = lineup_shows.lineup_id
      AND lineups.user_id = auth.uid()
    )
  );

-- Users can add shows to their lineups
CREATE POLICY "Users can add shows to own lineups"
  ON lineup_shows FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM lineups
      WHERE lineups.id = lineup_shows.lineup_id
      AND lineups.user_id = auth.uid()
    )
  );

-- Users can update shows in their lineups (for reordering)
CREATE POLICY "Users can update shows in own lineups"
  ON lineup_shows FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lineups
      WHERE lineups.id = lineup_shows.lineup_id
      AND lineups.user_id = auth.uid()
    )
  );

-- Users can remove shows from their lineups
CREATE POLICY "Users can remove shows from own lineups"
  ON lineup_shows FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM lineups
      WHERE lineups.id = lineup_shows.lineup_id
      AND lineups.user_id = auth.uid()
    )
  );

-- ============================================================================
-- RLS Policies for lineup_progress
-- ============================================================================

ALTER TABLE lineup_progress ENABLE ROW LEVEL SECURITY;

-- Users can view their own lineup progress
CREATE POLICY "Users can view own lineup progress"
  ON lineup_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can create their own lineup progress
CREATE POLICY "Users can create own lineup progress"
  ON lineup_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own lineup progress
CREATE POLICY "Users can update own lineup progress"
  ON lineup_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can delete their own lineup progress
CREATE POLICY "Users can delete own lineup progress"
  ON lineup_progress FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- Indexes for Performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_lineup_shows_lineup_id ON lineup_shows(lineup_id);
CREATE INDEX IF NOT EXISTS idx_lineup_shows_show_id ON lineup_shows(show_id);
CREATE INDEX IF NOT EXISTS idx_lineup_shows_position ON lineup_shows(lineup_id, position);

CREATE INDEX IF NOT EXISTS idx_lineup_progress_user_id ON lineup_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lineup_progress_lineup_id ON lineup_progress(lineup_id);
CREATE INDEX IF NOT EXISTS idx_lineup_progress_last_watched ON lineup_progress(last_watched_at DESC);

-- ============================================================================
-- Helper Function: Reorder Lineup Positions
-- ============================================================================
-- Ensures positions are sequential without gaps (1, 2, 3, 4...)

CREATE OR REPLACE FUNCTION reorder_lineup_positions(p_lineup_id UUID)
RETURNS void AS $$
DECLARE
  v_show RECORD;
  v_position INTEGER := 1;
BEGIN
  FOR v_show IN
    SELECT id FROM lineup_shows
    WHERE lineup_id = p_lineup_id
    ORDER BY position
  LOOP
    UPDATE lineup_shows
    SET position = v_position
    WHERE id = v_show.id;
    v_position := v_position + 1;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Trigger: Auto-reorder on delete
-- ============================================================================

CREATE OR REPLACE FUNCTION reorder_after_delete()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM reorder_lineup_positions(OLD.lineup_id);
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_reorder_lineup_after_delete
  AFTER DELETE ON lineup_shows
  FOR EACH ROW
  EXECUTE FUNCTION reorder_after_delete();
-- Migration 007: Parental Controls
-- Age ratings and content filtering

-- ============================================================================
-- Add Age Rating to Episodes
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'episodes' AND column_name = 'age_rating'
  ) THEN
    ALTER TABLE episodes ADD COLUMN age_rating TEXT DEFAULT 'TV-Y'
      CHECK (age_rating IN ('TV-Y', 'TV-Y7', 'TV-G', 'TV-PG', 'TV-14', 'TV-MA'));
  END IF;
END $$;

-- ============================================================================
-- Add Max Age Rating to Child Profiles
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'child_profiles' AND column_name = 'max_age_rating'
  ) THEN
    ALTER TABLE child_profiles ADD COLUMN max_age_rating TEXT DEFAULT 'TV-Y7'
      CHECK (max_age_rating IN ('TV-Y', 'TV-Y7', 'TV-G', 'TV-PG'));
  END IF;
END $$;

-- ============================================================================
-- Age Rating Helper Function
-- ============================================================================
-- Returns numeric value for rating comparison

CREATE OR REPLACE FUNCTION age_rating_value(rating TEXT)
RETURNS INTEGER AS $$
BEGIN
  CASE rating
    WHEN 'TV-Y' THEN RETURN 1;
    WHEN 'TV-Y7' THEN RETURN 2;
    WHEN 'TV-G' THEN RETURN 3;
    WHEN 'TV-PG' THEN RETURN 4;
    WHEN 'TV-14' THEN RETURN 5;
    WHEN 'TV-MA' THEN RETURN 6;
    ELSE RETURN 0;
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- Indexes
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_episodes_age_rating ON episodes(age_rating);
CREATE INDEX IF NOT EXISTS idx_child_profiles_max_age_rating ON child_profiles(max_age_rating);

-- ============================================================================
-- Update Existing Episodes
-- ============================================================================
-- Set default age rating for existing episodes

UPDATE episodes
SET age_rating = 'TV-Y'
WHERE age_rating IS NULL;
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
