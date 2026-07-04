output "s3_website_endpoint" {
  description = "Point Cloudflare DNS (orange-cloud CNAME) at this."
  value       = module.static_site.website_endpoint
}

output "contact_form_url" {
  description = "Set as PUBLIC_CONTACT_FORM_URL when building the site."
  value       = module.contact_form.function_url
}

output "github_deploy_role_arn" {
  description = "Set repo variable AWS_ACCOUNT_ID + this role name is referenced directly in deploy.yml."
  value       = aws_iam_role.github_deploy.arn
}

output "github_infra_plan_role_arn" {
  description = "Referenced directly in infra-plan.yml."
  value       = aws_iam_role.github_infra_plan.arn
}
