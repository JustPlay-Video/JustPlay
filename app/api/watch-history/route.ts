import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * POST /api/watch-history
 *
 * Upsert watch history for an episode
 * Tracks playback progress and completion status
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      episode_id,
      progress_seconds,
      duration_seconds,
      lineup_id = null,
      child_profile_id = null,
    } = body;

    // Validate required fields
    if (!episode_id || progress_seconds === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: episode_id, progress_seconds' },
        { status: 400 }
      );
    }

    // Calculate if episode is completed (90% threshold)
    const completed = duration_seconds
      ? progress_seconds >= duration_seconds * 0.9
      : false;

    // Check if watch history entry exists
    const { data: existing } = await supabase
      .from('watch_history')
      .select('id')
      .eq('profile_id', user.id)
      .eq('episode_id', episode_id)
      .maybeSingle();

    if (existing) {
      // Update existing entry
      const { data, error } = await supabase
        .from('watch_history')
        .update({
          progress_seconds,
          completed,
          watched_at: new Date().toISOString(),
          lineup_id,
          child_profile_id,
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating watch history:', error);
        return NextResponse.json(
          { error: 'Failed to update watch history' },
          { status: 500 }
        );
      }

      return NextResponse.json({ data, updated: true });
    } else {
      // Insert new entry
      const { data, error } = await supabase
        .from('watch_history')
        .insert({
          profile_id: user.id,
          episode_id,
          progress_seconds,
          completed,
          watched_at: new Date().toISOString(),
          lineup_id,
          child_profile_id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating watch history:', error);
        return NextResponse.json(
          { error: 'Failed to create watch history' },
          { status: 500 }
        );
      }

      return NextResponse.json({ data, updated: false });
    }
  } catch (error) {
    console.error('Watch history API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/watch-history?episode_id=xxx
 *
 * Get watch history for a specific episode
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const episode_id = searchParams.get('episode_id');

    if (!episode_id) {
      return NextResponse.json(
        { error: 'Missing episode_id parameter' },
        { status: 400 }
      );
    }

    // Fetch watch history for this episode
    const { data, error } = await supabase
      .from('watch_history')
      .select('*')
      .eq('profile_id', user.id)
      .eq('episode_id', episode_id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching watch history:', error);
      return NextResponse.json(
        { error: 'Failed to fetch watch history' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Watch history API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
