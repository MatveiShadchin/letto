interface RelayMessage {
  chat_id: string;
  text: string;
}

export async function relayTelegramViaGithub(
  messages: RelayMessage[],
  botToken?: string
): Promise<boolean> {
  const token = process.env.GITHUB_TELEGRAM_RELAY_TOKEN?.trim();
  const repo = process.env.GITHUB_TELEGRAM_RELAY_REPO?.trim() || 'MatveiShadchin/letto';
  const telegramToken = botToken?.trim() || process.env.TELEGRAM_BOT_TOKEN?.trim();

  if (!token || !telegramToken || messages.length === 0) {
    return false;
  }

  const response = await fetch(`https://api.github.com/repos/${repo}/dispatches`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      event_type: 'telegram_notify',
      client_payload: { token: telegramToken, messages },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub relay failed (${response.status}): ${body}`);
  }

  return true;
}
