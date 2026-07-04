variable "bucket_name" {
  description = "S3 bucket name for the static site origin (globally unique)."
  type        = string
}

variable "cloudflare_ipv4" {
  description = "Cloudflare IPv4 CIDR ranges allowed to reach the bucket via S3 website/REST endpoint."
  type        = list(string)
}

variable "tags" {
  type    = map(string)
  default = {}
}
