# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (Vite, localhost:5173)
npm run build     # Production build to dist/
npm run preview   # Preview production build locally
```

There are no tests and no linter configured.

## Architecture

**Experenciei** is a Brazilian medical mentorship marketplace — connecting surgical specialists (mentors) with medical students and residents. The entire frontend is a static React SPA with all data hardcoded (no backend or API calls).

### Stack
- React 18 + React Router v6 + Vite
- Tailwind CSS v3 (utility-first, no component library)
- Deployed on Vercel (`vercel.json` rewrites all routes to `index.html` for SPA routing)

### Routing (`src/App.jsx`)
| Route | Component | Purpose |
|---|---|---|
| `/` | `Landing` | Marketing page |
| `/auth` | `Auth` | Login/register/forgot-password (UI only, navigates to `/home` on submit) |
| `/home` | `StudentHome` | Mentor + procedure discovery with search/filters |
| `/mentor/:id` | `MentorProfile` | Mentor detail with tabbed content + booking sidebar |

### Data model
All data is defined as constants at the top of each page component — there is no shared state, context, or store. `MentorProfile` always renders a single hardcoded mentor (`Dr. Carlos Silva`); the `:id` param is captured by the router but not used.

### Design system
Brand colors are hardcoded hex values (`#1E3A8A`, `#2563EB`, `#0F172A`) rather than Tailwind config aliases. The `Logo` component (SVG + wordmark) is defined inline in every page file rather than as a shared component, with slight variants (dark vs. white mode). Avatar placeholders use initials + gradient backgrounds throughout.

### Key interaction patterns
- `Landing` navigates to `/auth` with `{ state: { login: true } }` for the "Entrar" button and plain `navigate('/auth')` for "Cadastrar". `Auth` reads `location.state?.login` to set the initial tab.
- Auth forms do nothing except `navigate('/home')` on submit — no validation beyond HTML `required`
- `StudentHome` search/filter state is local (`useState`). Only `procCategory` actually filters anything — the `searchQuery` text field and the four `filters` dropdowns are captured in state but never applied to rendered output; mentor cards are always unfiltered.
- `MentorProfile` booking flow: select procedure → select date → `handleRequest()` sets `requested=true`, shows success state, then `setTimeout` navigates back to `/home`. The "Disponibilidade" tab calendar and the sidebar date grid are separate UIs but share the same `selectedDate` state.
