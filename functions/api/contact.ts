// Cloudflare Pages Function — POST /api/contact
//
// Runs on Cloudflare's edge, colocated with the static site itself (no
// cross-cloud hop to AWS). Validates the submission, escapes it, and forwards
// to Resend's transactional email API. Env vars are configured as Pages
// project secrets (Settings → Environment variables), not committed here.

interface Env {
  RESEND_API_KEY: string;
  CONTACT_FROM_EMAIL: string; // e.g. no-reply@qnsc.vn (must be a Resend-verified domain)
  CONTACT_TO_EMAIL: string; // e.g. contact@qnsc.vn
  ALLOWED_ORIGIN: string; // e.g. https://qnsc.vn
}

const MAX_FIELD_LEN = 2000;

function escapeHtml(str: string): string {
  return str.replace(
    /[&<>"']/g,
    (c) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[c] as string,
  );
}

function isValidEmail(email: unknown): email is string {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function corsHeaders(origin: string, allowedOrigin: string): HeadersInit {
  return {
    'Access-Control-Allow-Origin': origin === allowedOrigin ? origin : allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export const onRequestOptions: PagesFunction<Env> = async ({ request, env }) => {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(request.headers.get('origin') ?? '', env.ALLOWED_ORIGIN),
  });
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const headers = corsHeaders(request.headers.get('origin') ?? '', env.ALLOWED_ORIGIN);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400, headers });
  }

  const { name, email, company = '', service = '', message = '' } = body;

  if (!name || typeof name !== 'string' || !isValidEmail(email)) {
    return Response.json({ error: 'missing_required_fields' }, { status: 400, headers });
  }
  const fields = [name, email, company, service, message];
  if (fields.some((v) => typeof v === 'string' && v.length > MAX_FIELD_LEN)) {
    return Response.json({ error: 'field_too_long' }, { status: 400, headers });
  }

  const safe = {
    name: escapeHtml(name),
    email: escapeHtml(email),
    company: escapeHtml(String(company)),
    service: escapeHtml(String(service)),
    message: escapeHtml(String(message)),
  };

  const html = `
    <h2>New QNSC contact form submission</h2>
    <p><strong>Name:</strong> ${safe.name}</p>
    <p><strong>Email:</strong> ${safe.email}</p>
    <p><strong>Company:</strong> ${safe.company || '—'}</p>
    <p><strong>Interested in:</strong> ${safe.service || '—'}</p>
    <p><strong>Message:</strong></p>
    <p>${safe.message.replace(/\n/g, '<br>')}</p>
  `;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.CONTACT_FROM_EMAIL,
      to: env.CONTACT_TO_EMAIL,
      reply_to: email,
      subject: `QNSC contact form: ${name}`,
      html,
    }),
  });

  if (!res.ok) {
    console.error('Resend send failed', res.status, await res.text());
    return Response.json({ error: 'send_failed' }, { status: 502, headers });
  }

  return Response.json({ ok: true }, { status: 200, headers });
};
