# Database Migrations Protocol

**Purpose:** Prevent schema drift, ensure Row Level Security, maintain type safety

**Type:** Sub-protocol (triggered by schema change keywords)

---

## When to Use

### Automatic Triggers
This protocol is **mandatory** when ANY of these keywords appear in context:
- CREATE TABLE
- ALTER TABLE
- DROP (table, column, index)
- INDEX (creating or modifying)
- POLICY (RLS policies)
- schema modification
- add column
- remove column
- migration

### Examples That Trigger This Protocol
- ✅ "Add a favorites table"
- ✅ "Add cloudflare_stream_id column to episodes"
- ✅ "Create index on watch_history.profile_id"
- ✅ "Update RLS policy for shows table"
- ✅ "Remove deprecated fields"

### No Exemptions
Database changes ALWAYS trigger this protocol. Security and data integrity are non-negotiable.

---

## Mandatory Migration Workflow

### Step 1: Create Migration File

**Location:** `supabase/migrations/`

**Naming Convention:**
```
XXX_description_of_change.sql

Examples:
002_add_favorites_table.sql
003_add_cloudflare_stream_id_to_episodes.sql
004_add_indexes_for_performance.sql
005_update_shows_rls_policies.sql
```

**Numbering:**
- Start from last migration number + 1
- Use 3-digit zero-padded numbers (001, 002, etc.)
- Check existing migrations to find next number

---

### Step 2: Write Migration SQL

**Required Components:**
1. Comment header explaining change
2. Schema modifications (CREATE, ALTER, DROP)
3. Row Level Security policies (if applicable)
4. Indexes for performance (if applicable)
5. Triggers/functions (if applicable)

**Template:**

```sql
-- Migration: Add favorites table for user-saved shows
-- Purpose: Allow users to favorite shows for quick access
-- Date: 2024-11-15

-- Create favorites table
CREATE TABLE favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  show_id UUID REFERENCES shows(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  UNIQUE(profile_id, show_id) -- User can only favorite a show once
);

-- Enable Row Level Security
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can create favorites"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can delete own favorites"
  ON favorites FOR DELETE
  USING (auth.uid() = profile_id);

-- Indexes for performance
CREATE INDEX idx_favorites_profile_id ON favorites(profile_id);
CREATE INDEX idx_favorites_show_id ON favorites(show_id);
```

---

### Step 3: Row Level Security Policies

**CRITICAL:** All tables MUST have RLS enabled and policies defined.

**RLS Policy Patterns:**

**User-Owned Data (profiles, lineups, favorites, watch_history):**
```sql
-- Users can view their own data
CREATE POLICY "Users can view own {table}"
  ON {table} FOR SELECT
  USING (auth.uid() = profile_id);

-- Users can create their own data
CREATE POLICY "Users can create {table}"
  ON {table} FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

-- Users can update their own data
CREATE POLICY "Users can update own {table}"
  ON {table} FOR UPDATE
  USING (auth.uid() = profile_id);

-- Users can delete their own data
CREATE POLICY "Users can delete own {table}"
  ON {table} FOR DELETE
  USING (auth.uid() = profile_id);
```

**Public Data (published shows, episodes):**
```sql
-- Everyone can view published content
CREATE POLICY "Published {table} are viewable by everyone"
  ON {table} FOR SELECT
  USING (
    status = 'published' OR
    auth.uid() = creator_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );
```

**Admin-Only Data:**
```sql
-- Only admins can create
CREATE POLICY "Admins can insert {table}"
  ON {table} FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Only admins can update
CREATE POLICY "Admins can update {table}"
  ON {table} FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );
```

**Child Profiles (requires parent check):**
```sql
CREATE POLICY "Users can view own child profiles"
  ON child_profiles FOR SELECT
  USING (auth.uid() = parent_id);
```

---

### Step 4: Update TypeScript Types

**File:** `lib/types/database.types.ts`

**Add new table types:**

```typescript
export interface Database {
  public: {
    Tables: {
      // ... existing tables

      favorites: {
        Row: {
          id: string;
          profile_id: string;
          show_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          show_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          show_id?: string;
          created_at?: string;
        };
      };
    };
  };
}
```

**For added columns, update existing table type:**

```typescript
episodes: {
  Row: {
    // ... existing columns
    cloudflare_stream_id: string | null; // NEW
  };
  Insert: {
    // ... existing columns
    cloudflare_stream_id?: string | null; // NEW
  };
  Update: {
    // ... existing columns
    cloudflare_stream_id?: string | null; // NEW
  };
};
```

---

### Step 5: Run Migration in Supabase

**Process:**
1. Open Supabase Dashboard: https://rywutxlxcusnajfvzksy.supabase.co
2. Navigate to **SQL Editor** (left sidebar)
3. Click **"New Query"**
4. Copy entire migration file contents
5. Paste into SQL Editor
6. Click **"Run"** (or press Ctrl+Enter)
7. Verify success: "Success. No rows returned"

**If Error Occurs:**
- Read error message carefully
- Fix issue in migration file
- Try running again
- Common issues:
  - Syntax errors
  - Table/column already exists
  - Foreign key constraints violated
  - Missing parentheses or semicolons

---

### Step 6: Verify Migration Success

**Checks to Perform:**

**1. Table Created:**
- Navigate to **Database** → **Tables**
- Verify new table appears in list
- Check column names and types

**2. RLS Enabled:**
- Click on table
- Check "Row Level Security" is enabled
- Verify policies exist

**3. Indexes Created:**
- Navigate to **Database** → **Indexes**
- Verify indexes appear for new table

**4. Test Policy:**
- Try inserting test data via SQL Editor
- Verify RLS policies work as expected
- Delete test data after verification

---

## Common Migration Patterns

### Adding a New Table

```sql
-- Migration: Add {table_name}
-- Purpose: {explain purpose}

CREATE TABLE {table_name} (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  -- other columns
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE {table_name} ENABLE ROW LEVEL SECURITY;

-- Policies (see Step 3 for patterns)

-- Indexes
CREATE INDEX idx_{table_name}_profile_id ON {table_name}(profile_id);

-- Updated timestamp trigger (if has updated_at)
CREATE TRIGGER update_{table_name}_updated_at
  BEFORE UPDATE ON {table_name}
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
```

### Adding a Column

```sql
-- Migration: Add {column_name} to {table_name}
-- Purpose: {explain purpose}

ALTER TABLE {table_name}
  ADD COLUMN {column_name} {TYPE} {NULL/NOT NULL} {DEFAULT value};

-- Add index if frequently queried
CREATE INDEX idx_{table_name}_{column_name} ON {table_name}({column_name});

-- Update RLS policies if column affects security
-- (Only if needed)
```

### Adding an Index

```sql
-- Migration: Add index for {table_name}.{column_name}
-- Purpose: Improve query performance for {explain query}

CREATE INDEX idx_{table_name}_{column_name} ON {table_name}({column_name});

-- For composite indexes:
CREATE INDEX idx_{table_name}_{col1}_{col2} ON {table_name}({col1}, {col2});
```

### Updating RLS Policy

```sql
-- Migration: Update RLS policy for {table_name}
-- Purpose: {explain why policy needs updating}

-- Drop old policy
DROP POLICY "old_policy_name" ON {table_name};

-- Create new policy
CREATE POLICY "new_policy_name"
  ON {table_name} FOR {SELECT|INSERT|UPDATE|DELETE}
  USING ({new_condition});
```

---

## Pre-Migration Checklist

Before running migration:
- [ ] Migration file created in `supabase/migrations/`
- [ ] Naming follows convention (XXX_description.sql)
- [ ] Comment header explains purpose
- [ ] RLS policies included for new tables
- [ ] Indexes added for foreign keys and frequently queried columns
- [ ] TypeScript types updated in database.types.ts
- [ ] Migration tested locally (if possible) or reviewed carefully

---

## Post-Migration Checklist

After running migration:
- [ ] Verify "Success" message in SQL Editor
- [ ] Check table appears in Database → Tables
- [ ] Verify RLS enabled on new tables
- [ ] Verify policies exist and are correct
- [ ] Verify indexes created
- [ ] Test inserting/querying data
- [ ] Commit migration file to git
- [ ] Update CHANGELOG.md with schema change

---

## Integration with Feature Development

### Within 8-Step Workflow

```
Step 1-5: Planning phase
Step 6: Implementation ← Triggers database-migrations.md
    ├─> Schema change needed
    ├─> PAUSE implementation
    ├─> Create migration file
    ├─> Write migration SQL
    ├─> Add RLS policies
    ├─> Update database.types.ts
    ├─> Run migration in Supabase
    ├─> Verify success
    └─> RESUME implementation with new schema
Step 7-8: Documentation and deployment
```

---

## Common Mistakes to Avoid

### ❌ Forgetting RLS Policies
**Problem:** Table created without RLS = security vulnerability

**Solution:** ALWAYS enable RLS and add policies for new tables

### ❌ Not Updating TypeScript Types
**Problem:** Type mismatches, IDE doesn't know about new columns

**Solution:** Update database.types.ts immediately after schema change

### ❌ Missing Indexes
**Problem:** Slow queries on foreign keys and frequently searched columns

**Solution:** Add indexes for: foreign keys, columns used in WHERE/JOIN

### ❌ Not Testing Migration
**Problem:** Migration fails in production

**Solution:** Always run in Supabase SQL Editor and verify success

### ❌ Breaking Existing Data
**Problem:** Adding NOT NULL column without default breaks existing rows

**Solution:** Either add DEFAULT or make column nullable initially

---

## Security Checklist

Before finalizing migration:
- [ ] RLS enabled on all new tables
- [ ] SELECT policy prevents unauthorized reads
- [ ] INSERT policy validates ownership (auth.uid() check)
- [ ] UPDATE policy validates ownership
- [ ] DELETE policy validates ownership
- [ ] Admin checks use `is_admin = true` in profiles
- [ ] No policies that use client-provided IDs without auth.uid() check

---

## Notes

**Migration Numbering:**
- Never reuse migration numbers
- Never modify existing migration files (create new ones)
- Migrations should be idempotent when possible (check existence before creating)

**Down Migrations:**
- Not required for this project (Supabase doesn't support automatic rollback)
- Document how to revert manually if needed
- Use caution with DROP operations (data loss)

**Testing:**
- Always test migrations in Supabase dashboard before committing
- Use Supabase "SQL Snippets" to save complex migrations
- Keep a backup query to revert if needed

**Performance:**
- Add indexes for foreign keys
- Add indexes for columns in WHERE clauses
- Add indexes for columns used in JOIN
- Don't over-index (each index has write cost)
