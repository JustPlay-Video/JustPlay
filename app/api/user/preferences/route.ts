import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/user/preferences
 *
 * Get current user's preferences
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

    // Fetch user preferences
    const { data: preferences, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user preferences:', error);
      return NextResponse.json(
        { error: 'Failed to fetch user preferences' },
        { status: 500 }
      );
    }

    // If no preferences exist, return defaults
    if (!preferences) {
      return NextResponse.json({
        data: {
          autoplay_next_episode: true,
          thumbnail_preview: false,
          playback_speed: 1.0,
          preferred_quality: 'auto',
          default_volume: 80,
          captions_enabled: false,
          preferred_caption_language: 'en',
          skip_intro_enabled: true,
          theater_mode: false,
        },
      });
    }

    return NextResponse.json({ data: preferences });
  } catch (error) {
    console.error('User preferences API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/preferences
 *
 * Create or update user preferences
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

    // Check if preferences exist
    const { data: existing } = await supabase
      .from('user_preferences')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) {
      // Update existing preferences
      const { data, error } = await supabase
        .from('user_preferences')
        .update(body)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating user preferences:', error);
        return NextResponse.json(
          { error: 'Failed to update user preferences' },
          { status: 500 }
        );
      }

      return NextResponse.json({ data, updated: true });
    } else {
      // Create new preferences
      const { data, error } = await supabase
        .from('user_preferences')
        .insert({
          user_id: user.id,
          ...body,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating user preferences:', error);
        return NextResponse.json(
          { error: 'Failed to create user preferences' },
          { status: 500 }
        );
      }

      return NextResponse.json({ data, updated: false });
    }
  } catch (error) {
    console.error('User preferences API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
