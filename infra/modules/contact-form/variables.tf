variable "name" {
  description = "Resource name prefix, e.g. qnsc-landing-contact-form."
  type        = string
}

variable "ses_sender_email" {
  description = "SES-verified sender address, e.g. no-reply@qnsc.vn."
  type        = string
}

variable "ses_recipient_email" {
  description = "Where contact-form submissions get forwarded, e.g. contact@qnsc.vn."
  type        = string
}

variable "allowed_origins" {
  description = "CORS origins allowed to call the Function URL (the landing page's own domain(s))."
  type        = list(string)
}

variable "tags" {
  type    = map(string)
  default = {}
}
