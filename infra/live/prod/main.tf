terraform {
  required_version = ">= 1.9"
  required_providers {
    aws     = { source = "hashicorp/aws", version = "~> 5.0" }
    archive = { source = "hashicorp/archive", version = "~> 2.4" }
  }

  backend "s3" {
    bucket         = "qnsc-tofu-state"
    key            = "qnsc-landing/prod/terraform.tfstate"
    region         = "ap-southeast-1"
    encrypt        = true
    dynamodb_table = "qnsc-tofu-locks"
  }
}

provider "aws" {
  region = "ap-southeast-1"
  default_tags {
    tags = {
      Project     = "qnsc-landing"
      Environment = "production"
      ManagedBy   = "opentofu"
    }
  }
}

data "aws_caller_identity" "current" {}

# ── Read platform-level outputs (OIDC provider) from qnsc-infra bootstrap ────
# Dependency: qnsc-infra/live/bootstrap must be applied before this stack.
data "terraform_remote_state" "platform" {
  backend = "s3"
  config = {
    bucket = "qnsc-tofu-state"
    key    = "platform/bootstrap/terraform.tfstate"
    region = "ap-southeast-1"
  }
}

locals {
  domain     = "qnsc.vn"
  github_org = "QNSC-VN"

  # Cloudflare IPv4 ranges — https://www.cloudflare.com/ips-v4 (update if Cloudflare publishes new ranges)
  cloudflare_ipv4 = [
    "173.245.48.0/20",
    "103.21.244.0/22",
    "103.22.200.0/22",
    "103.31.4.0/22",
    "141.101.64.0/18",
    "108.162.192.0/18",
    "190.93.240.0/20",
    "188.114.96.0/20",
    "197.234.240.0/22",
    "198.41.128.0/17",
    "162.158.0.0/15",
    "104.16.0.0/13",
    "104.24.0.0/14",
    "172.64.0.0/13",
    "131.0.72.0/22",
  ]
}

module "static_site" {
  source          = "../../modules/static-site"
  bucket_name     = "qnsc-landing-prod"
  cloudflare_ipv4 = local.cloudflare_ipv4
  tags            = { Component = "static-site" }
}

module "contact_form" {
  source              = "../../modules/contact-form"
  name                = "qnsc-landing-contact-form"
  ses_sender_email    = "no-reply@${local.domain}"
  ses_recipient_email = "contact@${local.domain}"
  allowed_origins     = ["https://${local.domain}", "https://www.${local.domain}"]
  tags                = { Component = "contact-form" }
}

# ── GitHub OIDC — deploy role for .github/workflows/deploy.yml ───────────────
# Least-privilege: only S3 read/write on this product's own bucket, nothing else.
resource "aws_iam_role" "github_deploy" {
  name        = "qnsc-landing-github-deploy-production"
  description = "Assumed by GitHub Actions (qnsc-landing repo) to deploy the built site to S3"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = { Federated = data.terraform_remote_state.platform.outputs.oidc_provider_arn }
        Action    = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
          }
          StringLike = {
            "token.actions.githubusercontent.com:sub" = [
              "repo:${local.github_org}/qnsc-landing:ref:refs/heads/main",
              "repo:${local.github_org}/qnsc-landing:environment:production",
            ]
          }
        }
      }
    ]
  })

  tags = { Component = "github-oidc" }
}

resource "aws_iam_role_policy" "github_deploy" {
  name = "qnsc-landing-deploy"
  role = aws_iam_role.github_deploy.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "S3Sync"
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:GetObject",
          "s3:ListBucket",
        ]
        Resource = [
          module.static_site.bucket_arn,
          "${module.static_site.bucket_arn}/*",
        ]
      },
    ]
  })
}

# ── GitHub OIDC — infra-plan role for .github/workflows/infra-plan.yml ───────
# Read-only: tofu plan needs to read state + describe resources, never write.
resource "aws_iam_role" "github_infra_plan" {
  name        = "qnsc-landing-github-infra-plan"
  description = "Assumed by GitHub Actions (qnsc-landing repo) to run tofu plan on PRs — read-only"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = { Federated = data.terraform_remote_state.platform.outputs.oidc_provider_arn }
        Action    = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
          }
          StringLike = {
            "token.actions.githubusercontent.com:sub" = "repo:${local.github_org}/qnsc-landing:pull_request"
          }
        }
      }
    ]
  })

  tags = { Component = "github-oidc" }
}

resource "aws_iam_role_policy_attachment" "github_infra_plan_readonly" {
  role       = aws_iam_role.github_infra_plan.name
  policy_arn = "arn:aws:iam::aws:policy/ReadOnlyAccess"
}
