# Feature Development Protocol

**Purpose:** Enforce complete development workflow from initial request to deployment

**Type:** Master Orchestrator (coordinates other protocols)

---

## When to Use

### Automatic Triggers
This protocol is **mandatory** when user request contains these keywords:
- "implement" + (feature/functionality/page/component/system)
- "add" + (feature/functionality/page/component/system)
- "build" + (feature/functionality/page/component/system)
- "create" + (feature/functionality/page/component/system)

### Examples That Trigger This Protocol
- ✅ "Implement video upload to Cloudflare Stream"
- ✅ "Add user profile editing"
- ✅ "Build the lineup creator"
- ✅ "Create a browse catalog page"

### Explicit Exemptions (Do NOT Trigger)
- Typo corrections
- Code formatting changes (prettier, linting fixes)
- Documentation-only updates
- Reverting changes
- Dependency updates only (package.json changes without code changes)

---

## Mandatory 8-Step Workflow

### Step 1: Launch and Coordinate Agents

**Requirement:** Use multiple agents for feature implementation

**Default Behavior:**
- Start from presumption of coordinating multiple agents
- Only use single agent if work could not be significantly faster or higher quality with multiple
- Governed by global CLAUDE.md multi-agent rules

**Agent Coordination:**
- Launch agents in parallel when tasks are independent
- Use single message with multiple Task tool calls
- Specify clear task boundaries for each agent

**Example:**
```
User: "Implement video upload to Cloudflare Stream"

Claude launches:
- Agent 1: Research Cloudflare Stream API and pricing
- Agent 2: Audit existing upload flow and admin dashboard
- Agent 3: Search for similar upload patterns in codebase
```

---

### Step 2: Create TodoWrite Tracking Document

**Requirement:** Create tracking document at workflow start, update throughout

**TodoWrite Requirements:**
- Create todos before starting implementation
- One todo per distinct task/step
- Mark as in_progress when starting a task
- Mark as completed immediately after finishing (don't batch)
- Exactly ONE task in_progress at any time

**Example:**
```
TodoWrite:
1. [in_progress] Research Cloudflare Stream API
2. [pending] Create database migration for video_uploads table
3. [pending] Build upload form component
4. [pending] Implement server-side upload handler
5. [pending] Add video processing status tracking
6. [pending] Update documentation
7. [pending] Deploy and verify
```

---

### Step 3: Check Relevant Documentation

**Requirement:** Trigger research protocol before implementing

**Action:** Load and execute `.claude/protocols/research.md`

**Research Checklist:**
- [ ] Check `/docs/` for existing guides
- [ ] Search codebase for similar patterns
- [ ] Review CHANGELOG.md for recent related work
- [ ] Check database schema for existing tables
- [ ] Review relevant protocols
- [ ] Check third-party library patterns: **Mux** (use `any` type for event handlers) - see research.md section 6

**Output:** Document findings in response to user

---

### Step 4: Audit Relevant Codebase Sections

**Requirement:** Understand current state before making changes

**Audit Checklist:**
- [ ] Identify files/components that will be modified
- [ ] Understand data flow for affected features
- [ ] Check existing patterns that should be followed
- [ ] Identify potential conflicts or breaking changes
- [ ] Review related database tables and queries
- [ ] Check authentication/authorization requirements

**Common Audit Targets:**
- `app/admin/` - Admin dashboard pages
- `lib/supabase/` - Database client patterns
- `supabase/migrations/` - Existing schema
- `lib/types/database.types.ts` - Type definitions

**Output:** Brief summary of current state and how changes will integrate

---

### Step 5: Develop Plan & Get User Approval

**Requirement:** Present detailed plan before proceeding with implementation

**Plan Structure:**
1. **Overview:** High-level summary of approach
2. **Files to Create/Modify:** List all affected files
3. **Database Changes:** Schema modifications (if any)
4. **Implementation Steps:** Ordered list of tasks
5. **Testing Strategy:** How to verify it works
6. **Risks/Considerations:** Potential issues or trade-offs

**Approval Process:**
- Present plan clearly
- Wait for explicit user approval
- If user requests changes, revise plan
- Do NOT proceed to Step 6 without approval

**Example Plan:**
```
## Video Upload Implementation Plan

### Overview
Integrate Cloudflare Stream for video uploads with progress tracking

### Files to Create
- app/admin/shows/[id]/episodes/[episodeId]/upload/page.tsx
- lib/cloudflare-stream.ts

### Files to Modify
- app/admin/shows/[id]/episodes/new/page.tsx
- .env.local (add CLOUDFLARE_STREAM_API_KEY)

### Database Changes
- Add column: episodes.cloudflare_stream_id
- Add table: video_upload_progress

### Implementation Steps
1. Create Cloudflare Stream client utility
2. Add upload progress table migration
3. Build upload form component
4. Implement server-side upload handler
5. Add progress tracking
6. Update episode creation flow
7. Test upload with sample video
8. Update documentation
9. Deploy

### Testing
- Upload video file (< 100MB)
- Verify progress tracking updates
- Check video appears in Cloudflare dashboard
- Verify episode playback works

### Risks
- Large files may timeout (implement chunked upload)
- Need Cloudflare API key (user must provide)
```

---

### Step 6: Implement with Coordinated Agents

**Requirement:** Execute implementation using multiple agents when beneficial

**Implementation Standards:**
- Write ES6 modules only
- Include inline documentation for complex logic
- Handle errors on all external calls
- Validate inputs at system boundaries
- Follow existing patterns in codebase
- Test as you implement (don't wait until end)

**Sub-Protocol Triggers:**

**Database Changes:**
- If creating/modifying tables → Trigger `database-migrations.md`
- If adding columns → Trigger `database-migrations.md`
- If updating RLS policies → Trigger `database-migrations.md`

**Inline Documentation:**
- Complex functions → Add JSDoc
- Business logic → Add explanatory comments
- Non-obvious code → Explain why, not what

**Testing During Implementation:**
- Build passes: `npm run build`
- No TypeScript errors
- Test forms submit correctly
- Test error states display
- Test loading states work

---

### Step 7: Complete Outstanding Documentation

**Requirement:** Trigger documentation protocol before marking task complete

**Action:** Load and execute `.claude/protocols/documentation.md`

**Documentation Requirements:**
- Update CHANGELOG.md with changes
- Add JSDoc to new public functions
- Update API documentation if routes added
- Document schema changes in migration file
- Update database.types.ts if schema changed

**Cannot Skip:** Documentation protocol runs before task considered complete

---

### Step 8: Deploy

**Requirement:** Trigger deployment protocol for completed work

**Action:** Load and execute `.claude/protocols/deployment.md`

**Deployment Checklist:**
- [ ] Build passes locally
- [ ] No TypeScript errors
- [ ] Documentation updated
- [ ] No secrets in code
- [ ] Commit with proper message
- [ ] Push to GitHub
- [ ] Verify deployment in Vercel
- [ ] Test deployed functionality

**Cannot Skip:** Deployment protocol must complete successfully

---

## Workflow Visualization

```
User Request: "Implement X feature"
    ↓
feature-development.md triggered (keyword match)
    ↓
Step 1: Launch agents for parallel work
    ↓
Step 2: Create TodoWrite tracking
    ↓
Step 3: research.md → Check docs/code for existing solutions
    ↓
Step 4: Audit codebase → Understand current state
    ↓
Step 5: Present plan → Get user approval
    ↓ (approval required)
Step 6: Implement
    ├─> database-migrations.md (if schema changes)
    ├─> Write frontend code
    ├─> Write backend code
    ├─> Add inline docs
    └─> Test during implementation
    ↓
Step 7: documentation.md → Update CHANGELOG, JSDoc, API docs
    ↓
Step 8: deployment.md → Build, commit, deploy, verify
    ↓
✅ Task Complete
```

---

## Common Scenarios

### Scenario: User asks to implement new feature

1. Protocol triggers automatically (keyword match)
2. Launch agents to research and audit
3. Create TodoWrite tracking
4. Execute research protocol
5. Audit relevant code sections
6. Present detailed plan
7. Wait for approval
8. Implement with agents (trigger sub-protocols as needed)
9. Document everything
10. Deploy and verify

### Scenario: Feature requires database changes

1. Follow steps 1-5 as normal
2. During Step 6 (implement):
   - Trigger database-migrations.md when creating tables
   - Create migration file
   - Update database.types.ts
   - Include in implementation
3. Continue with steps 7-8

### Scenario: User requests documentation-only change

1. Protocol does NOT trigger (explicit exemption)
2. Make documentation changes directly
3. Commit and push (no full workflow needed)

---

## Failure Modes & Recovery

### User doesn't approve plan (Step 5)
- Ask clarifying questions
- Revise plan based on feedback
- Present updated plan
- Do NOT proceed without approval

### Build fails during implementation (Step 6)
- Fix errors immediately
- Do not continue with broken build
- Run `npm run build` to verify
- Update TodoWrite with fix

### Documentation incomplete (Step 7)
- Cannot proceed to deployment
- Complete all required documentation
- Verify CHANGELOG updated
- Verify types updated if schema changed

### Deployment fails (Step 8)
- Check Vercel logs
- Fix issues
- Re-run deployment protocol
- Verify deployment successful before marking complete

---

## Success Criteria

Task is only considered complete when:
- ✅ All 8 steps executed successfully
- ✅ TodoWrite shows all tasks completed
- ✅ Documentation updated (CHANGELOG, JSDoc, types)
- ✅ Build passes with no errors
- ✅ Deployed to dev.justplay.cc
- ✅ Post-deployment verification passed
- ✅ User can test the feature

---

## Notes

**Multi-Agent Coordination:**
- Governed by global CLAUDE.md multi-agent rules
- Default to multiple agents
- Only use single agent if work couldn't be faster/better with multiple

**Exemptions:**
- Exhaustive list only (no judgment calls)
- If uncertain, trigger protocol (better safe than sorry)
- User can explicitly bypass with "skip protocol" directive

**Sub-Protocol Orchestration:**
- This protocol coordinates other protocols
- Sub-protocols triggered at specific steps
- Cannot skip sub-protocols (they're part of workflow)
