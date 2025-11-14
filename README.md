# JustPlay

**Saturday Morning Cartoons, Reimagined**

JustPlay is a streaming platform that brings back the magic of scheduled viewing with intentional entertainment and fair creator pay.

## Features

- 📺 **Scheduled Lineups**: Create your own Saturday morning schedule
- 🎨 **Fair Creator Pay**: 50% revenue share for creators
- 👨‍👩‍👧‍👦 **Parental Controls**: Set time limits and create kid profiles
- 🎬 **On-Demand & Scheduled**: Watch anytime or follow your lineup
- 💰 **Creator-Friendly**: Fair licensing and transparent revenue sharing

## Tech Stack

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Hosting**: Vercel
- **Payments**: Stripe (coming soon)
- **Video**: Cloudflare Stream / Mux (coming soon)

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── auth/              # Auth callback routes
│   ├── dashboard/         # User dashboard
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── lib/
│   ├── supabase/          # Supabase client utilities
│   └── types/             # TypeScript type definitions
├── supabase/
│   ├── migrations/        # Database migrations
│   └── README.md          # Supabase setup instructions
└── middleware.ts          # Auth middleware

```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Vercel account (for deployment)

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/JustPlay-Video/JustPlay.git
cd JustPlay
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run database migrations:
- Go to Supabase SQL Editor
- Run `supabase/migrations/001_initial_schema.sql`

5. Start development server:
```bash
npm run dev
```

6. Open http://localhost:3000

### Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## Database Schema

- **profiles**: User profiles (extends Supabase Auth)
- **child_profiles**: Child accounts with parental controls
- **shows**: TV shows/series metadata
- **episodes**: Individual episodes with video URLs
- **lineups**: User-created viewing schedules
- **lineup_slots**: Episodes scheduled in lineups
- **watch_history**: Viewing progress tracking
- **subscriptions**: Stripe subscription data

## Development Roadmap

### Phase 1: Core Platform (Weeks 1-8)
- [x] Next.js + Supabase setup
- [x] Authentication system
- [x] Database schema
- [ ] Admin dashboard
- [ ] Video upload & management
- [ ] Show/episode CRUD
- [ ] Browse catalog
- [ ] Video player
- [ ] Lineup builder

### Phase 2: Content Acquisition (Weeks 9-10)
- [ ] Public domain content
- [ ] Indie creator outreach
- [ ] Licensing agreements

### Phase 3: Polish & Testing (Weeks 11-12)
- [ ] Parental controls
- [ ] Email notifications
- [ ] Responsive design
- [ ] Testing & bug fixes

### Phase 4: Beta Launch (Weeks 13-16)
- [ ] Landing page
- [ ] Beta invites
- [ ] Press outreach

### Phase 5: Public Launch (Week 17+)
- [ ] Stripe integration
- [ ] Subscription management
- [ ] Referral program
- [ ] Growth tactics

## Contributing

This is a bootstrapped project currently in early development. Contributions will be welcome once we reach beta.

## License

Proprietary - All Rights Reserved

## Contact

- Website: https://dev.justplay.cc
- GitHub: https://github.com/JustPlay-Video/JustPlay

---

Built with ❤️ by Jeffrey
