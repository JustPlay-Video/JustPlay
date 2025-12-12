import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Genres API endpoint
 * Returns list of all unique genres from published shows
 */
export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('shows')
    .select('genre')
    .eq('status', 'published')
    .not('genre', 'is', null);

  if (error) {
    console.error('Genres fetch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Deduplicate genres and sort alphabetically
  const genres = [...new Set(data.map(s => s.genre))].sort();

  return NextResponse.json({ data: genres });
}
