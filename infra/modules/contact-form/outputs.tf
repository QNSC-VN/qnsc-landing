output "function_url" {
  description = "Public HTTPS endpoint for the contact form — set as PUBLIC_CONTACT_FORM_URL in the site build."
  value       = aws_lambda_function_url.contact_form.function_url
}

output "function_name" {
  value = aws_lambda_function.contact_form.function_name
}
