// Đảo Câu Văn — máy chủ (Vercel function), gọi bằng /api/app?a=<việc cần làm>.
// Tài khoản DÙNG CHUNG với app tiếng Anh: chỉ ĐỌC bảng kv (students, teachers, parents) — không bao giờ ghi vào đó.
// Dữ liệu của game nằm riêng trong bảng dcv_progress.
// Biến môi trường: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (bắt buộc); ADMIN_LOGIN (mặc định "admin"), ADMIN_PASSWORD
// (chép đúng giá trị từ app tiếng Anh). Cookie đăng nhập được kí bằng khóa suy ra từ SUPABASE_SERVICE_ROLE_KEY.
const crypto = require('crypto');

const BASE = (() => { try { return new URL(String(process.env.SUPABASE_URL || '').trim()).origin; } catch (e) { return ''; } })();
const KEY = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const AUTH = KEY.startsWith('eyJ') ? { Authorization: `Bearer ${KEY}` } : {};
const ADMIN_LOGIN = String(process.env.ADMIN_LOGIN || 'admin').trim().toLowerCase();
const ADMIN_PASSWORD = String(process.env.ADMIN_PASSWORD || '');
const LOCAL = process.env.DCV_LOCAL === '1';
const T = 'dcv_progress';
const DAY = 86400000;
const GAME_IDS = ['cay-cau','tau-chu','tham-tu','ghep-cau','cau-noi','sua-cau','so-sanh','nhan-hoa','cam-thu','noi-doi','kinh-lup','tu-lay','thanh-ngu','xep-doan','thi-thu','dau-cau','phan-loai','nhieu-nghia','cap-tu','chinh-ta','doc-hieu'];

class Bad extends Error { constructor(msg, status = 400) { super(msg); this.status = status; } }
const bad = (m, s) => { throw new Bad(m, s); };
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ---------- Supabase REST
async function sb(path, opt = {}) {
  const r = await fetch(`${BASE}/rest/v1/${path}`, { ...opt, headers: { apikey: KEY, ...AUTH, 'Content-Type': 'application/json', ...(opt.headers || {}) } });
  const t = await r.text();
  if (!r.ok) { const e = new Error(`supabase ${r.status}: ${t}`); e.sb = r.status; throw e; }
  return t ? JSON.parse(t) : null;
}
const enc = encodeURIComponent;
async function kvGet(col, id) { const r = await sb(`kv?collection=eq.${enc(col)}&id=eq.${enc(id)}&select=data`); return r && r[0] ? r[0].data : null; }
async function kvList(col) { return ((await sb(`kv?collection=eq.${enc(col)}&select=data&order=id`)) || []).map(r => r.data); }
async function prog(code) { const r = await sb(`${T}?code=eq.${enc(code)}&select=code,best,essays,xu,updated_at`); return r && r[0] ? r[0] : { code, best: {}, essays: [], xu: {}, updated_at: null }; }
async function progAll() { return (await sb(`${T}?select=code,best,essays,xu,updated_at`)) || []; }
async function progPut(p) {
  await sb(T, { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ code: p.code, best: p.best || {}, essays: p.essays || [], xu: p.xu || {}, updated_at: new Date().toISOString() }) });
}

// ---------- đăng nhập (giống app tiếng Anh: scrypt, cookie kí HMAC)
const hashPw = (pw, salt) => crypto.scryptSync(pw, salt, 32).toString('hex');
const safeEq = (a, b) => { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && crypto.timingSafeEqual(x, y); };
const secret = () => crypto.createHmac('sha256', KEY).update('dcv-session-v1').digest();
const sign = body => crypto.createHmac('sha256', secret()).update(body).digest('base64url');
function cookieFor(sess) {
  const body = Buffer.from(JSON.stringify({ ...sess, exp: Date.now() + 30 * DAY })).toString('base64url');
  return `dcv=${body}.${sign(body)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 86400}${LOCAL ? '' : '; Secure'}`;
}
const clearCookie = () => `dcv=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${LOCAL ? '' : '; Secure'}`;
function session(req) {
  const m = /(?:^|;\s*)dcv=([^;]+)/.exec(req.headers.cookie || ''); if (!m) return null;
  const [body, mac] = m[1].split('.'); if (!body || !mac) return null;
  if (!safeEq(mac, sign(body))) return null;
  try { const s = JSON.parse(Buffer.from(body, 'base64url').toString()); return s.exp > Date.now() ? s : null; } catch (e) { return null; }
}
// Ai đang dùng: kiểm tra lại tài khoản mỗi lần (bị khóa bên app tiếng Anh là mất quyền ngay)
async function who(req) {
  const s = session(req); if (!s) return null;
  if (s.r === 's') { const st = await kvGet('students', s.id); return st && st.active ? { role: 'student', code: st.code, name: st.name } : null; }
  if (s.r === 't') { const t = await kvGet('teachers', s.id); return t && t.active ? { role: 'teacher', login: t.login, name: t.name } : null; }
  if (s.r === 'p') { const p = await kvGet('parents', s.id); return p && p.active ? { role: 'parent', login: p.login, name: p.name, kids: p.kids || [] } : null; }
  if (s.r === 'a' && s.id === ADMIN_LOGIN && ADMIN_PASSWORD) return { role: 'admin', login: s.id, name: 'Admin' };
  return null;
}
const need = (me, roles) => { if (!me) bad('Hãy đăng nhập lại.', 401); if (!roles.includes(me.role)) bad('Tài khoản này không có quyền làm việc đó.', 403); return me; };

// ---------- dữ liệu gửi về trình duyệt
const essaysOut = es => (Array.isArray(es) ? es : []).map(e => ({ at: e.at, de: e.de, text: e.text, stars: e.stars, comment: e.comment || '', commentBy: e.commentBy || '', commentAt: e.commentAt || null }));
// ---------- xu và quà
const DEFAULT_GIFTS = [
  { m: 1000, name: "1 bộ sticker" }, { m: 2000, name: "30 phút chơi game" },
  { m: 5000, name: "1 cặp vé xem phim" }, { m: 10000, name: "1 bộ lego" }];
const giftsOf = x => (Array.isArray(x && x.gifts) && x.gifts.length ? x.gifts : DEFAULT_GIFTS);
const vnDay = (ms = Date.now()) => new Date(ms + 7 * 3600000).toISOString().slice(0, 10);
function dayStreak(days, today) { const set = new Set(days); let n = 0, d = Date.parse(today + "T00:00:00Z"); while (set.has(new Date(d).toISOString().slice(0, 10))) { n++; d -= DAY; } return n; }
function bestRun(days) { const s = [...new Set(days || [])].sort(); let best = 0, run = 0, prev = 0; for (const d of s) { const ms = Date.parse(d + "T00:00:00Z"); run = prev && ms - prev === DAY ? run + 1 : 1; prev = ms; best = Math.max(best, run); } return best; }
const xuOut = x => { x = x || {}; return { total: x.total || 0, peak: x.peak || 0, gifts: giftsOf(x), req: (x.req || []).slice(-50), streak: dayStreak(x.days || [], vnDay()),
  stats: { solved: x.solved || {}, maxStreak: x.maxStreak || 0, perfect: x.perfect || 0, bestDays: bestRun(x.days) }, paid: x.paid || [] }; };
// Thưởng xu khi mở khóa huy hiệu (mỗi huy hiệu một lần). Danh sách huy hiệu do trình duyệt tính; máy chủ giữ mức thưởng.
const BADGE_FIXED = { streak10: 100, streak20: 200, streak30: 300, perfect5: 200, days7: 150, days30: 300, write5: 100, praised: 150, write3s: 200, king: 1000 };
function badgeReward(id) {
  let m = /^([a-z-]+)-(dong|bac|vang)$/.exec(id);
  if (m && GAME_IDS.includes(m[1]) && m[1] !== "thi-thu") return { dong: 50, bac: 100, vang: 200 }[m[2]];
  m = /^isl([0-4])-([12])$/.exec(id); if (m) return m[2] === "1" ? 150 : 300;
  return BADGE_FIXED[id] || 0;
}
// Số câu (số dòng) của từng ngân hàng: phải khớp với data/*.js (cam-thu = 50 ở tu-tu.js + 20 ở dau-cau.js).
const BANK_ROWS = { "cay-cau": 50, "tau-chu": 50, "tham-tu": 50, "dau-cau": 51, "ghep-cau": 50, "cau-noi": 50, "sua-cau": 52, "so-sanh": 50, "nhan-hoa": 50, "cam-thu": 70,
  "noi-doi": 13, "kinh-lup": 50, "tu-lay": 53, "thanh-ngu": 51, "phan-loai": 50, "nhieu-nghia": 52, "cap-tu": 57, "chinh-ta": 55, "xep-doan": 50, "doc-hieu": 50 };
const ISL_GAMES = [["cay-cau", "tau-chu", "tham-tu", "dau-cau"], ["ghep-cau", "cau-noi", "sua-cau"], ["so-sanh", "nhan-hoa", "cam-thu"],
  ["noi-doi", "kinh-lup", "tu-lay", "thanh-ngu", "phan-loai", "nhieu-nghia", "cap-tu", "chinh-ta"], ["xep-doan", "doc-hieu"]];
// Máy chủ tự kiểm tra điều kiện của huy hiệu trước khi thưởng xu
function earned(id, p) {
  const x = p.xu || {}, sv = x.solved || {}, E = Array.isArray(p.essays) ? p.essays : [];
  const tierOk = (g, tier) => BANK_ROWS[g] > 0 && (sv[g] || []).length >= Math.ceil(BANK_ROWS[g] * { dong: 0.4, bac: 0.7, vang: 1 }[tier]);
  let m = /^([a-z-]+)-(dong|bac|vang)$/.exec(id); if (m) return tierOk(m[1], m[2]);
  m = /^isl([0-4])-([12])$/.exec(id); if (m) return ISL_GAMES[+m[1]].every(g => tierOk(g, m[2] === "1" ? "dong" : "vang"));
  switch (id) {
    case "streak10": return (x.maxStreak || 0) >= 10; case "streak20": return (x.maxStreak || 0) >= 20; case "streak30": return (x.maxStreak || 0) >= 30;
    case "perfect5": return (x.perfect || 0) >= 5; case "days7": return bestRun(x.days) >= 7; case "days30": return bestRun(x.days) >= 30;
    case "write5": return E.length >= 5; case "praised": return E.filter(e => e.comment).length >= 3; case "write3s": return E.filter(e => e.stars === 3).length >= 5;
    case "king": return [0, 1, 2, 3, 4].every(k => earned("isl" + k + "-2", p));
  }
  return false;
}
const canKid = (me, code) => me.role === "teacher" || me.role === "admin" || (me.role === "parent" && (me.kids || []).includes(code));
function report(st, p, withLink) {
  const o = { code: st.code, name: st.name || st.code, active: !!st.active, best: (p && p.best) || {}, essays: essaysOut(p && p.essays), xu: xuOut(p && p.xu), updated: (p && p.updated_at) || null };
  if (withLink) o.plink = st.ptoken && !st.poff ? st.ptoken : null;
  return o;
}

// ---------- xử lý
async function handle(req, res) {
  const a = String((req.query && req.query.a) || '');
  const body = req.method === 'POST' ? (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {})) : {};
  const out = (data, cookie) => { if (cookie) res.setHeader('Set-Cookie', cookie); return res.status(200).json(data); };

  if (a === 'me') { const me = await who(req); return out(me || { role: null }); }
  if (a === 'logout') return out({ ok: true }, clearCookie());

  if (a === 'login.student') {
    const code = String(body.code || '').trim().toUpperCase();
    const st = /^[A-Z0-9]{2,20}$/.test(code) ? await kvGet('students', code) : null;
    if (!st) { await sleep(400); bad('Mã này chưa có. Em hỏi thầy cô mã của mình nhé.', 401); }
    if (!st.active) bad('Mã này đang bị khóa. Em hỏi thầy cô nhé.', 401);
    return out({ role: 'student', code: st.code, name: st.name }, cookieFor({ r: 's', id: st.code }));
  }
  if (a === 'login.staff') {
    const login = String(body.login || '').trim().toLowerCase(), pw = String(body.password || '');
    if (login && login === ADMIN_LOGIN) {
      if (ADMIN_PASSWORD && safeEq(hashPw(pw, 'a'), hashPw(ADMIN_PASSWORD, 'a'))) return out({ role: 'admin', name: 'Admin' }, cookieFor({ r: 'a', id: login }));
    } else if (login) {
      const t = await kvGet('teachers', login);
      if (t && t.active && safeEq(hashPw(pw, t.salt), t.hash)) return out({ role: 'teacher', name: t.name }, cookieFor({ r: 't', id: t.login }));
      const p = !t && await kvGet('parents', login);
      if (p && p.active && safeEq(hashPw(pw, p.salt), p.hash)) return out({ role: 'parent', name: p.name }, cookieFor({ r: 'p', id: p.login }));
    }
    await sleep(600); bad('Sai tên đăng nhập hoặc mật khẩu.', 401);
  }

  // Link riêng của phụ huynh (cùng link bí mật với app tiếng Anh): chỉ xem, không cần đăng nhập
  if (a === 'plink') {
    const token = String((req.query && req.query.p) || '');
    const st = token.length >= 8 && (await kvList('students')).find(x => x.ptoken && safeEq(x.ptoken, token));
    if (!st || st.poff || !st.active) { await sleep(400); bad('Link này không còn dùng được. Hãy xin thầy cô link mới.', 404); }
    return out({ student: report(st, await prog(st.code), false) });
  }

  // Học sinh: tiến độ của chính mình, lưu sao và bài thi thử
  if (a === 'progress') {
    const me = need(await who(req), ['student']);
    return out(report({ code: me.code, name: me.name, active: true }, await prog(me.code), false));
  }
  if (a === 'save') {
    const me = need(await who(req), ['student']);
    const game = String(body.game || ''), stars = Math.max(0, Math.min(3, parseInt(body.stars, 10) || 0));
    if (!GAME_IDS.includes(game)) bad('Trò chơi không đúng.');
    const p = await prog(me.code);
    const prevStars = (p.best || {})[game] || 0;
    p.best = { ...(p.best || {}) }; if (!(p.best[game] >= stars)) p.best[game] = stars;
    // xu: phần cộng/trừ trong lượt chơi do trình duyệt gửi lên (giới hạn hợp lí), thưởng thêm do máy chủ tính
    const x = { ...(p.xu || {}) }, bonus = [];
    const delta = Math.max(-500, Math.min(900, parseInt(body.xu, 10) || 0));
    if (stars === 3 && prevStars < 3) bonus.push(["Lần đầu đạt 3 sao ở trò này", 50]);
    const today = vnDay(); x.days = Array.isArray(x.days) ? x.days : [];
    if (!x.days.includes(today)) {
      bonus.push(["Chơi hôm nay", 15]); x.days = [...x.days, today].slice(-60);
      const s = dayStreak(x.days, today); if (s > 0 && s % 7 === 0) bonus.push([`Chơi đều ${s} ngày liên tiếp`, 100]);
    }
    x.total = Math.max(0, (x.total || 0) + delta + bonus.reduce((a, b) => a + b[1], 0)); x.peak = Math.max(x.peak || 0, x.total);
    // thống kê cho huy hiệu: các câu (số thứ tự trong ngân hàng) đã trả lời đúng ngay lần đầu, chuỗi dài nhất, số lượt hoàn hảo
    const sv = (Array.isArray(body.solved) ? body.solved : []).map(n => parseInt(n, 10)).filter(n => n >= 0 && n < (BANK_ROWS[game] || 0)).slice(0, 50);
    if (sv.length && game !== "thi-thu") { x.solved = { ...(x.solved || {}) }; x.solved[game] = [...new Set([...(x.solved[game] || []), ...sv])].sort((a, b) => a - b); }
    x.maxStreak = Math.max(x.maxStreak || 0, Math.min(200, parseInt(body.maxStreak, 10) || 0));
    if (body.perfect === true && game !== "thi-thu") x.perfect = (x.perfect || 0) + 1;
    p.xu = x; p.bonus = bonus;
    p.essays = Array.isArray(p.essays) ? p.essays : [];
    if (game === 'thi-thu' && body.essay && body.essay.text) {
      p.essays = [{ at: new Date().toISOString(), de: String(body.essay.de || '').slice(0, 300), text: String(body.essay.text).slice(0, 5000), stars }, ...p.essays].slice(0, 50);
    }
    await progPut(p);
    return out({ ...report({ code: me.code, name: me.name, active: true }, p, false), bonus: p.bonus });
  }
  if (a === "badge.claim") {
    const me = need(await who(req), ["student"]);
    const p = await prog(me.code), x = { ...(p.xu || {}) }; x.paid = Array.isArray(x.paid) ? x.paid : [];
    const ids = [...new Set((Array.isArray(body.ids) ? body.ids : []).map(String))].filter(id => badgeReward(id) > 0 && !x.paid.includes(id) && earned(id, p)).slice(0, 80);
    const got = ids.map(id => [id, badgeReward(id)]);
    if (got.length) { x.paid = [...x.paid, ...ids]; x.total = (x.total || 0) + got.reduce((s, g) => s + g[1], 0); x.peak = Math.max(x.peak || 0, x.total); p.xu = x; await progPut(p); }
    return out({ xu: xuOut(x), got });
  }
  if (a === "gift.request") {
    const me = need(await who(req), ["student"]);
    const p = await prog(me.code), x = { ...(p.xu || {}) }, m = parseInt(body.m, 10);
    const g = giftsOf(x).find(z => z.m === m); if (!g) bad("Không có món quà này.", 404);
    x.req = Array.isArray(x.req) ? x.req : [];
    if (x.req.some(r => r.m === m && r.status === "pending")) bad("Em đã xin đổi món quà này rồi, hãy chờ người lớn duyệt.");
    if ((x.total || 0) < m) bad("Em chưa đủ xu để đổi món quà này.");
    x.total = (x.total || 0) - m;   // trừ xu ngay; nếu người lớn không đồng ý thì hoàn lại
    x.req.push({ id: Date.now().toString(36), m, name: g.name, at: new Date().toISOString(), status: "pending" });
    p.xu = x; await progPut(p); return out({ xu: xuOut(x) });
  }
  if (a === "gift.decide") {
    const me = need(await who(req), ["teacher", "admin", "parent"]);
    const code = String(body.code || "").toUpperCase(); if (!canKid(me, code)) bad("Tài khoản này không xem được học sinh này.", 403);
    const p = await prog(code), x = { ...(p.xu || {}) }, r = (x.req || []).find(z => z.id === String(body.id || ""));
    if (!r) bad("Không tìm thấy yêu cầu đổi quà.", 404); if (r.status !== "pending") bad("Yêu cầu này đã được xử lí.");
    r.status = body.ok ? "given" : "refused"; r.by = me.name; r.doneAt = new Date().toISOString();
    if (!body.ok) x.total = (x.total || 0) + r.m;   // hoàn lại xu
    p.xu = x; await progPut(p); return out({ xu: xuOut(x) });
  }
  if (a === "gift.set") {
    const me = need(await who(req), ["teacher", "admin", "parent"]);
    const code = String(body.code || "").toUpperCase(); if (!canKid(me, code)) bad("Tài khoản này không xem được học sinh này.", 403);
    const list = (Array.isArray(body.gifts) ? body.gifts : []).map(g => ({ m: parseInt(g.m, 10), name: String(g.name || "").trim().slice(0, 80) }))
      .filter(g => g.name && g.m >= 10 && g.m <= 100000).sort((a, b) => a.m - b.m).slice(0, 10);
    if (new Set(list.map(g => g.m)).size !== list.length) bad("Mỗi mốc xu chỉ đặt một món quà.");
    const p = await prog(code), x = { ...(p.xu || {}) }; x.gifts = list.length ? list : undefined;
    p.xu = x; await progPut(p); return out({ xu: xuOut(x) });
  }

  // Thầy cô, Admin, phụ huynh (tài khoản): bảng theo dõi
  if (a === 'dash') {
    const me = need(await who(req), ['teacher', 'admin', 'parent']);
    let students = (await kvList('students')).filter(s => s && s.code);
    if (me.role === 'parent') { const kids = new Set(me.kids); students = students.filter(s => kids.has(s.code) && s.active); }
    const rows = new Map((await progAll()).map(r => [r.code, r]));
    const list = students.sort((x, y) => (x.created || 0) - (y.created || 0)).map(s => report(s, rows.get(s.code), me.role === 'admin'));
    return out({ me, students: list });
  }
  if (a === 'comment') {
    const me = need(await who(req), ['teacher', 'admin']);
    const code = String(body.code || '').toUpperCase(), at = String(body.at || ''), text = String(body.text || '').trim().slice(0, 1000);
    const p = await prog(code); const e = (p.essays || []).find(x => x.at === at); if (!e) bad('Không tìm thấy bài viết.', 404);
    e.comment = text; e.commentBy = me.name; e.commentAt = new Date().toISOString();
    await progPut(p); return out({ essays: essaysOut(p.essays) });
  }
  if (a === 'essay.remove') {
    need(await who(req), ['admin']);
    const code = String(body.code || '').toUpperCase(), at = String(body.at || '');
    const p = await prog(code); p.essays = (p.essays || []).filter(x => x.at !== at);
    await progPut(p); return out({ essays: essaysOut(p.essays) });
  }
  if (a === 'reset') {
    need(await who(req), ['admin']);
    const code = String(body.code || '').toUpperCase(); if (!code) bad('Thiếu mã học sinh.');
    await sb(`${T}?code=eq.${enc(code)}`, { method: 'DELETE', headers: { Prefer: 'return=minimal' } });
    return out({ ok: true });
  }
  bad('Không có việc này.', 404);
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  try {
    if (!BASE || !KEY) return res.status(503).json({ error: 'Máy chủ chưa được cài Supabase.' });
    await handle(req, res);
  } catch (e) {
    if (e instanceof Bad) return res.status(e.status).json({ error: e.message });
    console.error(e);
    return res.status(500).json({ error: 'Máy chủ gặp lỗi, thử lại sau.', supabase: e.sb || null });
  }
};
