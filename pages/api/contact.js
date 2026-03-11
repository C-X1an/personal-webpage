export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      ok: false,
      message: 'Method not allowed. Use POST for the contact endpoint.',
    });
  }

  return res.status(410).json({
    ok: false,
    message:
      'This project posts directly to NEXT_PUBLIC_FORMSPREE_ENDPOINT on the client. A proxy route is not required for the current deployment path.',
  });
}
