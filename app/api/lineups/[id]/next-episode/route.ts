import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/lineups/[id]/next-episode
 *
 * Get the next episode to play in a lineup (round-robin logic)
 *
 * Round-robin example:
 * Lineup with Show A, Show B, Show C:
 * 1. Show A S1E1
 * 2. Show B S1E1
 * 3. Show C S1E1
 * 4. Show A S1E2 (next round)
 * 5. Show B S1E2
 * 6. Show C S1E2
 * etc.
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id: lineupId } = await params;
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

    // Fetch lineup with shows
    const { data: lineup, error: lineupError } = await supabase
      .from('lineups')
      .select(`
        *,
        lineup_shows (
          position,
          shows (
            id,
            title
          )
        )
      `)
      .eq('id', lineupId)
      .eq('user_id', user.id)
      .single();

    if (lineupError || !lineup) {
      return NextResponse.json(
        { error: 'Lineup not found' },
        { status: 404 }
      );
    }

    if (!lineup.lineup_shows || lineup.lineup_shows.length === 0) {
      return NextResponse.json(
        { error: 'Lineup has no shows' },
        { status: 400 }
      );
    }

    // Sort shows by position
    const shows = lineup.lineup_shows
      .sort((a: any, b: any) => a.position - b.position)
      .map((ls: any) => (Array.isArray(ls.shows) ? ls.shows[0] : ls.shows));

    // Get or create lineup progress
    let { data: progress } = await supabase
      .from('lineup_progress')
      .select('*')
      .eq('lineup_id', lineupId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!progress) {
      // Create new progress
      const { data: newProgress, error: progressError } = await supabase
        .from('lineup_progress')
        .insert({
          lineup_id: lineupId,
          user_id: user.id,
          current_round: 1,
          current_show_position: 1,
        })
        .select()
        .single();

      if (progressError) {
        console.error('Error creating lineup progress:', progressError);
        return NextResponse.json(
          { error: 'Failed to create lineup progress' },
          { status: 500 }
        );
      }

      progress = newProgress;
    }

    const currentRound = progress.current_round;
    const currentShowPosition = progress.current_show_position;

    // Get current show (position is 1-indexed)
    const currentShow = shows[currentShowPosition - 1];

    if (!currentShow) {
      return NextResponse.json(
        { error: 'Invalid show position in progress' },
        { status: 500 }
      );
    }

    // Fetch user's watch history for this show to get current episode
    const { data: watchHistory } = await supabase
      .from('watch_history')
      .select('episode_id, completed')
      .eq('profile_id', user.id)
      .eq('completed', true)
      .order('watched_at', { ascending: false });

    // Fetch episodes for current show
    const { data: episodes, error: episodesError } = await supabase
      .from('episodes')
      .select('*')
      .eq('show_id', currentShow.id)
      .eq('status', 'published')
      .order('season_number', { ascending: true })
      .order('episode_number', { ascending: true });

    if (episodesError) {
      console.error('Error fetching episodes:', episodesError);
      return NextResponse.json(
        { error: 'Failed to fetch episodes' },
        { status: 500 }
      );
    }

    if (!episodes || episodes.length === 0) {
      // No episodes for this show, skip to next show
      return await advanceToNextShow(supabase, lineupId, user.id, progress, shows);
    }

    // Find the episode for current round (episode number = round)
    const targetEpisode = episodes.find((ep) => ep.episode_number === currentRound);

    if (!targetEpisode) {
      // Show doesn't have enough episodes, skip to next show
      return await advanceToNextShow(supabase, lineupId, user.id, progress, shows);
    }

    // Check if user has already watched this episode
    const alreadyWatched = watchHistory?.some(
      (wh) => wh.episode_id === targetEpisode.id && wh.completed
    );

    if (alreadyWatched) {
      // Episode already watched, advance to next show
      return await advanceToNextShow(supabase, lineupId, user.id, progress, shows);
    }

    // Return the next episode
    return NextResponse.json({
      data: {
        episode: targetEpisode,
        show: currentShow,
        progress: {
          current_round: currentRound,
          current_show_position: currentShowPosition,
          total_shows: shows.length,
        },
      },
    });
  } catch (error) {
    console.error('Next episode API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Helper function to advance to the next show in the lineup
 */
async function advanceToNextShow(
  supabase: any,
  lineupId: string,
  userId: string,
  currentProgress: any,
  shows: any[]
) {
  const nextShowPosition = currentProgress.current_show_position + 1;

  let newRound = currentProgress.current_round;
  let newPosition = nextShowPosition;

  // If we've gone through all shows, advance to next round
  if (nextShowPosition > shows.length) {
    newRound = currentProgress.current_round + 1;
    newPosition = 1;
  }

  // Update progress
  const { error: updateError } = await supabase
    .from('lineup_progress')
    .update({
      current_round: newRound,
      current_show_position: newPosition,
      last_watched_at: new Date().toISOString(),
    })
    .eq('lineup_id', lineupId)
    .eq('user_id', userId);

  if (updateError) {
    console.error('Error updating lineup progress:', updateError);
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    );
  }

  // Return message indicating advancement
  return NextResponse.json({
    data: {
      advanced: true,
      new_round: newRound,
      new_position: newPosition,
      message: 'Advanced to next show in lineup',
    },
  });
}
