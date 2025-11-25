-- Migration 010: Watch History RLS Policies
-- Add missing RLS policies for watch_history table

-- ============================================================================
-- Watch History Policies
-- ============================================================================

-- Users can view their own watch history
CREATE POLICY "Users can view own watch history"
  ON watch_history FOR SELECT
  TO authenticated
  USING (auth.uid() = profile_id);

-- Users can insert their own watch history
CREATE POLICY "Users can insert own watch history"
  ON watch_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = profile_id);

-- Users can update their own watch history (progress tracking)
CREATE POLICY "Users can update own watch history"
  ON watch_history FOR UPDATE
  TO authenticated
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

-- Users can delete their own watch history
CREATE POLICY "Users can delete own watch history"
  ON watch_history FOR DELETE
  TO authenticated
  USING (auth.uid() = profile_id);
