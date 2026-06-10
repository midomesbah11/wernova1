export default async function handler(req, res) {
  // TEST: if you open this in browser, it should show this message
  if (req.method === 'GET') {
    return res.status(200).json({ status: 'API is alive and reachable' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { message, image_url } = req.body;
  const botToken = process.env.VITE_TELEGRAM_BOT_TOKEN;
  const chatId = process.env.VITE_TELEGRAM_CHAT_ID;

  // Debugging log for Vercel Dashboard
  console.log('Attempting to send to Telegram...', { hasToken: !!botToken, hasChatId: !!chatId, hasImage: !!image_url });

  if (!botToken || !chatId) {
    return res.status(500).json({ 
      error: 'Environment variables MISSING on Vercel. Please add them in Settings > Environment Variables.' 
    });
  }

  try {
    let url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    let payload = {
      chat_id: chatId,
      text: message || 'Test',
      parse_mode: 'Markdown',
    };

    let finalImageUrl = image_url;
    if (finalImageUrl && finalImageUrl.startsWith('/')) {
      const host = req.headers.host || 'wernova-store.vercel.app';
      finalImageUrl = `https://${host}${finalImageUrl}`;
    }

    if (finalImageUrl && finalImageUrl.startsWith('http')) {
      url = `https://api.telegram.org/bot${botToken}/sendPhoto`;
      payload = {
        chat_id: chatId,
        photo: finalImageUrl,
        caption: message || 'Test',
        parse_mode: 'Markdown',
      };
    }

    let response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    let data = await response.json();

    // Fallback: If sendPhoto failed, send text only
    if (!data.ok && finalImageUrl) {
      console.warn('sendPhoto failed, falling back to sendMessage:', data.description);
      const textUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const textPayload = {
        chat_id: chatId,
        text: message || 'Test',
        parse_mode: 'Markdown',
      };
      response = await fetch(textUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(textPayload),
      });
      data = await response.json();
    }

    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
