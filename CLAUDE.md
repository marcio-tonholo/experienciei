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
- Supabase (`@supabase/supabase-js`) — auth (email/password, Google OAuth, PKCE flow) + Postgres database; client singleton in `src/lib/supabase.js` with `{ auth: { flowType: 'pkce' } }`
- Deployed on Vercel (`vercel.json` rewrites all routes to `index.html` for SPA routing)

### Routing (`src/App.jsx`)

| Route | Component | Guard | Purpose |
|---|---|---|---|
| `/` | `Landing` | public | Marketing page |
| `/auth` | `Auth` | public | Login / register / forgot-password |
| `/auth/callback` | `AuthCallback` | public | OAuth + email link landing; redirects based on profile state |
| `/auth/reset-password` | `ResetPassword` | public | Password reset form (requires active Supabase session from email link) |
| `/onboarding` | `Onboarding` | `OnboardingRoute` | 3-step profile creation for new users |
| `/explorar` | `Explorar` | public | Public marketplace of published offerings with live search + specialty filter |
| `/home` | `HomeRouter` → `MentorHome` or `StudentHome` | `ProtectedRoute` | Role-dispatched home: mentors see `MentorHome`, everyone else sees `StudentHome` |
| `/mentor/:id` | `MentorProfile` | `ProtectedRoute` | Mentor detail with tabbed content + booking sidebar |
| `/offering/:id` | `OfferingDetail` | `ProtectedRoute` | Offering detail view with booking actions and async chat |

### Auth and route guards

`AuthContext` (`src/contexts/AuthContext.jsx`) exposes `{ user, profile, loading }` plus `signIn`, `signUp`, `signInWithGoogle`, `signOut`, `resetPassword`, `createProfile`.

Two route guard components in `App.jsx`:
- **`ProtectedRoute`** — redirects to `/` if no user, redirects to `/onboarding` if user exists but has no profile row.
- **`OnboardingRoute`** — redirects to `/` if no user, redirects to `/home` if profile already exists.

The `loading` state covers the initial session resolution; never assume `user`/`profile` are set synchronously.

### Database schema (`supabase/schema.sql`)

Eight tables, all with RLS enabled:
- **`profiles`** — base user record; `papel` ∈ `{mentor, aluno, admin}`, `categoria` ∈ `{estudante, medico}`, `status` ∈ `{pendente, ativo, inativo, rejeitado}`. Mentors are publicly readable if `status = 'ativo'` OR if they have a published offering. Students are readable by mentors who have received a booking from them.
- **`mentor_profiles`** — extends `profiles` for mentors; includes `crm`, `uf`, `especialidade`, `subespecialidades text[]`, `ambientes text[]`, `anos_experiencia`, `mini_curriculo`.
- **`student_profiles`** — extends `profiles` for students; includes `nivel` ∈ `{estudante, residente, especialista}`, `objetivos text[]`, optional `crm`/`especialidade`/`ano_formacao`.
- **`documents`** — document uploads linked to profiles; `tipo` ∈ `{identidade, crm}`, `status` is currently locked to `'enviado'` (admin approval workflow not yet implemented). Files are stored in the `documents` Supabase Storage bucket (private; signed URLs for viewing).
- **`procedures`** — catalog of surgical procedures; `nome` (unique), `especialidade`, `complexidade` ∈ `{basico, intermediario, avancado}`. Pre-seeded with 18 entries. Publicly readable; only admins can insert.
- **`offerings`** — mentoring sessions created by mentors; FK to `profiles` (mentor_id) and optional FK to `procedures`. Fields: `titulo`, `descricao`, `max_vagas` (1–20), `preco`, `inicio`/`fim` (timestamptz), `cidade`, `local_descricao`, `status` ∈ `{rascunho, publicado, encerrado}`. Published offerings are readable by anyone (including anon). All CRUD requires ownership.
- **`bookings`** — student applications to offerings; FKs to `profiles` (aluno_id, mentor_id) and `offerings`. `status` ∈ `{pendente, confirmado, rejeitado, concluido, cancelado}`. Unique constraint on `(aluno_id, offering_id)`. Students can select/insert/update their own; mentors can select and update status for their offering's bookings.
- **`messages`** — async chat per offering; FKs to `offerings`, optional `bookings` (NULL = pre-booking message), and `profiles` (sender_id). `conteudo text not null`. RLS: sender can insert; visible to sender, to booking parties (when `booking_id` is set), or to the offering mentor (when `booking_id` is null).

`createProfile` in `AuthContext` inserts into `profiles` first, then conditionally into `mentor_profiles` or `student_profiles` based on `papel`.

### Key pages

**AuthCallback (`src/pages/AuthCallback.jsx`)** — Handles both OAuth redirects and PKCE email-link flows. Exchanges the `?code=` param for a session via `supabase.auth.exchangeCodeForSession()` before reading auth state (skipping this would cause a race where `getSession()` resolves null first). After exchange, redirects to `/onboarding` (no profile) or `/home` (has profile), or back to `/auth` if no session.

**Explorar (`src/pages/Explorar.jsx`)** — Public marketplace (no auth required to browse). Fetches `status = 'publicado'` offerings with `inicio >= now()`, joined with `procedures` and `profiles` (mentor name). Both the text search and specialty filter chips are fully wired and applied client-side. Students can apply inline; unauthenticated visitors see a "Cadastre-se" CTA; mentors see a read-only banner. Each card reflects the student's existing booking status.

**OfferingDetail (`src/pages/OfferingDetail.jsx`)** — Two-column layout: left panel has offering header (procedure, mentor info, date/time/vagas/city) plus a tabbed section (Detalhes | Chat); right sticky sidebar shows a booking summary with apply / cancel actions. The chat tab is visible to the offering's mentor or to students who have a booking (`booking_id` optional — NULL means pre-booking). Messages are sent to the `messages` table and reloaded after each send. Enter (without Shift) submits.

**MentorHome (`src/pages/MentorHome.jsx`)** — Dashboard for authenticated mentors. Six tabs:
- **Agenda** — lists the mentor's `offerings` fetched from Supabase (real data). Includes a "Nova Mentoria" button that opens `CreateOfferingModal`. Each card shows procedure name, complexity badge, date/time range, vagas, price, city/location, status badge, and Publicar/Encerrar actions. Expanding a card lazily loads that offering's `bookings` and lets the mentor accept/reject/conclude each applicant (`handleBookingStatus` updates `bookings.status`).
- **Sessões / Avaliações / Produção** — still hardcoded demo data.
- **Perfil** — editable mentor profile (inline in file).
- **Documentos** — renders `DocumentsTab` for document uploads.

`CreateOfferingModal` (defined inline above the main component) loads the `procedures` catalog from Supabase, lets the mentor fill the offering form, and inserts into `offerings`. Selecting a procedure auto-fills `titulo` if blank. Supports "Salvar rascunho" (`status = 'rascunho'`) and "Publicar" (`status = 'publicado'`) actions.

**StudentHome (`src/pages/StudentHome.jsx`)** — Dashboard for authenticated students. Five tabs (bottom nav):
- **Explorar** — searchable mentor/procedure list (hardcoded demo data); filter chips by specialty work, text search does not.
- **Agendamentos** — placeholder; no Supabase queries yet.
- **Histórico** — placeholder.
- **Perfil** — editable student profile (inline in file).
- **Documentos** — renders `DocumentsTab` for document uploads.

**Onboarding flow (`src/pages/Onboarding.jsx`)** — 3-step wizard: (1) role selection — `mentor` or `aluno`; (2) common fields — nome, cidade, categoria; (3) role-specific fields. The `TagInput` component (Enter/comma to add tags, Backspace to remove) is defined inline in the file.

### Shared components (`src/components/`)

**`DocumentsTab`** — Reusable document upload panel used in both `MentorHome` and `StudentHome`. Accepts `profileId`, fetches the latest upload per `tipo` from the `documents` table, uploads new files to Supabase Storage (`documents` bucket), and generates signed URLs for viewing. Validates file type (PDF/JPG/PNG) and size (≤10 MB). Only renders `identidade` and `crm` document types.

**MentorProfile (`src/pages/MentorProfile.jsx`)** — Fully hardcoded; always shows `Dr. Carlos Silva` regardless of the `:id` param. Has four tabs (Sobre / Procedimentos / Avaliações / Disponibilidade) and a booking sidebar. `handleRequest()` sets a success state then calls `setTimeout(() => navigate('/home'), 2000)` — no Supabase writes occur.

### Design system
Brand colors are hardcoded hex values (`#1E3A8A`, `#2563EB`, `#0F172A`) rather than Tailwind config aliases. The logo SVG + wordmark is duplicated inline in every page file. Avatar placeholders use initials + gradient backgrounds throughout.

`COMPLEXITY`, `BOOKING_STATUS`, `fmtDate`, and `fmtTime` are duplicated across `Explorar`, `OfferingDetail`, `StudentHome`, and `MentorHome` — they have not been extracted into shared utilities yet.

### Known incomplete areas
- `StudentHome` — Explorar tab is fully hardcoded demo data; text search and dropdowns are wired to state but never filter. Agendamentos and Histórico tabs have no Supabase queries.
- `MentorHome` sessions/reviews/earnings — still hardcoded; will need real Supabase queries once bookings flow is complete.
- `MentorProfile` — the `:id` param is captured by the router but not used; always renders hardcoded `Dr. Carlos Silva`. The booking flow triggers a `setTimeout` navigate back to `/home` after `handleRequest()`.
- `Landing` is entirely static/hardcoded — no Supabase queries. It navigates to `/auth` with `{ state: { login: true } }` for "Entrar" and plain `navigate('/auth')` for "Cadastrar". `Auth` reads `location.state?.login` to set the initial tab.
