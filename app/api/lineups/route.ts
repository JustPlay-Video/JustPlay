import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/lineups
 *
 * Get all lineups for the current user
 */
export async function GET() {
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

    // Fetch user's lineups with show count
    const { data: lineups, error } = await supabase
      .from('lineups')
      .select(`
        *,
        lineup_shows (
          id,
          show_id,
          position,
          shows (
            id,
            title,
            thumbnail_url
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching lineups:', error);
      return NextResponse.json(
        { error: 'Failed to fetch lineups' },
        { status: 500 }
      );
    }

    // Add show count to each lineup
    const lineupsWithCount = lineups?.map((lineup) => ({
      ...lineup,
      show_count: lineup.lineup_shows?.length || 0,
    }));

    return NextResponse.json({ data: lineupsWithCount });
  } catch (error) {
    console.error('Lineups API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/lineups
 *
 * Create a new lineup
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
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Missing required field: name' },
        { status: 400 }
      );
    }

    // Create lineup
    const { data, error } = await supabase
      .from('lineups')
      .insert({
        user_id: user.id,
        name,
        description: description || null,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating lineup:', error);
      return NextResponse.json(
        { error: 'Failed to create lineup' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Lineups API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
