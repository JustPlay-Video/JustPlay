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

-- Create the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_show_ratings_updated_at
  BEFORE UPDATE ON show_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
