export function sanitizeMarkdown(text) {
  if (!text) return '';
  return String(text).replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
}

export async function sendTelegramNotification(message, imageUrl = null) {
  const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
  const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.error("Telegram credentials missing in environment variables.");
    return { ok: false, error: "Missing credentials" };
  }

  try {
    let url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    let payload = {
      chat_id: chatId,
      text: message,
      parse_mode: 'HTML',
    };

    if (imageUrl) {
      // Try sending with photo first
      url = `https://api.telegram.org/bot${botToken}/sendPhoto`;
      payload = {
        chat_id: chatId,
        photo: imageUrl,
        caption: message,
        parse_mode: 'HTML',
      };
    }

    let response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    let data = await response.json();

    // Fallback if sendPhoto fails (e.g. invalid URL)
    if (!data.ok && imageUrl) {
      console.warn("sendPhoto failed, falling back to sendMessage", data);
      url = `https://api.telegram.org/bot${botToken}/sendMessage`;
      payload = {
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      };
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      data = await response.json();
    }

    return data;
  } catch (err) {
    console.error("Error sending telegram message:", err);
    return { ok: false, error: err.message };
  }
}
