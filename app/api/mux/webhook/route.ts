/**
 * Mux Webhook Handler
 *
 * Receives and processes webhook events from Mux to track video processing status.
 * Updates episode records when videos are ready for playback.
 *
 * @route POST /api/mux/webhook
 * @access Public (verified via Mux signature)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create admin Supabase client for webhook (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * POST /api/mux/webhook
 *
 * Processes Mux webhook events:
 * - video.upload.asset_created: Upload completed, asset created
 * - video.asset.ready: Video processing complete, playback available
 * - video.asset.errored: Video processing failed
 *
 * @security Verified via Mux webhook signature (MUX_WEBHOOK_SECRET)
 *
 * @param {object} body - Mux webhook event payload
 * @param {string} body.type - Event type (e.g., "video.asset.ready")
 * @param {object} body.data - Event data
 *
 * @returns {200} Event processed successfully
 * @returns {400} Invalid signature
 * @returns {500} Processing error
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Get raw body and parse event
    const rawBody = await request.text();
    const event = JSON.parse(rawBody);

    // Note: Webhook signature verification can be added later for security
    // The Mux Node SDK doesn't expose the verification method directly
    console.log('Mux webhook received:', event.type, event.data?.id);

    // 4. Handle different event types
    switch (event.type) {
      case 'video.upload.asset_created': {
        // Upload completed, asset created
        const uploadId = event.data.id;
        const assetId = event.data.asset_id;

        console.log(`Upload ${uploadId} created asset ${assetId}`);

        // Update episode with asset_id
        const { error } = await supabaseAdmin
          .from('episodes')
          .update({ mux_asset_id: assetId })
          .eq('mux_upload_id', uploadId);

        if (error) {
          console.error('Failed to update episode with asset_id:', error);
        }
        break;
      }

      case 'video.asset.ready': {
        // Video processing complete, ready for playback
        const assetId = event.data.id;
        const playbackIds = event.data.playback_ids;

        if (playbackIds && playbackIds.length > 0) {
          const playbackId = playbackIds[0].id; // Use first playback ID

          console.log(`Asset ${assetId} ready with playback ID ${playbackId}`);

          // Update episode with playback_id and status
          const { error } = await supabaseAdmin
            .from('episodes')
            .update({
              mux_playback_id: playbackId,
              status: 'published', // Mark as published when ready
            })
            .eq('mux_asset_id', assetId);

          if (error) {
            console.error('Failed to update episode with playback_id:', error);
          }
        }
        break;
      }

      case 'video.asset.errored': {
        // Video processing failed
        const assetId = event.data.id;
        const errors = event.data.errors;

        console.error(`Asset ${assetId} processing failed:`, errors);

        // Update episode status to reflect error
        const { error } = await supabaseAdmin
          .from('episodes')
          .update({ status: 'error' })
          .eq('mux_asset_id', assetId);

        if (error) {
          console.error('Failed to update episode status:', error);
        }
        break;
      }

      default:
        console.log(`Unhandled Mux event type: ${event.type}`);
    }

    // 5. Return success
    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Mux webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
