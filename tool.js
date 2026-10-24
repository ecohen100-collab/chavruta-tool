(function(){
if(location.hostname!=='amiway.s-admin.co.il'){
if(confirm('הכלי עובד בתוך אתר דרך עמ"י. לעבור לאתר עכשיו?\nאחרי ההתחברות לוחצים שוב על הסימניה.'))location.href='https://amiway.s-admin.co.il/centers/9/leads';return;}
var CH = (function () {
'use strict';
const DAY = 864e5, WD = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];
const NEW = 'ליד חדש', PART = 'ליד חלקי', IV = 'שלב ראיון', ACC = 'התקבל ויירשם', LATER = 'לחזור בהמשך', NOANS = 'אין מענה';
const NR_NAMES = ['הפסד', 'פסילה'];
const TPL = {
reg: ['השלמת רישום', 'הי {שם},\nמה נשמע? זה {אני} מדרך עמי בטכניון 🙂\n\nראיתי שעדיין לא השלמת רישום..\nאם צריך עזרה או משהו אני פה לכל עזרה ושאלה\nhttps://students.amiway.s-admin.co.il/'],
new: ['היכרות לליד חדש', 'הי {שם},\nמה נשמע? זה {אני} מדרך עמי בטכניון 🙂\n\nראיתי שהתעניינת בתוכנית החברותא. אשמח לספר לך עליה ולקבוע שיחה קצרה.\nמתי נוח לך?'],
ivr: ['תזכורת לראיון', 'הי {שם},\nזה {אני} מדרך עמי בטכניון 🙂\nרק תזכורת: נקבע לך ראיון היכרות {מועד}.\nאם משהו השתנה, אפשר לכתוב לי כאן.'],
ivday: ['יום הראיון (זום)', 'שלום {שם},\nאני {אני}, מדרך עמ"י - חברותא בטכניון.\nמה שלומך?\nיש לנו ראיון {מועד}.\nלקראת הראיון אשלח קישור לזום מכאן.\nלהתראות 🙂'],
iv: ['קביעת ראיון', 'הי {שם},\nזה {אני} מדרך עמי בטכניון 🙂\n\nרציתי לקבוע איתך ראיון היכרות קצר לתוכנית.\nאיזה יום ושעה נוחים לך בימים הקרובים?'],
noans: ['אין מענה בטלפון', 'הי {שם},\nזה {אני} מדרך עמי בטכניון 🙂\nניסיתי להשיג אותך בטלפון לגבי תוכנית החברותא.\nמתי נוח שנדבר?'],
later: ['חזרה כפי שסוכם', 'הי {שם},\nזה {אני} מדרך עמי בטכניון 🙂\nרציתי לחזור אליך כמו שדיברנו לגבי תוכנית החברותא. זה עדיין רלוונטי?'],
free: ['הודעה חופשית', 'הי {שם},\n']
};
const SENT = 'נשלחה הודעה';
const FR = /צרפת|france/i;
const FEEDBACK_TO = '';
const OUTCOMES = ['אין מענה', 'דיברנו, ממתין/ה לתשובה', 'נקבע ראיון', SENT, 'לא רלוונטי', 'אחר'];
const fillTpl = (t, first, sign, when) => t.replace(/\{(שם|first|אני|me|מועד)\}/g, (m, k) => k === 'שם' || k === 'first' ? first : k === 'אני' || k === 'me' ? sign : when);
const GROUPS = {
new: ['🟦', 'לידים חדשים'],
myIv: ['📅', 'ראיונות שקבעו לי'],
weekIv: ['🗓', 'ראיונות השבוע'],
ivPast: ['⏰', 'הראיון עבר, לא עודכן'],
acc: ['🟥', 'התקבלו, לא נרשמו'],
ivNoDate: ['🟧', 'לקבוע ראיון'],
noans: ['📵', 'אין מענה'],
later: ['⏳', 'לחזור בהמשך'],
changes: ['🔄', 'מה השתנה']
};
const GIDS = Object.keys(GROUPS);
const GSUB = { myIv: 'מהיום ועד שבוע', weekIv: 'כל המראיינים', ivPast: 'לעדכן תוצאה באתר', acc: 'לתזכר להשלים רישום', ivNoDate: 'בשלב ראיון בלי מועד', noans: 'לנסות שוב', later: 'ביקשו שנחזור', changes: 'מאז הפעם הקודמת' };
const ROLES = { tel: ['📞', 'טלפנית', 'חדשים, אין מענה, לחזור בהמשך'], int: ['🎤', 'מראיין', 'הראיונות שלי, מי שראיינתי ולא נרשם'] };
const HOME_BY_ROLE = {
tel: ['new', 'noans', 'later', 'ivNoDate', 'acc'],
int: ['myIv', 'ivPast', 'acc', 'new'],
'': ['new', 'myIv', 'acc', 'ivNoDate', 'noans', 'later']
};
const SKEY = 'chv_settings_v1';
function loadSettings() {
const s = LS.get(SKEY, null) || {};
const role = s.role === 'tel' || s.role === 'int' ? s.role : '';
let home = Array.isArray(s.home) ? s.home.filter((g, i, a) => GIDS.includes(g) && a.indexOf(g) === i) : [];
if (!home.length) home = HOME_BY_ROLE[role].slice();
return { role, home, techDefault: s.techDefault !== false, mineOnly: s.mineOnly !== false, hideFr: s.hideFr !== false };
}
const BLOCK = /תקלה|בעיה טכנית|בעיות טכניות|תמיכה|אישור מדרך/;
const Y3 = /שנה שלישית|שנה ג'|אישור חריג|חריגה/;
const ageOf = b => { if (!b) return null; const n = new Date(); let a = n.getFullYear() - b.getFullYear(); if (n < new Date(n.getFullYear(), b.getMonth(), b.getDate())) a--; return a > 0 && a < 120 ? a : null; };
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
if (r.status === 401 || r.status === 403 || r.status === 419) throw Object.assign(new Error('login'), { final: true });
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
slots.push({ at, end: withTime(date(x.date), x.endTime), dir: unq(x.directions || ''), link: unq(x.link || ''), who, whoId: x.interviewerId || null, names: ls.map(l => unq(l.name)), keys: ls.map(l => String(l.id)) });
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
accepted: date(l.acceptedDate), signed, registered: !!signed, remark: unq(l.remark), year: l.year, fr: FR.test(unq(l.aliyahCountry)), age: ageOf(date(l.birthday)), city: unq(l.city)
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
slots.push({ at, end: date(r['סיום']), dir: unq(r['הנחיות'] || ''), link: '', who, whoId: null, names, keys: names.map(nkey) });
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
remark: r['הערה'] || '', year: r['תכנית'] || '', fr: FR.test(r['ארץ עלייה'] || ''), age: ageOf(date(r['תאריך לידה'])), city: r['עיר מגורים'] || ''
};
});
const idx = Object.create(null);
leads.forEach(l => { idx[nkey(l.name)] = l.key; });
leads.forEach(l => { const r = nkey(l.last + ' ' + l.first); if (!(r in idx)) idx[r] = l.key; });
const missed = new Set();
slots.forEach(s => s.keys = s.keys.map(k => { if (idx[k]) return idx[k]; missed.add(k); return k; }));
if (missed.size) warn.push(missed.size + ' שמות בקובץ הראיונות לא הותאמו לאף ליד');
if (!ivRows) leads.filter(l => l.ivAt).forEach(l => slots.push({ at: l.ivAt, end: null, dir: '', link: '', who: '', whoId: null, names: [l.name], keys: [l.key] }));
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
.ibs{display:flex;gap:8px}
@media (max-width:520px){.hd.sub .hd1{flex-wrap:wrap;row-gap:4px}.hd.sub h1{order:3;flex:1 1 100%}.hd.sub .ibs{margin-inline-start:auto}}
.hd h1{font-size:18px;margin:0;flex:1;min-width:0}
.hd h1 .n{font-size:14px;color:var(--mute);font-weight:400}
.src{color:var(--mute);font-size:12px}
.ib{border:1px solid var(--line);background:var(--card);border-radius:10px;min-width:44px;height:44px;cursor:pointer;font-size:18px}
.ib.bk{padding:0 12px;font-size:15px;white-space:nowrap}
.ib:disabled{opacity:.35;cursor:default}
.srch{display:block;width:100%;height:44px;padding:0 14px;margin:0 0 10px;border:1px solid var(--line);border-radius:22px;background:var(--card)}
main{flex:1;padding:10px 12px calc(40px + env(safe-area-inset-bottom));max-width:760px;width:100%;margin:0 auto}
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
.fl.fb{background:var(--redbg);color:var(--red)}.fl.fi{background:var(--accbg);color:var(--acc)}.fl.fw{background:var(--ambbg);color:var(--amb)}
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
.slot{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:10px 12px;margin-bottom:8px}
.slot .top{gap:10px}
.slot .tm{font-variant-numeric:tabular-nums;font-weight:700;min-width:46px;font-size:17px}
.slot .who{color:var(--mute);font-size:13px;margin-inline-start:auto}
.slot a.ph{color:var(--acc);text-decoration:none;min-height:44px;display:inline-flex;align-items:center}
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
.tiles{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.tile{display:flex;flex-direction:column;gap:2px;text-align:start;min-height:104px;padding:12px;border:1px solid var(--line);border-radius:16px;background:var(--card);cursor:pointer}
.tile .tr{display:flex;align-items:center;justify-content:space-between}
.tile .ti{font-size:24px;line-height:1.2}
.tile .tn{font-size:26px;font-weight:700;line-height:1.1;font-variant-numeric:tabular-nums}
.tile.z .tn{color:var(--mute)}
.tile .tt{font-weight:700;margin-top:4px}
.tile .ts{font-size:12.5px;color:var(--mute)}
.first{background:var(--accbg);border:1px solid var(--acc);border-radius:14px;padding:12px;margin:0 0 10px;display:flex;flex-direction:column;gap:8px}
.first .b{background:var(--acc);color:var(--bg);border-color:var(--acc)}
.sec{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:12px;margin:10px 0}
.sec h2{margin:0 0 8px}
.sec p{margin:8px 0}
.sec input[type=text],.sec select{width:100%;height:44px;border:1px solid var(--line);border-radius:10px;padding:0 10px;background:var(--card)}
.wide{width:100%}
.roles{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.role{display:flex;flex-direction:column;align-items:flex-start;gap:2px;text-align:start;min-height:96px;padding:12px;border:2px solid var(--line);border-radius:14px;background:var(--card);cursor:pointer}
.role.on{border-color:var(--acc);background:var(--accbg)}
.role .ri{font-size:26px;line-height:1.2}
.role b{font-size:17px}
.gr{display:flex;align-items:center;gap:6px;min-height:52px;border-bottom:1px solid var(--line)}
.gr:last-child{border-bottom:0}
.gr label,.chk{display:flex;align-items:center;gap:10px;min-height:48px;cursor:pointer}
.gr label{flex:1}
.ch input[type=checkbox]{width:22px;height:22px;flex:none;accent-color:var(--acc)}
details.tp{border-top:1px solid var(--line)}
details.tp>summary{display:flex;align-items:center;justify-content:space-between;min-height:48px;cursor:pointer;list-style:none}
details.tp>summary::-webkit-details-marker{display:none}
details.tp>summary .chev{color:var(--mute);transition:transform .15s}
details.tp[open]>summary .chev{transform:rotate(180deg)}
details.tp textarea,textarea.fb{width:100%;min-height:150px;border:1px solid var(--line);border-radius:12px;padding:10px;background:var(--card);resize:vertical}
textarea.fb{min-height:100px;margin-bottom:8px}
.foot{margin:10px 2px}
.btns.two{grid-template-columns:1fr 1fr}
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
.lnk{background:none;border:0;color:var(--acc);cursor:pointer;padding:10px 0;font-size:14px;min-height:44px}
.toast{position:fixed;bottom:24px;inset-inline:16px;z-index:10;background:var(--ink);color:var(--bg);border-radius:12px;padding:10px 14px;text-align:center;font-size:14px}
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
try { ['chv_base_v2', 'chv_tab', 'chv_mine'].forEach(k => localStorage.removeItem(k)); } catch (e) { }   // מפתחות ישנים, כבר לא בשימוש
const byKey = {}; d.leads.forEach(l => byKey[l.key] = l);
let me = LS.get('chv_me_v2', null);           // {id, name, sign}
if (!me || !me.name) me = null;
let done = LS.get('chv_done_v2', {});         // key -> {t, o}
if (!done || typeof done !== 'object') done = {};
{ const ks = Object.keys(done); ks.forEach(k => { if (!done[k] || now - done[k].t >= 16 * 36e5) delete done[k]; }); if (Object.keys(done).length !== ks.length) LS.set('chv_done_v2', done); }
const settings = loadSettings();
const saveSettings = () => LS.set(SKEY, settings);
const tplOf = k => { const v = LS.get('chv_tpl_v3_' + k, null); return typeof v === 'string' && v.trim() ? v : TPL[k][1]; };
const tpls = () => Object.assign({}, ...Object.keys(TPL).map(k => ({ [k]: tplOf(k) })));
const st = { screen: 'home', group: '', f: null, hq: '', hqd: '' };
const byHandler = l => !!me && ((me.id != null && l.handlerId != null && String(l.handlerId) === String(me.id)) || samePerson(l.handler, me.name));
const byInterviewer = l => !!me && samePerson(l.ivWho, me.name);
const isMine = l => settings.role === 'tel' ? byHandler(l) : settings.role === 'int' ? byInterviewer(l) : byHandler(l) || byInterviewer(l);
const isFree = l => settings.role === 'tel' ? !l.handler : settings.role === 'int' ? !l.ivWho : !l.handler && !l.ivWho;
const mineSlot = s => !!me && (samePerson(s.who, me.name) || (me.id != null && s.whoId != null && String(s.whoId) === String(me.id)));
const mineCount = () => d.leads.filter(l => !l.nr && isMine(l)).length;   // רק לידים פעילים, בלי מי שיצא מהרשימה
let mineN = mineCount();                      // כמה לידים "שלי". אם אפס, "רק שלי" לא נדלק (אחרת כל קבוצה הייתה מציגה "אין כרגע" בטעות)
const defF = id => ({ tech: id === 'new' && settings.techDefault, mine: id !== 'weekIv' && !!me && settings.mineOnly && mineN > 0, q: '', qd: '' });
const digitsQ = q => {
if (/[^\d\s+().-]/.test(q)) return '';
const raw = q.replace(/\D/g, '');
if (raw.length < 3) return '';
const s = raw.replace(/^(00)?972/, '0');
return s.length > 1 ? s : '';
};
const qOkF = (l, f) => !f.q || (l.name + ' ' + l.phone + ' ' + l.inst + ' ' + l.ivWho + ' ' + l.handler).includes(f.q) || (!!f.qd && l.phone.includes(f.qd));
const passF = (l, f, ignoreMine) => (!settings.hideFr || !l.fr) && (!f.tech || l.tech) && (ignoreMine || !f.mine || !me || isMine(l) || isFree(l)) && qOkF(l, f);
const doneToday = l => { const x = done[l.key]; return x && now - x.t < 16 * 36e5 ? x : null; };
const instTag = l => l.tech ? '<span class="tag t">לומד/ת בטכניון</span>' : l.inst ? `<span class="tag">${esc(l.inst)}</span>` : '';
const showH = () => !(st.screen === 'group' && st.f && st.f.mine);
const extraTags = l => (l.isNew ? '<span class="tag g">חדש</span>' : '') + (l.was ? `<span class="tag a">היה: ${esc(l.was)}</span>` : '') +
(l.dup ? '<span class="tag a">מופיע/ה פעמיים</span>' : '') +
(showH() && l.handler ? `<span class="tag">מטפל/ת: ${esc(l.handler)}</span>` : '') +
(!showH() && isFree(l) && !isMine(l) ? `<span class="tag">${settings.role === 'int' ? 'עוד בלי מראיין' : 'בלי גורם מטפל'}</span>` : '');
const y3 = l => l && Y3.test(l.remark) ? '<div class="fl fi">ℹ️ שנה שלישית: כנראה לא נוכל לשלוח קישור לרישום (צריך אישור חריג), אבל כן מראיינים.</div>' : '';
const personLine = l => [l.age ? 'גיל ' + l.age : '', l.city ? 'מ' + l.city : '', l.inst].filter(Boolean).join(' · ');
const rem = l => l.remark ? `<details class="rem"><summary>📝 ${esc(l.remark.split('\n')[0])}</summary><div>${esc(l.remark)}</div></details>` : '';
function card(l, whyHtml, tpl, fl, meta) {
fl = fl || flag(l);
const dn = doneToday(l), off = fl.f === 'block' ? ' off' : '';
const cls = (fl.f === 'block' ? ' block' : fl.f === 'warn' ? ' warn2' : '') + (dn ? ' done' : '');
return `<div class="row${cls}"><div class="top"><span class="nm">${esc(l.name)}</span>${instTag(l)}${extraTags(l)}</div>
${whyHtml ? `<div class="why">${whyHtml}</div>` : ''}
${meta ? `<div class="meta">${meta}</div>` : ''}
${fl.f ? `<div class="fl ${fl.f === 'block' ? 'fb' : 'fw'}">${fl.f === 'block' ? '⛔ לא לפנות כרגע: ' : '⚠️ בזהירות: '}${esc(fl.why)}</div>` : ''}
${dn ? `<div class="dn">✓ סימנת ${dm(new Date(dn.t))} ${hm(new Date(dn.t))}: ${esc(dn.o)}</div>` : ''}
${y3(l)}${rem(l)}
<div class="btns">${l.phone ? `<a class="b call${off}" href="tel:${esc(l.phone)}" data-guard="${fl.f === 'block' ? esc(fl.why) : ''}">📞 התקשר</a>
<button class="b msg${off}" data-msg="${esc(l.key)}" data-tpl="${tpl}" data-guard="${fl.f === 'block' ? esc(fl.why) : ''}">💬 הודעה</button>` :
'<span class="b off">אין טלפון</span><span></span>'}
<button class="b" data-done="${esc(l.key)}">${dn ? '↩︎ בטל' : '✓ טופל'}</button></div></div>`;
}
const list = (arr, fn, empty) => arr.length ? arr.map(fn).join('') : `<div class="empty">${empty || 'אין כרגע 👍'}</div>`;
const emptyH = '<div class="empty">אין כרגע 👍</div>';
const PRI = { acc: 1, new: 2, ivNoDate: 3, noans: 4, later: 5 };   // לפי העדיפות ב-queueOf
const accWhy = l => `<span class="tag ${l.reg === 'טרם התחבר' ? 'r' : 'a'}">${esc(l.reg)}</span> ` + (l.accepted ? 'התקבל/ה ' + dm(l.accepted) + ' (' + agoTxt(l.accepted) + ')' : l.ivAt ? 'רואיין/ה ' + dm(l.ivAt) : '');
function leadItems(id, f, ignoreMine) {
const L = d.leads.filter(l => !l.nr && passF(l, f, ignoreMine));
if (id === 'ivPast') {
const lim = new Date(now - 2 * 36e5);
return L.filter(l => l.status === IV && l.ivAt && l.ivAt < lim).sort((a, b) => a.ivAt - b.ivAt).map(l => ({
l, tpl: 'free', fl: flag(l),
why: 'ראיון ' + WD[l.ivAt.getDay()] + ' ' + dm(l.ivAt) + ' ' + hm(l.ivAt) + (l.ivWho ? ' · ' + l.ivWho : '') + (l.ivDone ? ' · ' + l.ivDone : '')
}));
}
const a = queueOf(L).filter(x => x.p === PRI[id]);
if (id === 'new') a.sort((x, y) => (x.fl.f === 'block') - (y.fl.f === 'block') || (y.l.tech - x.l.tech) || ((y.l.created || 0) - (x.l.created || 0)));
if (id === 'acc') a.forEach(x => { x.html = accWhy(x.l); });
if (id === 'noans') a.forEach(x => { x.why = 'אין מענה'; x.meta = x.l.sub; });
return a;
}
const orphOf = () => [];
function ivDays(id, f) {
const win = d.slots.filter(s => s.at && s.at >= today && s.at < addDays(today, 8) && (id === 'weekIv' ? !f.mine || mineSlot(s) : mineSlot(s))).sort((a, b) => a.at - b.at);
const people = !!(f.tech || f.q), days = {};
win.forEach(s => {
const k = +day0(s.at), D = days[k] = days[k] || { k, rows: [], free: 0 };
if (!s.names.length) { if (!people) D.free++; return; }
s.names.forEach((n, i) => {
const l = byKey[s.keys[i]];
if (f.tech && !(l && l.tech)) return;
if (settings.hideFr && l && l.fr) return;
if (f.q && !(n + ' ' + s.who + ' ' + (l ? l.phone : '')).includes(f.q) && !(f.qd && l && l.phone.includes(f.qd))) return;
D.rows.push({ s, l, n });
});
});
return Object.keys(days).map(k => days[k]).filter(D => D.rows.length || D.free).sort((a, b) => a.k - b.k);
}
function chData(f, ignoreMine) {
const L = d.leads.filter(l => passF(l, f, ignoreMine));
return {
L, newer: L.filter(l => l.isNew && !l.nr), regNow: L.filter(l => l.regNow && !l.nr),
left: L.filter(l => l.nr && l.was && !NR_NAMES.includes(l.was)),
gone: !f.mine && !f.tech && !f.q && d.gone ? d.gone.length : 0
};
}
const cardX = x => card(x.l, x.html || esc(x.why), x.tpl, x.fl, esc(x.meta || ''));
const closedBox = arr => arr.length ? `<details class="grp"><summary>✓ סימנת היום <span class="n">${arr.length}</span></summary><div>${arr.map(cardX).join('')}</div></details>` : '';
const orphBox = cards => cards.length ? `<details class="grp"><summary>בלי גורם מטפל <span class="n">${cards.length}</span></summary><div><div class="note">לידים שעוד אין להם מטפל או מראיין, ולכן לא נכללים ב"רק שלי".</div>${cards.join('')}</div></details>` : '';
function leadView(id, f) {
const all = leadItems(id, f), open = all.filter(x => !doneToday(x.l)), closed = all.filter(x => doneToday(x.l)), orph = orphOf(id, f);
let h = '', blk = false;
open.forEach(x => {
if (x.fl.f === 'block' && !blk) { blk = true; h += `<h2>⛔ לא לפנות כרגע <span class="n">${open.filter(y => y.fl.f === 'block').length}</span></h2>`; }
h += cardX(x);
});
return { n: open.length, html: (h || emptyH) + closedBox(closed.concat(orph.filter(x => doneToday(x.l)))) + orphBox(orph.filter(x => !doneToday(x.l)).map(cardX)) };
}
function accView(f) {
const acc = d.leads.filter(l => l.status === ACC), W = l => l.ivWho || '(לא ידוע מי ראיין)';
const all = leadItems('acc', f), open = all.filter(x => !doneToday(x.l)), closed = all.filter(x => doneToday(x.l)), orph = orphOf('acc', f);
const stats = {};
acc.forEach(l => { const s = stats[W(l)] = stats[W(l)] || { all: 0, st: 0 }; s.all++; if (!l.registered) s.st++; });
const groups = {};
open.forEach(x => (groups[W(x.l)] = groups[W(x.l)] || []).push(x));
const rank = fl => fl === 'block' ? 2 : fl === 'warn' ? 1 : 0;
const isMe = n => !!me && samePerson(n, me.name);   // הקבוצה של המשתמש עצמו אחרונה
const names = Object.keys(groups).sort((a, b) => isMe(a) - isMe(b) || groups[b].length - groups[a].length);
const sum = acc.length, reg = acc.filter(l => l.registered).length;
const h = names.map(n => {
const arr = groups[n].sort((a, b) => rank(a.fl.f) - rank(b.fl.f) || (b.l.tech - a.l.tech) || ((a.l.accepted || 0) - (b.l.accepted || 0)));
return `<details class="grp"${names.length === 1 ? ' open' : ''}><summary>${esc(n)} <span class="n">${arr.length} מתוך ${stats[n] ? stats[n].all : arr.length}</span></summary><div>${arr.map(cardX).join('')}</div></details>`;
}).join('');
return {
n: open.length,
html: `<div class="note">${sum} התקבלו השנה · ${reg} נרשמו סופית · ${sum - reg} עוד לא (${sum ? Math.round(100 * (sum - reg) / sum) : 0}%).</div>` +
(h || emptyH) + closedBox(closed.concat(orph.filter(x => doneToday(x.l)))) + orphBox(orph.filter(x => !doneToday(x.l)).map(cardX)) +
`<h2>לפי מראיין <span class="n">בסיס ואחוז, לא רק מספר</span></h2><table><tr><th>מראיין</th><th>התקבלו</th><th>לא נרשמו</th><th>%</th></tr>` +
Object.keys(stats).sort((a, b) => stats[b].all - stats[a].all).map(n => {
const s = stats[n]; return `<tr><td>${esc(n)}</td><td>${s.all}</td><td>${s.st}</td><td>${Math.round(100 * s.st / s.all)}%${s.all < 4 ? ' <span class="small">(בסיס קטן)</span>' : ''}</td></tr>`;
}).join('') + '</table>'
};
}
function ivRow(r, showWho) {
const { s, l, n } = r, fl = l ? flag(l) : { f: '', why: '' }, blk = fl.f === 'block', g = blk ? esc(fl.why) : '';
return `<div class="slot"><div class="top"><span class="tm">${hm(s.at) || '--:--'}</span><span class="nm">${esc(n)}</span>${l && l.tech ? '<span class="tag t">טכניון</span>' : ''}${l && l.phone ? `<a class="ph" href="tel:${esc(l.phone)}">${esc(l.phone)}</a>` : ''}${showWho && s.who ? `<span class="who">${esc(s.who)}</span>` : ''}</div>
${l && personLine(l) ? `<div class="meta">${esc(personLine(l))}</div>` : ''}
${fl.f ? `<div class="fl ${blk ? 'fb' : 'fw'}">${blk ? '⛔ לא לפנות כרגע: ' : '⚠️ בזהירות: '}${esc(fl.why)}</div>` : ''}
${l ? y3(l) + rem(l) : ''}
<div class="btns">${l && l.phone ? `<a class="b call${blk ? ' off' : ''}" href="tel:${esc(l.phone)}" data-guard="${g}">📞 התקשר</a>
<button class="b msg${blk ? ' off' : ''}" data-msg="${esc(l.key)}" data-tpl="${+day0(s.at) === +today ? 'ivday' : 'ivr'}" data-at="${+s.at}" data-guard="${g}">${+day0(s.at) === +today ? '💬 יום הראיון' : '💬 תזכורת'}</button>` : '<span class="b off">אין טלפון</span><span></span>'}
<button class="b" data-cal="${esc(l ? l.key : '')}" data-at="${+s.at}" data-n="${esc(n)}">📆 ליומן</button></div></div>`;
}
function ivView(id, f) {
if (id === 'myIv' && !me) return { n: 0, html: '<div class="note">כדי לראות את הראיונות שלך צריך קודם לבחור מי אני. <button class="lnk" data-go="settings">⚙ הגדרות</button></div>' };
const days = ivDays(id, f);
const h = days.map(D => {
const dd = new Date(D.k), lbl = D.k === +today ? 'היום' : D.k === +addDays(today, 1) ? 'מחר' : 'יום ' + WD[dd.getDay()];
return `<div class="day">${lbl} ${dm(dd)} <span class="n">${D.rows.length} ראיונות${D.free ? ' · ' + D.free + ' משבצות פנויות' : ''}</span></div>` + D.rows.map(r => ivRow(r, id === 'weekIv')).join('');
}).join('');
return {
n: days.reduce((a, D) => a + D.rows.length, 0),
html: (d.noIvFile ? '<div class="note">מתוך "מועד ראיון" בקובץ הלידים. לשמות המראיינים צריך לצרף גם את קובץ הראיונות.</div>' : '') + (h || emptyH)
};
}
function changesView(f) {
const c = chData(f), base = d.base, n = c.newer.length + c.regNow.length + c.left.length + c.gone;
if (!base) return { n, html: '<div class="note">בפעם הבאה שתפתח/י את הכלי, כאן יופיע מה השתנה מאז הפעם הזאת (מי נכנס, מי נרשם, מי יצא או נעלם מהרשימה).</div>' };
const cNew = l => card(l, esc(l.status), 'new'), cReg = l => card(l, esc(l.status), 'free', { f: '', why: '' });
const cLeft = l => card(l, 'היה: ' + esc(l.was) + ' ← ' + esc(l.status) + (l.sub ? ' (' + esc(l.sub) + ')' : ''), 'free', { f: '', why: '' });
const since = dm(new Date(base.at)) + ' ' + hm(new Date(base.at));
let h = `<h2>מה השתנה מאז ${since}</h2>
<div class="note">${c.newer.length} לידים חדשים · ${c.L.filter(l => l.was && !l.nr).length} שינו סטטוס · ${c.regNow.length} נרשמו · ${c.left.length + c.gone} יצאו או נעלמו מהרשימה</div>
<div class="small" style="margin:0 2px 8px">ההשוואה מתחדשת רק אחרי הפסקה של יותר מ-6 שעות בין פתיחות, כדי שהסימונים יישארו לאורך היום.</div>` +
(c.regNow.length ? `<details class="grp" open><summary>נרשמו מאז <span class="n">${c.regNow.length}</span></summary><div>${c.regNow.map(cReg).join('')}</div></details>` : '') +
(c.left.length ? `<details class="grp" open><summary>יצאו מהרשימה (הפסד / פסילה) <span class="n">${c.left.length}</span></summary><div>${c.left.map(cLeft).join('')}</div></details>` : '') +
(c.gone ? `<div class="note">עוד ${c.gone} לידים שהיו ברשימה בפעם הקודמת כבר לא בנתונים (יצאו מהרשימה או נמחקו). אין עליהם פרטים.</div>` : '') +
(c.newer.length ? `<details class="grp"><summary>לידים חדשים <span class="n">${c.newer.length}</span></summary><div>${c.newer.map(cNew).join('')}</div></details>` : '');
return { n, html: h };
}
const groupView = (id, f) => id === 'myIv' || id === 'weekIv' ? ivView(id, f) : id === 'acc' ? accView(f) : id === 'changes' ? changesView(f) : leadView(id, f);
function tileOf(id) {
const f = Object.assign(defF(id), { tech: false });
let sub = GSUB[id];
if (id === 'new') sub = leadItems('new', f).filter(x => !doneToday(x.l) && x.l.tech).length + ' מהטכניון';
else if (id === 'myIv' && !me) sub = 'צריך קודם לבחור מי אני';
return { n: groupView(id, f).n, sub };
}
const srcLine = () => `${esc(d.source)} · ${dm(d.at)} ${hm(d.at)}${d.year ? ' · ' + esc(d.year) : ''}${me ? ' · ' + esc(me.name) : ''}${settings.role ? ' · ' + ROLES[settings.role][1] : ''}`;
el.innerHTML = '<div class="ch"><div class="hd"></div><main></main></div>';
const root = el.querySelector('.ch'), hd = root.querySelector('.hd'), main = root.querySelector('main');
const toast = t => { const x = document.createElement('div'); x.className = 'toast'; x.textContent = t; root.appendChild(x); setTimeout(() => x.remove(), 3200); };
function showScreen() {
now = new Date(); today = day0(now);
const sc = st.screen, g = st.group;
const title = sc === 'home' ? 'רישום חברותא' : sc === 'settings' ? 'הגדרות' : `${GROUPS[g][0]} ${esc(GROUPS[g][1])} <span class="n" data-cnt></span>`;
hd.className = sc === 'group' ? 'hd sub' : 'hd';   // במסך קבוצה בטלפון הכותרת (שם + מספר) יורדת לשורה משלה
hd.innerHTML = `<div class="hd1">${sc === 'home' ? '' : '<button class="ib bk" data-back>→ חזרה</button>'}<h1>${title}</h1><span class="ibs">${sc === 'settings' ? '' : '<button class="ib" data-go="settings" title="הגדרות">⚙</button>'}${opt.onReload ? '<button class="ib" data-reload title="רענון">⟳</button>' : ''}${opt.onClose ? '<button class="ib" data-x title="סגירה">✕</button>' : ''}</span></div>` +
(sc === 'home' ? `<div class="src">${srcLine()}</div>` : '');
if (sc === 'home') {
main.innerHTML = (d.warn || []).map(w => `<div class="warn">${esc(w)}</div>`).join('') +
`<input class="srch" type="search" data-q="h" placeholder="חיפוש שם או טלפון" autocomplete="off" value="${esc(st.hq)}"><div class="hb"></div>`;
} else if (sc === 'group') {
const f = st.f;
main.innerHTML = `<div class="chips"><button class="chip${f.tech ? ' on' : ''}" data-tech aria-pressed="${f.tech}">🎓 רק טכניון</button>${me && g !== 'myIv' ? `<button class="chip${f.mine ? ' on' : ''}" data-mine aria-pressed="${f.mine}">👤 רק שלי</button>` : ''}</div>
<input class="srch" type="search" data-q="g" placeholder="חיפוש בקבוצה" autocomplete="off" value="${esc(f.q)}"><div class="gb"></div>`;
} else {
main.innerHTML = settingsHtml();
wireSettings();
}
draw();
}
function draw() {
now = new Date(); today = day0(now);
if (st.screen === 'home') drawHome();
else if (st.screen === 'group') drawGroup();
}
function drawHome() {
const box = main.querySelector('.hb');
if (st.hq) {
const L = d.leads.filter(l => qOkF(l, { q: st.hq, qd: st.hqd }));
box.innerHTML = `<h2>לידים שמתאימים לחיפוש <span class="n">${L.length}</span></h2>` + (L.length > 60 ? `<div class="note">מוצגים 60 מתוך ${L.length}. אפשר לדייק את החיפוש.</div>` : '') +
list(L.slice(0, 60), l => card(l, esc(l.status) + (l.sub ? ' · ' + esc(l.sub) : ''), 'free'), 'לא נמצאו לידים מתאימים');
return;
}
box.innerHTML = (!me || !settings.role ? '<div class="first"><b>הגדרה ראשונה: מי את/ה ומה התפקיד?</b><button class="b" data-go="settings">להגדרות</button></div>' : '') +
`<div class="tiles">${settings.home.map(id => {
const x = tileOf(id);
return `<button class="tile${x.n ? '' : ' z'}" data-g="${id}"><span class="tr"><span class="ti">${GROUPS[id][0]}</span><span class="tn">${x.n}</span></span><span class="tt">${esc(GROUPS[id][1])}</span><span class="ts">${esc(x.sub)}</span></button>`;
}).join('')}</div>`;
}
function drawGroup() {
const r = groupView(st.group, st.f);
main.querySelector('.gb').innerHTML = r.html;
hd.querySelector('[data-cnt]').textContent = r.n;
}
function sheet(html, wire, canClose) {
const s = document.createElement('div'); s.className = 'sheet';
s.innerHTML = `<div class="sh">${html}</div>`;
s._can = canClose;   // גם כפתור Back של הדפדפן שואל אותה לפני סגירה
s.onclick = e => { if ((e.target === s || e.target.closest('[data-close]')) && (!canClose || canClose())) s.remove(); };
root.appendChild(s); wire(s); return s;
}
const people = () => {
const ppl = {};
Object.entries(d.users || {}).forEach(([id, n]) => { if (d.leads.some(l => String(l.handlerId) === id || String(l.ivWhoId) === id)) ppl[n] = +id; });
d.leads.forEach(l => { if (l.handler && !(l.handler in ppl)) ppl[l.handler] = null; if (l.ivWho && !(l.ivWho in ppl)) ppl[l.ivWho] = null; });
return ppl;
};
const idHtml = () => `<div class="small">לחתימה בהודעות ולסינון "רק שלי" (לידים שאת/ה מטפל/ת בהם או שראיינת). נשמר רק במכשיר הזה.</div>
<p><select data-pick><option value="">בחירה מהרשימה…</option>${Object.keys(people()).sort().map(n => `<option${me && me.name === n ? ' selected' : ''}>${esc(n)}</option>`).join('')}</select></p>
<p><input type="text" data-sign placeholder="איך לחתום בהודעה (למשל: דנה)" value="${esc(me && me.sign || '')}"></p>
<button class="b msg wide" data-idok>שמירה</button>`;
function idWire(scope, after) {
const pk = scope.querySelector('[data-pick]'), sg = scope.querySelector('[data-sign]'), ppl = people();
let auto = '';
pk.onchange = () => { if (!sg.value || sg.value === auto) sg.value = auto = firstOf(pk.value); };
scope.querySelector('[data-idok]').onclick = () => {
const n = pk.value || sg.value.trim(); if (!n) return;
const had = mineN;   // כמה לידים היו על שם הזהות הקודמת (אפס גם כשלא הייתה זהות)
me = { name: n, id: ppl[n] || null, sign: sg.value.trim() || firstOf(n) };
LS.set('chv_me_v2', me);
mineN = mineCount();
if (!mineN) { settings.mineOnly = false; saveSettings(); toast('לא נמצאו לידים על שמך, "רק שלי" נשאר כבוי'); }
else if (!had && !settings.mineOnly) { settings.mineOnly = true; saveSettings(); }   // היה כבוי רק כי לא נמצאו לידים, ועכשיו יש
after(!!mineN);
};
}
const afterId = () => { if (st.screen === 'settings') fillOpts(); else showScreen(); };
function setMe(next) {
sheet(`<h3><span>מי את/ה?</span><button class="ib" data-close>✕</button></h3>${idHtml()}`, s => idWire(s, () => {
s.remove(); afterId(); if (next) next();
}));
}
function settingsHtml() {
return `<div class="sec"><h2>אני</h2><div data-sec="me">${idHtml()}</div></div>
<div class="sec"><h2>התפקיד שלי</h2><div class="roles">${Object.keys(ROLES).map(r => `<button class="role${settings.role === r ? ' on' : ''}" data-role="${r}" aria-pressed="${settings.role === r}"><span class="ri">${ROLES[r][0]}</span><b>${ROLES[r][1]}</b><span class="small">${ROLES[r][2]}</span></button>`).join('')}</div></div>
<div class="sec"><h2>מה מופיע במסך הבית</h2><div data-sec="groups"></div></div>
<div class="sec" data-sec="opts"></div>
<div class="sec"><h2>נוסחי ההודעות</h2><div class="small" style="margin-bottom:6px">{שם} = השם הפרטי · {אני} = החתימה שלך · {מועד} = יום ושעת הראיון</div>${Object.keys(TPL).map(k => `<details class="tp" data-tp="${k}"><summary><span>${esc(TPL[k][0])}</span><span class="chev">⌄</span></summary><textarea></textarea><div class="btns two"><button class="b msg" data-tsave="${k}">שמירה</button><button class="b" data-treset="${k}">החזרה למקור</button></div></details>`).join('')}</div>
<div class="sec"><h2>הערה על הכלי</h2><div class="small" style="margin-bottom:6px">משהו לא עובד, חסר או מבלבל? לכתוב כאן ולשלוח בוואטסאפ.</div><textarea class="fb" data-fb placeholder="מה כדאי לשפר?"></textarea><a class="b msg wide" data-fbsend target="_blank" rel="noopener" href="#">💬 שליחת ההערה בוואטסאפ</a></div>
<div class="small foot">ההגדרות, הסימונים והנוסחים נשמרים רק בטלפון הזה.</div>
<div class="small foot">${d.leads.length} לידים בנתונים · הכלי רק קורא, לא משנה כלום באתר ולא שולח נתונים לשום מקום.</div>`;
}
const grRow = (g, on, i, n) => `<div class="gr"><label><input type="checkbox" data-gchk="${g}"${on ? ' checked' : ''}><span>${GROUPS[g][0]} ${esc(GROUPS[g][1])}</span></label>${on ? `<button class="ib" data-up="${g}" aria-label="הזזה למעלה"${i === 0 ? ' disabled' : ''}>▲</button><button class="ib" data-dn="${g}" aria-label="הזזה למטה"${i === n - 1 ? ' disabled' : ''}>▼</button>` : ''}</div>`;
function fillGroups() {
const box = main.querySelector('[data-sec=groups]'); if (!box) return;
const en = settings.home;
box.innerHTML = en.map((g, i) => grRow(g, true, i, en.length)).join('') + GIDS.filter(g => !en.includes(g)).map(g => grRow(g, false)).join('');
}
function fillOpts() {
const box = main.querySelector('[data-sec=opts]'); if (!box) return;
box.innerHTML = `<label class="chk"><input type="checkbox" data-opt="techDefault"${settings.techDefault ? ' checked' : ''}><span>בלידים חדשים, להתחיל עם 'רק טכניון'</span></label>
<label class="chk"><input type="checkbox" data-opt="hideFr"${settings.hideFr ? ' checked' : ''}><span>להסתיר עולים מצרפת (מסלול נפרד)</span></label>
<label class="chk"><input type="checkbox" data-opt="mineOnly"${settings.mineOnly ? ' checked' : ''}${me ? '' : ' disabled'}><span>בקבוצות, להתחיל עם 'רק שלי'${me ? '' : ' <span class="small">(קודם לבחור מי אני)</span>'}</span></label>`;
}
function wireSettings() {
idWire(main.querySelector('[data-sec=me]'), matched => { if (matched) toast('נשמר'); fillOpts(); });
fillGroups(); fillOpts();
const T = tpls();
main.querySelectorAll('[data-tp]').forEach(x => { x.querySelector('textarea').value = T[x.dataset.tp]; });
}
function setRole(r) {
settings.role = r; settings.home = HOME_BY_ROLE[r].slice(); saveSettings();
mineN = mineCount();
main.querySelectorAll('[data-role]').forEach(b => { const on = b.dataset.role === r; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
fillGroups();
toast('מסך הבית עודכן לפי התפקיד');
}
function moveGroup(id, dir) {
const h = settings.home, i = h.indexOf(id), j = i + dir;
if (i < 0 || j < 0 || j >= h.length) return;
[h[i], h[j]] = [h[j], h[i]];
saveSettings(); fillGroups();
}
function saveTpl(k, ta) {
const v = ta.value;
try {
if (!v.trim()) { localStorage.removeItem('chv_tpl_v3_' + k); ta.value = TPL[k][1]; toast('הנוסח היה ריק, הוחזר למקור'); }
else { if (v === TPL[k][1]) localStorage.removeItem('chv_tpl_v3_' + k); else LS.set('chv_tpl_v3_' + k, v); toast('הנוסח נשמר'); }
} catch (e) { toast('השמירה נכשלה'); }
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
function whenTxt(l, at) {
const n = new Date(), t0 = day0(n);
let a = at ? new Date(at) : null;
if (!a && l.ivAt && (hm(l.ivAt) ? l.ivAt > n : day0(l.ivAt) >= t0)) a = l.ivAt;
if (!a) return '(יום ושעה)';
const k = +day0(a), t = hm(a);
return (k === +t0 ? 'היום' : k === +addDays(t0, 1) ? 'מחר' : 'ביום ' + WD[a.getDay()] + ' ' + dm(a)) + (t ? ' בשעה ' + t : '');
}
function msgSheet(l, tpl, at) {
if (!me) return setMe(() => msgSheet(l, tpl, at));
const T = tpls(), first = l.first || l.name.split(' ')[0], when = whenTxt(l, at);
const fill = k => fillTpl(T[k], first, me.sign, when);
const num = '972' + l.phone.replace(/^0/, '');
let k = tpl, filled = '', ta = null;   // filled = הנוסח שמולא בפעם האחרונה, כדי לזהות עריכה ידנית
const can = () => !ta || ta.value === filled || confirm('לסגור בלי לשלוח? הטקסט שערכת יימחק');
sheet(`<h3><span>הודעה ל${esc(l.name)}</span><button class="ib" data-close>✕</button></h3>
<div class="chips">${Object.keys(TPL).map(k => `<button class="chip${k === tpl ? ' on' : ''}" data-k="${k}">${esc(TPL[k][0])}</button>`).join('')}</div>
<textarea></textarea>
<div class="btns"><a class="b msg" data-wa target="_blank" rel="noopener">וואטסאפ</a><a class="b" data-sms>SMS</a></div>
<button class="lnk" data-cfg>✏️ לערוך את הנוסח הזה (נשמר רק אצלך)</button>
<div class="small">ההודעה לא נשלחת מכאן. נפתח וואטסאפ עם הטקסט, ושם לוחצים "שלח".</div>`, s => {
ta = s.querySelector('textarea');
const wa = s.querySelector('[data-wa]'), sms = s.querySelector('[data-sms]');
const upd = () => {
wa.href = 'https://wa.me/' + num + '?text=' + encodeURIComponent(ta.value);
sms.href = 'sms:' + l.phone + '?&body=' + encodeURIComponent(ta.value);
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
s.querySelector('[data-cfg]').onclick = () => {
if (!can()) return;
s.remove(); go('settings');
const det = main.querySelector('[data-tp="' + k + '"]');
if (det) { det.open = true; det.scrollIntoView({ block: 'center' }); }
};
choose(k);
}, can);
}
const icsT = x => x.getFullYear() + pad(x.getMonth() + 1) + pad(x.getDate()) + 'T' + pad(x.getHours()) + pad(x.getMinutes()) + '00';
const icsEsc = t => String(t).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
const icsFold = line => (line.match(/.{1,40}/gu) || ['']).join('\r\n ');   // שורות קצרות (עברית = 2 בתים לתו)
function calSheet(key, at, n) {
const l = byKey[key] || null;
const s = d.slots.find(x => x.at && +x.at === at && (!l || x.keys.includes(key))) || { who: '', dir: '', link: '', end: null };
const start = new Date(at), end = s.end && s.end > start ? s.end : new Date(at + 20 * 6e4);
const title = 'ראיון דרך עמ"י: ' + (l ? l.name : n);
const lines = [];
const first = l ? (l.first || l.name.split(' ')[0]) : String(n).split(' ')[0];
const dayMsg = fillTpl(tpls().ivday, first, me ? me.sign : '', 'היום בשעה ' + hm(start));
if (l && personLine(l)) lines.push(personLine(l));
if (l && l.phone) lines.push('טלפון: ' + l.phone, 'וואטסאפ עם הודעת יום הראיון: https://wa.me/972' + l.phone.replace(/^0/, '') + '?text=' + encodeURIComponent(dayMsg));
if (s.who) lines.push('מראיין: ' + s.who);
if (s.dir) lines.push('הנחיות: ' + s.dir);
if (s.link) lines.push('קישור: ' + s.link);
if (l && Y3.test(l.remark)) lines.push('שנה שלישית: כנראה לא נוכל לשלוח קישור לרישום, אבל כן מראיינים.');
if (l && l.remark) lines.push('', 'הערה בליד: ' + l.remark);
const details = lines.join('\n');
const gcal = 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(title) +
'&dates=' + icsT(start) + '/' + icsT(end) + '&ctz=Asia/Jerusalem&details=' + encodeURIComponent(details) +
(s.link ? '&location=' + encodeURIComponent(s.link) : '');
sheet(`<h3><span>📆 ${esc(title)}</span><button class="ib" data-close>✕</button></h3>
<div class="small" style="margin-bottom:10px">יום ${WD[start.getDay()]} ${dm(start)}, ${hm(start)}-${hm(end)}${s.who ? ' · ' + esc(s.who) : ''}</div>
<div class="btns two"><a class="b msg" target="_blank" rel="noopener" href="${esc(gcal)}">יומן Google</a><button class="b" data-ics>קובץ ליומן (אייפון / אחר)</button></div>
<div class="small">ביומן Google נפתח אירוע מוכן, ולוחצים "שמירה". הקובץ נפתח ביומן של הטלפון.</div>`, sh => {
sh.querySelector('[data-ics]').onclick = () => {
const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//chavruta-tool//he', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT',
'UID:chv-' + (key || 'x') + '-' + at + '@chavruta-tool',
'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, ''),
'DTSTART:' + icsT(start), 'DTEND:' + icsT(end), 'SUMMARY:' + icsEsc(title), 'DESCRIPTION:' + icsEsc(details)]
.concat(s.link ? ['LOCATION:' + icsEsc(s.link)] : [], ['END:VEVENT', 'END:VCALENDAR']).map(icsFold).join('\r\n');
try {
const a = document.createElement('a');
a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
a.download = 'ראיון.ics'; sh.appendChild(a); a.click();
setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 5000);
} catch (e) { toast('לא הצלחתי ליצור את הקובץ'); }
};
});
}
const fbHref = t => 'https://wa.me/' + FEEDBACK_TO + '?text=' + encodeURIComponent('הערה על כלי הרישום של החברותא' + (me ? ' (מאת ' + me.name + ')' : '') + ':\n' + t);
const hist = sub => { if (!opt.useHistory) return; try { history.pushState(sub ? { chv: 1, sub: 1 } : { chv: 1 }, '', location.href); } catch (e) { } };
let ready = false;
function go(screen, group) {
if (screen === 'group' && !GROUPS[group]) return;
if (st.screen === 'home') hist(true);
st.screen = screen; st.group = group || '';
if (screen === 'group') st.f = defF(group);
showScreen();
if (ready) el.scrollIntoView();
}
function home() { st.screen = 'home'; st.group = ''; showScreen(); el.scrollIntoView(); }
function back() {
const s = root.querySelector('.sheet'), sub = st.screen !== 'home';
if (s) {
if (s._can && !s._can()) { hist(sub); return true; }
s.remove();
if (sub) home(); else hist(false);
return true;
}
if (sub) { home(); return true; }
return false;
}
const uiBack = () => { if (opt.useHistory && history.state && history.state.sub) history.back(); else home(); };
root.addEventListener('input', e => {
const t = e.target;
if (t.matches && t.matches('[data-fb]')) { const a = main.querySelector('[data-fbsend]'); if (a) a.href = fbHref(t.value.trim()); return; }
if (!t.matches || !t.matches('[data-q]')) return;
const q = t.value.trim(), qd = digitsQ(q);
if (t.dataset.q === 'h') { st.hq = q; st.hqd = qd; drawHome(); }
else { st.f.q = q; st.f.qd = qd; drawGroup(); }
});
root.addEventListener('change', e => {
const t = e.target;
if (!t.matches) return;
if (t.matches('[data-gchk]')) {
const g = t.dataset.gchk, on = t.checked;
if (!on && settings.home.length <= 1) { t.checked = true; return toast('חייבת להישאר לפחות קבוצה אחת במסך הבית'); }
settings.home = on ? settings.home.concat(g) : settings.home.filter(x => x !== g);
saveSettings(); fillGroups();
} else if (t.matches('[data-opt]')) { settings[t.dataset.opt] = t.checked; saveSettings(); }
});
root.addEventListener('click', e => {
const t = e.target.closest('[data-g],[data-go],[data-back],[data-x],[data-reload],[data-role],[data-up],[data-dn],[data-tech],[data-mine],[data-tsave],[data-treset],[data-msg],[data-done],[data-cal],[data-fbsend],a.call');
if (!t || t.closest('.sheet')) return;
if (t.dataset.guard && !confirm('לא לפנות כרגע:\n' + t.dataset.guard + '\n\nלהמשיך בכל זאת?')) { e.preventDefault(); return; }
if (t.hasAttribute('data-fbsend')) {
const v = (main.querySelector('[data-fb]') || {}).value || '';
if (!v.trim()) { e.preventDefault(); toast('קודם לכתוב את ההערה'); return; }
t.href = fbHref(v.trim());   // הקישור נפתח בלחיצה עצמה (ברירת המחדל של <a>)
return;
}
if (t.hasAttribute('data-cal')) calSheet(t.dataset.cal, +t.dataset.at, t.dataset.n || '');
else if (t.hasAttribute('data-msg')) msgSheet(byKey[t.dataset.msg], t.dataset.tpl, t.dataset.at ? +t.dataset.at : 0);
else if (t.hasAttribute('data-done')) doneSheet(byKey[t.dataset.done]);
else if (t.hasAttribute('data-g')) go('group', t.dataset.g);
else if (t.hasAttribute('data-go')) go(t.dataset.go);
else if (t.hasAttribute('data-back')) uiBack();
else if (t.hasAttribute('data-x')) { if (opt.onClose) opt.onClose(); }
else if (t.hasAttribute('data-reload')) { if (opt.onReload) opt.onReload(); }
else if (t.hasAttribute('data-role')) setRole(t.dataset.role);
else if (t.hasAttribute('data-up')) moveGroup(t.dataset.up, -1);
else if (t.hasAttribute('data-dn')) moveGroup(t.dataset.dn, 1);
else if (t.hasAttribute('data-tech')) { st.f.tech = !st.f.tech; t.classList.toggle('on', st.f.tech); t.setAttribute('aria-pressed', st.f.tech); drawGroup(); }
else if (t.hasAttribute('data-mine')) {
if (!st.f.mine && !mineN && st.group !== 'weekIv') return toast('לא נמצאו לידים על שמך, "רק שלי" נשאר כבוי');
st.f.mine = !st.f.mine; t.classList.toggle('on', st.f.mine); t.setAttribute('aria-pressed', st.f.mine); drawGroup();
}
else if (t.hasAttribute('data-tsave')) saveTpl(t.dataset.tsave, t.closest('details').querySelector('textarea'));
else if (t.hasAttribute('data-treset')) {
const k = t.dataset.treset;
try { localStorage.removeItem('chv_tpl_v3_' + k); } catch (x) { }
t.closest('details').querySelector('textarea').value = TPL[k][1]; toast('הנוסח הוחזר למקור');
}
});
if (!LS.get('chv_firstrun_done', false)) { LS.set('chv_firstrun_done', true); go('settings'); }
else showScreen();
ready = true;
return { back };
}
return { fromApi, fromFiles, render, css, queueOf, tagNormalizer, samePerson };
})();
if(!document.querySelector('meta[name=viewport]')){const m=document.createElement('meta');m.name='viewport';m.content='width=device-width,initial-scale=1';document.head.appendChild(m);}
let ui=null;
const teardown=()=>{const o=document.getElementById('chv-tool');if(o)o.remove();document.documentElement.style.overflow='';};
const onPop=()=>{if(ui&&ui.back())return;window.removeEventListener('popstate',onPop);teardown();};
const close=()=>{window.removeEventListener('popstate',onPop);teardown();if(history.state&&history.state.sub)history.go(-2);else if(history.state&&history.state.chv)history.back();};
const reload=()=>{if(history.state&&history.state.sub){window.removeEventListener('popstate',onPop);const f=()=>{window.removeEventListener('popstate',f);run();};window.addEventListener('popstate',f);history.back();}else run();};
async function run(){
teardown();window.removeEventListener('popstate',onPop);ui=null;
if(!(history.state&&history.state.chv))history.pushState({chv:1},'',location.href);
window.addEventListener('popstate',onPop);
const h=document.createElement('div');h.id='chv-tool';h.style.cssText='position:fixed;inset:0;z-index:2147483647;overflow:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;background:#f4f4f1';
document.body.appendChild(h);document.documentElement.style.overflow='hidden';
const r=h.attachShadow({mode:'open'});
r.innerHTML='<style>'+CH.css+'</style><div class="root"><div class="ch"><main>טוען נתונים מהאתר…</main></div></div>';
const el=r.querySelector('.root');
try{const data=await CH.fromApi();if(!h.isConnected)return;ui=CH.render(el,data,{onClose:close,onReload:reload,useHistory:true});}
catch(e){const login=e.message==='login';
const x=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
el.innerHTML='<div class="ch"><main><h2>'+(login?'האתר לא נתן נתונים':'משהו נכשל')+'</h2><p>'+(login?'כנראה צריך להתחבר מחדש: ללחוץ "סגירה", להתחבר באתר (הדפדפן זוכר את הסיסמה), ולהפעיל שוב את הסימניה. אם כבר מחוברים, האתר פשוט לא ענה: "לנסות שוב".':'פרטי השגיאה: '+x(e.message))+'</p>'+(e.cause?'<div class="small" style="margin-bottom:10px">פרטים: '+x(e.cause.message||e.cause)+'</div>':'')+'<div class="btns" style="grid-template-columns:1fr 1fr"><button class="b msg" id="r">⟳ לנסות שוב</button><button class="b" id="c">סגירה</button></div></main></div>';
el.querySelector('#c').onclick=close;el.querySelector('#r').onclick=run;console.error(e);}
}
run();
})();