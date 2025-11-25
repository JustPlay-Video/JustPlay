# Database Migration Guide

This guide provides step-by-step instructions to run the new database migrations for the video playback system.

## Prerequisites

- Access to Supabase Dashboard (https://supabase.com/dashboard)
- Admin access to the JustPlay project

## Migration Files

The following migrations need to be run in order:

1. `004_settings_infrastructure.sql` - Feature flags and user preferences
2. `005_user_engagement.sql` - Favorites and ratings
3. `006_multiple_lineups.sql` - Multiple named lineups
4. `007_parental_controls.sql` - Age ratings
5. `008_captions.sql` - Multi-language captions
6. `009_episode_markers.sql` - Intro/outro markers

## Step-by-Step Instructions

### Step 1: Access Supabase SQL Editor

1. Go to https://supabase.com/dashboard
2. Select your JustPlay project
3. Navigate to "SQL Editor" in the left sidebar

### Step 2: Run Migration 004 - Settings Infrastructure

1. Click "New Query" in the SQL Editor
2. Copy the contents of `supabase/migrations/004_settings_infrastructure.sql`
3. Paste into the SQL Editor
4. Click "Run" (or press Cmd/Ctrl + Enter)
5. Verify success: You should see "Success. No rows returned"

**Creates:**
- `feature_flags` table (with 7 default flags)
- `user_preferences` table
- `playback_settings` table
- RLS policies for all tables

### Step 3: Run Migration 005 - User Engagement

1. Click "New Query"
2. Copy the contents of `supabase/migrations/005_user_engagement.sql`
3. Paste and run
4. Verify success

**Creates:**
- `favorites` table
- `ratings` table (dislike/like/love)
- RLS policies

### Step 4: Run Migration 006 - Multiple Lineups

1. Click "New Query"
2. Copy the contents of `supabase/migrations/006_multiple_lineups.sql`
3. Paste and run
4. Verify success

**Creates:**
- `lineup_shows` table
- `lineup_progress` table (for round-robin playback)
- Auto-reorder trigger
- Helper functions
- Migrates existing data from `lineup_slots`
- RLS policies

**IMPORTANT:** This migration preserves existing lineup data by migrating from the old `lineup_slots` table.

### Step 5: Run Migration 007 - Parental Controls

1. Click "New Query"
2. Copy the contents of `supabase/migrations/007_parental_controls.sql`
3. Paste and run
4. Verify success

**Creates:**
- `age_rating` column on `episodes` table
- `max_age_rating` column on `child_profiles` table
- `age_rating_value()` helper function
- Indexes for performance

**Sets default age rating to 'TV-Y' for all existing episodes**

### Step 6: Run Migration 008 - Captions

1. Click "New Query"
2. Copy the contents of `supabase/migrations/008_captions.sql`
3. Paste and run
4. Verify success

**Creates:**
- `episode_captions` table
- RLS policies

### Step 7: Run Migration 009 - Episode Markers

1. Click "New Query"
2. Copy the contents of `supabase/migrations/009_episode_markers.sql`
3. Paste and run
4. Verify success

**Creates:**
- `intro_start_seconds` column on `episodes`
- `intro_end_seconds` column on `episodes`
- `outro_start_seconds` column on `episodes`

### Step 8: Verify All Migrations

Run this query to verify all tables were created:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'feature_flags',
    'user_preferences',
    'playback_settings',
    'favorites',
    'ratings',
    'lineup_shows',
    'lineup_progress',
    'episode_captions'
  )
ORDER BY table_name;
```

You should see all 8 tables listed.

### Step 9: Regenerate TypeScript Types (Optional)

After running all migrations, you can regenerate TypeScript types to include the new fields:

```bash
npx supabase gen types typescript --project-id rywutxlxcusnajfvzksy > lib/types/database.types.ts
```

This will update the types to include `age_rating`, `intro_start_seconds`, etc.

## Troubleshooting

### "Relation already exists" Error

If you see this error, it means the migration was partially run before. The migrations use `IF NOT EXISTS` checks, so you can safely re-run them.

### "Permission denied" Error

Make sure you're logged in as a project admin in Supabase Dashboard.

### RLS Policy Issues

If you get RLS errors after migration:
1. Go to "Authentication" → "Policies" in Supabase Dashboard
2. Verify RLS is enabled on all new tables
3. Check that policies were created correctly

## Post-Migration Checklist

- [ ] All 6 migrations run successfully
- [ ] 8 new tables created
- [ ] Feature flags seeded (7 flags)
- [ ] Existing lineup data migrated
- [ ] All episodes have age_rating = 'TV-Y'
- [ ] RLS policies active on all tables
- [ ] TypeScript types regenerated (optional)

## Need Help?

If you encounter issues:
1. Check the Supabase logs: Dashboard → Logs → Postgres Logs
2. Verify table structure: Dashboard → Table Editor
3. Test RLS policies: Dashboard → Authentication → Policies

---

After completing these migrations, your JustPlay application will have access to:
- Feature flag system for gradual rollout
- User preferences and settings
- Favorites and ratings
- Multiple named lineups with round-robin playback
- Age ratings and parental controls
- Multi-language caption support
- Intro/outro skip markers
