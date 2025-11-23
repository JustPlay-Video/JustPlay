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
