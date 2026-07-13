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
- Leaflet (`leaflet`) — interactive maps for location picker (mentor creates offerings) and proximity display (student views offering detail). Each Leaflet component imports `leaflet/dist/leaflet.css` directly (not globally).
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
| `/home` | `HomeRouter` → `AdminHome`, `MentorHome`, or `StudentHome` | `ProtectedRoute` | Role-dispatched home by `profile.papel`: `admin` → `AdminHome`, `mentor` → `MentorHome`, else → `StudentHome` |
| `/mentor/:id` | `MentorProfile` | `ProtectedRoute` | Mentor detail with tabbed content + booking sidebar |
| `/offering/:id` | `OfferingDetail` | public | Offering detail view with booking actions and async chat |
| `/payment/success` | `PaymentSuccess` | public | Stripe Checkout success redirect target (static confirmation) |

### Auth and route guards

`AuthContext` (`src/contexts/AuthContext.jsx`) exposes `{ user, profile, loading }` plus `signIn`, `signUp`, `signInWithGoogle`, `signOut`, `resetPassword`, `createProfile`.

Two route guard components in `App.jsx`:
- **`ProtectedRoute`** — redirects to `/` if no user, redirects to `/onboarding` if user exists but has no profile row.
- **`OnboardingRoute`** — redirects to `/` if no user, redirects to `/home` if profile already exists.

The `loading` state covers the initial session resolution; never assume `user`/`profile` are set synchronously.

### Database schema (`supabase/schema.sql`)

Nine tables, all with RLS enabled:
- **`profiles`** — base user record; `papel` ∈ `{mentor, aluno, admin}`, `categoria` ∈ `{estudante, medico}`, `status` ∈ `{pendente, ativo, inativo, rejeitado}`. Mentors are publicly readable if `status = 'ativo'` OR if they have a published offering. Students are readable by mentors who have received a booking from them.
- **`mentor_profiles`** — extends `profiles` for mentors; includes `crm`, `uf`, `especialidade`, `subespecialidades text[]`, `ambientes text[]`, `anos_experiencia`, `mini_curriculo`.
- **`student_profiles`** — extends `profiles` for students; includes `nivel` ∈ `{estudante, residente, especialista}`, `objetivos text[]`, optional `crm`/`especialidade`/`ano_formacao`.
- **`documents`** — document uploads linked to profiles; `tipo` ∈ `{identidade, crm}`, `status` is currently locked to `'enviado'` (admin approval workflow not yet implemented). Files are stored in the `documents` Supabase Storage bucket (private; signed URLs for viewing).
- **`procedures`** — catalog of surgical procedures; `nome` (unique), `especialidade`, `complexidade` ∈ `{basico, intermediario, avancado}`. Pre-seeded with 18 entries. Publicly readable; only admins can insert.
- **`offerings`** — mentoring sessions created by mentors; FK to `profiles` (mentor_id) and optional FK to `procedures`. Fields: `titulo`, `descricao`, `max_vagas` (1–20), `preco`, `inicio`/`fim` (timestamptz), `cidade`, `local_descricao`, `status` ∈ `{rascunho, publicado, encerrado}`, nullable `latitude`/`longitude` (set via `LocationPicker`). Published offerings are readable by anyone (including anon). All CRUD requires ownership.
- **`bookings`** — student applications to offerings; FKs to `profiles` (aluno_id, mentor_id) and `offerings`. `status` ∈ `{pendente, confirmado, rejeitado, concluido, cancelado}`. Unique constraint on `(aluno_id, offering_id)`. Students can select/insert/update their own; mentors can select and update status for their offering's bookings.
- **`messages`** — async chat per offering; FKs to `offerings`, optional `bookings` (NULL = pre-booking message), and `profiles` (sender_id). `conteudo text not null`, `sender_nome text` (auto-filled by `trg_fill_message_sender_nome` trigger — avoids cross-user RLS visibility issues). RLS: sender can insert; visible to sender, to booking parties (when `booking_id` is set), or to the offering mentor (when `booking_id` is null).
- **`notifications`** — created server-side only by Postgres triggers; clients only read and mark as read. `tipo` ∈ `{mensagem_privada, mensagem_turma, booking_status, offering_editado}`. Three triggers populate it: `trg_notify_booking_status` (booking status changes → notify student, and mentor on cancellation), `trg_notify_new_message` (new message → notify the other party; for global chat, only mentor→enrolled-students direction), `trg_notify_offering_edit` (offering content edits → notify enrolled students with a field-level diff summary). Clients have SELECT + UPDATE (mark read) only — no INSERT.

`createProfile` in `AuthContext` inserts into `profiles` first, then conditionally into `mentor_profiles` or `student_profiles` based on `papel`.

### Key pages

**AuthCallback (`src/pages/AuthCallback.jsx`)** — Handles both OAuth redirects and PKCE email-link flows. Exchanges the `?code=` param for a session via `supabase.auth.exchangeCodeForSession()` before reading auth state (skipping this would cause a race where `getSession()` resolves null first). After exchange, redirects to `/onboarding` (no profile) or `/home` (has profile), or back to `/auth` if no session.

**Explorar (`src/pages/Explorar.jsx`)** — Public marketplace (no auth required to browse). Fetches `status = 'publicado'` offerings with `inicio >= now()`, joined with `procedures` and `profiles` (mentor name). Both the text search and specialty filter chips are fully wired and applied client-side. Students can apply inline; unauthenticated visitors see a "Cadastre-se" CTA; mentors see a read-only banner. Each card reflects the student's existing booking status. If the offering has `latitude`/`longitude` and the user has granted geolocation, a proximity tag (from `src/lib/geo.js`) is shown on each card.

**OfferingDetail (`src/pages/OfferingDetail.jsx`)** — Two-column layout: left panel has offering header (procedure, mentor info, date/time/vagas/city) plus a tabbed section (Detalhes | Chat); right sticky sidebar shows a booking summary with apply / cancel actions. The chat tab is visible to the offering's mentor or to students who have a booking (`booking_id` optional — NULL means pre-booking). Messages are sent to the `messages` table and reloaded after each send. Enter (without Shift) submits. When the offering has `latitude`/`longitude`, a `LocationMap` renders in the Detalhes tab (500m radius circle, ~200m seeded random offset for privacy). Proximity distance via `haversineKm` is shown when user location is available.

**MentorHome (`src/pages/MentorHome.jsx`)** — Dashboard for authenticated mentors. Six active tabs (Avaliações and Produção are commented out in JSX but their `SESSIONS`/`REVIEWS` constants remain in the file):
- **Agenda** — lists the mentor's `offerings` fetched from Supabase (real data). Includes a "Nova Mentoria" button that opens `CreateOfferingModal`. Each card shows procedure name, complexity badge, date/time range, vagas, price, city/location, status badge, and Publicar/Encerrar actions. Expanding a card lazily loads that offering's `bookings` and lets the mentor accept/reject pending applicants and reject/reactivate confirmed ones (`handleBookingStatus` updates `bookings.status`) — there's no per-student "concluir" action here; concluding only happens by closing the whole offering. Encerrar opens `EncerrarModal` which marks confirmed bookings as `concluido` before setting offering `status = 'encerrado'`.
- **Sessões** — shows `pastOfferings` (offerings with `status = 'encerrado'`) from Supabase. Clicking a session opens a detail modal showing all bookings for that offering.
- **Financeiro** — reads the mentor's own `payments` rows (joined via `bookings` with `status in (confirmado, concluido)`) to show total received/repassed/pending totals and a per-student breakdown with payment and `repasse_status` badges. For a paid booking the mentor hasn't rated yet (`repasse_status !== 'repassado'` and no `avaliacoes` row from this mentor), the row shows "⏳ Avalie o aluno para liberar o repasse" instead of the repasse badge, which expands into the same inline star-picker used elsewhere (see Mutual reviews section) — rating from here unblocks that booking in `AdminHome`'s Repasses queue.
- **Perfil** — editable mentor profile (inline in file).
- **Documentos** — renders `DocumentsTab` for document uploads.
- **Notificações** — renders `NotificationsTab`.

`CreateOfferingModal` (defined inline above the main component) loads the `procedures` catalog from Supabase, lets the mentor fill the offering form, and inserts into `offerings`. Selecting a procedure auto-fills `titulo` if blank. Includes a `LocationPicker` for setting `latitude`/`longitude` (optional — city string is auto-resolved via Nominatim reverse-geocoding). Supports "Salvar rascunho" (`status = 'rascunho'`) and "Publicar" (`status = 'publicado'`) actions.

`EncerrarModal` (defined inline) — fetches confirmed bookings for the offering; closing always marks *all* of them as `concluido` (no longer a per-student choice) before setting the offering to `encerrado`. Optionally lets the mentor rate each student (see Mutual reviews section) while closing.

**StudentHome (`src/pages/StudentHome.jsx`)** — Dashboard for authenticated students. Six tabs (bottom nav):
- **Explorar** — fetches `status = 'publicado'` offerings from Supabase joined with `procedures` and `profiles`. Both text search and specialty filter chips are wired to real data and filter client-side. Students can apply inline; each card reflects their existing booking status. Once the mentor confirms a booking (`status = 'confirmado'`) and it's still unpaid, the card's action area becomes a "Pagar R$ X" button (same `handlePay()`/Stripe Checkout flow as the Agendamentos tab) instead of a static status badge — lets the student pay without leaving Explorar. Proximity tags shown when offering has coordinates and user granted geolocation. Also shows the "🏆 Mentores mais bem avaliados" ranking row (see Mutual reviews section) above the offerings grid.
- **Agendamentos** — fetches real bookings from Supabase; shows `activeBookings` (pending or confirmed non-closed); allows cancellation via `handleCancelBooking`.
- **Histórico** — shows `pastBookings` (concluded, rejected, cancelled) from the same bookings query. For `concluido` bookings, a "Certificado" button opens `CertificateModal` (defined inline) which generates a printable HTML certificate.
- **Perfil** — editable student profile (inline in file).
- **Documentos** — renders `DocumentsTab` for document uploads.
- **Notificações** — renders `NotificationsTab`.

**Onboarding flow (`src/pages/Onboarding.jsx`)** — 3-step wizard: (1) role selection — `mentor` or `aluno`; (2) common fields — nome, cidade, categoria; (3) role-specific fields. The `TagInput` component (Enter/comma to add tags, Backspace to remove) is defined inline in the file.

**MentorProfile (`src/pages/MentorProfile.jsx`)** — Fully hardcoded; always shows `Dr. Carlos Silva` regardless of the `:id` param. Has four tabs (Sobre / Procedimentos / Avaliações / Disponibilidade) and a booking sidebar. `handleRequest()` sets a success state then calls `setTimeout(() => navigate('/home'), 2000)` — no Supabase writes occur.

### Shared components (`src/components/`)

**`DocumentsTab`** — Reusable document upload panel used in both `MentorHome` and `StudentHome`. Accepts `profileId`, fetches the latest upload per `tipo` from the `documents` table, uploads new files to Supabase Storage (`documents` bucket), and generates signed URLs for viewing. Validates file type (PDF/JPG/PNG) and size (≤10 MB). Only renders `identidade` and `crm` document types.

**`LocationMap`** — Read-only Leaflet map used in `OfferingDetail`. Shows a 500m radius circle centered near the offering's `latitude`/`longitude` with a seeded random offset (≤~200m, derived from `offeringId`) so the exact venue is never revealed. `scrollWheelZoom` and `attributionControl` are disabled for embedding.

**`LocationPicker`** — Interactive Leaflet map used in `CreateOfferingModal` (and offering edit) in `MentorHome`. Supports address search via Nominatim (`/search?countrycodes=br`), map click to place a pin, and draggable marker. Calls `onChange(lat, lng)` and `onCityResolved(cityString)` on each pin placement (city resolved via Nominatim reverse geocoding).

**`NotificationsTab`** — Notification inbox used in both `MentorHome` and `StudentHome`. Reads from the `notifications` table for the given `profileId`, marks all as read on mount, and navigates to `/offering/:id` on click when `offering_id` is set. Supports 4 notification types with distinct icon/color: `mensagem_privada`, `mensagem_turma`, `booking_status`, `offering_editado`.

### Shared utilities

**`src/lib/geo.js`** — `haversineKm(lat1, lng1, lat2, lng2)` and `formatDistance(km)` (returns strings like `~1,4 km de você`). Used in `Explorar` and `StudentHome` to show proximity on offering cards, and in `OfferingDetail` to show distance in the sidebar.

**`src/contexts/UserLocationContext.jsx`** — `UserLocationProvider` wraps the entire app (mounted in `App.jsx`) and requests browser geolocation once on mount. Exposes `{ lat, lng, status }` where `status` ∈ `{idle, loading, granted, denied, unavailable}`. Consume via `useUserLocation()` exported from the same file. The standalone `src/hooks/useUserLocation.js` is an unused duplicate — prefer the context version.

### Design system
Brand colors are hardcoded hex values (`#1E3A8A`, `#2563EB`, `#0F172A`) rather than Tailwind config aliases. The logo SVG + wordmark is duplicated inline in every page file. Avatar placeholders use initials + gradient backgrounds throughout. Poppins is the global font, applied via `src/index.css`.

`COMPLEXITY`, `BOOKING_STATUS`, `fmtDate`, and `fmtTime` are duplicated across `Explorar`, `OfferingDetail`, `StudentHome`, and `MentorHome` — they have not been extracted into shared utilities yet.

### Admin panel (`src/pages/AdminHome.jsx`)

Accessible to users with `profiles.papel = 'admin'` via `HomeRouter` in `App.jsx`. Five tabs: Pendentes | Ativos | Rejeitados | Inativos | Repasses.

- **Pendentes/Ativos/Rejeitados/Inativos** — non-admin profiles grouped by status. Each card has a "Ver documentos" button that opens a modal and generates Supabase signed URLs (60s) for the user's documents. Approve sets `status = 'ativo'`; reject opens a modal that stores `motivo_rejeicao` text. Admins can also deactivate active users and reactivate rejected/inactive ones.
- **Repasses** (`RepassesTab`) — the mentor payout queue. `loadPayments()` fetches `payments` where `status = 'pago'`, grouped by mentor, and cross-references `avaliacoes` (`direcao = 'mentor_para_aluno'`) by `booking_id` to flag which ones the mentor has already rated (see Mutual reviews section below — unrated bookings are excluded from "A repassar"/"Repassar tudo" until the mentor evaluates that student). `handleRepasse(ids)` bulk-updates `payments.repasse_status = 'repassado'` (admin-only per RLS).

**To create an admin account**, run in the Supabase SQL Editor:
```sql
update profiles set papel = 'admin' where id = '<uuid>';
```

**Required DB setup** — run `supabase/admin_policies.sql` after the main schema. It adds:
- `is_admin()` helper function (`security definer`) used in all admin RLS policies
- Policies for admin to read/update all profiles, read all documents, generate signed URLs for all storage objects
- `motivo_rejeicao text` column on `profiles`
- `trg_validate_profile_status` trigger — only admins can set status to `ativo`/`inativo`/`rejeitado`; regular users can only transition `rejeitado → pendente` (re-request review)

### Payments (Stripe)

Confirmed bookings can be paid via Stripe Checkout (card only — PIX is planned but not yet enabled). This uses two Supabase Edge Functions (`supabase/functions/`, Deno) plus a `payments` table (`supabase/payments_schema.sql`, apply after `schema.sql` and `admin_policies.sql`).

- **`payments` table** — one row per booking (`booking_id` unique FK), with `aluno_id`/`mentor_id`/`offering_id` FKs and `valor_bruto`. Tracks `status` (`pendente | pago | falhou | expirado`) and a separate `repasse_status` (`pendente | repassado`) for mentor payout bookkeeping (repayout marking is admin-only via `payments: admin update`; no payout automation yet). Clients get `select`/`insert`/`update` grants, but there are no client-facing INSERT/general-UPDATE RLS policies — rows are only ever written by the edge functions using the service-role key, which bypasses RLS. Students/mentors can only SELECT their own (mentors use this in `MentorHome`'s Financeiro panel); admins can SELECT/UPDATE all (e.g. to mark `repasse_status = 'repassado'`).
- **`create-checkout` function** — invoked from `StudentHome.handlePay()` via `supabase.functions.invoke('create-checkout', { body: { booking_id, origin } })`. Verifies the caller's JWT, re-fetches the booking under the *user's* client (so RLS confirms they own a `status = 'confirmado'` booking), then creates a Stripe Checkout session (`card` only, BRL, amount from `offerings.preco`) and upserts a `payments` row (`onConflict: booking_id`) with the session id. Returns `{ url }` for client-side redirect. Short-circuits with `{ already_paid: true }` if a `payments` row already has `status = 'pago'`.
- **`stripe-webhook` function** — separate public endpoint (no user JWT) that verifies the Stripe signature (`STRIPE_WEBHOOK_SECRET`) and updates the matching `payments` row (looked up by `stripe_session_id`) on `checkout.session.completed` (→ `status = 'pago'`, records `stripe_payment_intent` and `metodo_pagamento`) and `checkout.session.expired` (→ `status = 'expirado'`).
- **`/payment/success`** (`PaymentSuccess.jsx`) — static confirmation page Stripe redirects to after a successful checkout; does not itself verify payment (the webhook is the source of truth). No `/payment/cancel` route exists; Stripe's `cancel_url` points back to `/home`.
- Edge functions require `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` set as Supabase function secrets (not in `.env.local` — these run server-side on Supabase, not in the Vite app).

### Mutual reviews and mentor ranking

After a booking is `concluido`, students and mentors can rate each other via an `avaliacoes` table (`supabase/avaliacoes_schema.sql`, apply after `schema.sql` and `admin_policies.sql`).

- **`avaliacoes` table** — one row per `(booking_id, autor_id)` (unique constraint), so both parties of a booking can each leave one review. `direcao` ∈ `{aluno_para_mentor, mentor_para_aluno}` determines both the shape of the RLS and how the row is used. `autor_nome` is auto-filled by `trg_fill_avaliacao_autor_nome` (same pattern as `messages.sender_nome`). RLS: `aluno_para_mentor` rows are **publicly readable** (anon included — this powers the ranking); `mentor_para_aluno` rows are only visible to the author, the reviewed student, or an admin. Insert is only allowed by a party of a `status = 'concluido'` booking, rating the other party. No update/delete policy — reviews are immutable once submitted.
- **Aluno → mentor** (`StudentHome`, Histórico tab) — simple form: 1–5 stars + optional free-text comment (`AvaliarMentorModal`, inline in the file). Once submitted, the "⭐ Avaliar mentor" button is replaced by a static star readout. **Gates the certificate**: until this review exists for a booking, the "📜 Certificado" button is rendered disabled (with a "Avalie para liberar" hint) instead of opening `CertificateModal`.
- **Mentor → aluno** (`MentorHome`) — two entry points feeding the same table, since a mentor rates many students per session: (1) inside `EncerrarModal`, while marking students as concluded, an inline star picker + optional short comment per student is submitted alongside closing the offering; (2) from the Sessões tab's "Participantes" modal for any already-closed session, an "⭐ Avaliar aluno" button opens the same inline form for students not yet rated. **Gates the repasse queue**: `AdminHome`'s Repasses tab (`loadPayments()`) cross-references `avaliacoes` (`direcao = 'mentor_para_aluno'`) by `booking_id` — a paid booking the mentor hasn't rated yet shows "⏳ Aguardando avaliação do mentor" instead of the "Marcar repassado" button, and is excluded from the "A repassar" total and from "Repassar tudo".
- **Ranking** — both `Explorar` (public) and `StudentHome`'s Explorar tab (logged-in students) independently aggregate all public `aluno_para_mentor` rows client-side (avg + count per mentor) and render a "🏆 Mentores mais bem avaliados" horizontal card row (top 6) above the offerings grid/list; hidden entirely until at least one review exists. Cards are not clickable since `MentorProfile` is still a hardcoded stub (see Known incomplete areas).

### Status enforcement (platform gates)

`profiles.status` ∈ `{pendente, ativo, inativo, rejeitado}` is now enforced:

- **Mentors** (`MentorHome`): if `status !== 'ativo'`, the entire dashboard is replaced by a status banner with the rejection reason (if any) and a DocumentsTab so they can upload docs while waiting. Rejected mentors see a "Solicitar nova análise" button that sets status back to `pendente`.
- **Students** (`StudentHome`, `Explorar`): a banner appears at the top of the Explorar tab; the "Candidatar-se" button is replaced with a disabled "Cadastro pendente/não aprovado" label. `handleApply()` also guards internally. Rejected students see their `motivo_rejeicao` and a "Solicitar nova análise" button.
- The `refreshProfile()` function (exposed from `AuthContext`) is called after a re-review request to update local state without page reload.

### Known incomplete areas
- `MentorHome` — Avaliações and Produção tabs are commented out; `SESSIONS` and `REVIEWS` hardcoded constants remain in the file and are only used within those commented-out sections.
- `MentorProfile` — the `:id` param is captured by the router but not used; always renders hardcoded `Dr. Carlos Silva`. The booking flow triggers a `setTimeout` navigate back to `/home` — no Supabase writes occur.
- `Landing` is entirely static/hardcoded — no Supabase queries. It navigates to `/auth` with `{ state: { login: true } }` for "Entrar" and plain `navigate('/auth')` for "Cadastrar". `Auth` reads `location.state?.login` to set the initial tab.
