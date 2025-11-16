# Mux Video Integration Setup Guide

## Overview

This guide covers the complete setup for Mux video upload and playback integration.

## Environment Variables

### Required Variables

Add these to your `.env.local` file:

```env
# Mux API Credentials (already configured)
MUX_TOKEN_ID=9718c0fa-3244-49bc-9fba-997f40ffb5da
MUX_TOKEN_SECRET=zj5R1zxaCbNJ9jm4wRYTfiITBD5Q4NDZADjqbGH0PjvlR1opzXxkzt4VAM/OngELuKtyQVPvf8U
NEXT_PUBLIC_MUX_ENV_KEY=9gblufr7u55rdp1o5uiikfuo9

# Supabase Service Role Key (REQUIRED for webhooks)
# Get this from: https://rywutxlxcusnajfvzksy.supabase.co/project/settings/api
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Mux Webhook Secret (RECOMMENDED for security)
# Generate in Mux Dashboard > Settings > Webhooks
MUX_WEBHOOK_SECRET=your_webhook_secret_here
```

### Getting Supabase Service Role Key

1. Go to https://rywutxlxcusnajfvzksy.supabase.co
2. Navigate to **Settings** → **API**
3. Copy the **service_role** key (NOT the anon key)
4. Add to `.env.local` as `SUPABASE_SERVICE_ROLE_KEY`

**Important**: Never commit this key to git. It bypasses Row Level Security.

## Webhook Configuration

### 1. Deploy to Vercel

The webhook endpoint must be publicly accessible. Deploy to Vercel first:

```bash
git add .
git commit -m "Add Mux video integration"
git push
```

### 2. Configure Webhook in Mux Dashboard

1. Go to https://dashboard.mux.com
2. Navigate to **Settings** → **Webhooks**
3. Click **Create a new webhook**
4. Enter webhook URL: `https://dev.justplay.cc/api/mux/webhook`
5. Select events to receive:
   - ✅ `video.upload.asset_created` - Upload completed
   - ✅ `video.asset.ready` - Video ready for playback
   - ✅ `video.asset.errored` - Processing failed
6. (Optional but recommended) Copy the **Signing Secret** and add to `.env.local` as `MUX_WEBHOOK_SECRET`
7. Click **Create webhook**

### 3. Test Webhook

After deploying, test the webhook:

1. Go to Mux Dashboard → Webhooks
2. Find your webhook
3. Click **Send test event**
4. Verify webhook receives and processes event
5. Check Vercel logs for webhook processing output

## Video Upload Workflow

### How It Works

1. **Admin initiates upload**
   - Clicks "Select Video File" in episode form
   - Client requests upload URL from `/api/mux/upload`
   - API validates admin authentication and creates Mux Direct Upload

2. **Client uploads directly to Mux**
   - MuxUploader component handles file upload
   - Video uploaded directly to Mux (not through server)
   - Upload ID stored in episode record

3. **Mux processes video**
   - Mux creates asset and begins encoding
   - Webhook fires: `video.upload.asset_created`
   - Episode updated with `mux_asset_id`

4. **Video becomes ready**
   - Mux finishes processing
   - Webhook fires: `video.asset.ready`
   - Episode updated with `mux_playback_id` and status = 'published'

5. **User watches video**
   - MuxPlayer component uses `mux_playback_id`
   - Adaptive bitrate streaming (HLS)
   - No additional configuration needed

### Database Fields

Episodes table now includes:

- `mux_upload_id` - Tracks upload status (set immediately)
- `mux_asset_id` - Mux asset reference (set after upload completes)
- `mux_playback_id` - Public playback ID (set when ready)
- `video_url` - Still supported for manual URLs

## Testing

### Test Video Upload

1. Go to https://dev.justplay.cc/admin/shows
2. Click on a show
3. Click "Add Episode"
4. Select "Upload File (Mux)" method
5. Click "Select Video File"
6. Choose a video file (MP4, MOV, etc. - max 2GB)
7. Wait for upload to complete
8. Fill in episode details
9. Click "Add Episode"
10. Check Supabase to verify `mux_upload_id` was saved
11. Wait for webhook to update `mux_asset_id` and `mux_playback_id`

### Verify Webhook Processing

Check Vercel logs for webhook events:

```bash
vercel logs dev.justplay.cc
```

Look for:
- "Mux webhook received: video.upload.asset_created"
- "Mux webhook received: video.asset.ready"
- Episode update confirmations

## Troubleshooting

### Upload fails with 401 Unauthorized

- Verify you're logged in as admin user
- Check `is_admin` flag in profiles table: `SELECT is_admin FROM profiles WHERE id = 'your-user-id';`
- Make admin: `UPDATE profiles SET is_admin = true WHERE id = 'your-user-id';`

### Webhook not receiving events

- Verify webhook URL is publicly accessible: `curl https://dev.justplay.cc/api/mux/webhook`
- Check Mux Dashboard → Webhooks for delivery status
- Verify environment variables are set in Vercel
- Check Vercel logs for webhook processing errors

### Video stuck in "processing" status

- Check Mux Dashboard → Assets to see processing status
- Verify webhook events are being sent (check Mux Dashboard → Webhooks → Logs)
- Check Vercel logs for webhook errors
- Manually trigger webhook test event from Mux Dashboard

### Database update fails in webhook

- Verify `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel environment variables
- Check webhook is using service role key (not anon key)
- Verify `mux_upload_id` in episode matches upload ID from Mux

## Security Notes

- All upload endpoints require admin authentication
- Webhook signature verification (if `MUX_WEBHOOK_SECRET` configured)
- Service role key never exposed to client
- Playback IDs are public (safe to expose in player)

## Cost Monitoring

Mux free tier includes:
- $20/month in free credit
- ~20-40 minutes of video encoding
- ~200 hours of video streaming

Monitor usage at: https://dashboard.mux.com/usage
