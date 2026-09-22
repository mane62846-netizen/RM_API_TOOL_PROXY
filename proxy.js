export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { type, uid, region = 'ind' } = req.query;
  if (!uid || !/^\d{5,15}$/.test(String(uid))) {
    return res.status(400).json({ error: 'Valid UID is required' });
  }

  let target;
  if (type === 'like') {
    const url = new URL('https://two0likeapifreebyzexxyh4x.onrender.com/like');
    url.searchParams.set('key', process.env.LIKE_API_KEY || '20LikeFreeApiByzexxyh4x');
    url.searchParams.set('uid', uid);
    url.searchParams.set('region', region);
    target = url;
  } else if (type === 'info') {
    target = new URL('https://info.bhuwanhex.bond/info');
    target.searchParams.set('uid', uid);
  } else if (type === 'ban') {
    target = new URL('https://ban.bhuwanhex.bond/check');
    target.searchParams.set('uid', uid);
  } else {
    return res.status(400).json({ error: 'Unknown API type' });
  }

  try {
    const upstream = await fetch(target, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(25000)
    });
    const text = await upstream.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { response: text }; }
    return res.status(upstream.status).json(data);
  } catch (error) {
    return res.status(502).json({ error: 'Upstream API request failed', message: error.message });
  }
}
