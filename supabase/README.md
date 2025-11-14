# Supabase Setup Instructions

## Running the Database Migrations

1. Go to your Supabase project: https://rywutxlxcusnajfvzksy.supabase.co
2. Navigate to the SQL Editor (left sidebar)
3. Create a new query
4. Copy and paste the contents of `migrations/001_initial_schema.sql`
5. Run the query

This will create all the necessary tables, policies, and functions for JustPlay.

## Database Schema Overview

### Core Tables

- **profiles**: User profile information (extends Supabase Auth)
- **child_profiles**: Child accounts with parental controls
- **shows**: TV shows/series metadata
- **episodes**: Individual episodes with video URLs
- **lineups**: User-created viewing schedules
- **lineup_slots**: Episodes scheduled in lineups (day/time)
- **watch_history**: Track viewing progress and completion
- **subscriptions**: Stripe subscription data

### Security

All tables have Row Level Security (RLS) enabled with appropriate policies:
- Users can only see their own data (profiles, lineups, watch history, subscriptions)
- Published shows and episodes are public
- Child profiles are only accessible by parent
- Admins have elevated permissions for content management

### Automatic Features

- Profile automatically created when user signs up (via trigger)
- `updated_at` timestamps automatically maintained
- UUID primary keys generated automatically
