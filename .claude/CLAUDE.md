# JustPlay Development Protocols

**Project:** JustPlay - Saturday Morning Cartoons Streaming Platform
**Stack:** Next.js 15 + TypeScript + Supabase + Vercel
**Development Site:** https://dev.justplay.cc
**GitHub:** https://github.com/JustPlay-Video/JustPlay

---

## 🔒 Mandatory Protocol Triggers

These protocols are ALWAYS consulted when triggered. No exceptions unless explicitly stated in the protocol file.

### 1. Feature Development (Master Orchestrator)
**Protocol:** `.claude/protocols/feature-development.md`
**Trigger Keywords:** implement, add, build, create + feature/functionality/page/component
**Purpose:** Enforce complete 8-step development workflow from research to deployment

### 2. Research & Documentation Check
**Protocol:** `.claude/protocols/research.md`
**Trigger:** Before implementing features (called by feature-development.md step 3)
**Purpose:** Check existing documentation and code before reinventing solutions

### 3. Database Migrations
**Protocol:** `.claude/protocols/database-migrations.md`
**Trigger Keywords:** CREATE TABLE, ALTER TABLE, DROP, INDEX, POLICY, schema, migration
**Purpose:** Prevent schema drift, ensure RLS policies, maintain type safety

### 4. Documentation Requirements
**Protocol:** `.claude/protocols/documentation.md`
**Trigger:** Before marking ANY task complete (called by feature-development.md step 7)
**Purpose:** Ensure documentation never forgotten, maintain CHANGELOG and API docs

### 5. Deployment
**Protocol:** `.claude/protocols/deployment.md`
**Trigger Keywords:** deploy, push, commit, git push, marking work complete
**Purpose:** Prevent broken deployments, ensure verification, enable safe rollback

---

## Tech Stack Constraints

### Required Technologies
- **Framework:** Next.js 15+ with App Router (no Pages Router)
- **Language:** TypeScript (strict mode)
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Styling:** Tailwind CSS only
- **Modules:** ES6 modules only (enforced globally)

### Prohibited
- ❌ Pages Router (use App Router only)
- ❌ Client-side env vars without `NEXT_PUBLIC_` prefix
- ❌ Direct database queries (use Supabase client)
- ❌ Inline styles (use Tailwind classes)
- ❌ CSS-in-JS libraries (styled-components, emotion, etc.)
- ❌ Non-module scripts

---

## Supabase Patterns

### Authentication
```typescript
// Client component
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();

// Server component
import { createClient } from '@/lib/supabase/server';
const supabase = await createClient();

// Middleware
import { updateSession } from '@/lib/supabase/middleware';
```

### Row Level Security
- All user data MUST have RLS policies
- Use `auth.uid()` in policies, never trust client IDs
- Admin actions require `is_admin = true` check
- Public content needs explicit public read policy

### Storage
- Buckets: `show-thumbnails`, `episode-videos`, `user-avatars`
- Validate file types and sizes before upload
- Generate public URLs for published content only

---

## Quick Reference

### Common Commands
```bash
# Development
npm run dev              # Start dev server (localhost:3000)
npm run build            # Build for production
npm run lint             # Run ESLint

# Git & Deployment
git add .
git commit -m "type: description"
git push origin main     # Auto-deploys to Vercel

# Database
# Run migrations in Supabase SQL Editor
# Copy from supabase/migrations/XXX_*.sql
```

### Key Files
```
📁 JustPlay
├── .claude/
│   ├── CLAUDE.md                    # This file
│   └── protocols/                   # Protocol files
│       ├── feature-development.md   # Master workflow
│       ├── research.md              # Doc/code research
│       ├── database-migrations.md   # Schema changes
│       ├── documentation.md         # CHANGELOG, JSDoc
│       └── deployment.md            # Deploy checklist
├── app/                             # Next.js App Router
│   ├── admin/                       # Admin dashboard
│   ├── dashboard/                   # User dashboard
│   └── (auth pages)
├── lib/
│   ├── supabase/                    # Supabase clients
│   └── types/database.types.ts      # DB TypeScript types
├── supabase/migrations/             # SQL migrations
├── ROADMAP.md                       # Project status/next steps
└── CHANGELOG.md                     # Version history
```

### Environment Variables
```env
# .env.local (local dev) and Vercel (production)
NEXT_PUBLIC_SUPABASE_URL=https://rywutxlxcusnajfvzksy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

---

## Database Schema Overview

**Core Tables:**
- `profiles` - User profiles (extends auth.users)
- `child_profiles` - Child accounts for parental controls
- `shows` - TV shows/series metadata
- `episodes` - Individual episodes with video URLs
- `lineups` - User-created viewing schedules
- `lineup_slots` - Episodes scheduled in lineups
- `watch_history` - Viewing progress tracking
- `subscriptions` - Stripe subscription data (future)

**Full schema:** See `supabase/migrations/001_initial_schema.sql`

---

## Project Status

**Current Status:** See `ROADMAP.md` for detailed progress and next steps

**Recent Changes:** See `CHANGELOG.md` for version history

---

## Miscellaneous Guidelines

### Code Style (Preferences, Not Enforced)
- Prefer descriptive variable names over short abbreviations
- Use async/await over promise chains
- Prefer early returns over nested conditionals
- Group related imports together

### Error Messages
- User-facing: Friendly, actionable, no technical details
- Admin-facing: Can include error messages and debug info
- Always log actual errors server-side

### Forms
- Show loading states during submission
- Display validation errors inline
- Redirect after successful mutation
- Use `router.refresh()` to revalidate server data

---

## Notes for Claude Code

**Starting a new feature:**
1. Feature development protocol triggers automatically
2. Follow 8-step workflow (agents → tracking → research → audit → plan → implement → document → deploy)
3. Sub-protocols trigger at appropriate steps

**When encountering errors:**
1. Check Vercel deployment logs
2. Check browser console (F12)
3. Check Supabase logs (Dashboard → Logs)
4. Verify RLS policies if permission denied
5. Check environment variables are set

**When uncertain:**
- Reference global CLAUDE.md protocols
- Check existing code patterns (use research.md)
- Ask user for clarification on business logic
- Prefer established patterns over new approaches
