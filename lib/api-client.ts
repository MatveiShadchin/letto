export async function apiJson<T>(
  url: string,
  init?: RequestInit
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      credentials: 'include',
      ...init,
    });
  } catch {
    throw new Error('Нет связи с сервером. Проверьте интернет.');
  }

  let data: { error?: string } & T;
  try {
    data = await response.json();
  } catch {
    if (response.status >= 502 && response.status <= 504) {
      throw new Error('Сервер временно недоступен. Подождите минуту и попробуйте снова.');
    }
    throw new Error(
      response.ok
        ? 'Сервер вернул некорректный ответ'
        : `Ошибка сервера (${response.status}). Попробуйте ещё раз.`
    );
  }

  if (!response.ok) {
    throw new Error(data.error || 'Ошибка запроса');
  }

  return data;
}
