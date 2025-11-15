# Documentation Protocol

**Purpose:** Ensure documentation is never forgotten and remains up-to-date

**Type:** Universal trigger (before marking ANY task complete)

---

## When to Use

### Universal Trigger
This protocol is triggered **before considering ANY task complete**.

No keywords needed - this protocol ALWAYS runs at task completion.

### Explicit Exemptions (Do NOT Require Documentation)
- Typo corrections (spelling/grammar fixes only)
- Code formatting changes (prettier, linting)
- Pure refactors with no behavior change (internal only, no API changes)
- Reverting changes (git revert)

**If unsure whether exemption applies:** Trigger protocol (safer to document than skip)

---

## Documentation Requirements by Change Type

### 1. New Features

**Required Documentation:**
- ✅ **CHANGELOG.md** - Add to "Unreleased" section under "### Added"
- ✅ **JSDoc** - Document public functions with parameters, returns, examples
- ✅ **Inline comments** - Explain complex business logic

**CHANGELOG Example:**
```markdown
## [Unreleased]

### Added
- Video upload to Cloudflare Stream with progress tracking
- Favorites feature allowing users to save shows for quick access
```

**JSDoc Example:**
```typescript
/**
 * Uploads video file to Cloudflare Stream
 *
 * @param file - Video file to upload (max 500MB)
 * @param showId - ID of the show this episode belongs to
 * @param onProgress - Callback for upload progress (0-100)
 * @returns Cloudflare Stream video ID
 * @throws {Error} If upload fails or file exceeds size limit
 *
 * @example
 * const streamId = await uploadToCloudflare(file, showId, (progress) => {
 *   console.log(`Upload ${progress}% complete`);
 * });
 */
export async function uploadToCloudflare(
  file: File,
  showId: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  // implementation
}
```

---

### 2. Schema Changes

**Required Documentation:**
- ✅ **Migration file** - Comment header explaining purpose
- ✅ **database.types.ts** - Update TypeScript types
- ✅ **CHANGELOG.md** - Add to "Unreleased" under "### Changed"
- ✅ **Migration file comments** - Document what tables/columns affected

**Migration Comment Example:**
```sql
-- Migration: Add favorites table
-- Purpose: Allow users to save favorite shows for quick access
-- Affects: Creates new favorites table with RLS policies
-- Related: Shows, profiles tables (foreign keys)
```

**CHANGELOG Example:**
```markdown
## [Unreleased]

### Changed
- Database schema: Added favorites table for user-saved shows
- Database schema: Added cloudflare_stream_id column to episodes table
```

---

### 3. Breaking Changes

**Required Documentation:**
- ✅ **CHANGELOG.md** - Add to "Unreleased" under "### Changed" with "**BREAKING:**" prefix
- ✅ **Migration guide** - Document how to migrate existing code/data
- ✅ **Update affected documentation** - Fix any docs that reference old behavior

**CHANGELOG Example:**
```markdown
## [Unreleased]

### Changed
- **BREAKING:** Episodes now require cloudflare_stream_id instead of video_url
  - Migration: Run migration 004_add_cloudflare_stream_id.sql
  - Update: Change all episode creation to use Cloudflare Stream upload
```

---

### 4. Bug Fixes

**Required Documentation:**
- ✅ **CHANGELOG.md** - Add to "Unreleased" under "### Fixed"
- ❌ **JSDoc** - Not required unless function signature changed
- ❌ **Inline comments** - Not required unless fixing complex logic

**CHANGELOG Example:**
```markdown
## [Unreleased]

### Fixed
- Admin dashboard now correctly checks is_admin flag before allowing access
- Episode upload no longer times out for large video files
```

---

### 5. API Routes / Server Actions

**Required Documentation:**
- ✅ **JSDoc** - Document request/response types, error codes
- ✅ **CHANGELOG.md** - Add to "Unreleased" under "### Added"
- ✅ **Inline comments** - Document authentication/authorization logic

**API Route JSDoc Example:**
```typescript
/**
 * POST /api/episodes/upload
 *
 * Handles video upload to Cloudflare Stream
 *
 * @auth Required - User must be admin
 *
 * Request body:
 * @param {File} file - Video file (max 500MB, mp4/mov/avi)
 * @param {string} showId - UUID of parent show
 * @param {string} episodeId - UUID of episode
 *
 * Response:
 * @returns {object} { streamId: string, status: string }
 *
 * Error responses:
 * @throws {401} User not authenticated
 * @throws {403} User not admin
 * @throws {400} File too large or invalid format
 * @throws {500} Cloudflare Stream API error
 */
export async function POST(request: Request) {
  // implementation
}
```

---

### 6. Components (Reusable)

**Required Documentation:**
- ✅ **JSDoc** - Document props, usage examples
- ❌ **CHANGELOG.md** - Only if component is major feature
- ✅ **Inline comments** - Complex state management or effects

**Component JSDoc Example:**
```typescript
/**
 * VideoUploader component for admin episode management
 *
 * Handles file selection, validation, upload to Cloudflare Stream,
 * and progress tracking.
 *
 * @param {object} props
 * @param {string} props.episodeId - Episode to attach video to
 * @param {string} props.showId - Parent show ID
 * @param {function} props.onComplete - Callback when upload completes
 * @param {function} props.onError - Callback when upload fails
 *
 * @example
 * <VideoUploader
 *   episodeId={episode.id}
 *   showId={show.id}
 *   onComplete={(streamId) => console.log('Uploaded:', streamId)}
 *   onError={(error) => console.error('Failed:', error)}
 * />
 */
export function VideoUploader({
  episodeId,
  showId,
  onComplete,
  onError
}: VideoUploaderProps) {
  // implementation
}
```

---

## CHANGELOG.md Format

**Follow "Keep a Changelog" Standard:**

### Structure
```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- New features

### Changed
- Changes to existing functionality
- Breaking changes (prefix with **BREAKING:**)

### Deprecated
- Soon-to-be removed features

### Removed
- Removed features

### Fixed
- Bug fixes

### Security
- Security fixes

## [0.1.0] - 2024-11-14

### Added
- Initial release
- Feature list
```

### Categories
- **Added** - New features
- **Changed** - Changes to existing functionality (include **BREAKING:** prefix if breaking)
- **Deprecated** - Features that will be removed soon
- **Removed** - Removed features
- **Fixed** - Bug fixes
- **Security** - Security fixes

### Version Numbers (Semantic Versioning)
- **MAJOR.MINOR.PATCH** (e.g., 1.2.3)
- **MAJOR** - Breaking changes
- **MINOR** - New features (backward compatible)
- **PATCH** - Bug fixes (backward compatible)

**Current version:** 0.1.0 (pre-release, everything can change)

---

## JSDoc Templates

### Function Template
```typescript
/**
 * Brief description of what function does
 *
 * Longer description if needed, explaining:
 * - Complex behavior
 * - Edge cases
 * - Important constraints
 *
 * @param {type} paramName - Description
 * @param {type} paramName2 - Description
 * @returns {type} Description of return value
 * @throws {ErrorType} When this error occurs
 *
 * @example
 * const result = functionName(arg1, arg2);
 */
```

### Component Template
```typescript
/**
 * Component description
 *
 * @param {object} props
 * @param {type} props.propName - Description
 * @param {type} props.propName2 - Description
 *
 * @example
 * <ComponentName prop1="value" prop2={value} />
 */
```

### Type/Interface Template
```typescript
/**
 * Description of what this type represents
 *
 * @property {type} propName - Description
 * @property {type} propName2 - Description
 */
```

---

## Inline Comments Guidelines

### When to Add Comments

**DO comment:**
- ✅ Complex business logic
- ✅ Non-obvious algorithms
- ✅ Security checks (explain why)
- ✅ Workarounds for bugs/limitations
- ✅ Performance optimizations (explain why)
- ✅ Magic numbers (explain what they represent)

**DON'T comment:**
- ❌ Obvious code (`x = x + 1 // increment x`)
- ❌ Code that should be self-documenting (use better names instead)
- ❌ Commented-out code (delete it, it's in git history)

### Good Comment Examples

```typescript
// Check admin access - RLS policies handle user access,
// but admin check must be explicit for content creation
const { data: profile } = await supabase
  .from('profiles')
  .select('is_admin')
  .eq('id', user.id)
  .single();

if (!profile?.is_admin) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
}

// Cloudflare Stream has 500MB file size limit
// See: https://developers.cloudflare.com/stream/uploading-videos/
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB in bytes
```

---

## Documentation Checklist

Before marking task complete:

**For All Changes (unless exempted):**
- [ ] CHANGELOG.md updated under "Unreleased" section
- [ ] Change categorized correctly (Added, Changed, Fixed, etc.)

**For New Features:**
- [ ] Public functions have JSDoc
- [ ] Complex logic has inline comments
- [ ] CHANGELOG.md has entry under "Added"

**For Schema Changes:**
- [ ] Migration file has comment header
- [ ] database.types.ts updated
- [ ] CHANGELOG.md has entry under "Changed"

**For Breaking Changes:**
- [ ] CHANGELOG.md entry prefixed with "**BREAKING:**"
- [ ] Migration guide provided
- [ ] Affected documentation updated

**For API Routes:**
- [ ] JSDoc documents request/response types
- [ ] JSDoc documents error codes
- [ ] Auth requirements documented

**For Reusable Components:**
- [ ] Props documented with JSDoc
- [ ] Usage example provided
- [ ] Complex state/effects commented

---

## Integration with Feature Development

### Within 8-Step Workflow

```
Step 1-6: Planning and implementation
Step 7: DOCUMENTATION (this protocol) ← YOU ARE HERE
    ├─> Determine change type
    ├─> Update CHANGELOG.md
    ├─> Add JSDoc if needed
    ├─> Add inline comments if needed
    ├─> Update database.types.ts if schema changed
    └─> Verify all documentation complete
Step 8: Deployment
```

**Documentation runs BEFORE deployment** - no skipping!

---

## Common Scenarios

### Scenario: Added new feature with database change

**Documentation Required:**
1. CHANGELOG.md - Add to "Unreleased" → "Added"
2. CHANGELOG.md - Add to "Unreleased" → "Changed" (for schema)
3. database.types.ts - Update types
4. Migration file - Add comment header
5. Public functions - Add JSDoc
6. Complex logic - Add inline comments

### Scenario: Fixed bug (no API changes)

**Documentation Required:**
1. CHANGELOG.md - Add to "Unreleased" → "Fixed"

**Documentation NOT Required:**
- JSDoc (unless function signature changed)
- Inline comments (unless fixing complex logic)

### Scenario: Refactored code (no behavior change)

**Documentation Required:**
- None (exempted as pure refactor)

**Unless:**
- Behavior changed → Document as "Changed"
- API changed → Update JSDoc

---

## Anti-Patterns to Avoid

### ❌ Skipping CHANGELOG
**Problem:** No record of what changed between versions

**Solution:** ALWAYS update CHANGELOG before deployment (unless exempted)

### ❌ Vague CHANGELOG Entries
**Bad:** "Updated episodes"
**Good:** "Added cloudflare_stream_id column to episodes table for video hosting"

### ❌ JSDoc After-the-Fact
**Problem:** Writing docs long after code is written (never happens)

**Solution:** Write JSDoc as you write the function

### ❌ Over-Commenting
**Problem:** Comments explaining obvious code

**Solution:** Only comment non-obvious logic, use better variable names for obvious code

### ❌ Outdated Comments
**Problem:** Code changes but comments don't

**Solution:** Update comments when changing code, or delete if no longer accurate

---

## Success Criteria

Documentation is complete when:
- ✅ CHANGELOG.md updated (unless exempted)
- ✅ JSDoc added for public functions/components (if new or changed)
- ✅ Inline comments added for complex logic
- ✅ database.types.ts updated (if schema changed)
- ✅ Migration file has comment header (if database change)
- ✅ Breaking changes clearly marked in CHANGELOG
- ✅ All documentation accurate and up-to-date

---

## Notes

**CHANGELOG Commits:**
- Update CHANGELOG in same commit as code changes
- Don't create separate "update CHANGELOG" commits
- CHANGELOG should be part of the feature/fix commit

**Version Releases:**
- Move "Unreleased" changes to new version when deploying to production
- Add date to version header: `## [0.2.0] - 2024-11-15`
- Create new "Unreleased" section for next changes

**Documentation as Code:**
- Documentation lives with code in same repo
- Review documentation in code reviews
- Outdated documentation is a bug
