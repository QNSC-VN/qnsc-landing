# qnsc-landing infra

AWS infra for the landing page, kept in-repo (not a separate `*-infra` repo like
`rally-infra`/`opshub-infra`) because the whole stack is ~6 resources — an S3
bucket, a Lambda + Function URL, and IAM/SES glue. Uses the same shared Tofu
state backend and locking as every other QNSC product (see `platform/qnsc-infra`).

## What this deploys

| Resource | Purpose |
|---|---|
| `module.static_site` | S3 bucket serving the built Astro site, public-read locked to Cloudflare's IP ranges |
| `module.contact_form` | Lambda (Node 22, SES `SendEmail`) behind a Lambda Function URL — no API Gateway, so $0/mo at this volume |

**No CloudFront, no Route53.** DNS and CDN/TLS are Cloudflare (same as `rally`'s
ALB) — point a Cloudflare DNS record (proxied / "orange cloud") at the S3
website endpoint output.

## One-time prerequisites

1. **SES domain verification** — `no-reply@qnsc.vn` (sender) and `contact@qnsc.vn`
   (recipient) both need SES identity verification before `SendEmail` will work.
   In the SES console (ap-southeast-1): verify the `qnsc.vn` domain (add the
   DKIM/TXT records Cloudflare DNS asks for), or verify each address individually.
2. **SES sandbox** — new AWS accounts start in the SES sandbox, which only sends
   to verified addresses. Since `contact@qnsc.vn` is verified per step 1, sandbox
   mode is actually fine for a contact form (sender+recipient both verified) —
   no need to request production access unless you want to send to arbitrary
   inboxes later.
3. **Confirm `qnsc-tofu-state` bootstrap has run** — see `platform/qnsc-infra/README.md`.

## Deploy

```bash
# 1. Build the Lambda's node_modules (archive_file zips whatever's on disk —
#    this step is not run by Tofu itself)
cd infra/modules/contact-form/lambda
npm install --omit=dev

# 2. Plan + apply
cd ../../../live/prod
tofu init
tofu plan
tofu apply
```

Outputs after apply:

```bash
tofu output contact_form_url     # → PUBLIC_CONTACT_FORM_URL for the site build
tofu output s3_website_endpoint  # → Cloudflare DNS target
```

## Deploying the site itself

The Astro build is a separate step from this Tofu stack — Tofu only owns the
bucket, not its contents. In practice this runs via `.github/workflows/deploy.yml`
(below), not by hand — the manual version for reference:

```bash
cd ../../../../                     # repo root (qnsc-landing/)
PUBLIC_CONTACT_FORM_URL=$(cd infra/live/prod && tofu output -raw contact_form_url) \
  pnpm build
aws s3 sync dist/ s3://qnsc-landing-prod --delete
```

## CI/CD

Reuses the org-wide `QNSC-VN/qnsc-ci` composite actions library (the same one
`rally` and `opshub` consume) — no bespoke CI logic invented here, no copy-paste
drift to maintain independently.

| Workflow | Trigger | What it does |
|---|---|---|
| `.github/workflows/ci.yml` | every PR + push to `main` | `astro check`, build, upload `dist/` artifact, PR-title lint |
| `.github/workflows/deploy.yml` | push to `main` | build with real `PUBLIC_CONTACT_FORM_URL`, OIDC into AWS, S3 sync (immutable cache for hashed assets, no-cache for HTML), health check, Slack notify |
| `.github/workflows/security.yml` | PR + push to `main` + weekly | Gitleaks secret scan, dependency review, CodeQL SAST |
| `.github/workflows/infra-plan.yml` | PR touching `infra/**` | `tofu plan`, posts the diff as a PR comment |

**No CloudFront-invalidate or Trivy-container-scan steps** — this repo has no
CloudFront distribution (Cloudflare fronts it) and ships no Docker image (static
site), so those two steps from the rally/opshub template don't apply and were
deliberately omitted rather than left as no-ops.

### GitHub repo configuration needed once

**Environment** (Settings → Environments → New environment):
- `production` — used by `deploy.yml`
- `production-plan` — used by `infra-plan.yml` (can require no approval; it's read-only)

**Repository secrets:**
```
AWS_ACCOUNT_ID              # 12-digit AWS account ID
SLACK_DEPLOY_WEBHOOK        # optional — Slack or Discord incoming webhook
```

**Environment variables** (on the `production` environment):
```
AWS_REGION                  # ap-southeast-1
S3_BUCKET                   # qnsc-landing-prod
APP_URL                     # https://qnsc.vn
PUBLIC_CONTACT_FORM_URL     # from `tofu output contact_form_url`
```

**IAM roles** — provisioned by this Tofu stack itself (`aws_iam_role.github_deploy`,
`aws_iam_role.github_infra_plan` in `live/prod/main.tf`), trusting the platform
OIDC provider from `qnsc-infra/live/bootstrap`. Nothing to create by hand beyond
`tofu apply`.

## DNS (Cloudflare)

Point `qnsc.vn` (and `www`) at the S3 website endpoint via a proxied CNAME —
Cloudflare's proxy terminates TLS and caches static assets at the edge, so no
ACM cert or CloudFront distribution is needed.

## State

```
qnsc-tofu-state/
  qnsc-landing/prod/terraform.tfstate
```
