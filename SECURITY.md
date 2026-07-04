# Security Policy

## Supported Versions

| Version         | Supported           |
| --------------- | ------------------- |
| latest (`main`) | ✅                  |
| older releases  | ❌ — please upgrade |

## Reporting a Vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Please report security issues by emailing: **security@qnsc.vn**

Include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (optional)

You will receive an acknowledgement within **48 hours** and a status update within **7 days**.

## Disclosure Policy

- We follow [responsible disclosure](https://en.wikipedia.org/wiki/Responsible_disclosure).
- Once a fix is released, we will publish a security advisory on GitHub.
- Credit will be given to the reporter unless anonymity is requested.

## Scope

In scope:

- Cross-site scripting (XSS) in rendered pages or the contact form
- Contact-form Lambda: injection, SSRF, unauthorized SES sending, PII exposure
- S3 bucket misconfiguration (public write, unintended object exposure)
- Sensitive data exposure (leaked credentials, internal URLs)
- Supply-chain issues (compromised npm dependency, GitHub Actions supply chain)

Out of scope:

- Denial of service attacks
- Social engineering
- Issues requiring physical access
- Missing security headers on a static marketing site with no auth/session (report only if it enables a concrete exploit)
