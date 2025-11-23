import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/ratings?show_id=xxx
 *
 * Get user's rating for a specific show
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
    const show_id = searchParams.get('show_id');

    if (!show_id) {
      return NextResponse.json(
        { error: 'Missing show_id parameter' },
        { status: 400 }
      );
    }

    // Fetch user's rating for this show
    const { data: rating, error } = await supabase
      .from('show_ratings')
      .select('*')
      .eq('user_id', user.id)
      .eq('show_id', show_id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching rating:', error);
      return NextResponse.json(
        { error: 'Failed to fetch rating' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: rating });
  } catch (error) {
    console.error('Ratings API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ratings
 *
 * Add or update a show rating
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
    const { show_id, rating } = body;

    if (!show_id || !rating) {
      return NextResponse.json(
        { error: 'Missing required fields: show_id, rating' },
        { status: 400 }
      );
    }

    if (!['dislike', 'like', 'love'].includes(rating)) {
      return NextResponse.json(
        { error: 'Invalid rating. Must be: dislike, like, or love' },
        { status: 400 }
      );
    }

    // Check if rating already exists
    const { data: existing } = await supabase
      .from('show_ratings')
      .select('id')
      .eq('user_id', user.id)
      .eq('show_id', show_id)
      .maybeSingle();

    if (existing) {
      // Update existing rating
      const { data, error } = await supabase
        .from('show_ratings')
        .update({ rating })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating rating:', error);
        return NextResponse.json(
          { error: 'Failed to update rating' },
          { status: 500 }
        );
      }

      return NextResponse.json({ data, updated: true });
    } else {
      // Insert new rating
      const { data, error } = await supabase
        .from('show_ratings')
        .insert({
          user_id: user.id,
          show_id,
          rating,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating rating:', error);
        return NextResponse.json(
          { error: 'Failed to create rating' },
          { status: 500 }
        );
      }

      return NextResponse.json({ data, updated: false });
    }
  } catch (error) {
    console.error('Ratings API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/ratings?show_id=xxx
 *
 * Remove a show rating
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

    // Remove rating
    const { error } = await supabase
      .from('show_ratings')
      .delete()
      .eq('user_id', user.id)
      .eq('show_id', show_id);

    if (error) {
      console.error('Error removing rating:', error);
      return NextResponse.json(
        { error: 'Failed to remove rating' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ratings API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
