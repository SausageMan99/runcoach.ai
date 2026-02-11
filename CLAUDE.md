# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint (eslint command, no src/ arg needed)
```

No test framework is configured.

## Architecture

**Next.js 16 App Router** with TypeScript (strict), Tailwind CSS v4, Supabase (auth + DB), and Anthropic Claude API.

### Key Directories

- `src/app/(auth)/` — Login/signup pages (route group, shared layout)
- `src/app/(dashboard)/` — Protected pages: dashboard, program, settings
- `src/app/onboarding/` — 6-step questionnaire storing progress in localStorage (`runcoach_onboarding`)
- `src/app/api/generate-program/` — AI program generation endpoint (rate limited: 1/day/user)
- `src/app/api/tracking/` — Session tracking CRUD
- `src/lib/ai/claude.ts` — Claude API integration (model: `claude-3-5-haiku-20241022`, max 8000 tokens)
- `src/lib/ai/prompts.ts` — Prompt templates for program generation
- `src/lib/supabase/client.ts` — Browser Supabase client
- `src/lib/supabase/server.ts` — Server component Supabase client
- `src/lib/validations/schemas.ts` — Zod schemas for all form/data validation
- `src/types/index.ts` — TypeScript interfaces
- `src/components/ui/` — Shadcn/ui components (New York style)
- `src/middleware.ts` — Auth-based route protection

### Path Alias

`@/*` maps to `./src/*` (configured in tsconfig.json).

### Authentication Flow

Supabase Auth with email/password and optional Google OAuth. Middleware protects `/dashboard`, `/program`, `/settings` (redirects to `/login`). Auth pages redirect authenticated users to `/dashboard`. Server components use `createClient()` from `@/lib/supabase/server`, client components from `@/lib/supabase/client`.

### Database

Supabase PostgreSQL with RLS on all tables. Schema defined in `supabase-schema.sql`. No ORM — direct Supabase JS client queries.

- **profiles** — extends auth.users (first_name). Auto-created via DB trigger on signup.
- **programs** — stores AI-generated training programs as JSONB in `program_data`. `is_active` flag for current program.
- **session_tracking** — completion status with notes, linked to program via `program_id`.

### AI Program Generation

Uses Claude API to generate personalized running programs based on Jack Daniels VDOT methodology. Programs are structured as JSONB with weeks containing sessions. The API route validates the response, retries on JSON parse errors, and enforces session count constraints. Program duration (6-20 weeks) is computed based on user level and goal.

### Design System

French language throughout. Keith Haring-inspired artistic design with warm cream/beige palette (#F5F0E6), bold black (#1A1A1A), Inter font. Custom 3D "artistic" button styles with hand-drawn borders.

## Environment Variables

Required (see `.env.example`):
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase public config
- `SUPABASE_SERVICE_ROLE_KEY` — Server-only Supabase admin access
- `ANTHROPIC_API_KEY` — Claude API
- `NEXT_PUBLIC_SITE_URL` — App URL (localhost:3000 for dev)
