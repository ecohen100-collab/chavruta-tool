(function(){
if(location.hostname!=='amiway.s-admin.co.il'){
if(confirm('הכלי עובד בתוך אתר דרך עמ"י. לעבור לאתר עכשיו?\nאחרי ההתחברות לוחצים שוב על הסימניה.'))location.href='https://amiway.s-admin.co.il/centers/9/leads';return;}
var CH = (function () {
'use strict';
const DAY = 864e5, WD = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];
const NEW = 'ליד חדש', PART = 'ליד חלקי', IV = 'שלב ראיון', ACC = 'התקבל ויירשם', LATER = 'לחזור בהמשך', NOANS = 'אין מענה';
const NR_NAMES = ['הפסד', 'פסילה'];
const TPL = {
reg: ['השלמת רישום', 'הי {first},\nמה נשמע? זה {me} מדרך עמי בטכניון 🙂\n\nראיתי שעדיין לא השלמת רישום..\nאם צריך עזרה או משהו אני פה לכל עזרה ושאלה\nhttps://students.amiway.s-admin.co.il/'],
new: ['היכרות לליד חדש', 'הי {first},\nמה נשמע? זה {me} מדרך עמי בטכניון 🙂\n\nראיתי שהתעניינת בתוכנית החברותא. אשמח לספר לך עליה ולקבוע שיחה קצרה.\nמתי נוח לך?'],
iv: ['קביעת ראיון', 'הי {first},\nזה {me} מדרך עמי בטכניון 🙂\n\nרציתי לקבוע איתך ראיון היכרות קצר לתוכנית.\nאיזה יום ושעה נוחים לך בימים הקרובים?'],
noans: ['אין מענה בטלפון', 'הי {first},\nזה {me} מדרך עמי בטכניון 🙂\nניסיתי להשיג אותך בטלפון לגבי תוכנית החברותא.\nמתי נוח שנדבר?'],
later: ['חזרה כפי שסוכם', 'הי {first},\nזה {me} מדרך עמי בטכניון 🙂\nרציתי לחזור אליך כמו שדיברנו לגבי תוכנית החברותא. זה עדיין רלוונטי?'],
free: ['הודעה חופשית', 'הי {first},\n']
};
const SENT = 'נשלחה הודעה';
const OUTCOMES = ['אין מענה', 'דיברנו, ממתין/ה לתשובה', 'נקבע ראיון', SENT, 'לא רלוונטי', 'אחר'];
const BLOCK = /תקלה|בעיה טכנית|בעיות טכניות|תמיכה|אישור מדרך|שנה שלישית|אישור חריג|חריגה/;
const WARN = /מילואים|חו"ל|חו״ל|להתלבט|מתלבט|לחשוב על זה/;
const REMIND = /תזכורת|שלחתי|שלחה|נשלחה/;
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const unq = s => String(s == null ? '' : s).replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/\s+$/, '').replace(/^\s+/, '');
const pad = n => String(n).padStart(2, '0');
const day0 = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const LS = {
get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
};
function date(s) {
if (s == null || s === '') return null;
if (s instanceof Date) return isNaN(s) ? null : s;
s = String(s).trim();
if (!s || s.startsWith('0000')) return null;
let m = s.match(/^(\d{4})-(\d\d)-(\d\d)(?:[ T](\d\d):(\d\d))?/);
if (m) return new Date(+m[1], m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0));
m = s.match(/^(\d{1,2})[\/.](\d{1,2})[\/.](\d{2,4})(?:\s+(\d\d?):(\d\d))?/);
if (m) return new Date(m[3].length === 2 ? 2000 + +m[3] : +m[3], m[2] - 1, +m[1], +(m[4] || 0), +(m[5] || 0));
if (/^\d+(\.\d+)?$/.test(s)) { // מספר סידורי של אקסל
const n = +s;
if (n > 20000 && n < 80000) { const u = new Date(Math.round((n - 25569) * DAY)); return new Date(u.getTime() + u.getTimezoneOffset() * 6e4); }
}
return null;
}
function withTime(d, t) {
if (!d || !t) return d;
const m = String(t).match(/(\d\d?):(\d\d)/);
if (!m || d.getHours() || d.getMinutes()) return d;
return new Date(d.getFullYear(), d.getMonth(), d.getDate(), +m[1], +m[2]);
}
const dm = d => d ? pad(d.getDate()) + '.' + pad(d.getMonth() + 1) : '';
const hm = d => d && (d.getHours() || d.getMinutes()) ? pad(d.getHours()) + ':' + pad(d.getMinutes()) : '';
const ago = d => d ? Math.round((day0(new Date()) - day0(d)) / DAY) : null;
const agoTxt = d => { const n = ago(d); return n == null ? '' : n <= 0 ? 'היום' : n === 1 ? 'אתמול' : 'לפני ' + n + ' ימים'; };
function phone(p) {
let s = String(p == null ? '' : p).replace(/\D/g, '');
if (s.startsWith('00972')) s = s.slice(2);
if (s.startsWith('972')) s = s.slice(3);
if (s && !s.startsWith('0')) s = '0' + s;
return s;
}
const NOISE = new Set(['פרונטלי', 'פרונטאלי', 'פרונטלית', 'זום', 'בזום', 'או', 'ראיון', 'טלפוני', 'טלפונית', 'עדיפות', 'נמוכה', 'גבוהה']);
const cleanTag = t => unq(t).split(/[\s\-–,/()]+/).filter(w => w && !NOISE.has(w)).join(' ');
const bare = n => String(n || '').replace(/^הרב\s+/, '');
function tagNormalizer(rawTags) {
const cl = [...new Set(rawTags.map(cleanTag).filter(Boolean))];
const multi = cl.filter(t => bare(t).includes(' '));
const map = Object.create(null);
cl.forEach(t => {
let target = t;
if (!bare(t).includes(' ')) { const c = multi.filter(m => bare(m).startsWith(bare(t) + ' ')); if (c.length === 1) target = c[0]; }
const rav = cl.find(m => m !== target && m === 'הרב ' + bare(target));
if (rav) target = rav;
map[t] = target;
});
return raw => { const c = cleanTag(raw); return map[c] || c; };
}
const samePerson = (a, b) => { a = bare(cleanTag(a)); b = bare(cleanTag(b)); return !!a && !!b && (a === b || a.startsWith(b + ' ') || b.startsWith(a + ' ')); };
const firstOf = n => String(n || '').replace(/^(הרב|ד"ר|דר׳?)\s+/, '').split(' ')[0];
const nkey = s => unq(s).replace(/["'״׳()\-]/g, '').replace(/\s+/g, ' ').trim();
const djb2 = s => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); };
const pick = (o, ...ks) => { for (const k of ks) if (o && o[k] != null && o[k] !== '') return o[k]; return null; };
async function fromApi() {
const A = 'https://api.amiway.s-admin.co.il', o = { credentials: 'include' };
const wait = ms => new Promise(r => setTimeout(r, ms));
const get = async p => {
let last;
for (let i = 0; i < 5; i++) {
try {
const r = await fetch(A + p, o);
if (r.status === 401 || r.status === 403) throw Object.assign(new Error('login'), { final: true });
if (r.ok) return await r.json();
last = new Error('http ' + r.status);
} catch (e) { if (e.final) throw e; last = e; }
if (i < 4) await wait(500 * (i + 1));
}
throw last;
};
let L, I, G, IN, U, LA, partial = false;
try {
L = await get('/leads/all?centerId=9').catch(() => { partial = true; return get('/leads/relevant?centerId=9'); });
I = await get('/interviews?centerId=9&all=1');
G = await get('/global-data?statuses&sub_statuses');
IN = await get('/global-data?institutes');
U = await get('/global-data?users').catch(() => ({}));
LA = Array.isArray(L) ? L : L && Array.isArray(L.leads) ? L.leads : null;
if (!LA || !Array.isArray(I) || !G || !IN) throw new Error('התשובה מהאתר בצורה לא צפויה');
} catch (e) { const err = new Error('login'); err.cause = e; throw err; }
const warn = partial ? ['נטענה רשימה חלקית (בלי מי שיצא מהרשימה). "מה השתנה" לא יתעדכן הפעם.'] : [];
const norm = tagNormalizer((I || []).map(x => x.publicTag || ''));
const SO = {}; (G.statuses || []).forEach(s => SO[String(s.id)] = s);
const SUB = {}; (G.sub_statuses || []).forEach(s => SUB[String(s.id)] = s.title);
const IM = {}; (IN.institutes || []).forEach(i => IM[String(i.id)] = i.title);
const UM = {}; ((U && U.users) || []).forEach(u => UM[u.id] = unq((u.firstName || '') + ' ' + (u.lastName || '')).replace(/\s+/g, ' ')); // רק שמות
const ivOf = {}, slots = [];
(I || []).filter(x => !x.isDeleted).forEach(x => {
const at = withTime(date(x.date), x.startTime);
const who = norm(x.publicTag) || UM[x.interviewerId] || '';
const ls = x.leads || [];
slots.push({ at, who, whoId: x.interviewerId || null, names: ls.map(l => unq(l.name)), keys: ls.map(l => String(l.id)) });
ls.forEach(l => { const p = ivOf[l.id]; if (!p || (at && (!p.at || at > p.at))) ivOf[l.id] = { at, who, whoId: x.interviewerId || null }; });
});
const leads = LA.filter(l => !l.isDeleted).map(l => {
const iv = ivOf[l.id] || {};
const so = SO[String(l.status)] || {};
const signed = date(l.signedDate);
const own = withTime(date(l.interviewDate), l.interviewTime);
return {
key: String(l.id), name: unq((l.firstName || '') + ' ' + (l.lastName || '')).replace(/\s+/g, ' '), first: unq(l.firstName), last: unq(l.lastName),
phone: phone(l.phone), inst: unq(IM[String(l.institute)] || ''),
status: unq(so.title || String(l.status)), nr: !!so.notRelevant, sub: unq(SUB[String(l.subStatus)] || ''),
reg: signed ? 'רשום' : (date(l.lastLoginTime) ? 'התחבר, לא חתם' : 'טרם התחבר'),
created: date(l.createTime), ivAt: own || iv.at || null, ivDone: date(l.attendedDate) ? 'התקיים' : '',
ivWho: iv.who || '', ivWhoId: iv.whoId || null, handler: UM[l.handlerId] || '', handlerId: l.handlerId || null,
accepted: date(l.acceptedDate), signed, registered: !!signed, remark: unq(l.remark), year: l.year
};
});
return { source: 'האתר', at: new Date(), year: leads[0] && leads[0].year, leads, slots, warn, partial, users: UM };
}
async function unzip(buf) {
const dv = new DataView(buf);
let e = buf.byteLength - 22;
while (e >= 0 && dv.getUint32(e, true) !== 0x06054b50) e--;
if (e < 0) throw new Error('זה לא קובץ אקסל (xlsx)');
const n = dv.getUint16(e + 10, true), files = {};
let p = dv.getUint32(e + 16, true);
for (let i = 0; i < n; i++) {
const nl = dv.getUint16(p + 28, true), xl = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true);
files[new TextDecoder().decode(new Uint8Array(buf, p + 46, nl))] =
{ method: dv.getUint16(p + 10, true), size: dv.getUint32(p + 20, true), off: dv.getUint32(p + 42, true) };
p += 46 + nl + xl + cl;
}
const read = async name => {
const f = files[name]; if (!f) return null;
const start = f.off + 30 + dv.getUint16(f.off + 26, true) + dv.getUint16(f.off + 28, true);
const data = new Uint8Array(buf, start, f.size);
if (f.method === 0) return new TextDecoder().decode(data);
if (typeof DecompressionStream === 'undefined') throw new Error('הדפדפן הזה לא יודע לפתוח את הקובץ. לנסות במחשב או בכרום מעודכן.');
return new Response(new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).text();
};
return { names: Object.keys(files), read };
}
const colIdx = ref => { let n = 0; for (const c of ref.replace(/\d+/g, '')) n = n * 26 + c.charCodeAt(0) - 64; return n - 1; };
async function readXlsx(buf) {
const z = await unzip(buf), P = new DOMParser();
const xml = s => { const doc = P.parseFromString(s == null ? '' : s, 'application/xml'); if (doc.getElementsByTagName('parsererror').length) throw new Error('הקובץ פגום'); return doc; };
const txt = el => Array.from(el.getElementsByTagName('t')).map(t => t.textContent).join('');
const ssx = await z.read('xl/sharedStrings.xml');
const ss = ssx ? Array.from(xml(ssx).getElementsByTagName('si')).map(txt) : [];
const sheet = z.names.filter(n => /^xl\/worksheets\/sheet\d+\.xml$/.test(n)).sort()[0];
if (!sheet) throw new Error('הקובץ פגום');
const doc = xml(await z.read(sheet));
const rows = Array.from(doc.getElementsByTagName('row')).map(r => {
const a = [];
Array.from(r.getElementsByTagName('c')).forEach(c => {
const t = c.getAttribute('t'), v = c.getElementsByTagName('v')[0];
a[colIdx(c.getAttribute('r'))] = t === 's' ? (v ? ss[+v.textContent] : '') : t === 'inlineStr' ? txt(c) : (v ? v.textContent.trim() : '');
});
return a;
});
const hi = rows.slice(0, 5).findIndex(r => r.some(v => v != null && ['סטטוס', 'סטודנטים'].includes(unq(v))));
const head = (rows.splice(0, hi < 0 ? 1 : hi + 1).pop() || []).map(h => unq(h));
return rows.filter(r => r.some(v => v != null && String(v).trim() !== '')).map(r => {
const o = {}; head.forEach((h, i) => { if (h) o[h] = r[i] == null ? '' : unq(r[i]); }); return o;
});
}
async function fromFiles(files) {
let leadsRows = null, ivRows = null, leadsName = '', ivName = '';
for (const f of files) {
const rows = await readXlsx(await f.arrayBuffer());
const h = rows[0] || {};
if ('סטטוס' in h && ('סלולרי' in h || 'שם פרטי' in h)) { leadsRows = rows; leadsName = f.name; }
else if ('סטודנטים' in h) { ivRows = rows; ivName = f.name; }
}
if (!leadsRows) throw new Error('לא מצאתי קובץ לידים (צריך את הייצוא מדף "לידים" באתר).');
const warn = [], ivOf = {}, slots = [];
if (ivRows) {
const norm = tagNormalizer(ivRows.map(r => r['תג חשוף'] || r['מראיין'] || ''));
ivRows.forEach(r => {
const at = date(r['התחלה']) || withTime(date(r['תאריך']), r['שעה']), who = norm(r['תג חשוף'] || r['מראיין'] || '');
const names = String(r['סטודנטים'] || '').split(',').map(s => s.trim()).filter(Boolean);
slots.push({ at, who, whoId: null, names, keys: names.map(nkey) });
names.forEach(n => { const k = nkey(n), p = ivOf[k]; if (!p || (at && (!p.at || at > p.at))) ivOf[k] = { at, who }; });
});
const future = ivRows.filter(r => { const d = date(r['תאריך']); return d && d >= day0(new Date()); }).length;
if (ivRows.length && future === ivRows.length) warn.push('בקובץ הראיונות יש רק ראיונות עתידיים, כנראה "הצג הכל" היה כבוי בייצוא. שמות המראיינים יחסרו לרוב מי שכבר רואיין.');
}
const used = {};
const leads = leadsRows.map(r => {
const first = r['שם פרטי'] || '', last = r['שם משפחה'] || '';
const name = (first + ' ' + last).trim(), ph = phone(r['סלולרי']);
const iv = ivOf[nkey(name)] || ivOf[nkey(last + ' ' + first)] || {};
const reg = r['סטטוס רישום'] || '', signed = date(r['תאריך חתימה']), status = r['סטטוס'] || '';
const kb = 'x' + djb2(ph || nkey(name)), kn = used[kb] = (used[kb] || 0) + 1;
return {
key: kn > 1 ? kb + '#' + kn : kb, name, first, last, phone: ph, inst: r['מוסד אקדמי'] || '',
status, nr: NR_NAMES.includes(status), sub: r['סטטוס משני'] || '', reg,
created: date(r['זמן הוספה']), ivAt: date(r['מועד ראיון']) || iv.at || null, ivDone: /^\s*בוצע/.test(r['ביצוע ראיון'] || '') ? 'התקיים' : '',
ivWho: iv.who || '', ivWhoId: null, handler: r['גורם מטפל'] || '', handlerId: null,
accepted: date(r['תאריך קבלה']), signed, registered: reg === 'רשום' || !!signed,
remark: r['הערה'] || '', year: r['תכנית'] || ''
};
});
const idx = Object.create(null);
leads.forEach(l => { idx[nkey(l.name)] = l.key; });
leads.forEach(l => { const r = nkey(l.last + ' ' + l.first); if (!(r in idx)) idx[r] = l.key; });
const missed = new Set();
slots.forEach(s => s.keys = s.keys.map(k => { if (idx[k]) return idx[k]; missed.add(k); return k; }));
if (missed.size) warn.push(missed.size + ' שמות בקובץ הראיונות לא הותאמו לאף ליד');
if (!ivRows) leads.filter(l => l.ivAt).forEach(l => slots.push({ at: l.ivAt, who: '', whoId: null, names: [l.name], keys: [l.key] }));
return { source: 'אקסל: ' + leadsName + (ivName ? ' + ' + ivName : ''), at: new Date(), year: leads[0] && leads[0].year, leads, slots, warn, noIvFile: !ivRows, users: {} };
}
function flag(l) {
const m = l.remark.match(BLOCK);
if (m) return { f: 'block', why: 'בהערה: "' + m[0] + '". העיכוב כנראה אצלנו, לא אצלו/ה' };
if (l.status === ACC && !l.registered) {
const base = l.accepted || l.ivAt;
if (base && ago(base) < 3) return { f: 'block', why: 'התקבל/ה ' + agoTxt(base) + '. מוקדם מדי לתזכר' };
}
const w = l.remark.match(WARN);
if (w) return { f: 'warn', why: 'בהערה: "' + w[0] + '"' };
const rd = recentRemind(l.remark);
if (rd) return { f: 'warn', why: 'בהערה: נשלחה תזכורת ב-' + dm(rd) };
return { f: '', why: '' };
}
function recentRemind(remark) {
for (const line of String(remark || '').split('\n')) {
if (!REMIND.test(line)) continue;
const re = /(^|\D)(\d{1,2})[./](\d{1,2})(?:[./](\d{2,4}))?(?!\d)/g;
let m;
while ((m = re.exec(line))) {
let y = m[4] ? +m[4] : new Date().getFullYear();
if (y < 100) y += 2000;
let dt = new Date(y, m[3] - 1, +m[2]);
if (!m[4] && ago(dt) < -7) dt = new Date(y - 1, m[3] - 1, +m[2]); // "28.12" שנקרא בינואר הוא של השנה שעברה
if (dt.getMonth() === m[3] - 1 && ago(dt) >= 0 && ago(dt) <= 10) return dt;
}
}
return null;
}
function queueOf(L) {
const out = [];
L.forEach(l => {
if (l.nr) return;
let p = 0, why = '', tpl = 'free';
if (l.status === ACC && !l.registered) { p = 1; tpl = 'reg'; why = 'התקבל/ה' + (l.accepted ? ' ' + agoTxt(l.accepted) : '') + ', לא השלים/ה רישום (' + l.reg + ')'; }
else if (l.status === NEW) { p = 2; tpl = 'new'; why = 'ליד חדש' + (l.created ? ', נכנס ' + agoTxt(l.created) : ''); }
else if (l.status === IV && !l.ivAt) { p = 3; tpl = 'iv'; why = 'בשלב ראיון בלי מועד. לקבוע ראיון'; }
else if (l.status === NOANS) { p = 4; tpl = 'noans'; why = 'אין מענה' + (l.sub ? ' (' + l.sub + ')' : ''); }
else if (l.status === PART) { p = 5; tpl = 'new'; why = 'ליד חלקי, לא סיים/ה למלא פרטים'; }
else if (l.status === LATER) { p = 5; tpl = 'later'; why = 'לחזור בהמשך'; }
if (p) out.push({ l, p, why, tpl, fl: flag(l) });
});
const t = x => (x.l.accepted || x.l.created || new Date(0)).getTime();
return out.sort((a, b) => (a.fl.f === 'block') - (b.fl.f === 'block') || a.p - b.p || (b.l.tech - a.l.tech) || t(a) - t(b));
}
const css = `
:host,.ch{--bg:#f4f4f1;--card:#fff;--ink:#1f2328;--mute:#666a72;--line:#e0e0da;--acc:#1f5fbf;--accbg:#e8f0fc;
--red:#b42318;--redbg:#fdeceb;--amb:#8f5b00;--ambbg:#fff3d6;--grn:#11743c;--grnbg:#e3f4e8;--gry:#5e6168;--grybg:#ececea}
@media (prefers-color-scheme:dark){:host,.ch{--bg:#141517;--card:#212226;--ink:#ececec;--mute:#a4a7ad;--line:#36383d;--acc:#86b4ff;--accbg:#1c2a43;
--red:#ff8f85;--redbg:#3b1f1d;--amb:#f2c063;--ambbg:#3a2f15;--grn:#7ad69a;--grnbg:#173323;--gry:#b8bbc1;--grybg:#2b2c30}}
:host{display:block;background:var(--bg)!important}
.ch{direction:rtl;background:var(--bg);color:var(--ink);font:16px/1.45 system-ui,-apple-system,"Segoe UI",Arial,sans-serif;min-height:100vh;min-height:100dvh;display:flex;flex-direction:column}
.ch *{box-sizing:border-box}
.ch button,.ch input,.ch select,.ch textarea{font:inherit;color:inherit}
.hd{position:sticky;top:0;z-index:5;background:var(--bg);border-bottom:1px solid var(--line);padding:10px 14px 8px}
.hd1{display:flex;gap:8px;align-items:center}
.hd h1{font-size:18px;margin:0;flex:1}
.src{color:var(--mute);font-size:12px}
.ib{border:1px solid var(--line);background:var(--card);border-radius:10px;min-width:44px;height:44px;cursor:pointer;font-size:18px}
.flt{display:flex;gap:6px;margin-top:8px;align-items:center}
.flt input[type=search]{flex:1;min-width:0;height:44px;padding:0 12px;border:1px solid var(--line);border-radius:22px;background:var(--card)}
.tg{height:44px;padding:0 12px;border-radius:22px;border:1px solid var(--line);background:var(--card);cursor:pointer;white-space:nowrap;font-size:14px}
.tg.on{background:var(--acc);border-color:var(--acc);color:#fff}
main{flex:1;padding:10px 12px 90px;max-width:760px;width:100%;margin:0 auto}
.warn{background:var(--ambbg);color:var(--amb);border-radius:10px;padding:8px 12px;margin:8px 0;font-size:14px}
.note{color:var(--mute);font-size:13px;margin:4px 2px 10px}
h2{font-size:16px;margin:16px 2px 8px;display:flex;gap:8px;align-items:baseline}
h2 .n{font-size:13px;color:var(--mute);font-weight:400}
.row{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:12px;margin-bottom:10px}
.row.block{border-inline-start:5px solid var(--red)}.row.warn2{border-inline-start:5px solid var(--amb)}
.row.done{opacity:.6}
.top{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
.nm{font-weight:700;font-size:17px}
.tag{font-size:12px;padding:2px 8px;border-radius:10px;background:var(--grybg);color:var(--gry)}
.tag.t{background:var(--accbg);color:var(--acc);font-weight:700}.tag.r{background:var(--redbg);color:var(--red)}.tag.a{background:var(--ambbg);color:var(--amb)}.tag.g{background:var(--grnbg);color:var(--grn)}
.why{margin-top:4px;font-size:15px}
.meta{font-size:13px;color:var(--mute);margin-top:2px}
.fl{font-size:13px;margin-top:6px;padding:4px 8px;border-radius:8px}
.fl.fb{background:var(--redbg);color:var(--red)}.fl.fw{background:var(--ambbg);color:var(--amb)}
.dn{font-size:13px;margin-top:6px;color:var(--grn)}
details.rem{margin-top:6px;font-size:14px}
details.rem summary{cursor:pointer;color:var(--mute);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
details.rem div{white-space:pre-wrap;overflow-wrap:anywhere;border-inline-start:3px solid var(--line);padding-inline-start:8px;margin-top:4px}
.btns{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:10px}
.b{display:flex;align-items:center;justify-content:center;gap:4px;height:46px;border-radius:12px;border:1px solid var(--line);background:var(--card);text-decoration:none;color:var(--ink);font-size:15px;cursor:pointer}
.b.call{background:var(--accbg);color:var(--acc);border-color:transparent}
.b.msg{background:var(--grnbg);color:var(--grn);border-color:transparent}
.b.off{filter:grayscale(1);opacity:.7}
.day{font-weight:700;margin:14px 2px 6px}
.day .n{font-weight:400;color:var(--mute);font-size:13px}
.slot{display:flex;gap:10px;align-items:center;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:10px 12px;margin-bottom:6px;flex-wrap:wrap}
.slot .tm{font-variant-numeric:tabular-nums;font-weight:700;min-width:46px}
.slot .who{color:var(--mute);font-size:13px;margin-inline-start:auto}
.slot a{color:var(--acc);text-decoration:none;padding:8px 0;display:inline-block}
.empty{color:var(--mute);padding:10px 4px}
details.grp{background:var(--card);border:1px solid var(--line);border-radius:14px;margin-bottom:10px}
details.grp>summary{cursor:pointer;padding:12px;font-weight:700;list-style:none;display:flex;gap:8px}
details.grp>summary .n{font-weight:400;color:var(--mute)}
details.grp>div{padding:0 8px 4px}
details.grp .row{border-radius:12px}
table{width:100%;border-collapse:collapse;font-size:14px;background:var(--card);border-radius:12px;overflow:hidden}
th,td{padding:7px 8px;border-bottom:1px solid var(--line);text-align:start}
th{color:var(--mute);font-weight:600}
.small{font-size:13px;color:var(--mute)}
nav{position:fixed;bottom:0;inset-inline:0;z-index:6;display:grid;grid-template-columns:repeat(4,1fr);background:var(--card);border-top:1px solid var(--line);padding-bottom:env(safe-area-inset-bottom)}
nav button{border:0;background:none;padding:8px 2px 10px;cursor:pointer;font-size:12px;color:var(--mute);display:flex;flex-direction:column;align-items:center;gap:1px}
nav button b{font-size:20px;line-height:1.1}
nav button .c{font-size:11px;background:var(--grybg);border-radius:9px;padding:0 6px}
nav button.on{color:var(--acc)}nav button.on .c{background:var(--acc);color:#fff}
.sheet{position:fixed;inset:0;z-index:9;background:rgba(0,0,0,.45);display:flex;align-items:flex-end;justify-content:center}
.sh{background:var(--bg);width:100%;max-width:640px;border-radius:18px 18px 0 0;padding:14px 14px calc(14px + env(safe-area-inset-bottom));max-height:92vh;max-height:92dvh;overflow:auto;overscroll-behavior:contain}
.sh h3{margin:0 0 8px;font-size:17px;display:flex;gap:8px;align-items:center}
.sh h3 span{flex:1}
.chips{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0 10px}
.chip{border:1px solid var(--line);background:var(--card);border-radius:22px;padding:11px 14px;cursor:pointer;font-size:14px}
.chip.on{background:var(--acc);border-color:var(--acc);color:#fff}
.sh textarea{width:100%;min-height:170px;border:1px solid var(--line);border-radius:12px;padding:10px;background:var(--card);resize:vertical}
.sh input[type=text],.sh select{width:100%;height:44px;border:1px solid var(--line);border-radius:10px;padding:0 10px;background:var(--card)}
.sh .btns{grid-template-columns:1fr 1fr}
.lnk{background:none;border:0;color:var(--acc);cursor:pointer;padding:10px 0;font-size:14px}
.toast{position:fixed;bottom:90px;inset-inline:16px;z-index:10;background:var(--ink);color:var(--bg);border-radius:12px;padding:10px 14px;text-align:center;font-size:14px}
@media (min-width:900px){nav{max-width:760px;margin:0 auto;border:1px solid var(--line);border-bottom:0;border-radius:14px 14px 0 0}}
`;
function render(el, d, opt) {
opt = opt || {};
let now = new Date(), today = day0(now);      // מתחדשים בתחילת כל draw, כדי ששכבה שנשארה פתוחה אחרי חצות לא תציג את אתמול כ"היום"
d.leads.forEach(l => { l.tech = l.inst === 'הטכניון'; });
if (!d._flagged) {
const okSnap = s => !!s && typeof s.at === 'number' && !!s.m && typeof s.m === 'object';
let seen = LS.get('chv_seen_v3', null), base = LS.get('chv_base_v3', null);
if (!okSnap(seen)) seen = null;
if (!okSnap(base)) base = null;
if (seen && (!base || now - seen.at > 6 * 36e5 || now - base.at > 48 * 36e5)) { base = seen; LS.set('chv_base_v3', base); }
const cur = Object.create(null);
d.leads.forEach(l => { cur[l.key] = [l.status, l.registered ? 1 : 0]; });
d.leads.forEach(l => {
const b = base && base.m[l.key];
l.isNew = !!base && !b;
l.was = b && b[0] !== l.status ? b[0] : '';
l.regNow = !!b && !b[1] && !!l.registered;
});
d.base = base;
d.gone = base ? Object.keys(base.m).filter(k => !(k in cur)) : [];
if (!d.partial && d.leads.length > 0 && (!seen || d.leads.length >= 0.5 * Object.keys(seen.m).length)) LS.set('chv_seen_v3', { at: +now, m: cur });
const cnt = {};
d.leads.forEach(l => { if (!l.nr && l.phone) cnt[l.phone] = (cnt[l.phone] || 0) + 1; });
d.leads.forEach(l => { l.dup = !l.nr && !!l.phone && cnt[l.phone] > 1; });
d._flagged = true;
}
try { localStorage.removeItem('chv_base_v2'); } catch (e) { }   // תמונת מצב ישנה, כבר לא בשימוש
const byKey = {}; d.leads.forEach(l => byKey[l.key] = l);
const st = { tab: LS.get('chv_tab', 'call'), q: '', qd: '', tech: false, mine: LS.get('chv_mine', false) };
if (['call', 'iv', 'reg', 'more'].indexOf(st.tab) < 0) st.tab = 'call';
let me = LS.get('chv_me_v2', null);           // {id, name, sign}
if (!me || !me.name) me = null;
let done = LS.get('chv_done_v2', {});         // key -> {t, o}
if (!done || typeof done !== 'object') done = {};
{ const ks = Object.keys(done); ks.forEach(k => { if (!done[k] || now - done[k].t >= 16 * 36e5) delete done[k]; }); if (Object.keys(done).length !== ks.length) LS.set('chv_done_v2', done); }
const tpls = () => Object.assign({}, ...Object.keys(TPL).map(k => ({ [k]: LS.get('chv_tpl_v2_' + k, TPL[k][1]) })));
const isMine = l => !!me && ((me.id != null && l.handlerId != null && String(l.handlerId) === String(me.id)) ||
samePerson(l.handler, me.name) || samePerson(l.ivWho, me.name));
const mineCount = () => d.leads.filter(l => !l.nr && isMine(l)).length;   // רק לידים פעילים, בלי מי שיצא מהרשימה
let mineN = mineCount();                      // כמה לידים "שלי", מוצג על הכפתור
if (st.mine && me && !mineN) st.mine = false; // אחרת כל הרשימה הייתה נעלמת ומציגה "אין למי להתקשר" בטעות
const digitsQ = q => {
if (/[^\d\s+().-]/.test(q)) return '';
const raw = q.replace(/\D/g, '');
if (raw.length < 3) return '';
const s = raw.replace(/^(00)?972/, '0');
return s.length > 1 ? s : '';
};
const qOk = l => !st.q || (l.name + ' ' + l.phone + ' ' + l.inst + ' ' + l.ivWho + ' ' + l.handler).includes(st.q) || (!!st.qd && l.phone.includes(st.qd));
const pass = (l, ignoreMine) => (!st.tech || l.tech) && (ignoreMine || !st.mine || !me || isMine(l)) && qOk(l);
const slotOk = s => (!st.mine || !me || samePerson(s.who, me.name) || (me.id != null && s.whoId != null && String(s.whoId) === String(me.id))) &&
(!st.q || s.names.join(' ').includes(st.q) || s.who.includes(st.q) || (!!st.qd && s.keys.some(k => byKey[k] && byKey[k].phone.includes(st.qd)))) &&
(!st.tech || s.keys.some(k => byKey[k] && byKey[k].tech));
const doneToday = l => { const x = done[l.key]; return x && now - x.t < 16 * 36e5 ? x : null; };
const instTag = l => l.tech ? '<span class="tag t">לומד/ת בטכניון</span>' : l.inst ? `<span class="tag">${esc(l.inst)}</span>` : '';
const extraTags = l => (l.isNew ? '<span class="tag g">חדש</span>' : '') + (l.was ? `<span class="tag a">היה: ${esc(l.was)}</span>` : '') +
(l.dup ? '<span class="tag a">מופיע/ה פעמיים</span>' : '') +
(!st.mine && l.handler ? `<span class="tag">מטפל/ת: ${esc(l.handler)}</span>` : '');
const rem = l => l.remark ? `<details class="rem"><summary>📝 ${esc(l.remark.split('\n')[0])}</summary><div>${esc(l.remark)}</div></details>` : '';
function card(l, whyHtml, tpl, fl) {
fl = fl || flag(l);
const dn = doneToday(l), off = fl.f === 'block' ? ' off' : '';
const cls = (fl.f === 'block' ? ' block' : fl.f === 'warn' ? ' warn2' : '') + (dn ? ' done' : '');
return `<div class="row${cls}"><div class="top"><span class="nm">${esc(l.name)}</span>${instTag(l)}${extraTags(l)}</div>
${whyHtml ? `<div class="why">${whyHtml}</div>` : ''}
${fl.f ? `<div class="fl ${fl.f === 'block' ? 'fb' : 'fw'}">${fl.f === 'block' ? '⛔ לא לפנות כרגע: ' : '⚠️ בזהירות: '}${esc(fl.why)}</div>` : ''}
${dn ? `<div class="dn">✓ סימנת ${dm(new Date(dn.t))} ${hm(new Date(dn.t))}: ${esc(dn.o)}</div>` : ''}
${rem(l)}
<div class="btns">${l.phone ? `<a class="b call${off}" href="tel:${esc(l.phone)}" data-guard="${fl.f === 'block' ? esc(fl.why) : ''}">📞 התקשר</a>
<button class="b msg${off}" data-msg="${esc(l.key)}" data-tpl="${tpl}" data-guard="${fl.f === 'block' ? esc(fl.why) : ''}">💬 הודעה</button>` :
'<span class="b off">אין טלפון</span><span></span>'}
<button class="b" data-done="${esc(l.key)}">${dn ? '↩︎ בטל' : '✓ טופל'}</button></div></div>`;
}
const list = (arr, fn, empty) => arr.length ? arr.map(fn).join('') : `<div class="empty">${empty || 'אין כרגע 👍'}</div>`;
function tabCall() {
const q = queueOf(d.leads.filter(l => pass(l)));
const open = q.filter(x => !doneToday(x.l)), closed = q.filter(x => doneToday(x.l));
const orph = st.mine && me ? queueOf(d.leads.filter(l => !l.handler && !l.ivWho && pass(l, true))) : [];
const orphOpen = orph.filter(x => !doneToday(x.l)), closedAll = closed.concat(orph.filter(x => doneToday(x.l)));
const HEAD = { 1: '🟥 התקבלו, לא השלימו רישום', 2: '🟦 לידים חדשים', 3: '🟧 לקבוע ראיון', 4: '📵 אין מענה', 5: '⏳ לחזור בהמשך' };
let h = '', last = 0;
const shown = open;
shown.forEach(x => {
const grp = x.fl.f === 'block' ? 9 : x.p;
if (grp !== last) { h += `<h2>${grp === 9 ? '⛔ לא לפנות כרגע' : HEAD[x.p]} <span class="n">${shown.filter(y => (y.fl.f === 'block' ? 9 : y.p) === grp).length}</span></h2>`; last = grp; }
h += card(x.l, esc(x.why), x.tpl, x.fl);
});
const who = !me ? `<div class="warn">כדי שההודעות ייחתמו בשמך ושתוכל/י לסנן "רק שלי": <button class="lnk" data-set>להגדיר מי אני</button></div>` : '';
return who + `<div class="note">הסדר: התקבלו ולא נרשמו, לידים חדשים, קביעת ראיון, אין מענה, לחזור בהמשך. בכל קבוצה הטכניון ראשון, ואחריו מי שמחכה הכי הרבה.</div>` +
(h || '<div class="empty">אין למי להתקשר כרגע 👍</div>') +
(closedAll.length ? `<details class="grp"><summary>✓ סימנת היום <span class="n">${closedAll.length}</span></summary><div>${closedAll.map(x => card(x.l, esc(x.why), x.tpl, x.fl)).join('')}</div></details>` : '') +
(orphOpen.length ? `<details class="grp"><summary>בלי גורם מטפל <span class="n">${orphOpen.length}</span></summary><div><div class="note">לידים שעוד אין להם מטפל או מראיין, ולכן לא נכללים ב"רק שלי".</div>${orphOpen.map(x => card(x.l, esc(x.why), x.tpl, x.fl)).join('')}</div></details>` : '');
}
function tabIv() {
const slots = d.slots.filter(s => s.at && s.at >= today && s.at < addDays(today, 8)).filter(slotOk)
.sort((a, b) => a.at - b.at);
const days = {};
slots.forEach(s => { const k = +day0(s.at); (days[k] = days[k] || []).push(s); });
let h = Object.keys(days).map(k => {
const dd = new Date(+k), ss = days[k], full = ss.filter(s => s.names.length), free = ss.length - full.length;
const lbl = +k === +today ? 'היום' : +k === +addDays(today, 1) ? 'מחר' : 'יום ' + WD[dd.getDay()];
return `<div class="day">${lbl} ${dm(dd)} <span class="n">${full.length} ראיונות${free ? ' · ' + free + ' משבצות פנויות' : ''}</span></div>` +
full.map(s => `<div class="slot"><span class="tm">${hm(s.at) || '--:--'}</span><span>${s.names.map((n, i) => {
const l = byKey[s.keys[i]];
return '<b>' + esc(n) + '</b>' + (l && l.tech ? ' <span class="tag t">טכניון</span>' : '') + (l && l.phone ? ` · <a href="tel:${esc(l.phone)}">${esc(l.phone)}</a>` : '');
}).join('<br>')}</span><span class="who">${esc(s.who)}</span></div>`).join('');
}).join('');
if (!h) h = '<div class="empty">אין ראיונות בשבוע הקרוב.</div>';
const L = d.leads.filter(l => pass(l)).filter(l => !l.nr);
const past = L.filter(l => l.status === IV && l.ivAt && l.ivAt < new Date(now - 2 * 36e5)).sort((a, b) => a.ivAt - b.ivAt);
const noDate = L.filter(l => l.status === IV && !l.ivAt);
return `<h2>📅 ראיונות בשבוע הקרוב <span class="n">${slots.filter(s => s.names.length).length}</span></h2>` +
(d.noIvFile ? '<div class="note">מתוך "מועד ראיון" בקובץ הלידים. לשמות המראיינים צריך לצרף גם את קובץ הראיונות.</div>' : '') + h +
`<h2>🟧 הראיון עבר, הסטטוס לא עודכן <span class="n">${past.length}</span></h2><div class="note">עדיין "שלב ראיון" אבל מועד הראיון עבר. לעדכן באתר תוצאה, או לקבוע מחדש אם לא התקיים.</div>` +
list(past, l => card(l, 'ראיון ' + WD[l.ivAt.getDay()] + ' ' + dm(l.ivAt) + ' ' + hm(l.ivAt) + (l.ivWho ? ' · ' + esc(l.ivWho) : '') + (l.ivDone ? ' · ' + l.ivDone : ''), 'free')) +
`<h2>🟧 בשלב ראיון, בלי מועד <span class="n">${noDate.length}</span></h2>` +
list(noDate, l => card(l, 'לקבוע ראיון' + (l.created ? ' · נכנס ' + agoTxt(l.created) : ''), 'iv'));
}
function tabReg() {
const acc = d.leads.filter(l => l.status === ACC);
const stuck = acc.filter(l => !l.registered && pass(l));
const W = l => l.ivWho || '(לא ידוע מי ראיין)';
const stats = {};
acc.forEach(l => { const s = stats[W(l)] = stats[W(l)] || { all: 0, st: 0 }; s.all++; if (!l.registered) s.st++; });
const groups = {};
stuck.forEach(l => (groups[W(l)] = groups[W(l)] || []).push(l));
const rank = f => f === 'block' ? 2 : f === 'warn' ? 1 : 0;
const isMe = n => !!me && samePerson(n, me.name);   // הקבוצה של המשתמש עצמו אחרונה
const names = Object.keys(groups).sort((a, b) => isMe(a) - isMe(b) || groups[b].length - groups[a].length);
const sum = acc.length, reg = acc.filter(l => l.registered).length;
return `<div class="note">${sum} התקבלו השנה · ${reg} נרשמו סופית · ${sum - reg} עוד לא (${sum ? Math.round(100 * (sum - reg) / sum) : 0}%). כפתור ההודעה פותח את הנוסח הקבוע, אפשר לערוך לפני השליחה.</div>` +
(names.length ? names.map(n => {
const arr = groups[n].sort((a, b) => rank(flag(a).f) - rank(flag(b).f) || (b.tech - a.tech) || ((a.accepted || 0) - (b.accepted || 0)));
return `<details class="grp"${names.length === 1 ? ' open' : ''}><summary>${esc(n)} <span class="n">${arr.length} מתוך ${stats[n] ? stats[n].all : arr.length}</span></summary><div>` +
arr.map(l => card(l, `<span class="tag ${l.reg === 'טרם התחבר' ? 'r' : 'a'}">${esc(l.reg)}</span> ` + (l.accepted ? 'התקבל/ה ' + dm(l.accepted) + ' (' + agoTxt(l.accepted) + ')' : l.ivAt ? 'רואיין/ה ' + dm(l.ivAt) : ''), 'reg')).join('') + '</div></details>';
}).join('') : '<div class="empty">כולם נרשמו 👍</div>') +
`<h2>לפי מראיין <span class="n">בסיס ואחוז, לא רק מספר</span></h2><table><tr><th>מראיין</th><th>התקבלו</th><th>לא נרשמו</th><th>%</th></tr>` +
Object.keys(stats).sort((a, b) => stats[b].all - stats[a].all).map(n => {
const s = stats[n]; return `<tr><td>${esc(n)}</td><td>${s.all}</td><td>${s.st}</td><td>${Math.round(100 * s.st / s.all)}%${s.all < 4 ? ' <span class="small">(בסיס קטן)</span>' : ''}</td></tr>`;
}).join('') + '</table>';
}
function tabMore() {
const L = d.leads.filter(l => pass(l)), base = d.base;
const left = L.filter(l => l.nr && l.was && !NR_NAMES.includes(l.was));
const regNow = L.filter(l => l.regNow && !l.nr);
const newer = L.filter(l => l.isNew && !l.nr);
const gone = !st.mine && !st.tech && !st.q && d.gone ? d.gone.length : 0;
const since = base ? dm(new Date(base.at)) + ' ' + hm(new Date(base.at)) : '';
let h = base ? `<h2>מה השתנה מאז ${since}</h2>
<div class="note">${newer.length} לידים חדשים · ${L.filter(l => l.was && !l.nr).length} שינו סטטוס · ${regNow.length} נרשמו · ${left.length + gone} יצאו או נעלמו מהרשימה</div>
<div class="small" style="margin:0 2px 8px">ההשוואה מתחדשת רק אחרי הפסקה של יותר מ-6 שעות בין פתיחות, כדי שהסימונים יישארו לאורך היום.</div>` +
(regNow.length ? `<details class="grp" open><summary>נרשמו מאז <span class="n">${regNow.length}</span></summary><div>${regNow.map(l => card(l, esc(l.status), 'free', { f: '', why: '' })).join('')}</div></details>` : '') +
(left.length ? `<details class="grp" open><summary>יצאו מהרשימה (הפסד / פסילה) <span class="n">${left.length}</span></summary><div>${left.map(l => card(l, 'היה: ' + esc(l.was) + ' ← ' + esc(l.status) + (l.sub ? ' (' + esc(l.sub) + ')' : ''), 'free', { f: '', why: '' })).join('')}</div></details>` : '') +
(gone ? `<div class="note">עוד ${gone} לידים שהיו ברשימה בפעם הקודמת כבר לא בנתונים (יצאו מהרשימה או נמחקו). אין עליהם פרטים.</div>` : '') +
(newer.length ? `<details class="grp"><summary>לידים חדשים <span class="n">${newer.length}</span></summary><div>${newer.map(l => card(l, esc(l.status), 'new')).join('')}</div></details>` : '')
: '<div class="note">בפעם הבאה שתפתח/י את הכלי, כאן יופיע מה השתנה מאז הפעם הזאת (מי נכנס, מי נרשם, מי יצא או נעלם מהרשימה).</div>';
if (st.q) h += `<h2>כל הלידים שמתאימים לחיפוש <span class="n">${L.length}</span></h2>` + (L.length > 60 ? `<div class="note">מוצגים 60 מתוך ${L.length}. אפשר לדייק את החיפוש.</div>` : '') +
list(L.slice(0, 60), l => card(l, esc(l.status) + (l.sub ? ' · ' + esc(l.sub) : ''), 'free'));
else h += `<div class="note">טיפ: בחיפוש למעלה אפשר למצוא כל ליד, גם כאלה שיצאו מהרשימה.</div>`;
h += `<h2>הגדרות</h2><div class="row"><div>אני: <b>${me ? esc(me.name) : 'לא הוגדר'}</b> <button class="lnk" data-set>שינוי</button></div>
<div class="small" style="margin-top:6px">הסימונים "✓ טופל" ונוסחי ההודעות שערכת נשמרים רק במכשיר הזה. הרישום האמיתי הוא ההערה באתר.</div>
<button class="lnk" data-reset>להחזיר את נוסחי ההודעות למקור</button></div>
<div class="small" style="margin:10px 2px">${d.leads.length} לידים בנתונים · הכלי רק קורא, לא משנה כלום באתר ולא שולח נתונים לשום מקום.</div>`;
return h;
}
const srcLine = () => `${esc(d.source)} · ${dm(d.at)} ${hm(d.at)}${d.year ? ' · ' + esc(d.year) : ''}${me ? ' · ' + esc(me.name) : ''}`;
el.innerHTML = `<div class="ch"><div class="hd"><div class="hd1"><h1>רישום חברותא</h1>
<button class="ib" data-set title="מי אני">👤</button>${opt.onReload ? '<button class="ib" data-reload title="רענון">⟳</button>' : ''}${opt.onClose ? '<button class="ib" data-x title="סגירה">✕</button>' : ''}</div>
<div class="src">${srcLine()}</div>
<div class="flt"><input type="search" placeholder="חיפוש שם / טלפון"><button class="tg" data-mine>רק שלי</button><button class="tg" data-tech>טכניון</button></div></div>
<main>${(d.warn || []).map(w => `<div class="warn">${esc(w)}</div>`).join('')}<div class="body"></div></main>
<nav><button data-tab="call"><b>📞</b>להתקשר<span class="c" data-c="call"></span></button><button data-tab="iv"><b>📅</b>ראיונות<span class="c" data-c="iv"></span></button>
<button data-tab="reg"><b>📝</b>לא נרשמו<span class="c" data-c="reg"></span></button><button data-tab="more"><b>⋯</b>עוד</button></nav></div>`;
const root = el.querySelector('.ch'), body = el.querySelector('.body');
const toast = t => { const x = document.createElement('div'); x.className = 'toast'; x.textContent = t; root.appendChild(x); setTimeout(() => x.remove(), 3200); };
function draw() {
now = new Date(); today = day0(now);
body.innerHTML = { call: tabCall, iv: tabIv, reg: tabReg, more: tabMore }[st.tab]();
el.querySelectorAll('nav [data-tab]').forEach(b => b.classList.toggle('on', b.dataset.tab === st.tab));
const mb = el.querySelector('[data-mine]');
mb.textContent = me ? 'רק שלי · ' + mineN : 'רק שלי';
mb.classList.toggle('on', st.mine && !!me);
el.querySelector('[data-tech]').classList.toggle('on', st.tech);
const L = d.leads.filter(l => pass(l));
const c = {
call: queueOf(L).filter(x => x.fl.f !== 'block' && !doneToday(x.l)).length,
iv: d.slots.filter(s => s.at && +day0(s.at) === +today && s.names.length).filter(slotOk).length,
reg: L.filter(l => l.status === ACC && !l.registered).length
};
Object.keys(c).forEach(k => el.querySelector(`[data-c="${k}"]`).textContent = c[k]);
}
function sheet(html, wire, canClose) {
const s = document.createElement('div'); s.className = 'sheet';
s.innerHTML = `<div class="sh">${html}</div>`;
s.onclick = e => { if ((e.target === s || e.target.closest('[data-close]')) && (!canClose || canClose())) s.remove(); };
root.appendChild(s); wire(s); return s;
}
function setMe(after) {
const ppl = {};
Object.entries(d.users || {}).forEach(([id, n]) => { if (d.leads.some(l => String(l.handlerId) === id || String(l.ivWhoId) === id)) ppl[n] = +id; });
d.leads.forEach(l => { if (l.handler && !(l.handler in ppl)) ppl[l.handler] = null; if (l.ivWho && !(l.ivWho in ppl)) ppl[l.ivWho] = null; });
const names = Object.keys(ppl).sort();
sheet(`<h3><span>מי את/ה?</span><button class="ib" data-close>✕</button></h3>
<div class="small">לחתימה בהודעות ולסינון "רק שלי" (לידים שאת/ה מטפל/ת בהם או שראיינת). נשמר רק במכשיר הזה.</div>
<p><select data-pick><option value="">בחירה מהרשימה…</option>${names.map(n => `<option${me && me.name === n ? ' selected' : ''}>${esc(n)}</option>`).join('')}</select></p>
<p><input type="text" data-sign placeholder="איך לחתום בהודעה (למשל: דנה)" value="${esc(me && me.sign || '')}"></p>
<button class="b msg" style="width:100%" data-ok>שמירה</button>`, s => {
const pk = s.querySelector('[data-pick]'), sg = s.querySelector('[data-sign]');
let auto = '';
pk.onchange = () => { if (!sg.value || sg.value === auto) sg.value = auto = firstOf(pk.value); };
s.querySelector('[data-ok]').onclick = () => {
const n = pk.value || sg.value.trim(); if (!n) return;
me = { name: n, id: ppl[n] || null, sign: sg.value.trim() || firstOf(n) };
LS.set('chv_me_v2', me);
mineN = mineCount();
if (!mineN) { st.mine = false; LS.set('chv_mine', false); toast('לא נמצאו לידים על שמך, "רק שלי" נשאר כבוי'); }
else if (!after) { st.mine = true; LS.set('chv_mine', true); }
s.remove();
el.querySelector('.src').innerHTML = srcLine();
draw();
if (after) after();
};
});
}
const noteFor = outcome => dm(new Date()) + ' ' + outcome + (me ? ' (' + me.sign + ')' : '');
function markDone(l, outcome, opt) {
done[l.key] = { t: Date.now(), o: outcome }; LS.set('chv_done_v2', done);
const note = noteFor(outcome), msg = 'סומן. הועתק "' + note + '", להדביק בהערה באתר';
if (opt && 'copied' in opt) toast(opt.copied ? msg : 'סומן');
else {
let started = false;
try { if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(note).then(() => toast(msg), () => toast('סומן')); started = true; } } catch (e) { }
if (!started) toast('סומן');
}
draw();
}
function doneSheet(l) {
if (done[l.key] && doneToday(l)) { delete done[l.key]; LS.set('chv_done_v2', done); draw(); return; }
sheet(`<h3><span>מה יצא עם ${esc(l.name)}?</span><button class="ib" data-close>✕</button></h3>
<div class="chips">${OUTCOMES.map(o => `<button class="chip" data-o="${esc(o)}">${esc(o)}</button>`).join('')}</div>
<div class="small">הסימון נשמר רק במכשיר שלך, ושורת סיכום מועתקת כדי להדביק אותה בהערה באתר.</div>`, s => {
s.querySelectorAll('[data-o]').forEach(b => b.onclick = () => { s.remove(); markDone(l, b.dataset.o); });
});
}
function msgSheet(l, tpl) {
if (!me) return setMe(() => msgSheet(l, tpl));
const T = tpls(), first = l.first || l.name.split(' ')[0];
const fill = k => T[k].replace(/\{first\}/g, () => first).replace(/\{me\}/g, () => me.sign);
const num = '972' + l.phone.replace(/^0/, '');
let k = tpl, filled = '', ta = null;   // filled = הנוסח שמולא בפעם האחרונה, כדי לזהות עריכה ידנית
sheet(`<h3><span>הודעה ל${esc(l.name)}</span><button class="ib" data-close>✕</button></h3>
<div class="chips">${Object.keys(TPL).map(k => `<button class="chip${k === tpl ? ' on' : ''}" data-k="${k}">${esc(TPL[k][0])}</button>`).join('')}</div>
<textarea></textarea>
<div class="btns"><a class="b msg" data-wa target="_blank" rel="noopener">וואטסאפ</a><a class="b" data-sms>SMS</a></div>
<button class="lnk" data-save>לשמור את הנוסח הזה כקבוע לסוג "<span></span>" (עם {first} במקום השם)</button>
<div class="small">ההודעה לא נשלחת מכאן. נפתח וואטסאפ עם הטקסט, ושם לוחצים "שלח".</div>`, s => {
ta = s.querySelector('textarea');
const wa = s.querySelector('[data-wa]'), sms = s.querySelector('[data-sms]');
const upd = () => {
wa.href = 'https://wa.me/' + num + '?text=' + encodeURIComponent(ta.value);
sms.href = 'sms:' + l.phone + '?&body=' + encodeURIComponent(ta.value);
s.querySelector('[data-save] span').textContent = TPL[k][0];
};
const choose = kk => { k = kk; ta.value = filled = fill(k); s.querySelectorAll('[data-k]').forEach(c => c.classList.toggle('on', c.dataset.k === k)); upd(); };
s.querySelectorAll('[data-k]').forEach(c => c.onclick = () => {
if (ta.value !== filled && !confirm('להחליף נוסח? השינויים שלך יימחקו')) return;
choose(c.dataset.k);
});
ta.oninput = upd;
[wa, sms].forEach(a => a.addEventListener('click', () => {
let ok = false;
try { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(noteFor(SENT)).then(() => { ok = true; }, () => { }); } catch (e) { }
setTimeout(() => { s.remove(); markDone(l, SENT, { copied: ok }); }, 300);
}));
s.querySelector('[data-save]').onclick = () => {
const swap = (t, w, ph) => !w ? t : t.replace(new RegExp('(^|[^\\u0590-\\u05FF])' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![\\u0590-\\u05FF])'), '$1' + ph);
const v = swap(swap(ta.value, first, '{first}'), me.sign, '{me}');
LS.set('chv_tpl_v2_' + k, v); toast('הנוסח נשמר במכשיר הזה');
};
choose(k);
}, () => !ta || ta.value === filled || confirm('לסגור בלי לשלוח? הטקסט שערכת יימחק'));
}
el.querySelector('input[type=search]').oninput = e => { st.q = e.target.value.trim(); st.qd = digitsQ(st.q); draw(); };
el.querySelector('[data-tech]').onclick = () => { st.tech = !st.tech; draw(); };
el.querySelector('[data-mine]').onclick = () => {
if (!me) return setMe();
if (!st.mine && !mineN) return toast('לא נמצאו לידים על שמך, "רק שלי" נשאר כבוי');
st.mine = !st.mine; LS.set('chv_mine', st.mine); draw();
};
el.querySelectorAll('nav [data-tab]').forEach(b => b.onclick = () => { st.tab = b.dataset.tab; LS.set('chv_tab', st.tab); draw(); el.scrollIntoView(); });
if (opt.onClose) el.querySelector('[data-x]').onclick = opt.onClose;
if (opt.onReload) el.querySelector('[data-reload]').onclick = opt.onReload;
root.addEventListener('click', e => {
const t = e.target.closest('[data-msg],[data-done],[data-set],[data-reset],a.call');
if (!t || t.closest('.sheet')) return;
if (t.dataset.guard && !confirm('לא לפנות כרגע:\n' + t.dataset.guard + '\n\nלהמשיך בכל זאת?')) { e.preventDefault(); return; }
if (t.hasAttribute('data-msg')) msgSheet(byKey[t.dataset.msg], t.dataset.tpl);
else if (t.hasAttribute('data-done')) doneSheet(byKey[t.dataset.done]);
else if (t.hasAttribute('data-set')) setMe();
else if (t.hasAttribute('data-reset')) { Object.keys(TPL).forEach(k => { try { localStorage.removeItem('chv_tpl_v2_' + k); } catch (x) { } }); toast('הנוסחים הוחזרו למקור'); }
});
draw();
}
return { fromApi, fromFiles, render, css, queueOf, tagNormalizer, samePerson };
})();
if(!document.querySelector('meta[name=viewport]')){const m=document.createElement('meta');m.name='viewport';m.content='width=device-width,initial-scale=1';document.head.appendChild(m);}
const teardown=()=>{const o=document.getElementById('chv-tool');if(o)o.remove();document.documentElement.style.overflow='';};
const onPop=()=>{window.removeEventListener('popstate',onPop);teardown();};
const close=()=>{window.removeEventListener('popstate',onPop);teardown();if(history.state&&history.state.chv)history.back();};
async function run(){
teardown();window.removeEventListener('popstate',onPop);
if(!(history.state&&history.state.chv))history.pushState({chv:1},'',location.href);
window.addEventListener('popstate',onPop);
const h=document.createElement('div');h.id='chv-tool';h.style.cssText='position:fixed;inset:0;z-index:2147483647;overflow:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;background:#f4f4f1';
document.body.appendChild(h);document.documentElement.style.overflow='hidden';
const r=h.attachShadow({mode:'open'});
r.innerHTML='<style>'+CH.css+'</style><div class="root"><div class="ch"><main>טוען נתונים מהאתר…</main></div></div>';
const el=r.querySelector('.root');
try{CH.render(el,await CH.fromApi(),{onClose:close,onReload:run});}
catch(e){const login=e.message==='login';
const x=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
el.innerHTML='<div class="ch"><main><h2>'+(login?'האתר לא נתן נתונים':'משהו נכשל')+'</h2><p>'+(login?'כנראה צריך להתחבר מחדש: ללחוץ "סגירה", להתחבר באתר (הדפדפן זוכר את הסיסמה), ולהפעיל שוב את הסימניה. אם כבר מחוברים, האתר פשוט לא ענה: "לנסות שוב".':'פרטי השגיאה: '+x(e.message))+'</p>'+(e.cause?'<div class="small" style="margin-bottom:10px">פרטים: '+x(e.cause.message||e.cause)+'</div>':'')+'<div class="btns" style="grid-template-columns:1fr 1fr"><button class="b msg" id="r">⟳ לנסות שוב</button><button class="b" id="c">סגירה</button></div></main></div>';
el.querySelector('#c').onclick=close;el.querySelector('#r').onclick=run;console.error(e);}
}
run();
})();