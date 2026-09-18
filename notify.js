// /api/notify.js
// Vercel serverless function — receives a booking submission from the site
// and sends a notification email to Chris and Kevin via Resend.
//
// Requires an environment variable set in the Vercel project settings:
//   RESEND_API_KEY = re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
//
// The "from" address below must be on a domain you've verified in Resend
// (see README.md). It can't be a plain gmail.com/yahoo.com address.

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const TEAM_EMAILS = ['chris@somainsurancegroup.com', 'kevin@somainsurancegroup.com'];

// TODO: replace with an address on your verified sending domain, e.g.
// 'Soma Insurance Website <bookings@somainsurancegroup.com>'
const FROM_ADDRESS = 'Soma Insurance Website <bookings@YOURDOMAIN.com>';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { line, name, phone, email, method, date, time, notes, submittedAt } = req.body || {};

  if (!name || !phone) {
    return res.status(400).json({ error: 'Missing required fields (name, phone)' });
  }

  const subject = `New appointment request — ${name} (${line || 'Not specified'})`;

  const text = `New booking request from the Soma Insurance website:

Coverage line: ${line || 'Not specified'}
Name: ${name}
Phone: ${phone}
Email: ${email || 'Not provided'}
Preferred contact method: ${method || 'Not specified'}
Preferred date: ${date || 'Not specified'}
Preferred time: ${time || 'Not specified'}
Notes: ${notes || 'None'}

Submitted: ${submittedAt ? new Date(submittedAt).toLocaleString() : new Date().toLocaleString()}`;

  try {
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: TEAM_EMAILS,
      subject,
      text,
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Resend send failed:', err);
    return res.status(500).json({ error: 'Failed to send notification email' });
  }
}
