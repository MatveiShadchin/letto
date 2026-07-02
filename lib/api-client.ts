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
    throw new Error('Сервер вернул некорректный ответ');
  }

  if (!response.ok) {
    throw new Error(data.error || 'Ошибка запроса');
  }

  return data;
}
