# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (Vite, localhost:5173)
npm run build     # Production build to dist/
npm run preview   # Preview production build locally
```

There are no tests and no linter configured.

## Environment

Copy `.env.example` to `.env.local` and fill in your Supabase project values:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

The database schema is in `supabase/schema.sql` — run it in the Supabase SQL Editor to set up tables, RLS policies, and triggers.

## Architecture

**Experenciei** is a Brazilian medical mentorship marketplace — connecting surgical specialists (mentors) with medical students and residents. It is a React SPA backed by Supabase for authentication and data persistence.

### Stack
- React 18 + React Router v6 + Vite
- Tailwind CSS v3 (utility-first, no component library)
- Supabase (`@supabase/supabase-js`) — auth (email/password, Google OAuth, PKCE flow) + Postgres database
- Deployed on Vercel (`vercel.json` rewrites all routes to `index.html` for SPA routing)

### Routing (`src/App.jsx`)

| Route | Component | Guard | Purpose |
|---|---|---|---|
| `/` | `Landing` | public | Marketing page |
| `/auth` | `Auth` | public | Login / register / forgot-password |
| `/auth/callback` | `AuthCallback` | public | OAuth + email link landing; redirects based on profile state |
| `/auth/reset-password` | `ResetPassword` | public | Password reset form (requires active Supabase session from email link) |
| `/onboarding` | `Onboarding` | `OnboardingRoute` | 3-step profile creation for new users |
| `/home` | `StudentHome` | `ProtectedRoute` | Mentor + procedure discovery |
| `/mentor/:id` | `MentorProfile` | `ProtectedRoute` | Mentor detail with tabbed content + booking sidebar |

### Auth and route guards

`AuthContext` (`src/contexts/AuthContext.jsx`) exposes `{ user, profile, loading }` plus `signIn`, `signUp`, `signInWithGoogle`, `signOut`, `resetPassword`, `createProfile`.

Two route guard components in `App.jsx`:
- **`ProtectedRoute`** — redirects to `/auth` if no user, redirects to `/onboarding` if user exists but has no profile row.
- **`OnboardingRoute`** — redirects to `/auth` if no user, redirects to `/home` if profile already exists.

The `loading` state covers the initial session resolution; never assume `user`/`profile` are set synchronously.

### Database schema (`supabase/schema.sql`)

Four tables, all with RLS enabled:
- **`profiles`** — base user record; `papel` ∈ `{mentor, aluno, admin}`, `status` ∈ `{pendente, ativo, inativo, rejeitado}`. Mentors with `status = 'ativo'` are publicly readable; all others require ownership.
- **`mentor_profiles`** — extends `profiles` for mentors; includes `crm`, `uf`, `especialidade`, `subespecialidades text[]`, `ambientes text[]`, `anos_experiencia`, `mini_curriculo`.
- **`student_profiles`** — extends `profiles` for students; includes `nivel` ∈ `{estudante, residente, especialista}`, `objetivos text[]`, optional `crm`/`especialidade`/`ano_formacao`.
- **`documents`** — document uploads linked to profiles (status workflow: pendente → aprovado/rejeitado).

`createProfile` in `AuthContext` inserts into `profiles` first, then conditionally into `mentor_profiles` or `student_profiles` based on `papel`.

### Onboarding flow (`src/pages/Onboarding.jsx`)

3-step wizard: (1) role selection — `mentor` or `aluno`; (2) common fields — nome, cidade, categoria; (3) role-specific fields. The `TagInput` component (Enter/comma to add tags, Backspace to remove) is defined inline in the file.

### Design system
Brand colors are hardcoded hex values (`#1E3A8A`, `#2563EB`, `#0F172A`) rather than Tailwind config aliases. The logo SVG + wordmark is duplicated inline in every page file. Avatar placeholders use initials + gradient backgrounds throughout.

### Known incomplete areas
- `StudentHome` search: `procCategory` actually filters; `searchQuery` and the four filter dropdowns are wired to state but never applied — mentor cards are always unfiltered.
- `MentorProfile` booking: the `:id` param is captured by the router but not used — always renders a hardcoded mentor (`Dr. Carlos Silva`). The booking flow triggers a `setTimeout` navigate back to `/home` after `handleRequest()`.
- `Landing` navigates to `/auth` with `{ state: { login: true } }` for "Entrar" and plain `navigate('/auth')` for "Cadastrar". `Auth` reads `location.state?.login` to set the initial tab.
