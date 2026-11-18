// Vercel serverless function: lưu và đọc số sao, bài thi thử theo mã học sinh.
// Cần 2 biến môi trường trên Vercel: SUPABASE_URL và SUPABASE_SERVICE_ROLE_KEY (khóa bí mật, chỉ nằm trên máy chủ).
const BASE = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TABLE = 'dcv_progress';
const GAME_IDS = ['cay-cau','tau-chu','tham-tu','ghep-cau','cau-noi','sua-cau','so-sanh','nhan-hoa','cam-thu','noi-doi','kinh-lup','tu-lay','thanh-ngu','xep-doan','thi-thu'];
const okCode = c => /^[A-Z0-9]{3,20}$/.test(c);

async function sb(path, opt = {}) {
  const r = await fetch(`${BASE}/rest/v1/${path}`, {
    ...opt,
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', ...(opt.headers || {}) }
  });
  const t = await r.text();
  if (!r.ok) throw new Error(`supabase ${r.status}: ${t}`);
  return t ? JSON.parse(t) : null;
}
async function load(code) {
  const rows = await sb(`${TABLE}?code=eq.${code}&select=best,essays`);
  return rows && rows[0] ? rows[0] : { best: {}, essays: [] };
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (!BASE || !KEY) return res.status(503).json({ error: 'not configured' });
    if (req.method === 'GET') {
      const code = String(req.query.code || '').toUpperCase();
      if (!okCode(code)) return res.status(400).json({ error: 'code' });
      return res.status(200).json(await load(code));
    }
    if (req.method === 'POST') {
      const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const code = String(b.code || '').toUpperCase();
      const game = String(b.game || '');
      const stars = Math.max(0, Math.min(3, parseInt(b.stars, 10) || 0));
      if (!okCode(code) || !GAME_IDS.includes(game)) return res.status(400).json({ error: 'input' });
      const cur = await load(code);
      const best = { ...(cur.best || {}) };
      if (!(best[game] >= stars)) best[game] = stars;
      let essays = Array.isArray(cur.essays) ? cur.essays : [];
      if (game === 'thi-thu' && b.essay && b.essay.text) {
        essays = [{ de: String(b.essay.de || '').slice(0, 300), text: String(b.essay.text).slice(0, 5000), stars, at: new Date().toISOString() }, ...essays].slice(0, 30);
      }
      await sb(TABLE, {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify({ code, best, essays, updated_at: new Date().toISOString() })
      });
      return res.status(200).json({ best, essays });
    }
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'method' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'server' });
  }
};
