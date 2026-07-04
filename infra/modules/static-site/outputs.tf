output "bucket_id" {
  value = aws_s3_bucket.site.id
}

output "bucket_arn" {
  value = aws_s3_bucket.site.arn
}

output "website_endpoint" {
  description = "S3 website endpoint — point Cloudflare's DNS CNAME/orange-cloud record here."
  value       = aws_s3_bucket_website_configuration.site.website_endpoint
}
