# ── S3 static website origin, fronted by Cloudflare (proxy + TLS + CDN) ──────
# No CloudFront: Cloudflare's free-tier proxy already provides HTTPS, caching,
# and DDoS protection at the edge, so a second CDN layer would be redundant
# cost with no functional benefit for a static marketing site.
resource "aws_s3_bucket" "site" {
  bucket = var.bucket_name
  tags   = var.tags
}

resource "aws_s3_bucket_public_access_block" "site" {
  bucket = aws_s3_bucket.site.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_website_configuration" "site" {
  bucket = aws_s3_bucket.site.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "404.html"
  }
}

# Bucket policy: public-read, but only via requests carrying Cloudflare's
# proxy IP ranges — direct requests to the S3 endpoint (bypassing Cloudflare)
# are refused. Mirrors the IP-allowlist approach used for rally's ALB.
resource "aws_s3_bucket_policy" "site" {
  bucket = aws_s3_bucket.site.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowCloudflareRead"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.site.arn}/*"
        Condition = {
          IpAddress = {
            "aws:SourceIp" = var.cloudflare_ipv4
          }
        }
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.site]
}
