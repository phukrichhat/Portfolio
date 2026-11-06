// Vercel serverless function — keeps the Telegram bot token off the client.
// Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in Vercel → Project → Settings → Environment Variables.
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ ok: false });
  const { name, email, message } = req.body || {};
  if (!name || !email || !message) return res.status(400).json({ ok: false });

  const text = `📬 New Message from Portfolio\n\n👤 Name: ${name}\n📧 Email: ${email}\n💬 Message: ${message}`.slice(0, 3500);
  const r = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text })
  });
  return res.status(r.ok ? 200 : 502).json({ ok: r.ok });
};
