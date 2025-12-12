import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Search API endpoint for shows
 * Supports full-text search, genre filtering, age filtering, and sorting
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const genre = searchParams.get('genre');
  const minAge = searchParams.get('minAge');
  const maxAge = searchParams.get('maxAge');
  const sortBy = searchParams.get('sortBy') || 'newest'; // newest, title, popular

  const supabase = await createClient();

  let dbQuery = supabase
    .from('shows')
    .select('id, title, description, thumbnail_url, genre, target_age_min, target_age_max, created_at')
    .eq('status', 'published');

  // Full-text search
  if (query) {
    dbQuery = dbQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
  }

  // Filters
  if (genre && genre !== 'all') {
    dbQuery = dbQuery.eq('genre', genre);
  }

  if (minAge) {
    dbQuery = dbQuery.gte('target_age_min', parseInt(minAge));
  }

  if (maxAge) {
    dbQuery = dbQuery.lte('target_age_max', parseInt(maxAge));
  }

  // Sorting
  switch (sortBy) {
    case 'title':
      dbQuery = dbQuery.order('title', { ascending: true });
      break;
    case 'popular':
      // TODO: Add view count or rating when available
      dbQuery = dbQuery.order('created_at', { ascending: false });
      break;
    case 'newest':
    default:
      dbQuery = dbQuery.order('created_at', { ascending: false });
  }

  const { data, error } = await dbQuery;

  if (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
