data "aws_region" "current" {}
data "aws_caller_identity" "current" {}

# ── Lambda deployment package ────────────────────────────────────────────────
# node_modules must be installed (npm install --omit=dev) inside lambda/ before
# `tofu apply` — see infra/README.md for the build step.
data "archive_file" "lambda" {
  type        = "zip"
  source_dir  = "${path.module}/lambda"
  output_path = "${path.module}/.build/contact-form.zip"
  excludes    = ["package.json", "package-lock.json"]
}

# ── IAM ───────────────────────────────────────────────────────────────────────
resource "aws_iam_role" "lambda" {
  name = "${var.name}-lambda"
  tags = var.tags

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic_logs" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "ses_send" {
  name = "${var.name}-ses-send"
  role = aws_iam_role.lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["ses:SendEmail", "ses:SendRawEmail"]
      Resource = "*"
      Condition = {
        StringEquals = {
          "ses:FromAddress" = var.ses_sender_email
        }
      }
    }]
  })
}

# ── Lambda ────────────────────────────────────────────────────────────────────
resource "aws_lambda_function" "contact_form" {
  function_name    = var.name
  role             = aws_iam_role.lambda.arn
  handler          = "index.handler"
  runtime          = "nodejs22.x"
  filename         = data.archive_file.lambda.output_path
  source_code_hash = data.archive_file.lambda.output_base64sha256
  timeout          = 10
  memory_size      = 128
  tags             = var.tags

  environment {
    variables = {
      SES_SENDER_EMAIL    = var.ses_sender_email
      SES_RECIPIENT_EMAIL = var.ses_recipient_email
      ALLOWED_ORIGINS     = join(",", var.allowed_origins)
    }
  }
}

# Function URL — no API Gateway needed for a single POST endpoint; this is
# free (Lambda's own HTTPS listener), whereas an HTTP API adds per-request cost.
resource "aws_lambda_function_url" "contact_form" {
  function_name      = aws_lambda_function.contact_form.function_name
  authorization_type = "NONE"

  cors {
    allow_origins = var.allowed_origins
    allow_methods = ["POST"]
    allow_headers = ["content-type"]
    max_age       = 300
  }
}
