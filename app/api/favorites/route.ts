import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/favorites
 *
 * Get all favorites for the current user
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

    // Fetch favorites with show details
    const { data: favorites, error } = await supabase
      .from('favorites')
      .select(`
        *,
        shows (
          *
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching favorites:', error);
      return NextResponse.json(
        { error: 'Failed to fetch favorites' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: favorites });
  } catch (error) {
    console.error('Favorites API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/favorites
 *
 * Add a show to favorites
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
    const { show_id } = body;

    if (!show_id) {
      return NextResponse.json(
        { error: 'Missing required field: show_id' },
        { status: 400 }
      );
    }

    // Add to favorites
    const { data, error } = await supabase
      .from('favorites')
      .insert({
        user_id: user.id,
        show_id,
      })
      .select()
      .single();

    if (error) {
      // Check if already favorited
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Show already in favorites' },
          { status: 409 }
        );
      }

      console.error('Error adding favorite:', error);
      return NextResponse.json(
        { error: 'Failed to add favorite' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Favorites API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/favorites?show_id=xxx
 *
 * Remove a show from favorites
 */
export async function DELETE(request: Request) {
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
    const show_id = searchParams.get('show_id');

    if (!show_id) {
      return NextResponse.json(
        { error: 'Missing show_id parameter' },
        { status: 400 }
      );
    }

    // Remove from favorites
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('show_id', show_id);

    if (error) {
      console.error('Error removing favorite:', error);
      return NextResponse.json(
        { error: 'Failed to remove favorite' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Favorites API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
