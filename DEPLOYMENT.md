# JustPlay Deployment Guide

## Deploying to Vercel

### Step 1: Create/Login to Vercel Account
1. Go to https://vercel.com
2. Sign up or log in (use GitHub OAuth for easy integration)

### Step 2: Import GitHub Repository
1. Click "Add New" → "Project"
2. Import your GitHub repository: `JustPlay-Video/JustPlay`
3. Vercel will automatically detect it's a Next.js project

### Step 3: Configure Environment Variables
Before deploying, add these environment variables in Vercel:

```
NEXT_PUBLIC_SUPABASE_URL=https://rywutxlxcusnajfvzksy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5d3V0eGx4Y3VzbmFqZnZ6a3N5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMxNDMzMTgsImV4cCI6MjA3ODcxOTMxOH0.eZMS9pJc5P0l1C1s-iPKvLt0683EudPoXykTlM-Il9I
```

### Step 4: Deploy
1. Click "Deploy"
2. Wait for the build to complete (~2-3 minutes)
3. You'll get a URL like `https://justplay-xyz.vercel.app`

### Step 5: Set Up Custom Domain (dev.justplay.cc)

#### In Vercel:
1. Go to your project → Settings → Domains
2. Add domain: `dev.justplay.cc`
3. Vercel will show you DNS records to add

#### In Your Domain Registrar (where you bought justplay.cc):
1. Go to DNS settings
2. Add a CNAME record:
   - **Name/Host**: `dev`
   - **Value/Points to**: `cname.vercel-dns.com`
   - **TTL**: 3600 (or Auto)
3. Save changes

#### Back in Vercel:
1. Wait for DNS to propagate (1-30 minutes)
2. Vercel will automatically provision SSL certificate
3. Your site will be live at `https://dev.justplay.cc`

## Step 6: Run Database Migrations

1. Go to Supabase dashboard: https://rywutxlxcusnajfvzksy.supabase.co
2. Navigate to SQL Editor
3. Copy contents of `supabase/migrations/001_initial_schema.sql`
4. Paste and run the query
5. Database schema is now set up!

## Testing Your Deployment

1. Visit `https://dev.justplay.cc`
2. Click "Get Started" to test signup
3. Create an account
4. Verify you're redirected to dashboard
5. Check Supabase dashboard → Authentication to see new user
6. Check Database → Tables to see profile created

## Troubleshooting

### Build fails
- Check build logs in Vercel
- Ensure environment variables are set correctly

### Auth not working
- Verify Supabase environment variables are correct
- Check Supabase dashboard → Authentication → URL Configuration
- Add `https://dev.justplay.cc` to allowed redirect URLs

### Database errors
- Ensure migrations were run in Supabase
- Check Row Level Security policies are enabled
- Verify user has proper permissions

## Next Steps

After deployment:
1. Configure Supabase email templates (for password reset, etc.)
2. Set up Stripe for payments (Phase 1, Week 3-4)
3. Add content upload functionality (Phase 1, Week 3-4)
4. Build lineup creator (Phase 1, Week 7-8)
