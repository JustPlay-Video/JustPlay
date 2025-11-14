-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Child profiles (for parental controls)
CREATE TABLE child_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  parent_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  birth_year INTEGER,
  max_daily_minutes INTEGER DEFAULT 120,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Shows table
CREATE TABLE shows (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  banner_url TEXT,
  creator_name TEXT,
  creator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  genre TEXT,
  target_age_min INTEGER,
  target_age_max INTEGER,
  is_public_domain BOOLEAN DEFAULT FALSE,
  revenue_share_percentage DECIMAL(5,2) DEFAULT 50.00,
  status TEXT DEFAULT 'draft', -- draft, published, archived
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Episodes table
CREATE TABLE episodes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  show_id UUID REFERENCES shows(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  episode_number INTEGER NOT NULL,
  season_number INTEGER DEFAULT 1,
  duration_seconds INTEGER NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  status TEXT DEFAULT 'processing', -- processing, ready, failed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  UNIQUE(show_id, season_number, episode_number)
);

-- Lineups table (user-created schedules)
CREATE TABLE lineups (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  child_profile_id UUID REFERENCES child_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Lineup slots (episodes scheduled in lineups)
CREATE TABLE lineup_slots (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lineup_id UUID REFERENCES lineups(id) ON DELETE CASCADE NOT NULL,
  episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE NOT NULL,
  day_of_week INTEGER NOT NULL, -- 0 = Sunday, 6 = Saturday
  time_of_day TIME NOT NULL,
  slot_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  UNIQUE(lineup_id, day_of_week, time_of_day)
);

-- Watch history
CREATE TABLE watch_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  child_profile_id UUID REFERENCES child_profiles(id) ON DELETE CASCADE,
  episode_id UUID REFERENCES episodes(id) ON DELETE CASCADE NOT NULL,
  lineup_id UUID REFERENCES lineups(id) ON DELETE SET NULL,
  watched_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  progress_seconds INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Subscriptions table (Stripe integration)
CREATE TABLE subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT NOT NULL, -- active, canceled, past_due, trialing
  plan_type TEXT NOT NULL, -- monthly, yearly
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE child_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE lineups ENABLE ROW LEVEL SECURITY;
ALTER TABLE lineup_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Child profiles policies
CREATE POLICY "Users can view own child profiles"
  ON child_profiles FOR SELECT
  USING (auth.uid() = parent_id);

CREATE POLICY "Users can create child profiles"
  ON child_profiles FOR INSERT
  WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Users can update own child profiles"
  ON child_profiles FOR UPDATE
  USING (auth.uid() = parent_id);

CREATE POLICY "Users can delete own child profiles"
  ON child_profiles FOR DELETE
  USING (auth.uid() = parent_id);

-- Shows policies
CREATE POLICY "Published shows are viewable by everyone"
  ON shows FOR SELECT
  USING (status = 'published' OR auth.uid() = creator_id OR
         EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Admins can insert shows"
  ON shows FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Creators and admins can update their shows"
  ON shows FOR UPDATE
  USING (auth.uid() = creator_id OR
         EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- Episodes policies
CREATE POLICY "Episodes of published shows are viewable by everyone"
  ON episodes FOR SELECT
  USING (EXISTS (SELECT 1 FROM shows WHERE shows.id = episodes.show_id AND
                 (shows.status = 'published' OR shows.creator_id = auth.uid() OR
                  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true))));

CREATE POLICY "Admins can insert episodes"
  ON episodes FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY "Admins and creators can update episodes"
  ON episodes FOR UPDATE
  USING (EXISTS (SELECT 1 FROM shows WHERE shows.id = episodes.show_id AND
                (shows.creator_id = auth.uid() OR
                 EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true))));

-- Lineups policies
CREATE POLICY "Users can view own lineups"
  ON lineups FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can create lineups"
  ON lineups FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update own lineups"
  ON lineups FOR UPDATE
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can delete own lineups"
  ON lineups FOR DELETE
  USING (auth.uid() = profile_id);

-- Lineup slots policies
CREATE POLICY "Users can view lineup slots for their lineups"
  ON lineup_slots FOR SELECT
  USING (EXISTS (SELECT 1 FROM lineups WHERE lineups.id = lineup_slots.lineup_id AND lineups.profile_id = auth.uid()));

CREATE POLICY "Users can insert lineup slots for their lineups"
  ON lineup_slots FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM lineups WHERE lineups.id = lineup_slots.lineup_id AND lineups.profile_id = auth.uid()));

CREATE POLICY "Users can update lineup slots for their lineups"
  ON lineup_slots FOR UPDATE
  USING (EXISTS (SELECT 1 FROM lineups WHERE lineups.id = lineup_slots.lineup_id AND lineups.profile_id = auth.uid()));

CREATE POLICY "Users can delete lineup slots for their lineups"
  ON lineup_slots FOR DELETE
  USING (EXISTS (SELECT 1 FROM lineups WHERE lineups.id = lineup_slots.lineup_id AND lineups.profile_id = auth.uid()));

-- Watch history policies
CREATE POLICY "Users can view own watch history"
  ON watch_history FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can create watch history"
  ON watch_history FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update own watch history"
  ON watch_history FOR UPDATE
  USING (auth.uid() = profile_id);

-- Subscriptions policies
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can update own subscription"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = profile_id);

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_shows_updated_at BEFORE UPDATE ON shows
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_episodes_updated_at BEFORE UPDATE ON episodes
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_lineups_updated_at BEFORE UPDATE ON lineups
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Indexes for performance
CREATE INDEX idx_episodes_show_id ON episodes(show_id);
CREATE INDEX idx_lineup_slots_lineup_id ON lineup_slots(lineup_id);
CREATE INDEX idx_lineup_slots_episode_id ON lineup_slots(episode_id);
CREATE INDEX idx_watch_history_profile_id ON watch_history(profile_id);
CREATE INDEX idx_watch_history_episode_id ON watch_history(episode_id);
CREATE INDEX idx_subscriptions_profile_id ON subscriptions(profile_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
