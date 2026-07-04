import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const ses = new SESClient({});
const SENDER = process.env.SES_SENDER_EMAIL;
const RECIPIENT = process.env.SES_RECIPIENT_EMAIL;
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? '').split(',').filter(Boolean);

const MAX_FIELD_LEN = 2000;

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const handler = async (event) => {
  const origin = event.headers?.origin ?? event.headers?.Origin ?? '';
  const headers = corsHeaders(origin);

  if (event.requestContext?.http?.method === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  let body;
  try {
    body = JSON.parse(event.body ?? '{}');
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'invalid_json' }) };
  }

  const { name, email, company = '', service = '', message = '' } = body;

  if (!name || !isValidEmail(email)) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'missing_required_fields' }) };
  }
  if ([name, email, company, service, message].some((v) => typeof v === 'string' && v.length > MAX_FIELD_LEN)) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'field_too_long' }) };
  }

  const safe = {
    name: escapeHtml(name),
    email: escapeHtml(email),
    company: escapeHtml(company),
    service: escapeHtml(service),
    message: escapeHtml(message),
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

  try {
    await ses.send(
      new SendEmailCommand({
        Source: SENDER,
        Destination: { ToAddresses: [RECIPIENT] },
        ReplyToAddresses: [email],
        Message: {
          Subject: { Data: `QNSC contact form: ${name}` },
          Body: { Html: { Data: html } },
        },
      }),
    );
  } catch (err) {
    console.error('SES send failed', err);
    return { statusCode: 502, headers, body: JSON.stringify({ error: 'send_failed' }) };
  }

  return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
};
