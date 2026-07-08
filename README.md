# Marketing Portal — Frontend

TypeScript + React (Vite) SPA for the internal Marketing Department portal.
Talks to a Yii2 + MySQL backend over a JWT-authenticated REST API. No SSR.

## Stack

- React 19 + TypeScript
- Vite
- React Router (client-side routing, no SSR)
- Plain CSS with design tokens (no CSS framework) — see `src/styles/global.css`

## Getting started

```bash
npm install
cp .env.example .env   # set VITE_API_BASE_URL to point at the Yii2 API
npm run dev
```

```bash
npm run build     # type-checks then builds to dist/
npm run preview   # serve the production build locally
```

## Structure

```
src/
  api/client.ts             fetch wrapper, in-memory token store, ApiError
  context/AuthContext.tsx   auth state, login()/logout(), current user
  components/               Navbar, FacultyCard, ProfileCard, ProtectedRoute
  pages/Login.tsx           login screen (id.oup.com-style centered card)
  pages/Dashboard.tsx       dashboard: starfield hero + 60/40 layout
  styles/global.css         design tokens: --primary, --radius, type scale
  types/index.ts            AuthUser, LoginRequest/Response, Faculty, etc.
```

## Design tokens

- `--primary: 0 33 71;` — the app's primary RGB triplet, consumed as
  `rgb(var(--primary) / <alpha>)` throughout (faculty cards, profile banner,
  nav pill, buttons, focus rings).
- `--radius: 10px;` — single global corner radius. `.card`, `.button`,
  `input`, `.modal`, `.nav-pill`, `.avatar-badge` all inherit it. There are no
  sharp corners and no pill/20px+ radii anywhere in the UI.
- Hero starfield and the floating nav pill live in `pages/Dashboard.css` /
  `components/Navbar.css`. The starfield is generated purely in CSS
  (layered `radial-gradient`s + a soft radial-gradient "planet"), so no image
  asset is required and it stays crisp at any resolution.

## Auth / token handling

- `POST /v1/auth/login` is called from `api/client.ts::authApi.login`.
- On success the `access_token` is kept in a **module-level in-memory
  variable** (`setAccessToken` / `getAccessToken`), never written to
  `localStorage`/`sessionStorage`. This means a hard page reload currently
  logs the user out — that's intentional for now; a persistent-token
  strategy (e.g. httpOnly refresh cookie) is a separate follow-up per the
  spec.
- Every authenticated request automatically gets
  `Authorization: Bearer <token>` added by `request()` unless the call opts
  out with `{ auth: false }` (used for the login call itself).
- `422` responses are parsed into `ApiError.errors` and surfaced as
  per-field messages on the login form.

## Role handling

`AuthUser.role` is one of `super_admin | supervisor | worker`, returned by
the backend and trusted as-is — the frontend does not re-derive or validate
permissions, it only reads `user.role` to decide what to show
(`ROLE_LABELS` in `src/types/index.ts` maps it to a human-readable label).
Any real permission logic stays server-side per the spec.

## What's stubbed for now

- **Faculties**: `Dashboard.tsx` renders 12 placeholder `Faculty` objects
  (`Faculty 1`…`Faculty 12`) client-side. Swap `buildPlaceholderFaculties()`
  for a real fetch once the faculties endpoint exists — `FacultyCard`
  already takes a typed `Faculty` prop, so no card markup changes should be
  needed.
- **Registration** is intentionally not implemented (accounts are created
  by an admin, per spec).
