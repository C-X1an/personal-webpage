export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      ok: false,
      message: 'Method not allowed. Use POST for the contact endpoint.',
    });
  }

  return res.status(503).json({
    ok: false,
    message:
      'Contact delivery is scaffolded but not wired yet. Task_05 will forward messages to Formspree.',
  });
}
