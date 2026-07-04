# QNSC Landing

Marketing site for QNSC — Quy Nhon Semiconductor. Astro 5 + Tailwind v4, static
output, English + Vietnamese (`/vi/`) routes.

## Stack

- **Astro 5** — static site generation, content collections, image optimization
- **Tailwind CSS v4** — design tokens ported from the original hand-authored CSS
- **TypeScript** — strict, `astro check` gates CI
- **Hosting** — S3 (static website) behind Cloudflare (proxy/CDN/TLS), no CloudFront/Route53
- **Contact form** — Lambda Function URL → SES, no API Gateway

See [`infra/README.md`](infra/README.md) for the AWS deploy story and
[`AGENTS.md`](AGENTS.md) for local dev-server notes.

## Getting started

```bash
nvm use          # Node version pinned in .nvmrc
pnpm install
cp .env.example .env   # fill in PUBLIC_CONTACT_FORM_URL once infra is applied
pnpm dev
```

## Scripts

| Command          | Action                                          |
| ---------------- | ----------------------------------------------- |
| `pnpm dev`       | Local dev server at `localhost:4321`            |
| `pnpm build`     | Production build to `./dist/`                   |
| `pnpm preview`   | Preview the production build locally            |
| `pnpm lint`      | ESLint + Prettier check                         |
| `pnpm lint:fix`  | Auto-fix lint + formatting                      |
| `pnpm typecheck` | `astro check` (TS + content collection schemas) |

## Project structure

```
src/
├─ components/     # Navbar, Footer, ServiceCard, ProductCard, LeaderCard, ContactForm, ...
├─ content/        # services/products/leadership as typed JSON, articles as Markdown
├─ i18n/           # en.ts (source of truth) + vi.ts, type-checked to match shape
├─ layouts/        # BaseLayout.astro — head/meta/OG/JSON-LD, nav+footer shell
├─ pages/          # index.astro, why-quy-nhon.astro, vi/index.astro, vi/why-quy-nhon.astro
└─ styles/         # Tailwind v4 tokens (global.css)

infra/             # OpenTofu — S3 static site, Lambda+SES contact form, GitHub OIDC roles
_legacy/           # Pre-Astro hand-authored HTML/CSS/JS — kept for reference, not built
```

## i18n

`src/i18n/vi.ts` is type-checked against the shape of `src/i18n/en.ts` (via a
structural `Dictionary` type) — adding a key to one without the other is a
build error, not a silent runtime gap.

## CI/CD

See [`infra/README.md`](infra/README.md#cicd) — reuses the shared
[`QNSC-VN/qnsc-ci`](https://github.com/QNSC-VN/qnsc-ci) composite actions
library used by `rally` and `opshub`.

## License

Proprietary — see [`LICENSE`](LICENSE).
