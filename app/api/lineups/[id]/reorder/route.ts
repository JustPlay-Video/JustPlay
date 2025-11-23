import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * POST /api/lineups/[id]/reorder
 *
 * Reorder shows in a lineup
 * Body: { show_ids: ['id1', 'id2', 'id3'] } - Array of show IDs in new order
 */
export async function POST(request: Request, { params }: RouteParams) {
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

    const body = await request.json();
    const { show_ids } = body;

    if (!show_ids || !Array.isArray(show_ids)) {
      return NextResponse.json(
        { error: 'Missing or invalid field: show_ids (must be array)' },
        { status: 400 }
      );
    }

    // Verify lineup belongs to user
    const { data: lineup } = await supabase
      .from('lineups')
      .select('id')
      .eq('id', lineupId)
      .eq('user_id', user.id)
      .single();

    if (!lineup) {
      return NextResponse.json(
        { error: 'Lineup not found' },
        { status: 404 }
      );
    }

    // Update positions for each show
    const updates = show_ids.map((show_id, index) => ({
      show_id,
      position: index + 1,
    }));

    // Execute updates
    for (const update of updates) {
      const { error } = await supabase
        .from('lineup_shows')
        .update({ position: update.position })
        .eq('lineup_id', lineupId)
        .eq('show_id', update.show_id);

      if (error) {
        console.error('Error updating position:', error);
        return NextResponse.json(
          { error: 'Failed to reorder shows' },
          { status: 500 }
        );
      }
    }

    // Fetch updated lineup
    const { data: updatedLineup } = await supabase
      .from('lineups')
      .select(`
        *,
        lineup_shows (
          id,
          position,
          show_id,
          shows (
            *
          )
        )
      `)
      .eq('id', lineupId)
      .single();

    // Sort shows by position
    if (updatedLineup && updatedLineup.lineup_shows) {
      updatedLineup.lineup_shows.sort((a: any, b: any) => a.position - b.position);
    }

    return NextResponse.json({ data: updatedLineup });
  } catch (error) {
    console.error('Lineup reorder API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
