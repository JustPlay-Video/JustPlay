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
