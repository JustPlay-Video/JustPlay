# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Mux Video Integration** - Complete video upload and playback system
  - Direct upload API endpoint (`/api/mux/upload`) with admin authentication
  - Webhook handler (`/api/mux/webhook`) for processing status updates
  - Mux client utility (`lib/mux/client.ts`) for API operations
  - MuxUploader component for admin video uploads
  - MuxPlayer component for video playback with HLS streaming
  - Database migration adding mux_asset_id, mux_playback_id, mux_upload_id to episodes
  - Support for both Mux uploads and manual video URLs
  - Automatic status updates via webhooks (processing → published)
  - MUX_SETUP.md comprehensive setup and troubleshooting guide
- Development protocol system with 5 mandatory protocols
- Feature development workflow (research → plan → implement → document → deploy)
- Research protocol for checking existing code and documentation
- Database migrations protocol with RLS policy templates
- Documentation protocol ensuring CHANGELOG and JSDoc updates
- Deployment protocol with pre/post verification checklists
- Project roadmap tracking phases and progress
- This CHANGELOG file to track all changes

### Changed
- Episode creation form now supports two upload methods:
  - Direct file upload via Mux (client-side upload)
  - Manual video URL entry (backward compatible)
- Episodes can be saved with "processing" status during Mux encoding
- Admin dashboard episode workflow updated for better UX

---

## [0.1.0] - 2024-11-14

### Added
- Initial Next.js 15 project setup with TypeScript and Tailwind CSS
- Supabase backend integration (PostgreSQL + Auth + Storage)
- Complete database schema with 8 core tables:
  - `profiles` - User profiles extending auth.users
  - `child_profiles` - Child accounts for parental controls
  - `shows` - TV shows/series metadata
  - `episodes` - Individual episodes with video URLs
  - `lineups` - User-created viewing schedules
  - `lineup_slots` - Episodes scheduled in lineups (day/time)
  - `watch_history` - Viewing progress tracking
  - `subscriptions` - Stripe subscription data (future)
- Row Level Security (RLS) policies for all tables
- Database triggers for automatic profile creation on signup
- Database triggers for automatic updated_at timestamp management
- User authentication system (login, signup, logout)
- Protected routes with middleware authentication
- Public homepage with feature highlights and CTAs
- User dashboard (authenticated users)
- Admin dashboard with role-based access control
  - Admin layout with navigation
  - Shows management (create, list, view, publish)
  - Episodes management (add episodes to shows)
  - Admin-only access enforcement (is_admin flag check)
- Environment variable configuration
- Deployment to Vercel at dev.justplay.cc
- Custom domain configuration (dev.justplay.cc)
- README with project overview and setup instructions
- Deployment guide for Vercel setup

### Database Schema
- Created initial migration: `001_initial_schema.sql`
- Implemented user ownership patterns with RLS
- Implemented public data patterns for published content
- Implemented admin-only patterns for content management
- Performance indexes on foreign keys and frequently queried columns

### Technical Infrastructure
- ES6 modules enforced throughout codebase
- TypeScript strict mode enabled
- Server-side and client-side Supabase client utilities
- Middleware for session management
- Form validation and error handling patterns
- Loading state management patterns
- Redirect after authentication patterns

### Developer Experience
- TypeScript types for database schema
- ESLint configuration
- Git repository initialized
- Vercel continuous deployment setup
- Development environment documentation

---

## Version History

### Version Numbering
Following Semantic Versioning (MAJOR.MINOR.PATCH):
- **MAJOR** - Breaking changes (not yet v1.0.0, so anything can change)
- **MINOR** - New features (backward compatible)
- **PATCH** - Bug fixes (backward compatible)

### Current Version: 0.1.0
Pre-release version. All features are subject to change until v1.0.0 release.

---

## Upcoming Changes

See [ROADMAP.md](./ROADMAP.md) for planned features and timeline.

**Next Release (0.2.0):**
- Public browse catalog
- Show detail pages for users
- Video player integration (Cloudflare Stream or Mux)
- Search and filter functionality

**Future Releases:**
- Lineup builder (v0.3.0)
- Watch history and resume playback (v0.4.0)
- Parental controls and child profiles (v0.5.0)
- Stripe subscription integration (v0.6.0)
- Public launch (v1.0.0)

---

## Notes

**Change Categories:**
- **Added** - New features
- **Changed** - Changes to existing functionality
- **Deprecated** - Soon-to-be removed features
- **Removed** - Removed features
- **Fixed** - Bug fixes
- **Security** - Security fixes

**Breaking Changes:**
When a change is breaking, it will be prefixed with `**BREAKING:**` in the description.

**Documentation:**
This CHANGELOG is updated before every deployment as part of the documentation protocol.
