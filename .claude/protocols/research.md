# Research & Documentation Check Protocol

**Purpose:** Check existing documentation and code before implementing solutions

**Type:** Sub-protocol (called by feature-development.md step 3)

---

## When to Use

### Triggered By
- **feature-development.md Step 3** (automatic)
- Before implementing any feature or pattern
- When encountering problems that may have been solved before
- When uncertain about project conventions

### Examples
- ✅ About to implement authentication → Check existing auth patterns
- ✅ Building a form → Check existing form components
- ✅ Adding database table → Check existing schema
- ✅ Creating API route → Check existing route patterns

---

## Research Checklist

Execute in order. Document findings for each section.

### 1. Check Project Documentation

**Location:** `/docs/` directory

**What to Check:**
- [ ] Existing guides related to feature being implemented
- [ ] Component patterns documentation
- [ ] Supabase patterns and anti-patterns
- [ ] Content management workflows
- [ ] Error handling standards

**Questions to Answer:**
- Does documentation already cover this pattern?
- Are there established conventions to follow?
- Are there known pitfalls or anti-patterns to avoid?

**Output:** List of relevant documentation found (or note if none exists)

---

### 2. Search Existing Codebase

**Tools:** Use Grep and Glob to search code

**Common Search Patterns:**

**Authentication:**
```
Grep: "createClient", "auth.getUser", "auth.signIn"
Glob: "app/**/auth/**/*.tsx", "lib/supabase/*.ts"
```

**Forms:**
```
Grep: "useState.*form", "onSubmit", "FormData"
Glob: "app/**/**/new/page.tsx", "app/**/**/edit/page.tsx"
```

**Database Queries:**
```
Grep: "supabase.from", ".select", ".insert", ".update"
Glob: "app/**/page.tsx", "app/**/route.ts"
```

**Components:**
```
Glob: "app/admin/**/*.tsx", "components/**/*.tsx"
```

**What to Look For:**
- [ ] Similar features already implemented
- [ ] Existing components that could be reused
- [ ] Patterns for forms, data fetching, error handling
- [ ] Database query patterns
- [ ] Authentication/authorization checks

**Questions to Answer:**
- Has this been implemented before?
- Can existing code be reused?
- What patterns are consistently used in the codebase?

**Output:** List of similar implementations found with file paths

---

### 3. Review CHANGELOG.md

**What to Check:**
- [ ] Recent features that may be related
- [ ] Recent breaking changes that affect implementation
- [ ] Patterns or conventions established in recent work

**Questions to Answer:**
- What has been built recently in this area?
- Are there recent changes that affect this feature?
- Have conventions changed recently?

**Output:** Note any relevant recent changes

---

### 4. Check Database Schema

**Location:** `lib/types/database.types.ts`

**What to Check:**
- [ ] Existing tables that may be relevant
- [ ] Column names and conventions
- [ ] Relationship patterns (foreign keys)
- [ ] Existing types and interfaces

**Questions to Answer:**
- Do tables for this feature already exist?
- What are the naming conventions?
- How are relationships structured?
- Are there existing types to reuse?

**Output:** List relevant tables and types

**Also Check:** `supabase/migrations/` for migration patterns

---

### 5. Review Relevant Protocols

**Protocols to Check:**
- `.claude/protocols/database-migrations.md` - If implementing database changes
- `.claude/protocols/documentation.md` - To understand documentation requirements
- `.claude/protocols/deployment.md` - To understand deployment requirements

**Questions to Answer:**
- What procedures must be followed?
- Are there protocol requirements for this feature type?
- What documentation will be required?

**Output:** List of protocols that will be triggered

---

### 6. Third-Party Library Patterns

**Mux Components** (`@mux/mux-uploader-react`, `@mux/mux-player-react`)
- Event handlers use `any` type (not React SyntheticEvent)
```typescript
// Need event data (progress, time, etc.)
const handleProgress = (event: any) => { ... }

// Don't need event data
const handleSuccess = () => { ... }
```
- Reference: Commits `2bd4254`, `4d6f71f`

**[Future libraries added here]**

**Output:** Document library-specific patterns found in research findings

---

## Research Output Format

After completing checklist, provide structured summary:

```markdown
## Research Findings

### Documentation Found
- /docs/component-patterns.md - Form handling section
- /docs/supabase-patterns.md - Row Level Security examples

### Similar Code Patterns
- app/admin/shows/new/page.tsx - Similar form structure
- lib/supabase/client.ts - Auth pattern to follow

### Recent Related Changes
- v0.1.0 (2024-11-14) - Added admin dashboard with forms

### Existing Database Schema
- Tables: shows, episodes (can be extended)
- Naming convention: snake_case for columns
- Timestamps: created_at, updated_at (with triggers)

### Protocols to Follow
- database-migrations.md (adding columns)
- documentation.md (JSDoc for new functions)

### Reusable Patterns
- Form submission pattern from shows/new/page.tsx
- Error handling from existing admin pages
- Loading states from dashboard components
```

---

## Common Research Scenarios

### Scenario: Implementing New Form

**Research Focus:**
1. Search for existing form pages (Glob: `app/**/new/page.tsx`)
2. Check form validation patterns (Grep: `validation`, `error`, `formData`)
3. Review error handling (Grep: `setError`, `catch`)
4. Check loading states (Grep: `loading`, `setLoading`)

**Expected Findings:**
- Existing forms in `app/admin/shows/new/page.tsx`
- Form submission patterns with error handling
- Loading state management
- Redirect after success pattern

---

### Scenario: Adding Database Table

**Research Focus:**
1. Check `database.types.ts` for naming conventions
2. Review existing migrations for RLS policy patterns
3. Check relationship patterns (foreign keys)
4. Review existing table structures

**Expected Findings:**
- Naming: `snake_case` for tables and columns
- All tables have `created_at`, `updated_at`
- RLS policies follow user ownership pattern
- UUID primary keys with `uuid_generate_v4()`

---

### Scenario: Implementing Authentication Check

**Research Focus:**
1. Search for existing auth patterns (Grep: `auth.getUser`, `createClient`)
2. Check server vs client component patterns
3. Review middleware authentication
4. Check admin access control

**Expected Findings:**
- Server components use `await createClient()` from `lib/supabase/server`
- Client components use `createClient()` from `lib/supabase/client`
- Admin check pattern: Check `is_admin` in profiles table
- Protected routes use middleware

---

## Integration with Feature Development

### Within 8-Step Workflow

```
Step 1: Launch agents
Step 2: Create TodoWrite
Step 3: RESEARCH (this protocol) ← YOU ARE HERE
    ├─> Check docs
    ├─> Search code
    ├─> Review CHANGELOG
    ├─> Check schema
    └─> Review protocols
Step 4: Audit codebase (informed by research)
Step 5: Plan (using patterns found in research)
...
```

**Research informs:**
- Step 4 (Audit) - Where to look for affected code
- Step 5 (Plan) - What patterns to follow
- Step 6 (Implementation) - What code to reuse

---

## Success Criteria

Research is complete when:
- ✅ All 5 checklist items executed
- ✅ Findings documented in structured format
- ✅ Existing patterns identified (or noted if none exist)
- ✅ Reusable code located
- ✅ Conventions understood
- ✅ Output provides clear direction for implementation

---

## Anti-Patterns to Avoid

### ❌ Skipping Research
**Problem:** Implementing duplicate functionality or violating conventions

**Solution:** Always execute full research checklist before implementing

### ❌ Superficial Search
**Problem:** Quick grep without understanding context

**Solution:** Read found code to understand pattern, don't just note it exists

### ❌ Ignoring Findings
**Problem:** Finding existing patterns but implementing differently

**Solution:** Follow established patterns unless there's a compelling reason to diverge (discuss with user)

### ❌ Not Documenting Findings
**Problem:** Research done but findings not recorded for plan

**Solution:** Always output structured findings summary

---

## Notes

**When No Existing Patterns Found:**
- Note that new pattern is being established
- Document pattern thoroughly for future reference
- Add to `/docs/` as reference for next time

**When Multiple Patterns Found:**
- Document all patterns
- Note which is most recent/preferred
- Ask user if uncertain which to follow

**When Patterns Conflict:**
- Document the conflict
- Ask user for direction
- Update docs to establish standard
