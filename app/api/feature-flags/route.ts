import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/feature-flags
 *
 * Get all feature flags (public endpoint)
 */
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: flags, error } = await supabase
      .from('feature_flags')
      .select('*')
      .order('flag_key', { ascending: true });

    if (error) {
      console.error('Error fetching feature flags:', error);
      return NextResponse.json(
        { error: 'Failed to fetch feature flags' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: flags });
  } catch (error) {
    console.error('Feature flags API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/feature-flags
 *
 * Update a feature flag (admin only)
 */
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();

    // Check authentication and admin status
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

    // Verify admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { flag_key, enabled, min_role } = body;

    if (!flag_key) {
      return NextResponse.json(
        { error: 'Missing required field: flag_key' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (enabled !== undefined) updateData.enabled = enabled;
    if (min_role !== undefined) updateData.min_role = min_role;

    const { data, error } = await supabase
      .from('feature_flags')
      .update(updateData)
      .eq('flag_key', flag_key)
      .select()
      .single();

    if (error) {
      console.error('Error updating feature flag:', error);
      return NextResponse.json(
        { error: 'Failed to update feature flag' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Feature flags API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
