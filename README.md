# QNSC Landing

Marketing site for QNSC — Quy Nhon Semiconductor. Astro 5 + Tailwind v4, static
output, English + Vietnamese (`/vi/`) routes. Hosted on Cloudflare Pages.

## Stack

- **Astro 5** — static site generation, content collections, image optimization
- **Tailwind CSS v4** — design tokens ported from the original hand-authored CSS
- **TypeScript** — strict, `astro check` gates CI
- **Hosting** — Cloudflare Pages (GitHub-connected, auto-deploys on push to `main`, automatic PR previews)
- **Contact form** — Cloudflare Pages Function (`functions/api/contact.ts`) → Resend

See [`AGENTS.md`](AGENTS.md) for local dev-server notes.

## Getting started

```bash
nvm use          # Node version pinned in .nvmrc
pnpm install
pnpm dev
```

To test the contact form locally, run it through Wrangler instead of the plain
Astro dev server so the Pages Function is available:

```bash
pnpm build
pnpm exec wrangler pages dev dist --compatibility-date=2026-07-01
```

## Scripts

| Command          | Action                                                                       |
| ---------------- | ---------------------------------------------------------------------------- |
| `pnpm dev`       | Local dev server at `localhost:4321`                                         |
| `pnpm build`     | Production build to `./dist/`                                                |
| `pnpm preview`   | Preview the production build locally                                         |
| `pnpm lint`      | ESLint + Prettier check                                                      |
| `pnpm lint:fix`  | Auto-fix lint + formatting                                                   |
| `pnpm typecheck` | `astro check` (TS + content collection schemas) — also covers `functions/**` |

## Project structure

```
src/
├─ components/     # Navbar, Footer, ServiceCard, ProductCard, LeaderCard, ContactForm, ...
├─ content/        # services/products/leadership as typed JSON, articles as Markdown
├─ i18n/           # en.ts (source of truth) + vi.ts, type-checked to match shape
├─ layouts/        # BaseLayout.astro — head/meta/OG/JSON-LD, nav+footer shell
├─ pages/          # index.astro, why-quy-nhon.astro, vi/index.astro, vi/why-quy-nhon.astro (redirect)
└─ styles/         # Tailwind v4 tokens (global.css)

functions/         # Cloudflare Pages Functions — api/contact.ts (form submit handler)
```

## i18n

`src/i18n/vi.ts` is type-checked against the shape of `src/i18n/en.ts` (via a
structural `Dictionary` type) — adding a key to one without the other is a
build error, not a silent runtime gap.

**Known gap:** the "Why Quy Nhơn?" article (`src/content/articles/why-quy-nhon.md`)
has no Vietnamese translation yet. `/vi/why-quy-nhon` redirects to the English
original rather than serving English body copy under a `vi` URL/hreflang.

## Hosting: Cloudflare Pages

The Pages project is GitHub-connected in the Cloudflare dashboard — every push
to `main` triggers a production build+deploy automatically, and every PR gets
its own preview URL. There is no `deploy.yml` in this repo; `.github/workflows/`
only runs pre-merge quality gates (lint/typecheck/build check, security scans),
which is intentionally decoupled from the actual deploy Cloudflare performs.

**Build settings** (Cloudflare dashboard → Pages project → Settings → Builds):

```
Build command:   pnpm build
Build output:    dist
Root directory:  /
Node version:    22 (or set via .nvmrc, which Pages respects)
```

**Environment variables** (Settings → Environment variables, both Production
and Preview):

```
RESEND_API_KEY        # from resend.com — used by functions/api/contact.ts
CONTACT_FROM_EMAIL     # e.g. no-reply@qnsc.vn (must be a Resend-verified domain)
CONTACT_TO_EMAIL       # e.g. contact@qnsc.vn
ALLOWED_ORIGIN         # e.g. https://qnsc.vn (CORS allow-origin for the Function)
```

**Security headers** — S3-style static hosts can't set custom response
headers, but Cloudflare Pages can via a `_headers` file in `public/` (Cloudflare's
own convention, no Transform Rule needed) — see `public/_headers`.

## CI

Three workflows, all pre-merge gates (see `.github/workflows/`):

- `ci.yml` — lint, typecheck, build check, PR title format
- `security.yml` — Gitleaks secret scan, dependency review, CodeQL SAST
- `release.yml` — Release Please changelog/semver bookkeeping

Reuses the shared [`QNSC-VN/qnsc-ci`](https://github.com/QNSC-VN/qnsc-ci)
composite actions library used by `rally` and `opshub` (just the Node/pnpm
setup action — the AWS-specific actions don't apply to a Cloudflare-hosted repo).

## License

Proprietary — see [`LICENSE`](LICENSE).
