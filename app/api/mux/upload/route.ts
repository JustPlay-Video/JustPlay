/**
 * Mux Direct Upload API Route
 *
 * Creates a Mux Direct Upload URL for admin users to upload video files.
 * The upload happens directly from browser to Mux, not through our server.
 *
 * @route POST /api/mux/upload
 * @access Admin only
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import mux from '@/lib/mux/client';

/**
 * POST /api/mux/upload
 *
 * Creates a new Mux Direct Upload URL and returns upload credentials.
 *
 * @security Requires authenticated admin user (is_admin = true)
 *
 * @returns {object} Upload URL and upload ID
 * @returns {string} upload_url - URL for MuxUploader component
 * @returns {string} upload_id - Mux upload ID to track upload status
 *
 * @throws {401} If user is not authenticated
 * @throws {403} If user is not an admin
 * @throws {500} If Mux API call fails
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verify user is authenticated
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    // 2. Verify user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.is_admin) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // 3. Create Mux Direct Upload
    const upload = await mux.video.uploads.create({
      new_asset_settings: {
        playback_policy: ['public'], // Public playback for all users
        encoding_tier: 'baseline',   // Standard quality encoding
      },
      cors_origin: process.env.NEXT_PUBLIC_SITE_URL || 'https://dev.justplay.cc',
      timeout: 3600, // 1 hour upload timeout
    });

    // 4. Return upload URL and ID to client
    return NextResponse.json({
      upload_url: upload.url,
      upload_id: upload.id,
    });

  } catch (error) {
    console.error('Mux upload creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create upload URL' },
      { status: 500 }
    );
  }
}
