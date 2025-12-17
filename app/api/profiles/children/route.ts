import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Child Profiles API endpoint
 * Creates a new child profile for parental controls
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { name, birth_year, max_daily_minutes } = body;

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('child_profiles')
    .insert({
      parent_id: user.id,
      name,
      birth_year: birth_year || null,
      max_daily_minutes: max_daily_minutes || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating child profile:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
