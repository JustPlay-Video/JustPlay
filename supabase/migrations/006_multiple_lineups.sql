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
