# JustPlay Video Playback - Testing Checklist

This comprehensive checklist covers all implemented features across Phases 1-5.

---

## 🎬 Phase 1: Core Playback

### Watch Page Functionality
- [ ] **Valid Episode ID**
  - Navigate to `/watch/[validEpisodeId]`
  - Video player loads and displays
  - Video plays when play button clicked
  - Mux playback ID is correct

- [ ] **Invalid Episode ID**
  - Navigate to `/watch/nonexistent-id`
  - 404 Not Found page displays
  - No console errors

- [ ] **Processing State**
  - Episode with status="processing"
  - "Video is processing..." message displays
  - Spinning loader animation shows
  - No player controls visible

- [ ] **Error State**
  - Episode with status="error" or "failed"
  - "Video unavailable" message displays
  - Error icon visible
  - Helpful error message shown

- [ ] **No Playback ID**
  - Episode without mux_playback_id
  - "Video not ready" message displays
  - Clear explanation provided

### Video Player Controls
- [ ] Play/pause button works
- [ ] Seek bar works (scrub through video)
- [ ] Volume control works
- [ ] Fullscreen toggle works
- [ ] Keyboard shortcuts work:
  - [ ] Spacebar = play/pause
  - [ ] Arrow keys = seek forward/back
  - [ ] F = fullscreen

### Episode Metadata
- [ ] Episode title displays correctly
- [ ] Show name displays and links to show page
- [ ] Season and episode number correct
- [ ] Duration shows in minutes
- [ ] Description displays if available

### Navigation
- [ ] Back to dashboard link works
- [ ] Show name link navigates to show page
- [ ] Navbar links functional

---

## 🧭 Phase 2: Discovery & Navigation

### Browse Page
- [ ] Navigate to `/browse`
- [ ] All published shows display
- [ ] Shows in grid layout
- [ ] Show cards have:
  - [ ] Thumbnail (or placeholder)
  - [ ] Title
  - [ ] Description (truncated)
  - [ ] Genre badge
  - [ ] Age range (if applicable)
- [ ] Hover effects work on cards
- [ ] Click show card → navigates to show detail page
- [ ] Empty state shows if no published shows

### Show Detail Page
- [ ] Navigate to `/shows/[showId]`
- [ ] Show banner/thumbnail displays
- [ ] Show title, description, genre display
- [ ] Creator name shows if available
- [ ] Episodes grouped by season
- [ ] Season headers visible (Season 1, Season 2, etc.)
- [ ] Episodes in correct order (by episode number)
- [ ] Episode cards display:
  - [ ] Thumbnail
  - [ ] Episode title
  - [ ] Season/Episode number (S1E1)
  - [ ] Duration
  - [ ] Description (truncated)
- [ ] Click episode card → navigates to watch page
- [ ] Empty state if show has no episodes

### Episode Card Component
- [ ] Thumbnail displays (or video icon placeholder)
- [ ] Play button overlay appears on hover
- [ ] Card scales/shadows on hover
- [ ] Status badges display:
  - [ ] "Processing" for status="processing"
  - [ ] "Error" for status="error"
- [ ] Progress bar shows if `progressPercent` prop provided
- [ ] All metadata displays correctly

### Dashboard
- [ ] Navigate to `/dashboard`
- [ ] Welcome message with user name
- [ ] Three quick action cards:
  - [ ] Browse Shows
  - [ ] My Lineups
  - [ ] Favorites
- [ ] Click cards navigate to correct pages
- [ ] Continue Watching section (tested in Phase 3)
- [ ] Recently Added section placeholder

---

## 📊 Phase 3: Progress Tracking

### Watch History Saving
- [ ] Start watching an episode
- [ ] Progress saves automatically (check every 10-15 seconds)
- [ ] Database `watch_history` table updates
- [ ] progress_seconds field increments
- [ ] watched_at timestamp updates

### Resume Playback
- [ ] Watch episode partway through (e.g., 2 minutes)
- [ ] Navigate away or close page
- [ ] Return to same episode
- [ ] Video resumes from last position (±5 seconds)
- [ ] No manual seeking required

### Progress Bars
- [ ] Episode cards show progress bar at bottom
- [ ] Progress bar color is blue
- [ ] Progress percentage is accurate
- [ ] Progress bar updates after watching more

### Completion Tracking
- [ ] Watch episode to 90% completion
- [ ] `completed` field in watch_history sets to true
- [ ] Episode no longer appears in "Continue Watching"
- [ ] Watching a new episode creates new watch_history entry

### Continue Watching Section
- [ ] Dashboard shows "Continue Watching" section
- [ ] Up to 6 recent incomplete episodes display
- [ ] Episodes sorted by most recently watched
- [ ] Episode cards show correct progress bars
- [ ] Show titles display on episode cards
- [ ] Click episode → resumes from last position
- [ ] Completed episodes don't appear
- [ ] Empty state if no episodes started

### Debouncing & Performance
- [ ] Progress saves every 10 seconds (not every second)
- [ ] No excessive API calls (check Network tab)
- [ ] Seeking doesn't trigger multiple saves
- [ ] Pausing triggers save
- [ ] Ending video triggers save

---

## ⚙️ Phase 4: Settings Infrastructure

### Feature Flags - Admin Dashboard
- [ ] **Access Control**
  - [ ] Admin can access `/admin/settings/features`
  - [ ] Non-admin redirected to dashboard
  - [ ] Correct admin navbar links

- [ ] **Feature Flag Table**
  - [ ] All 7 feature flags display:
    - autoplay_next_episode
    - thumbnail_preview
    - playback_speed_control
    - quality_selector
    - theater_mode
    - skip_intro
    - seek_bar_thumbnails
  - [ ] Flag names displayed correctly
  - [ ] Descriptions shown
  - [ ] Current status (Enabled/Disabled) visible
  - [ ] Min role shown (Admin/User/Public)

- [ ] **Toggle Feature Flags**
  - [ ] Click Enable/Disable button
  - [ ] Status updates immediately
  - [ ] Button text changes
  - [ ] Button disabled during update
  - [ ] Database updates confirmed

- [ ] **Change Minimum Role**
  - [ ] Select different role from dropdown
  - [ ] Role updates immediately
  - [ ] Dropdown disabled during update
  - [ ] Database updates confirmed

- [ ] **RLS Policies**
  - [ ] Non-admin cannot modify flags (test via API)
  - [ ] Everyone can read flags

### User Settings Page
- [ ] **Access**
  - [ ] Navigate to `/dashboard/settings`
  - [ ] Page loads for authenticated users
  - [ ] Redirects to login if not authenticated

- [ ] **Dynamic Feature Visibility**
  - [ ] Only enabled features show in settings
  - [ ] Admin-only features hidden from regular users
  - [ ] Admin users see all enabled features
  - [ ] Disabled features don't appear

- [ ] **Video Playback Settings**
  - [ ] Autoplay next episode toggle (if enabled)
  - [ ] Thumbnail preview toggle (if enabled)
  - [ ] Skip intro toggle (if enabled)
  - [ ] Theater mode toggle (if enabled)
  - [ ] Playback speed dropdown (if enabled)
  - [ ] Default quality dropdown (if enabled)
  - [ ] Default volume slider (always visible)

- [ ] **Caption Settings**
  - [ ] Enable captions toggle
  - [ ] Preferred language dropdown
  - [ ] Changes persist

- [ ] **Toggle Switches**
  - [ ] Click toggle switches on/off
  - [ ] Visual state changes immediately
  - [ ] "Saving..." indicator appears
  - [ ] Changes persist (refresh page)
  - [ ] Database updates confirmed

- [ ] **Dropdowns & Sliders**
  - [ ] Playback speed dropdown shows correct options
  - [ ] Quality dropdown shows correct options
  - [ ] Language dropdown shows correct options
  - [ ] Volume slider shows current value
  - [ ] Volume percentage displays

### Feature Flag Hooks
- [ ] **useFeatureFlag**
  - [ ] Returns correct enabled status
  - [ ] Respects minimum role
  - [ ] Loading state works
  - [ ] Updates when flags change

- [ ] **useUserPreference**
  - [ ] Fetches current preferences
  - [ ] Returns defaults if no preferences exist
  - [ ] updatePreference function works
  - [ ] Loading state works

### API Endpoints
- [ ] **GET /api/feature-flags**
  - [ ] Returns all flags
  - [ ] Accessible to all authenticated users
  - [ ] Returns correct structure

- [ ] **PATCH /api/feature-flags**
  - [ ] Updates flag successfully (admin)
  - [ ] Returns 403 for non-admin
  - [ ] Validates input

- [ ] **GET /api/user/preferences**
  - [ ] Returns user preferences
  - [ ] Returns defaults if none exist
  - [ ] Requires authentication

- [ ] **POST /api/user/preferences**
  - [ ] Creates new preferences
  - [ ] Updates existing preferences
  - [ ] Validates input
  - [ ] Requires authentication

---

## ⭐ Phase 5: User Engagement

### Favorites Functionality
- [ ] **Add Favorite**
  - [ ] Navigate to show page
  - [ ] Click "Favorite" button
  - [ ] Button changes to "Favorited"
  - [ ] Background changes to yellow
  - [ ] Database `favorites` table updates
  - [ ] Refresh page, button still shows "Favorited"

- [ ] **Remove Favorite**
  - [ ] Click "Favorited" button
  - [ ] Button changes back to "Favorite"
  - [ ] Background changes to gray
  - [ ] Database entry deleted
  - [ ] Refresh page, button shows "Favorite"

- [ ] **Favorites Page**
  - [ ] Navigate to `/dashboard/favorites`
  - [ ] All favorited shows display in grid
  - [ ] Show cards have yellow "Favorite" badge
  - [ ] Shows sorted by most recently favorited
  - [ ] Click show card → navigates to show page
  - [ ] Empty state if no favorites
  - [ ] "Browse Shows" button in empty state

### Rating Functionality
- [ ] **Add Rating - Dislike**
  - [ ] Click 👎 button on show page
  - [ ] Button highlights with red background
  - [ ] Button scales up slightly
  - [ ] Other rating buttons not highlighted
  - [ ] Refresh page, rating persists

- [ ] **Add Rating - Like**
  - [ ] Click 👍 button
  - [ ] Button highlights with blue background
  - [ ] Button scales up
  - [ ] Previous rating clears
  - [ ] Refresh page, rating persists

- [ ] **Add Rating - Love**
  - [ ] Click 💙 button
  - [ ] Button highlights with pink background
  - [ ] Button scales up
  - [ ] Previous rating clears
  - [ ] Refresh page, rating persists

- [ ] **Remove Rating**
  - [ ] Click currently selected rating
  - [ ] Highlight removes
  - [ ] Button returns to normal state
  - [ ] Database entry deleted
  - [ ] Refresh page, no rating selected

### ShowActions Component
- [ ] **Loading State**
  - [ ] Shows "Loading..." on initial load
  - [ ] Quickly transitions to actual buttons

- [ ] **Button Layout**
  - [ ] Favorite button on left
  - [ ] "Add to Lineup" button (placeholder)
  - [ ] Rating buttons on right
  - [ ] Responsive on mobile

- [ ] **Multiple Shows**
  - [ ] Each show has independent favorite status
  - [ ] Each show has independent rating
  - [ ] No state conflicts between shows

### API Endpoints
- [ ] **GET /api/favorites**
  - [ ] Returns user's favorites with show details
  - [ ] Sorted by created_at desc
  - [ ] Requires authentication

- [ ] **POST /api/favorites**
  - [ ] Adds show to favorites
  - [ ] Returns 409 if already favorited
  - [ ] Validates show_id

- [ ] **DELETE /api/favorites**
  - [ ] Removes favorite
  - [ ] Returns success
  - [ ] Requires show_id parameter

- [ ] **GET /api/ratings**
  - [ ] Returns user's rating for show
  - [ ] Returns null if no rating
  - [ ] Requires show_id parameter

- [ ] **POST /api/ratings**
  - [ ] Creates new rating
  - [ ] Updates existing rating
  - [ ] Validates rating value (dislike/like/love)

- [ ] **DELETE /api/ratings**
  - [ ] Removes rating
  - [ ] Returns success
  - [ ] Requires show_id parameter

---

## 🔐 Security & Permissions

### Row Level Security (RLS)
- [ ] **watch_history**
  - [ ] Users can only read their own history
  - [ ] Users can only insert/update their own history
  - [ ] No access to other users' data

- [ ] **user_preferences**
  - [ ] Users can only read their own preferences
  - [ ] Users can only update their own preferences
  - [ ] No access to other users' preferences

- [ ] **feature_flags**
  - [ ] Everyone can read flags
  - [ ] Only admins can modify flags
  - [ ] Non-admins get 403 on modification

- [ ] **favorites**
  - [ ] Users can only see their own favorites
  - [ ] Users can only add/remove their own favorites
  - [ ] No access to other users' favorites

- [ ] **show_ratings**
  - [ ] Users can only see their own ratings
  - [ ] Users can only add/update/delete their own ratings
  - [ ] No access to other users' ratings

### Authentication
- [ ] Unauthenticated users redirected to /login
- [ ] Authentication persists across sessions
- [ ] Logout works correctly
- [ ] Session expires appropriately

---

## 📱 Responsive Design

### Mobile (320px - 767px)
- [ ] Watch page video player responsive
- [ ] Episode cards stack vertically
- [ ] Navigation menus accessible
- [ ] Buttons appropriately sized
- [ ] Text readable without zooming
- [ ] Touch targets minimum 44x44px

### Tablet (768px - 1023px)
- [ ] 2-column grid for episodes
- [ ] Show detail page layout works
- [ ] Dashboard cards in 2 columns
- [ ] Settings page readable

### Desktop (1024px+)
- [ ] 3-4 column grid for episodes
- [ ] Browse shows in 4-column grid
- [ ] Wide video player on watch page
- [ ] Hover effects work
- [ ] Optimal reading width maintained

---

## 🌙 Dark Mode

### Theme Switching
- [ ] Dark mode classes applied correctly
- [ ] All text readable in dark mode
- [ ] Cards have dark backgrounds
- [ ] Buttons visible in dark mode
- [ ] Proper contrast ratios maintained
- [ ] No white flashes on page load

---

## ⚡ Performance

### Load Times
- [ ] Watch page loads < 3 seconds
- [ ] Browse page loads < 2 seconds
- [ ] Dashboard loads < 2 seconds
- [ ] Video starts playing < 5 seconds

### API Response Times
- [ ] Watch history save < 500ms
- [ ] Favorites add/remove < 500ms
- [ ] Ratings update < 500ms
- [ ] Settings update < 500ms

### Database Queries
- [ ] No N+1 query problems
- [ ] Proper use of indexes
- [ ] Joins used instead of multiple queries
- [ ] Pagination for large datasets

---

## 🐛 Error Handling

### Network Errors
- [ ] API failures show user-friendly messages
- [ ] Retry logic for transient failures
- [ ] Offline detection (if applicable)
- [ ] No silent failures

### User Input Validation
- [ ] Invalid episode IDs handled gracefully
- [ ] Missing parameters return 400 errors
- [ ] SQL injection prevented
- [ ] XSS attacks prevented

### Edge Cases
- [ ] Episode with no thumbnail
- [ ] Show with no episodes
- [ ] User with no preferences
- [ ] User with no favorites
- [ ] Incomplete watch history data

---

## 📋 Pre-Deployment Checklist

### Code Quality
- [ ] No console.log statements in production
- [ ] No commented-out code
- [ ] TypeScript compiles with no errors
- [ ] No ESLint warnings
- [ ] Proper error handling everywhere

### Database
- [ ] All migrations applied to production
- [ ] Database types regenerated
- [ ] RLS policies active on all tables
- [ ] Indexes created for performance
- [ ] No test data in production

### Environment Variables
- [ ] All required env vars set in Vercel
- [ ] NEXT_PUBLIC_ prefix for client vars
- [ ] No secrets in client code
- [ ] Environment-specific configs correct

### Deployment
- [ ] Build succeeds locally
- [ ] Build succeeds on Vercel
- [ ] No deployment errors
- [ ] Health checks pass
- [ ] Rollback plan documented

---

## ✅ Final Sign-Off

Before marking as production-ready, ensure:
- [ ] All Phase 1-5 tests passed
- [ ] Security audit completed
- [ ] Performance benchmarks met
- [ ] User acceptance testing done
- [ ] Documentation updated
- [ ] CHANGELOG.md updated

---

**Testing Status:** ⏳ Pending
**Last Tested:** Not yet tested
**Tester:** ___________
**Date:** ___________
