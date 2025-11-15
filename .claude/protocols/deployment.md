# Deployment Protocol

**Purpose:** Prevent broken deployments, ensure verification, enable safe rollback

**Type:** Sub-protocol (triggered by deployment keywords)

---

## When to Use

### Automatic Triggers
This protocol is **mandatory** when ANY of these keywords appear:
- "deploy"
- "push to main"
- "commit"
- "git push"
- "ready to deploy"
- "mark complete" (after implementation work)

### Examples That Trigger This Protocol
- ✅ "Deploy to dev.justplay.cc"
- ✅ "Ready to push this"
- ✅ "Let's commit and deploy"
- ✅ "Push changes to GitHub"

### No Exemptions
All completed work must be deployed following this protocol.

---

## Pre-Deployment Checklist

Execute ALL checks before committing. If ANY check fails, fix before deploying.

### 1. Build Verification

**Command:** `npm run build`

**Requirements:**
- ✅ Build completes successfully
- ✅ No compilation errors
- ✅ No TypeScript errors
- ❌ ESLint errors must be fixed
- ⚠️  ESLint warnings acceptable if minimal (< 5)

**If Build Fails:**
- Read error message carefully
- Fix TypeScript errors
- Fix ESLint errors
- Re-run build
- Do NOT proceed until build passes

---

### 2. Environment Variables Check

**Verify:**
- ✅ No secrets in code (API keys, passwords)
- ✅ `.env.local` not committed (check `.gitignore`)
- ✅ All required env vars set in Vercel
- ✅ `NEXT_PUBLIC_` prefix used for client-side vars only

**Common Secrets to Never Commit:**
- Supabase service role key (only anon key is safe)
- Cloudflare API keys
- Stripe secret keys
- Database passwords
- Any credentials

---

### 3. Documentation Check

**Verify (from documentation.md protocol):**
- ✅ CHANGELOG.md updated
- ✅ JSDoc added for new public functions
- ✅ database.types.ts updated if schema changed
- ✅ Migration files have comment headers

**Quick Check:**
```bash
git diff CHANGELOG.md
# Should show changes in Unreleased section
```

---

### 4. Database Migration Check

**If database changes made:**
- ✅ Migration file created in `supabase/migrations/`
- ✅ Migration run successfully in Supabase
- ✅ RLS policies enabled and tested
- ✅ database.types.ts updated

**Verify Migration:**
- Check Supabase Dashboard → Tables for new tables/columns
- Check Supabase Dashboard → Database → RLS for policies

---

### 5. Code Quality Check

**Quick review:**
- ✅ No `console.log` statements (except intentional logging)
- ✅ No commented-out code blocks
- ✅ No `// TODO` or `// FIXME` comments without tracking
- ✅ Error handling present on external calls
- ✅ Loading states implemented for async operations

---

## Deployment Steps

### Step 1: Stage Changes

```bash
git add .
```

**Verify staged files:**
```bash
git status
```

**Check for:**
- `.env.local` should NOT appear (if it does, it's in gitignore, good)
- Only intended files staged
- No unexpected files

---

### Step 2: Commit Changes

**Commit Message Format:**
```
type: brief description

Examples:
feat: Add video upload to Cloudflare Stream
fix: Correct admin access check in dashboard
docs: Update README with setup instructions
chore: Update dependencies
refactor: Simplify auth middleware logic
```

**Type Prefixes:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only
- `chore:` - Maintenance (dependencies, config)
- `refactor:` - Code refactor (no behavior change)
- `test:` - Add or update tests
- `style:` - Formatting changes

**Commit Command:**
```bash
git commit -m "feat: Add video upload functionality"
```

**For Multi-Line Commits:**
```bash
git commit -m "feat: Add video upload to Cloudflare Stream

- Create upload form component
- Add server-side upload handler
- Implement progress tracking
- Update episodes schema with cloudflare_stream_id"
```

---

### Step 3: Push to GitHub

```bash
git push origin main
```

**What Happens:**
- Code pushed to GitHub repository
- Vercel webhook triggered automatically
- Vercel builds and deploys (~2 minutes)
- New version live at dev.justplay.cc

---

### Step 4: Monitor Deployment

**Check Vercel Dashboard:**
1. Go to https://vercel.com/dashboard
2. Navigate to JustPlay project
3. Check deployment status
4. Wait for "Ready" status

**Deployment Logs:**
- Click on deployment to view logs
- Check for build errors
- Check for runtime errors

**Typical Timeline:**
- Building: 30-60 seconds
- Deploying: 30-60 seconds
- Total: 1-3 minutes

---

## Post-Deployment Verification

Execute ALL checks after deployment completes. If ANY check fails, investigate immediately.

### 1. Site Loads

**Test:** Visit https://dev.justplay.cc

**Verify:**
- ✅ Site loads without errors
- ✅ No blank/broken pages
- ✅ No infinite loading states

**If Site Doesn't Load:**
- Check Vercel deployment logs
- Check browser console for errors
- Check if deployment actually completed

---

### 2. Browser Console Check

**Test:** Open dev tools (F12) and check console

**Verify:**
- ✅ No red errors in console
- ⚠️  Warnings acceptable if expected
- ✅ No failed network requests (check Network tab)

**Common Errors to Check:**
- 404s (missing files)
- 500s (server errors)
- CORS errors
- Authentication errors

---

### 3. Authentication Flow

**Test:** Test auth functionality

**Verify:**
- ✅ Can visit login page
- ✅ Can log in with existing account
- ✅ Redirected to dashboard after login
- ✅ Protected routes require auth
- ✅ Logout works

**Quick Auth Test:**
```
1. Log out if logged in
2. Try to access /admin (should redirect to /login)
3. Log in
4. Should redirect to /dashboard
5. Access /admin (should work if admin, redirect if not)
```

---

### 4. Primary Functionality

**Test:** Test the specific feature that was changed

**Examples:**
- If added video upload → Test uploading a file
- If added favorites → Test adding/removing favorite
- If changed database → Test CRUD operations
- If updated UI → Test new UI interactions

**Verify:**
- ✅ Feature works as expected
- ✅ No errors during usage
- ✅ Loading states appear correctly
- ✅ Success/error messages display

---

### 5. Database Queries

**If database changes made:**

**Test:**
- ✅ New queries work
- ✅ RLS policies allow authorized access
- ✅ RLS policies deny unauthorized access
- ✅ No permission denied errors for valid operations

**Quick RLS Test:**
1. Create test data as admin
2. Log in as regular user
3. Verify can/cannot access as expected
4. Delete test data

---

### 6. Check Logs

**Vercel Logs:**
- Check "Functions" logs for runtime errors
- Look for 500 errors
- Look for database connection errors

**Supabase Logs:**
- Check for failed queries
- Check for RLS policy violations
- Check for unusual activity

---

## Rollback Procedure

**CRITICAL:** Never initiate rollback without explicit user approval.

### When to Rollback

- ⛔ Site completely broken
- ⛔ Authentication broken
- ⛔ Data corruption occurring
- ⛔ Security vulnerability exposed

### Rollback Process

1. **Get user approval:**
   ```
   "Deployment has critical issue: [describe issue]

   Recommend rollback to previous version.

   Proceed with rollback? (yes/no)"
   ```

2. **If approved, rollback in Vercel:**
   - Go to Vercel dashboard
   - Find previous successful deployment
   - Click "..." menu
   - Click "Redeploy"
   - Wait for redeployment

3. **Verify rollback:**
   - Check site loads
   - Check feature works
   - Confirm issue resolved

4. **Fix forward:**
   - Fix the issue locally
   - Test thoroughly
   - Deploy again following this protocol

**Never:**
- Use `git push --force` (causes issues for team)
- Use `git reset --hard` on main branch
- Rollback without user approval

---

## Deployment Checklist Summary

**Pre-Deployment:**
- [ ] `npm run build` passes
- [ ] No secrets in code
- [ ] Documentation updated
- [ ] Database migrations run (if applicable)
- [ ] Code quality checked

**Deployment:**
- [ ] Changes staged with `git add .`
- [ ] Committed with proper message format
- [ ] Pushed to GitHub with `git push origin main`
- [ ] Vercel deployment monitored

**Post-Deployment:**
- [ ] Site loads at dev.justplay.cc
- [ ] Browser console has no errors
- [ ] Authentication works
- [ ] Primary functionality tested
- [ ] Database queries work (if applicable)
- [ ] Logs checked for errors

---

## Integration with Feature Development

### Within 8-Step Workflow

```
Step 1-7: Planning, implementation, documentation
Step 8: DEPLOYMENT (this protocol) ← YOU ARE HERE
    ├─> Pre-deployment checklist
    ├─> Commit with proper message
    ├─> Push to GitHub
    ├─> Monitor Vercel deployment
    ├─> Post-deployment verification
    └─> Confirm success or rollback if needed
✅ Task Complete
```

---

## Common Issues & Solutions

### Issue: Build fails with TypeScript errors

**Solution:**
1. Read error message carefully
2. Fix type errors in code
3. Ensure database.types.ts is up to date
4. Run `npm run build` again
5. Commit and deploy only after build passes

---

### Issue: Deployment succeeds but site is broken

**Symptoms:**
- Blank pages
- 500 errors
- Authentication fails

**Diagnostic Steps:**
1. Check Vercel function logs
2. Check browser console
3. Check network requests (F12 → Network)
4. Check Supabase logs

**Common Causes:**
- Missing environment variables in Vercel
- Database migration not run
- RLS policies blocking queries
- Invalid API calls

---

### Issue: Database queries fail after deployment

**Symptoms:**
- "Permission denied" errors
- Empty results when data should exist
- 401/403 errors

**Diagnostic Steps:**
1. Check RLS policies in Supabase
2. Verify user authentication working
3. Check query in Supabase SQL editor
4. Test with RLS disabled (temporarily, for debugging only)

**Common Causes:**
- RLS policies too restrictive
- Auth token not being sent
- Wrong user ID in query

---

### Issue: Features work locally but not in production

**Common Causes:**
- Environment variables not set in Vercel
- Database migration not run in production Supabase
- Using localhost URLs instead of production URLs
- CORS issues

**Solution:**
1. Check environment variables in Vercel dashboard
2. Verify database migrations run
3. Check for hardcoded URLs
4. Review network requests for CORS errors

---

## Success Criteria

Deployment is successful when:
- ✅ All pre-deployment checks passed
- ✅ Code pushed to GitHub successfully
- ✅ Vercel deployment completed ("Ready" status)
- ✅ All post-deployment verification passed
- ✅ Site functional at dev.justplay.cc
- ✅ No critical errors in logs
- ✅ Primary functionality tested and working

---

## Notes

**Deployment Frequency:**
- Deploy often (after each feature/fix)
- Small deployments easier to debug than large ones
- Deploy to dev.justplay.cc freely (it's not production)

**Environment Management:**
- dev.justplay.cc is development/staging
- Production domain (justplay.cc) will be added later
- Both point to same Vercel deployment initially
- Can create separate production project when needed

**Monitoring:**
- Check Vercel analytics for errors
- Monitor Supabase logs for failed queries
- Set up error tracking (Sentry) in future

**Hot Fixes:**
- For critical bugs, can skip some steps
- Still require: build passes, commit, deploy, verify
- Document fix in CHANGELOG after deploying
