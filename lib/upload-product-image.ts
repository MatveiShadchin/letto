const MAX_SIZE_BYTES = 5 * 1024 * 1024;

function getUploadErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof Error)) {
    return fallback;
  }

  if (error.message === 'fetch failed') {
    return 'Нет связи с сервером. Откройте сайт на том же порту, что в терминале (npm run dev), и войдите в админку заново.';
  }

  return error.message || fallback;
}

export async function uploadProductImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/') && !file.name.match(/\.(jpe?g|png|webp|gif|heic|heif)$/i)) {
    throw new Error('Выберите файл изображения (JPG, PNG, WEBP)');
  }

  if (file.size > MAX_SIZE_BYTES) {
    throw new Error('Фото не больше 5 МБ');
  }

  const contentType = file.type || 'image/jpeg';

  let response: Response;
  try {
    response = await fetch('/api/upload-product-image', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': contentType,
        'X-File-Name': encodeURIComponent(file.name || 'image.jpg'),
      },
      body: file,
    });
  } catch (error) {
    throw new Error(
      getUploadErrorMessage(error, 'Нет связи с сервером. Проверьте, что сайт запущен, и попробуйте снова.')
    );
  }

  let data: { url?: string; error?: string };
  try {
    data = await response.json();
  } catch {
    throw new Error('Сервер вернул некорректный ответ. Попробуйте другое фото.');
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Сессия админки истекла. Выйдите и войдите снова, затем загрузите фото.');
    }
    throw new Error(data.error || 'Не удалось загрузить фото');
  }

  if (!data.url) {
    throw new Error('Сервер не вернул ссылку на фото');
  }

  return data.url;
}
