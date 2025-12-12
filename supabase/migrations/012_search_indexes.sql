-- Migration 012: Search & Discovery Indexes
-- Adds full-text search indexes and materialized view for recently added shows

-- Full-text search indexes on shows table
CREATE INDEX IF NOT EXISTS idx_shows_title_search ON shows USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_shows_description_search ON shows USING gin(to_tsvector('english', COALESCE(description, '')));

-- Performance indexes for filtering
CREATE INDEX IF NOT EXISTS idx_shows_genre ON shows(genre) WHERE genre IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_shows_target_age_min ON shows(target_age_min) WHERE target_age_min IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_shows_target_age_max ON shows(target_age_max) WHERE target_age_max IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_shows_created_at_desc ON shows(created_at DESC) WHERE status = 'published';

-- Materialized view for recently added shows (performance optimization)
CREATE MATERIALIZED VIEW IF NOT EXISTS recently_added_shows AS
SELECT id, title, thumbnail_url, genre, target_age_min, target_age_max, created_at
FROM shows
WHERE status = 'published'
ORDER BY created_at DESC
LIMIT 20;

CREATE INDEX IF NOT EXISTS idx_recently_added_created_at ON recently_added_shows(created_at DESC);

-- Function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_recently_added()
RETURNS trigger AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY recently_added_shows;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-refresh on show changes
DROP TRIGGER IF EXISTS refresh_recently_added_trigger ON shows;
CREATE TRIGGER refresh_recently_added_trigger
AFTER INSERT OR UPDATE OR DELETE ON shows
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_recently_added();

-- Comments
COMMENT ON INDEX idx_shows_title_search IS 'Full-text search index for show titles';
COMMENT ON INDEX idx_shows_description_search IS 'Full-text search index for show descriptions';
COMMENT ON MATERIALIZED VIEW recently_added_shows IS 'Cached view of most recently published shows for performance';
