const PROXY_KEY = process.env.PROXY_KEY || '';

module.exports = async (req, res) => {
  if (PROXY_KEY && req.headers['x-letto-tg-proxy-key'] !== PROXY_KEY) {
    res.status(403).send('Forbidden');
    return;
  }

  const segments = req.query.path;
  const pathname = '/' + (Array.isArray(segments) ? segments.join('/') : segments || '');
  const query = req.url?.includes('?') ? '?' + req.url.split('?')[1] : '';
  const target = `https://api.telegram.org${pathname}${query}`;

  const init = {
    method: req.method,
    headers: { 'Content-Type': 'application/json' },
  };

  if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
    init.body = JSON.stringify(req.body);
  }

  try {
    const response = await fetch(target, init);
    const text = await response.text();
    res.status(response.status);
    res.setHeader('Content-Type', 'application/json');
    res.send(text);
  } catch (error) {
    res.status(502).json({
      ok: false,
      description: error instanceof Error ? error.message : 'Proxy error',
    });
  }
};
