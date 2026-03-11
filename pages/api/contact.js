const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      ok: false,
      message: 'Method not allowed. Use POST for the contact endpoint.',
    });
  }

  const endpoint =
    process.env.FORMSPREE_ENDPOINT || process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT;

  if (!endpoint) {
    return res.status(500).json({
      ok: false,
      message:
        'Contact delivery is not configured on the server. Add FORMSPREE_ENDPOINT or NEXT_PUBLIC_FORMSPREE_ENDPOINT.',
    });
  }

  const payload = sanitizePayload(req.body);

  if (!payload.email || !EMAIL_PATTERN.test(payload.email)) {
    return res.status(400).json({
      ok: false,
      message: 'Enter a valid email address before sending the form.',
    });
  }

  if (!payload.message || payload.message.length < 10) {
    return res.status(400).json({
      ok: false,
      message: 'Message should be at least 10 characters.',
    });
  }

  try {
    const upstreamResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const upstreamPayload = await readUpstream(upstreamResponse);

    if (!upstreamResponse.ok) {
      return res.status(upstreamResponse.status).json({
        ok: false,
        message:
          upstreamPayload.message ||
          upstreamPayload.error ||
          'Form delivery failed through the server-side fallback.',
      });
    }

    return res.status(200).json({
      ok: true,
      message: 'Message sent through the server-side fallback.',
    });
  } catch {
    return res.status(502).json({
      ok: false,
      message:
        'Both the direct Formspree request and the server-side fallback failed. Use the mail fallback below.',
    });
  }
}

function sanitizePayload(body) {
  const source =
    body && typeof body === 'object' && !Array.isArray(body) ? body : {};

  return {
    name: sanitizeValue(source.name),
    email: sanitizeValue(source.email),
    message: sanitizeValue(source.message, true),
  };
}

function sanitizeValue(value, preserveLineBreaks = false) {
  const nextValue = String(value || '').replace(/[<>]/g, '').replace(/\r/g, '');

  if (preserveLineBreaks) {
    return nextValue
      .split('\n')
      .map((line) => line.trim())
      .join('\n')
      .trim();
  }

  return nextValue.replace(/\s+/g, ' ').trim();
}

async function readUpstream(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}
