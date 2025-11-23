import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * POST /api/lineups/[id]/shows
 *
 * Add a show to a lineup
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
    const { show_id } = body;

    if (!show_id) {
      return NextResponse.json(
        { error: 'Missing required field: show_id' },
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

    // Get current max position
    const { data: existingShows } = await supabase
      .from('lineup_shows')
      .select('position')
      .eq('lineup_id', lineupId)
      .order('position', { ascending: false })
      .limit(1);

    const nextPosition = existingShows && existingShows.length > 0
      ? existingShows[0].position + 1
      : 1;

    // Add show to lineup
    const { data, error } = await supabase
      .from('lineup_shows')
      .insert({
        lineup_id: lineupId,
        show_id,
        position: nextPosition,
      })
      .select(`
        *,
        shows (
          *
        )
      `)
      .single();

    if (error) {
      // Check if show already in lineup
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Show already in lineup' },
          { status: 409 }
        );
      }

      console.error('Error adding show to lineup:', error);
      return NextResponse.json(
        { error: 'Failed to add show to lineup' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Lineup shows API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/lineups/[id]/shows?show_id=xxx
 *
 * Remove a show from a lineup
 */
export async function DELETE(request: Request, { params }: RouteParams) {
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

    const { searchParams } = new URL(request.url);
    const show_id = searchParams.get('show_id');

    if (!show_id) {
      return NextResponse.json(
        { error: 'Missing show_id parameter' },
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

    // Remove show from lineup (trigger will auto-reorder)
    const { error } = await supabase
      .from('lineup_shows')
      .delete()
      .eq('lineup_id', lineupId)
      .eq('show_id', show_id);

    if (error) {
      console.error('Error removing show from lineup:', error);
      return NextResponse.json(
        { error: 'Failed to remove show from lineup' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Lineup shows API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
