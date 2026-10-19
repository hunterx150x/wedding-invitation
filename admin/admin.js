/* =========================================================
   Webding Admin — edit js/config.js from the browser
   ---------------------------------------------------------
   • Every edit is kept as a draft in localStorage (this browser only)
   • The preview iframe loads ../index.html?preview=1, which reads the
     draft from localStorage key "webding-preview"
   • "Publish" writes js/config.js to the GitHub repo through the
     GitHub REST API with a token the owner pastes in (GitHub Pages
     then rebuilds the site). Without a token nothing can be published.
   ========================================================= */
(() => {
  'use strict';

  const DRAFT_KEY = 'webding-admin-draft';
  const PREVIEW_KEY = 'webding-preview';
  const GH_KEY = 'webding-admin-github';
  const I18N = window.I18N || { th: {}, en: {} };

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clone = o => JSON.parse(JSON.stringify(o));
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } }
  };

  /* ---------------------------------------------------------
     Constants
     --------------------------------------------------------- */
  const THEME_DEFAULT = {
    envelope: '#8f9d74', seal: '#e3d2ad', accent: '#7f8d64', heading: '#4b5240',
    text: '#545a47', paper: '#fcfbf1', background: '#dfe0cd'
  };
  const PRESETS = [
    { name: 'Sage Garden', colors: THEME_DEFAULT },
    { name: 'Dusty Rose', colors: { envelope: '#c49a98', seal: '#f0e2d0', accent: '#a9787a', heading: '#5a3d40', text: '#644c4e', paper: '#fdf8f6', background: '#eedfdc' } },
    { name: 'Navy & Gold', colors: { envelope: '#33415e', seal: '#d8bd84', accent: '#a88a50', heading: '#24304a', text: '#3e4659', paper: '#fbf9f4', background: '#e3e1da' } },
    { name: 'Terracotta', colors: { envelope: '#bf7a5a', seal: '#eedcc0', accent: '#a6644a', heading: '#4e3227', text: '#5d4236', paper: '#fcf7f1', background: '#eee1d4' } },
    { name: 'Black & Gold', colors: { envelope: '#2e2d2b', seal: '#d4b676', accent: '#a58a52', heading: '#1f1e1c', text: '#3b3a37', paper: '#fbfaf6', background: '#e5e3dd' } },
    { name: 'Lavender', colors: { envelope: '#a69cc0', seal: '#efe5d2', accent: '#857aa5', heading: '#433d58', text: '#545066', paper: '#fbfafd', background: '#e6e2ee' } },
    { name: 'Champagne', colors: { envelope: '#cdbb95', seal: '#f4ead6', accent: '#a8915f', heading: '#4d4434', text: '#5b5242', paper: '#fffdf7', background: '#efe9da' } }
  ];
  const THEME_FIELDS = [
    ['envelope', 'สีซองจดหมาย', 'หน้าแรกที่แขกเห็น'],
    ['seal', 'สีตราประทับ', 'ครั่งตรงกลางซอง'],
    ['accent', 'สีเน้น', 'ปุ่ม เส้น ลายใบไม้'],
    ['heading', 'สีหัวข้อ', 'ชื่อบ่าวสาวและหัวข้อ'],
    ['text', 'สีตัวอักษร', 'ข้อความทั่วไป'],
    ['paper', 'สีกระดาษการ์ด', 'พื้นหลังของการ์ด'],
    ['background', 'สีพื้นรอบการ์ด', 'เห็นเฉพาะบนจอคอม']
  ];
  const DEFAULT_SWATCHES = [
    { name: 'Olive', color: '#7d8b63' }, { name: 'Sage', color: '#a7b28d' },
    { name: 'Champagne', color: '#e6dcc3' }, { name: 'Ivory', color: '#f6f2e4' }, { name: 'Gold', color: '#c9b48a' }
  ];
  const SECTIONS = [
    ['countdown', 'นับถอยหลัง', 'ตัวนับวันและปุ่มบันทึกลงปฏิทิน'],
    ['story', 'เรื่องราวของเรา', 'ไทม์ไลน์ความรัก'],
    ['program', 'กำหนดการ', 'ลำดับพิธีในวันงาน'],
    ['venue', 'สถานที่', 'แผนที่และปุ่มนำทาง'],
    ['dress', 'Dress code', 'โทนสีการแต่งกาย'],
    ['rsvp', 'RSVP', 'QR code และฟอร์มตอบรับ']
  ];
  const TZ = [
    ['+07:00', 'ไทย (GMT+7)'], ['+08:00', 'จีน / สิงคโปร์ (GMT+8)'], ['+09:00', 'ญี่ปุ่น / เกาหลี (GMT+9)'],
    ['+00:00', 'อังกฤษ (GMT+0)'], ['+01:00', 'ยุโรปกลาง (GMT+1)'], ['-05:00', 'นิวยอร์ก (GMT-5)'], ['-08:00', 'ลอสแอนเจลิส (GMT-8)']
  ];
  const HTML_TEXT_KEYS = ['kindly', 'honoured'];
  const TEXT_GROUPS = [
    ['หน้าซองจดหมาย', [['tapToOpen', 'ปุ่มเปิดซอง']]],
    ['Save the Date', [['save', 'คำว่า SAVE'], ['the', 'คำว่า the'], ['date', 'คำว่า DATE'], ['scroll', 'ข้อความเลื่อนลง']]],
    ['การ์ดเชิญ', [['kindly', 'คำเชิญ'], ['reception', 'บรรทัดปิดท้าย']]],
    ['นับถอยหลัง', [['countingTitle', 'หัวข้อ'], ['days', 'วัน'], ['hours', 'ชั่วโมง'], ['minutes', 'นาที'], ['seconds', 'วินาที'], ['addCal', 'ปุ่มบันทึกปฏิทิน'], ['calTitle', 'ชื่อกิจกรรมในปฏิทิน']]],
    ['เรื่องราวของเรา', [['our', 'หัวข้อบรรทัดบน'], ['story', 'หัวข้อบรรทัดล่าง']]],
    ['กำหนดการ', [['wedding', 'หัวข้อบรรทัดบน'], ['programTitle', 'หัวข้อบรรทัดล่าง']]],
    ['สถานที่', [['theVenue', 'หัวข้อบรรทัดบน'], ['venueTitle', 'หัวข้อบรรทัดล่าง'], ['openMap', 'ปุ่มเปิดแผนที่'], ['parking', 'หมายเหตุ']]],
    ['Dress code', [['dressEyebrow', 'หัวข้อบรรทัดบน'], ['dressTitle', 'หัวข้อบรรทัดล่าง'], ['dressText', 'คำอธิบาย']]],
    ['RSVP', [['kindlyScript', 'หัวข้อตัวเขียน'], ['by', 'คำว่า “ภายในวันที่”'], ['fName', 'ช่องชื่อ'], ['fAttend', 'คำถามร่วมงาน'], ['yes', 'ตัวเลือก: มา'], ['no', 'ตัวเลือก: ไม่มา'], ['fGuests', 'ช่องจำนวนคน'], ['fMsg', 'ช่องคำอวยพร'], ['send', 'ปุ่มส่ง'], ['needName', 'เตือนเมื่อไม่กรอกชื่อ'], ['sent', 'ข้อความหลังส่ง']]],
    ['ปิดท้าย', [['honoured', 'ข้อความขอบคุณ'], ['thanks', 'คำว่าขอบคุณ']]]
  ];
  const KEY_LABELS = {
    initials: 'อักษรย่อ', couple: 'ชื่อบ่าวสาว', parents: 'ผู้ปกครอง', date: 'วันเวลา', durationHours: 'ระยะเวลางาน',
    venue: 'สถานที่', illustration: 'ภาพสถานที่', illustrationUrl: 'ภาพสถานที่ (รูปเอง)', rsvp: 'RSVP', music: 'เพลง', program: 'กำหนดการ', story: 'เรื่องราว', theme: 'ธีมสี',
    dress: 'Dress code', sections: 'การแสดงผล', texts: 'ข้อความบนหน้าจอ', defaultLang: 'ภาษาเริ่มต้น'
  };
  const MONTH_TH = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];

  const ICONS = {
    home: 'M3 11l9-7 9 7M5 10v10h14V10M10 20v-6h4v6',
    settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
    upload: 'M12 16V4M7 9l5-5 5 5M5 20h14',
    heart: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z',
    calendar: 'M4 6h16v14H4zM4 10h16M9 3v4M15 3v4',
    list: 'M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01',
    book: 'M4 19V5a2 2 0 0 1 2-2h13v14H6a2 2 0 0 0-2 2zm0 0a2 2 0 0 0 2 2h13v-4',
    mail: 'M3 6h18v12H3zM3 7l9 6 9-6',
    palette: 'M12 3a9 9 0 1 0 0 18c1.1 0 1.5-.8 1.5-1.6 0-.9-.6-1.4-.6-2.2 0-.9.7-1.6 1.6-1.6H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3zM7.5 11h.01M10 7.5h.01M14.5 7.5h.01',
    shirt: 'M8 3L3 6l2 5 3-1v11h8V10l3 1 2-5-5-3a4 4 0 0 1-8 0z',
    type: 'M5 7V4h14v3M12 4v16M9 20h6',
    eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    up: 'M6 15l6-6 6 6', down: 'M6 9l6 6 6-6', trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
    check: 'M5 12l5 5 9-10',
    alert: 'M12 9v4M12 17h.01M10.3 3.9L2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
    info: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 16v-4M12 8h.01',
    download: 'M12 4v12M7 11l5 5 5-5M5 20h14',
    file: 'M14 3H6v18h12V7zM14 3v4h4',
    copy: 'M9 9h11v11H9zM5 15H4V4h11v1',
    reset: 'M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4',
    external: 'M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5',
    cloud: 'M7 18a5 5 0 1 1 .9-9.9A6 6 0 0 1 19 10a4 4 0 0 1-1 8z',
    sort: 'M7 4v16M4 17l3 3 3-3M17 20V4M14 7l3-3 3 3',
    plug: 'M9 2v6M15 2v6M7 8h10v4a5 5 0 0 1-10 0zM12 17v5',
    image: 'M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M15 9.5h.01',
    eyeOff: 'M3 3l18 18M10.6 6.1A9.7 9.7 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-3.2 3.9M6.6 6.6C3.8 8.4 2 12 2 12s3.5 6 10 6a9.6 9.6 0 0 0 4.4-1M9.9 9.9a3 3 0 0 0 4.2 4.2'
  };

  const SETTINGS = [
    { id: 'couple', label: 'ข้อมูลบ่าวสาว', icon: 'heart', anchor: 'invite', render: pageCouple },
    { id: 'event', label: 'วัน เวลา & สถานที่', icon: 'calendar', anchor: 'invite', render: pageEvent },
    { id: 'illustration', label: 'ภาพสถานที่', icon: 'image', anchor: 'villa', render: pageIllustration },
    { id: 'program', label: 'กำหนดการ', icon: 'list', anchor: 'program', render: pageProgram },
    { id: 'story', label: 'เรื่องราวของเรา', icon: 'book', anchor: 'story', render: pageStory },
    { id: 'rsvp', label: 'RSVP / ตอบรับ', icon: 'mail', anchor: 'rsvp', render: pageRsvp },
    { id: 'theme', label: 'ธีมสี', icon: 'palette', anchor: '@envelope', render: pageTheme },
    { id: 'dress', label: 'Dress code', icon: 'shirt', anchor: 'dress', render: pageDress },
    { id: 'texts', label: 'ข้อความบนหน้าจอ', icon: 'type', anchor: null, render: pageTexts },
    { id: 'display', label: 'การแสดงผล', icon: 'eye', anchor: null, render: pageDisplay }
  ];

  /* ---------------------------------------------------------
     State
     --------------------------------------------------------- */
  let published = null;   // what js/config.js currently contains
  let cfg = null;         // the working copy being edited
  let current = { page: 'dashboard', sub: null };

  function normalize(c) {
    c = c || {};
    c.initials = c.initials || ['', ''];
    c.couple = c.couple || {};
    c.couple.th = c.couple.th || ['', ''];
    c.couple.en = c.couple.en || ['', ''];
    c.parents = c.parents || { th: '', en: '' };
    c.date = c.date || '';
    if (c.durationHours == null) c.durationHours = 6;
    c.venue = c.venue || {};
    c.venue.th = c.venue.th || { name: '', address: '' };
    c.venue.en = c.venue.en || { name: '', address: '' };
    if (c.venue.mapQuery == null) c.venue.mapQuery = '';
    if (c.venue.mapUrl == null) c.venue.mapUrl = '';
    c.rsvp = Object.assign({ by: '', email: '', formUrl: '' }, c.rsvp);
    c.illustration = c.illustration || 'villa';
    if (c.illustrationUrl == null) c.illustrationUrl = '';
    if (c.music == null) c.music = '';
    c.program = c.program || [];
    c.story = c.story || [];
    c.theme = Object.assign({}, THEME_DEFAULT, c.theme);
    c.dress = c.dress || {};
    c.dress.colors = c.dress.colors || clone(DEFAULT_SWATCHES);
    c.sections = Object.assign({ countdown: true, story: true, program: true, venue: true, dress: true, rsvp: true }, c.sections);
    c.texts = c.texts || {};
    c.texts.th = c.texts.th || {};
    c.texts.en = c.texts.en || {};
    c.defaultLang = c.defaultLang || 'th';
    return c;
  }

  // Key-order independent JSON for comparisons
  function stable(v) {
    if (Array.isArray(v)) return '[' + v.map(stable).join(',') + ']';
    if (v && typeof v === 'object') return '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + stable(v[k])).join(',') + '}';
    return JSON.stringify(v);
  }
  const isDirty = () => stable(cfg) !== stable(published);
  const changedKeys = () => Object.keys(Object.assign({}, cfg, published)).filter(k => stable(cfg[k]) !== stable(published[k]));

  const get = (o, path) => path.split('.').reduce((a, k) => (a == null ? a : a[k]), o);
  function set(o, path, v) {
    const ks = path.split('.');
    let a = o;
    ks.slice(0, -1).forEach((k, i) => {
      if (a[k] == null) a[k] = /^\d+$/.test(ks[i + 1]) ? [] : {};
      a = a[k];
    });
    a[ks[ks.length - 1]] = v;
  }

  const htmlToText = v => {
    const t = document.createElement('textarea');
    t.innerHTML = String(v == null ? '' : v).replace(/<br\s*\/?>/gi, '\n');
    return t.value;
  };
  const textToHtml = v => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');

  /* ---------------------------------------------------------
     DOM helpers
     --------------------------------------------------------- */
  function h(tag, attrs, ...kids) {
    const el = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([k, v]) => {
      if (v == null || v === false) return;
      if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else if (typeof v === 'boolean' || (k in el && typeof v !== 'string')) el[k] = v;
      else el.setAttribute(k, v);
    });
    kids.flat(Infinity).forEach(c => {
      if (c == null || c === false) return;
      el.append(c instanceof Node ? c : document.createTextNode(String(c)));
    });
    return el;
  }
  function icon(name) {
    const NS = 'http://www.w3.org/2000/svg';
    const s = document.createElementNS(NS, 'svg');
    s.setAttribute('viewBox', '0 0 24 24');
    s.setAttribute('aria-hidden', 'true');
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', ICONS[name]);
    s.append(p);
    return s;
  }
  const card = (title, desc, ...kids) => h('div', { class: 'card' },
    (title || desc) && h('div', { class: 'card__head' }, h('div', null, title && h('h2', null, title), desc && h('p', null, desc))),
    kids);
  const cardWithTools = (title, desc, tools, ...kids) => {
    const c = card(title, desc, ...kids);
    $('.card__head', c).append(h('div', { class: 'card__tools' }, tools));
    return c;
  };
  const grid = (...kids) => h('div', { class: 'grid' }, kids);
  const intro = text => h('p', { class: 'intro' }, text);
  const notice = (kind, ...lines) => h('div', { class: `notice notice--${kind}` },
    icon(kind === 'ok' ? 'check' : kind === 'info' ? 'info' : 'alert'),
    h('div', null, lines.map(l => (l instanceof Node ? l : h('p', null, l)))));

  /* ---------------------------------------------------------
     Fields
     --------------------------------------------------------- */
  function field(o) {
    const wrap = h('label', { class: 'field ' + (o.cls || '') });
    wrap.append(h('span', { class: 'field__label' }, o.label, o.tag && h('span', { class: 'tag' }, o.tag)));
    const raw = get(cfg, o.path);
    let input;
    if (o.type === 'textarea') {
      input = h('textarea', { rows: o.rows || 3, placeholder: o.placeholder });
    } else if (o.type === 'select') {
      input = h('select', null, o.options.map(([v, l]) => h('option', { value: v }, l)));
    } else {
      input = h('input', { type: o.type || 'text', placeholder: o.placeholder, min: o.min, max: o.max, maxlength: o.maxlength });
    }
    input.value = o.html ? htmlToText(raw) : (raw == null ? '' : raw);
    input.addEventListener('input', () => {
      let v = input.value;
      if (o.type === 'number') { v = Number(v); if (isNaN(v)) return; }
      if (o.html) v = textToHtml(v);
      set(cfg, o.path, v);
      changed();
      if (o.onInput) o.onInput(v);
    });
    wrap.append(input);
    if (o.hint) wrap.append(h('small', { class: 'field__hint' }, o.hint));
    return wrap;
  }

  function colorField(o) {
    const val = get(cfg, o.path) || '#000000';
    const pick = h('input', { type: 'color', value: val, 'aria-label': o.label });
    const txt = h('input', { type: 'text', value: val, maxlength: 7, spellcheck: 'false' });
    const commit = v => { set(cfg, o.path, v); changed(); };
    pick.addEventListener('input', () => { txt.value = pick.value; commit(pick.value); });
    txt.addEventListener('input', () => {
      const v = txt.value.trim();
      if (/^#[0-9a-f]{6}$/i.test(v)) { pick.value = v.toLowerCase(); commit(v.toLowerCase()); }
    });
    return h('div', { class: 'field ' + (o.cls || '') },
      h('span', { class: 'field__label' }, o.label),
      h('div', { class: 'color-row' }, pick, txt),
      o.hint && h('small', { class: 'field__hint' }, o.hint));
  }

  function toggle(o) {
    const input = h('input', { type: 'checkbox', checked: get(cfg, o.path) !== false });
    input.addEventListener('change', () => { set(cfg, o.path, input.checked); changed(); });
    return h('label', { class: 'toggle ' + (o.cls || '') }, input, h('span', { class: 'sw' }),
      h('span', null, h('b', null, o.label), o.hint && h('small', null, o.hint)));
  }

  function sectionToggle(id) {
    const s = SECTIONS.find(x => x[0] === id);
    return h('div', { class: 'card' }, toggle({ path: `sections.${id}`, label: `แสดงส่วน “${s[1]}” บนเว็บ`, hint: 'ปิดไว้ถ้าไม่ต้องการให้แขกเห็นส่วนนี้' }));
  }

  function dateTimeField() {
    const m = String(cfg.date || '').match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})(?::\d{2})?(Z|[+-]\d{2}:\d{2})?$/);
    const dt = h('input', { type: 'datetime-local', value: m ? m[1] : '' });
    const tzVal = m && m[2] ? (m[2] === 'Z' ? '+00:00' : m[2]) : '+07:00';
    const opts = TZ.some(t => t[0] === tzVal) ? TZ : [[tzVal, `GMT${tzVal}`]].concat(TZ);
    const tz = h('select', { class: 'narrow' }, opts.map(([v, l]) => h('option', { value: v }, l)));
    tz.value = tzVal;
    const commit = () => { if (dt.value) { cfg.date = `${dt.value}:00${tz.value}`; changed(); } };
    dt.addEventListener('input', commit);
    tz.addEventListener('change', commit);
    return h('div', { class: 'field span-all' },
      h('span', { class: 'field__label' }, 'วันและเวลาเริ่มพิธี'),
      h('div', { class: 'inline' }, dt, tz),
      h('small', { class: 'field__hint' }, 'ใช้ทั้งการแสดงผลบนการ์ดและการนับถอยหลัง'));
  }

  /** Repeating rows (program, story, dress colours). */
  function repeater(path, columns, blank, cols) {
    const box = h('div', { class: 'rep' });
    const draw = () => {
      box.innerHTML = '';
      const arr = get(cfg, path);
      if (!arr.length) box.append(h('div', { class: 'rep__empty' }, 'ยังไม่มีรายการ'));
      arr.forEach((item, i) => {
        const fields = h('div', { class: 'rep__fields', style: `--cols:${cols || columns.length}` });
        columns.forEach(c => {
          const o = Object.assign({}, c, { path: `${path}.${i}.${c.key}` });
          fields.append(c.type === 'color' ? colorField(o) : field(o));
        });
        const move = d => { const j = i + d; [arr[i], arr[j]] = [arr[j], arr[i]]; changed(); draw(); };
        box.append(h('div', { class: 'rep__row' },
          h('span', { class: 'rep__num' }, String(i + 1)),
          fields,
          h('div', { class: 'rep__tools' },
            h('button', { type: 'button', class: 'icon-btn', title: 'เลื่อนขึ้น', disabled: i === 0, onclick: () => move(-1) }, icon('up')),
            h('button', { type: 'button', class: 'icon-btn', title: 'เลื่อนลง', disabled: i === arr.length - 1, onclick: () => move(1) }, icon('down')),
            h('button', { type: 'button', class: 'icon-btn icon-btn--danger', title: 'ลบ', onclick: () => { arr.splice(i, 1); changed(); draw(); } }, icon('trash')))));
      });
      box.append(h('button', {
        type: 'button', class: 'btn btn--dashed',
        onclick: () => { arr.push(clone(blank)); changed(); draw(); const f = box.querySelectorAll('.rep__row'); const last = f[f.length - 1]; if (last) { const inp = last.querySelector('input, textarea'); if (inp) inp.focus(); } }
      }, '+ เพิ่มรายการ'));
    };
    draw();
    box.redraw = draw;
    return box;
  }

  /** One on-screen text key, TH + EN side by side. */
  function textPair(key, label) {
    const html = HTML_TEXT_KEYS.includes(key);
    const row = h('div', { class: 'tp' });
    const resetBtn = h('button', { type: 'button', onclick: () => { delete cfg.texts.th[key]; delete cfg.texts.en[key]; changed(); row.replaceWith(textPair(key, label)); } }, 'คืนค่าเดิม');
    const syncReset = () => { resetBtn.hidden = !(key in cfg.texts.th || key in cfg.texts.en); };
    row.append(h('div', { class: 'tp__label' }, label, resetBtn));
    ['th', 'en'].forEach(l => {
      const def = (I18N[l] || {})[key] || '';
      const cur = key in cfg.texts[l] ? cfg.texts[l][key] : def;
      const input = html ? h('textarea', { rows: 2 }) : h('input', { type: 'text' });
      input.value = html ? htmlToText(cur) : cur;
      input.placeholder = html ? htmlToText(def) : def;
      input.addEventListener('input', () => {
        const v = html ? textToHtml(input.value) : input.value;
        if (v === def) delete cfg.texts[l][key]; else cfg.texts[l][key] = v;
        syncReset();
        changed();
      });
      row.append(h('label', { class: 'field' }, h('span', { class: 'field__label' }, l === 'th' ? 'ไทย' : 'ENGLISH'), input));
    });
    syncReset();
    return row;
  }

  /* ---------------------------------------------------------
     Settings pages
     --------------------------------------------------------- */
  function pageCouple() {
    return [
      intro('ชื่อและอักษรย่อที่แสดงบนการ์ด กรอกทั้งภาษาไทยและอังกฤษ ระบบจะสลับให้ตามภาษาที่แขกเลือก'),
      card('อักษรย่อ (โลโก้)', 'แสดงกลางช่อใบไม้ เช่น A | M',
        grid(field({ label: 'ตัวที่ 1', path: 'initials.0', maxlength: 3 }), field({ label: 'ตัวที่ 2', path: 'initials.1', maxlength: 3 }))),
      card('ชื่อบ่าวสาว', 'ชื่อที่ 1 อยู่บรรทัดบน ชื่อที่ 2 อยู่บรรทัดล่าง',
        grid(field({ label: 'ชื่อที่ 1', tag: 'ไทย', path: 'couple.th.0' }), field({ label: 'ชื่อที่ 2', tag: 'ไทย', path: 'couple.th.1' })),
        grid(field({ label: 'Name 1', tag: 'EN', path: 'couple.en.0' }), field({ label: 'Name 2', tag: 'EN', path: 'couple.en.1' }))),
      card('ชื่อผู้ปกครอง', 'แสดงใต้ชื่อบ่าวสาว เว้นว่างได้ถ้าไม่ต้องการ',
        grid(field({ label: 'ภาษาไทย', path: 'parents.th', type: 'textarea', html: true, rows: 2, cls: 'span-all', placeholder: 'บุตรของ คุณ... · ธิดาของ คุณ...' }),
          field({ label: 'English', path: 'parents.en', type: 'textarea', html: true, rows: 2, cls: 'span-all', placeholder: 'Son of ... · Daughter of ...' })))
    ];
  }

  function pageEvent() {
    return [
      intro('วันเวลาและสถานที่จัดงาน ใช้แสดงบนการ์ด นับถอยหลัง และสร้างไฟล์บันทึกลงปฏิทินให้แขก'),
      card('วันและเวลา', null,
        grid(dateTimeField(),
          field({ label: 'ระยะเวลางาน (ชั่วโมง)', path: 'durationHours', type: 'number', min: 1, max: 24, hint: 'ใช้ตอนแขกกด “บันทึกลงปฏิทิน”' }))),
      card('สถานที่', null,
        grid(field({ label: 'ชื่อสถานที่', tag: 'ไทย', path: 'venue.th.name' }), field({ label: 'Venue name', tag: 'EN', path: 'venue.en.name' })),
        grid(field({ label: 'ที่อยู่', tag: 'ไทย', path: 'venue.th.address', type: 'textarea', rows: 2 }), field({ label: 'Address', tag: 'EN', path: 'venue.en.address', type: 'textarea', rows: 2 }))),
      card('แผนที่', null,
        grid(field({ label: 'คำค้นหาใน Google Maps', path: 'venue.mapQuery', cls: 'span-all', placeholder: 'เช่น Kundala Beach Resort Hua Hin', hint: 'ใช้แสดงแผนที่ในหน้าเว็บ พิมพ์ชื่อสถานที่ให้ตรงกับใน Google Maps' }),
          field({ label: 'ลิงก์ Google Maps', path: 'venue.mapUrl', type: 'url', cls: 'span-all', placeholder: 'https://maps.app.goo.gl/...', hint: 'ปุ่ม “เปิดใน Google Maps” จะไปที่ลิงก์นี้ เว้นว่างได้ ระบบจะใช้คำค้นหาด้านบนแทน' })))
    ];
  }

  function pageIllustration() {
    const scenes = window.ILLUSTRATIONS || {};
    const list = h('div', { class: 'illus' });
    const extra = h('div');
    const thumb = svg => h('span', { class: 'illus__art', html: `<svg viewBox="0 0 360 220" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${svg}</g></svg>` });
    const placeholder = name => h('span', { class: 'illus__art illus__art--ph' }, icon(name));

    const draw = () => {
      list.innerHTML = '';
      const tile = (key, label, art) => h('button', {
        type: 'button', class: 'illus__item' + (cfg.illustration === key ? ' is-active' : ''),
        'aria-pressed': String(cfg.illustration === key),
        onclick: () => { cfg.illustration = key; changed(); draw(); }
      }, art, h('b', null, label));
      Object.entries(scenes).forEach(([k, v]) => list.append(tile(k, v.th, thumb(v.svg))));
      list.append(tile('custom', 'ใช้รูปของฉันเอง', cfg.illustrationUrl
        ? h('span', { class: 'illus__art' }, h('img', { src: /^(data:|https?:|\/)/.test(cfg.illustrationUrl) ? cfg.illustrationUrl : '../' + cfg.illustrationUrl, alt: '' }))
        : placeholder('image')));
      list.append(tile('none', 'ไม่แสดงรูป', placeholder('eyeOff')));
      drawExtra();
    };

    const drawExtra = () => {
      extra.innerHTML = '';
      if (cfg.illustration !== 'custom') return;
      const isData = /^data:/.test(cfg.illustrationUrl);
      const fileInput = h('input', {
        type: 'file', accept: 'image/*', hidden: true, onchange: async () => {
          const file = fileInput.files[0];
          if (!file) return;
          try {
            cfg.illustrationUrl = await shrinkImage(file);
            changed(); draw(); toast('ใส่รูปแล้ว');
          } catch (e) { toast('เปิดรูปนี้ไม่ได้'); }
        }
      });
      extra.append(card('รูปของคุณเอง', 'แนะนำรูปลายเส้นหรือภาพวาดพื้นขาว/พื้นโปร่งใส ระบบจะย่อรูปให้อัตโนมัติ (กว้างไม่เกิน 900px)',
        h('div', { class: 'btn-row', style: 'margin-top:0' },
          h('button', { type: 'button', class: 'btn btn--primary', onclick: () => fileInput.click() }, icon('upload'), 'เลือกรูปจากเครื่อง'),
          cfg.illustrationUrl && h('button', { type: 'button', class: 'btn btn--danger', onclick: () => { cfg.illustrationUrl = ''; changed(); draw(); } }, icon('trash'), 'ลบรูป'),
          fileInput),
        isData
          ? h('p', { class: 'field__hint', style: 'margin:12px 0 0' }, `ใช้รูปจากเครื่อง (${Math.round(cfg.illustrationUrl.length * 3 / 4 / 1024)} KB) — รูปจะถูกเก็บไว้ในไฟล์ config ตอนเผยแพร่`)
          : h('div', { style: 'margin-top:14px' }, field({ label: 'หรือวางลิงก์รูป', path: 'illustrationUrl', type: 'url', placeholder: 'https://... หรือ assets/venue.png', onInput: () => draw() }))));
    };

    draw();
    return [
      intro('ภาพลายเส้นใต้ชื่อบ่าวสาว เลือกให้เข้ากับสถานที่จัดงาน ภาพจะค่อยๆ วาดตัวเองตอนแขกเลื่อนผ่าน'),
      card('เลือกภาพ', null, list),
      extra
    ];
  }

  /** Read an image file, scale it down and return a data URL (keeps transparency). */
  function shrinkImage(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const s = Math.min(1, 900 / Math.max(img.naturalWidth, img.naturalHeight));
        const c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(img.naturalWidth * s));
        c.height = Math.max(1, Math.round(img.naturalHeight * s));
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        let data = c.toDataURL('image/webp', .86);
        if (!/^data:image\/webp/.test(data)) data = c.toDataURL('image/png');
        resolve(data);
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('bad image')); };
      img.src = url;
    });
  }

  function pageProgram() {
    let rep;
    const sortBtn = h('button', {
      type: 'button', class: 'btn', onclick: () => {
        cfg.program.sort((a, b) => String(a.time).localeCompare(String(b.time)));
        changed(); rep.redraw(); toast('เรียงตามเวลาแล้ว');
      }
    }, icon('sort'), 'เรียงตามเวลา');
    rep = repeater('program', [
      { key: 'time', label: 'เวลา', type: 'time' },
      { key: 'th', label: 'ไทย', placeholder: 'เช่น พิธีหลั่งน้ำพระพุทธมนต์' },
      { key: 'en', label: 'English', placeholder: 'e.g. Ceremony' }
    ], { time: '', th: '', en: '' }, 3);
    return [
      sectionToggle('program'),
      cardWithTools('กำหนดการในวันงาน', 'กดลูกศรเพื่อสลับลำดับ หรือกด “เรียงตามเวลา”', sortBtn, rep)
    ];
  }

  function pageStory() {
    return [
      sectionToggle('story'),
      card('เรื่องราวของเรา', 'เล่าสั้นๆ 2–4 ช่วง ปีให้ใส่เป็น ค.ศ. ฝั่งไทยจะแสดงเป็น พ.ศ. ให้อัตโนมัติ',
        repeater('story', [
          { key: 'year', label: 'ปี (ค.ศ.)', placeholder: '2024', cls: 'span-all', maxlength: 9 },
          { key: 'th.title', label: 'หัวข้อ', tag: 'ไทย' },
          { key: 'en.title', label: 'Title', tag: 'EN' },
          { key: 'th.text', label: 'เรื่องราว', tag: 'ไทย', type: 'textarea', rows: 2 },
          { key: 'en.text', label: 'Story', tag: 'EN', type: 'textarea', rows: 2 }
        ], { year: '', th: { title: '', text: '' }, en: { title: '', text: '' } }, 2))
    ];
  }

  function pageRsvp() {
    const warn = h('div');
    const check = () => {
      warn.innerHTML = '';
      if (cfg.rsvp.formUrl && cfg.rsvp.formUrl === cfg.venue.mapUrl) {
        warn.append(notice('warn', 'ลิงก์ฟอร์มตอบรับเป็นลิงก์เดียวกับแผนที่ แขกที่กดส่งคำตอบหรือสแกน QR จะไปเจอแผนที่แทนฟอร์ม', 'ถ้ายังไม่มี Google Form ให้ลบลิงก์ออก แขกจะตอบทางอีเมลแทน'));
      }
      if (cfg.rsvp.by && cfg.date && cfg.rsvp.by >= cfg.date.slice(0, 10)) {
        warn.append(notice('warn', 'วันปิดรับคำตอบตรงหรือเลยวันงานไปแล้ว ปกติควรตั้งก่อนวันงาน 2–4 สัปดาห์'));
      }
    };
    check();
    return [
      sectionToggle('rsvp'),
      warn,
      card('การตอบรับ', null,
        grid(field({ label: 'ตอบรับภายในวันที่', path: 'rsvp.by', type: 'date', onInput: check }),
          field({ label: 'อีเมลรับคำตอบ', path: 'rsvp.email', type: 'email', placeholder: 'you@example.com' }),
          field({ label: 'ลิงก์ Google Form (ไม่บังคับ)', path: 'rsvp.formUrl', type: 'url', cls: 'span-all', placeholder: 'https://forms.gle/...', onInput: check, hint: 'ถ้าใส่ ปุ่มส่งคำตอบและ QR code จะพาไปที่ฟอร์มนี้แทนอีเมล คำตอบทั้งหมดจะรวมอยู่ใน Google Sheets' }))),
      card('ทำ Google Form แบบง่าย', null,
        h('ol', { class: 'steps' },
          h('li', null, 'เข้า ', h('a', { href: 'https://forms.google.com', target: '_blank', rel: 'noopener' }, 'forms.google.com'), ' แล้วสร้างฟอร์มใหม่'),
          h('li', null, 'เพิ่มคำถาม: ชื่อ-นามสกุล, มาร่วมงานไหม, จำนวนคน, คำอวยพร'),
          h('li', null, 'กด “ส่ง” → ไอคอนลิงก์ → คัดลอก แล้วนำมาวางในช่องด้านบน')))
    ];
  }

  function pageTheme() {
    const pal = h('div', { class: 'presets' });
    const drawPresets = () => {
      pal.innerHTML = '';
      PRESETS.forEach(p => {
        const active = THEME_FIELDS.every(([k]) => (cfg.theme[k] || '').toLowerCase() === p.colors[k].toLowerCase());
        pal.append(h('button', {
          type: 'button', class: 'preset' + (active ? ' is-active' : ''),
          onclick: () => { Object.assign(cfg.theme, p.colors); changed(); rerender(); toast(`ใช้ธีม ${p.name}`); }
        },
        h('span', { class: 'preset__sw' }, ['envelope', 'seal', 'accent', 'paper', 'heading'].map(k => h('i', { style: `background:${p.colors[k]}` }))),
        h('b', null, p.name)));
      });
    };
    drawPresets();
    const reset = h('button', { type: 'button', class: 'btn', onclick: () => { cfg.theme = clone(THEME_DEFAULT); changed(); rerender(); } }, icon('reset'), 'คืนค่าเริ่มต้น');
    return [
      intro('เลือกชุดสีสำเร็จรูป หรือปรับทีละสีได้เอง ตัวอย่างด้านขวาจะแสดงหน้าซอง แตะตราประทับในตัวอย่างเพื่อดูการ์ดด้านใน'),
      card('ชุดสีสำเร็จรูป', null, pal),
      cardWithTools('ปรับสีเอง', null, reset,
        grid(THEME_FIELDS.map(([k, label, hint]) => colorField({ label, hint, path: `theme.${k}` }))))
    ];
  }

  function pageDress() {
    return [
      sectionToggle('dress'),
      card('สีที่อยากให้แขกใส่', 'แสดงเป็นวงกลมสี พร้อมชื่อสีด้านล่าง',
        repeater('dress.colors', [
          { key: 'name', label: 'ชื่อสี', placeholder: 'เช่น Sage' },
          { key: 'color', label: 'สี', type: 'color' }
        ], { name: '', color: '#cccccc' }, 2)),
      card('ข้อความ', 'เว้นว่างหรือกด “คืนค่าเดิม” เพื่อใช้ข้อความเริ่มต้น',
        textPair('dressEyebrow', 'หัวข้อบรรทัดบน'), textPair('dressTitle', 'หัวข้อบรรทัดล่าง'), textPair('dressText', 'คำอธิบาย'))
    ];
  }

  function pageTexts() {
    return [
      intro('แก้ข้อความทุกจุดบนหน้าเว็บได้ทั้งไทยและอังกฤษ ช่องไหนไม่แก้ ระบบจะใช้ข้อความเริ่มต้น (แสดงเป็นตัวจาง)'),
      TEXT_GROUPS.map(([title, keys]) => card(title, null, keys.map(([k, l]) => textPair(k, l))))
    ];
  }

  function pageDisplay() {
    return [
      card('ส่วนต่างๆ บนหน้าเว็บ', 'ปิดส่วนที่ไม่ต้องการแสดง ส่วนหน้าซอง การ์ดเชิญ และ Save the Date จะแสดงเสมอ',
        grid(SECTIONS.map(([id, label, hint]) => toggle({ path: `sections.${id}`, label, hint })))),
      card('ภาษา', null,
        grid(field({ label: 'ภาษาเริ่มต้นเมื่อแขกเปิดเว็บ', path: 'defaultLang', type: 'select', options: [['th', 'ภาษาไทย'], ['en', 'English']], hint: 'แขกยังกดสลับภาษาเองได้ที่มุมขวาบน' }))),
      card('เพลงประกอบ', 'เพลงจะเริ่มเล่นตอนแขกแตะเปิดซอง และมีปุ่มเปิด/ปิดเพลงที่มุมขวาบน',
        grid(field({ label: 'ลิงก์ไฟล์เพลง (.mp3)', path: 'music', cls: 'span-all', placeholder: 'assets/music.mp3 หรือ https://...', hint: 'เว้นว่างถ้าไม่ต้องการเพลง' })))
    ];
  }

  /* ---------------------------------------------------------
     Dashboard
     --------------------------------------------------------- */
  function parseEventDate() {
    const m = String(cfg.date || '').match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
    if (!m) return null;
    const [, y, mo, d, hh, mm] = m.map(Number);
    return { y, mo, d, hh, mm, ts: new Date(cfg.date).getTime() };
  }
  const siteUrl = () => new URL('../', location.href).href;

  function checks() {
    const ev = parseEventDate();
    const list = [];
    const add = (ok, text, link) => list.push({ ok, text, link });
    add(cfg.couple.th.every(Boolean) && cfg.couple.en.every(Boolean), 'กรอกชื่อบ่าวสาวครบทั้งไทยและอังกฤษ', '#/settings/couple');
    add(!!ev && ev.ts > Date.now(), 'วันงานถูกต้องและยังมาไม่ถึง', '#/settings/event');
    add(!!(cfg.venue.th.name && cfg.venue.en.name), 'กรอกชื่อสถานที่ทั้งสองภาษา', '#/settings/event');
    add(!!(cfg.venue.mapQuery || cfg.venue.mapUrl), 'ตั้งค่าแผนที่แล้ว', '#/settings/event');
    if (cfg.sections.rsvp !== false) {
      add(!!(cfg.rsvp.email || cfg.rsvp.formUrl), 'มีช่องทางรับคำตอบ (อีเมลหรือ Google Form)', '#/settings/rsvp');
      add(!(cfg.rsvp.formUrl && cfg.rsvp.formUrl === cfg.venue.mapUrl), 'ลิงก์ฟอร์มตอบรับไม่ซ้ำกับลิงก์แผนที่', '#/settings/rsvp');
      add(!cfg.rsvp.by || !cfg.date || cfg.rsvp.by < cfg.date.slice(0, 10), 'วันปิดรับคำตอบอยู่ก่อนวันงาน', '#/settings/rsvp');
    }
    if (cfg.sections.program !== false) add(cfg.program.length > 0, 'มีกำหนดการอย่างน้อย 1 รายการ', '#/settings/program');
    return list;
  }

  function pageDashboard() {
    const ev = parseEventDate();
    const days = ev ? Math.max(0, Math.ceil((ev.ts - Date.now()) / 864e5)) : '–';
    const dateTh = ev ? `${ev.d} ${MONTH_TH[ev.mo - 1]} ${ev.y + 543} · ${String(ev.hh).padStart(2, '0')}.${String(ev.mm).padStart(2, '0')} น.` : 'ยังไม่ได้ตั้งวันงาน';
    const names = cfg.couple.th.filter(Boolean).join(' & ') || 'ยังไม่ได้ใส่ชื่อ';
    const out = [];

    if (isDirty()) {
      out.push(notice('warn',
        h('p', null, h('b', null, 'มีการแก้ไขที่ยังไม่ได้เผยแพร่ '), 'แขกจะยังเห็นข้อมูลเดิมจนกว่าจะกดเผยแพร่'),
        h('div', { class: 'btn-row', style: 'margin-top:10px' },
          h('a', { class: 'btn btn--primary', href: '#/publish' }, icon('upload'), 'ไปหน้าเผยแพร่'),
          h('button', { type: 'button', class: 'btn', onclick: discard }, 'ทิ้งการแก้ไข'))));
    }

    out.push(h('div', { class: 'hero-card' },
      h('div', null,
        h('small', null, 'Wedding invitation'),
        h('h2', null, names),
        h('p', null, dateTh),
        h('p', null, cfg.venue.th.name || '')),
      h('div', { class: 'days' }, h('b', null, String(days)), h('span', null, 'วันก่อนถึงวันงาน'))));

    const copy = h('button', {
      type: 'button', class: 'icon-btn', title: 'คัดลอกลิงก์',
      onclick: () => { navigator.clipboard.writeText(siteUrl()).then(() => toast('คัดลอกลิงก์แล้ว'), () => toast(siteUrl())); }
    }, icon('copy'));
    out.push(h('div', { class: 'stats' },
      h('div', { class: 'stat' }, h('span', null, 'สถานะ'), h('b', null, isDirty() ? 'มีร่างที่ยังไม่เผยแพร่' : 'เผยแพร่ล่าสุดแล้ว')),
      h('div', { class: 'stat' }, h('span', null, 'ส่วนที่เปิดแสดง'), h('b', null, `${SECTIONS.filter(([id]) => cfg.sections[id] !== false).length} จาก ${SECTIONS.length} ส่วน`)),
      h('div', { class: 'stat' }, h('span', null, 'ลิงก์เว็บการ์ด'),
        h('div', { style: 'display:flex;align-items:center;gap:6px' },
          h('b', { style: 'flex:1' }, h('a', { href: siteUrl(), target: '_blank', rel: 'noopener' }, siteUrl().replace(/^https?:\/\//, ''))), copy))));

    const items = checks();
    const bad = items.filter(i => !i.ok).length;
    out.push(card('สิ่งที่ควรตรวจสอบ', bad ? `เหลืออีก ${bad} จุด` : 'เรียบร้อยครบทุกข้อ',
      h('ul', { class: 'checklist' }, items.map(i => h('li', { class: i.ok ? 'ok' : 'warn' },
        icon(i.ok ? 'check' : 'alert'), h('span', null, i.text), !i.ok && h('a', { href: i.link }, 'แก้ไข →'))))));

    out.push(card('ตั้งค่า', 'เลือกหัวข้อที่ต้องการแก้ไข',
      h('div', { class: 'tiles' }, SETTINGS.map(s => h('a', { class: 'tile', href: `#/settings/${s.id}` },
        h('i', null, icon(s.icon)), h('span', null, h('b', null, s.label), h('small', null, tileHint(s.id))))))));
    return out;
  }

  function tileHint(id) {
    return {
      couple: 'ชื่อ อักษรย่อ ผู้ปกครอง', event: 'วันงาน สถานที่ แผนที่',
      illustration: cfg.illustration === 'custom' ? 'รูปของคุณเอง' : cfg.illustration === 'none' ? 'ไม่แสดงรูป' : ((window.ILLUSTRATIONS || {})[cfg.illustration] || {}).th || '', program: `${cfg.program.length} รายการ`,
      story: `${cfg.story.length} ช่วงเวลา`, rsvp: 'วันปิดรับ อีเมล ฟอร์ม', theme: 'สีซอง ตราประทับ การ์ด',
      dress: `${cfg.dress.colors.length} สี`, texts: 'ข้อความทุกจุด ไทย/อังกฤษ', display: 'เปิด/ปิดส่วน ภาษา เพลง'
    }[id];
  }

  /* ---------------------------------------------------------
     Publish
     --------------------------------------------------------- */
  function ghSettings() {
    let s = {};
    try { s = JSON.parse(store.get(GH_KEY)) || {}; } catch (e) { /* ignore */ }
    // Guess owner/repo from <owner>.github.io/<repo>/admin/
    if (!s.owner && /\.github\.io$/.test(location.hostname)) s.owner = location.hostname.split('.')[0];
    if (!s.repo && /\.github\.io$/.test(location.hostname)) {
      const seg = location.pathname.split('/').filter(Boolean);
      s.repo = seg.length > 1 ? seg[0] : `${s.owner}.github.io`;
    }
    return Object.assign({ owner: '', repo: '', branch: 'main', path: 'js/config.js', remember: true, token: '' }, s, { token: s.token || sessionToken });
  }
  let sessionToken = '';
  function saveGh(s) {
    sessionToken = s.token || '';
    const copy = Object.assign({}, s);
    if (!copy.remember) delete copy.token;
    store.set(GH_KEY, JSON.stringify(copy));
  }

  async function gh(s, method, path, body) {
    const r = await fetch('https://api.github.com' + path, {
      method,
      headers: { Authorization: `Bearer ${s.token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    });
    if (!r.ok) {
      const msg = (await r.json().catch(() => ({}))).message || r.statusText;
      const err = new Error(msg); err.status = r.status; throw err;
    }
    return r.json();
  }
  function ghError(e) {
    return {
      401: 'Token ไม่ถูกต้องหรือหมดอายุ',
      403: `Token ไม่มีสิทธิ์เขียนไฟล์ — ที่หน้า GitHub token กด Edit แล้วตั้ง Repository access เป็น “Only select repositories” (เลือก repo นี้) และ Contents เป็น “Read and write” (GitHub: ${e.message})`,
      404: 'ไม่พบ repo / branch / ไฟล์ — ตรวจชื่อให้ถูก และให้ token เข้าถึง repo นี้ได้',
      409: 'ไฟล์ถูกแก้จากที่อื่นพร้อมกัน ลองกดเผยแพร่อีกครั้ง',
      422: 'ข้อมูลไม่ถูกต้อง: ' + e.message
    }[e.status] || `เกิดข้อผิดพลาด: ${e.message}`;
  }
  function b64(str) {
    const bytes = new TextEncoder().encode(str);
    let bin = '';
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(bin);
  }
  function toConfigJs(c) {
    return `/* =========================================================
   ข้อมูลเว็บการ์ด — แก้ไขผ่านหน้า /admin ได้ หรือแก้ไฟล์นี้โดยตรง
   Wedding details — edit via /admin or by hand.
   Last updated: ${new Date().toISOString()}
   ========================================================= */
window.WEDDING = ${JSON.stringify(c, null, 2)};
`;
  }

  function pagePublish() {
    const s = ghSettings();
    const keys = changedKeys();
    const log = h('div', { class: 'log' });
    const say = (text, kind) => { log.append(h('p', null, kind === 'busy' ? h('span', { class: 'spinner' }) : icon(kind === 'ok' ? 'check' : kind === 'err' ? 'alert' : 'info'), text)); };

    const fOwner = h('input', { type: 'text', value: s.owner, placeholder: 'ชื่อบัญชี GitHub' });
    const fRepo = h('input', { type: 'text', value: s.repo, placeholder: 'ชื่อ repo' });
    const fBranch = h('input', { type: 'text', value: s.branch });
    const fPath = h('input', { type: 'text', value: s.path });
    const fToken = h('input', { type: 'password', value: s.token, placeholder: 'github_pat_...', autocomplete: 'off' });
    const fRemember = h('input', { type: 'checkbox', checked: !!s.remember });
    const read = () => ({ owner: fOwner.value.trim(), repo: fRepo.value.trim(), branch: fBranch.value.trim() || 'main', path: fPath.value.trim().replace(/^\/+/, '') || 'js/config.js', token: fToken.value.trim(), remember: fRemember.checked });
    [fOwner, fRepo, fBranch, fPath, fToken].forEach(i => i.addEventListener('input', () => saveGh(read())));
    fRemember.addEventListener('change', () => saveGh(read()));
    const lbl = (t, input, hint, cls) => h('label', { class: 'field ' + (cls || '') }, h('span', { class: 'field__label' }, t), input, hint && h('small', { class: 'field__hint' }, hint));

    const testBtn = h('button', {
      type: 'button', class: 'btn', onclick: async () => {
        const g = read(); log.innerHTML = '';
        if (!g.owner || !g.repo || !g.token) return say('กรอก owner, repo และ token ให้ครบก่อน', 'err');
        say('กำลังทดสอบการเชื่อมต่อ…', 'busy');
        try {
          const repo = await gh(g, 'GET', `/repos/${encodeURIComponent(g.owner)}/${encodeURIComponent(g.repo)}`);
          log.innerHTML = '';
          if (repo.permissions && repo.permissions.push === false) say('เชื่อมต่อได้ แต่ token นี้ไม่มีสิทธิ์เขียน', 'err');
          else say(`เชื่อมต่อสำเร็จ: ${repo.full_name}`, 'ok');
        } catch (e) { log.innerHTML = ''; say(ghError(e), 'err'); }
      }
    }, icon('plug'), 'ทดสอบการเชื่อมต่อ');

    const pubBtn = h('button', {
      type: 'button', class: 'btn btn--primary btn--lg', disabled: !keys.length, onclick: async () => {
        const g = read(); log.innerHTML = '';
        if (!g.owner || !g.repo || !g.token) return say('กรอก owner, repo และ token ให้ครบก่อน', 'err');
        pubBtn.disabled = true;
        say('กำลังเผยแพร่…', 'busy');
        try {
          const api = `/repos/${encodeURIComponent(g.owner)}/${encodeURIComponent(g.repo)}/contents/${g.path.split('/').map(encodeURIComponent).join('/')}`;
          let sha;
          try { sha = (await gh(g, 'GET', `${api}?ref=${encodeURIComponent(g.branch)}`)).sha; } catch (e) { if (e.status !== 404) throw e; }
          await gh(g, 'PUT', api, { message: 'Update wedding details via Webding admin', content: b64(toConfigJs(cfg)), sha, branch: g.branch });
          published = clone(cfg);
          saveDraft();
          updateState();
          log.innerHTML = '';
          say('เผยแพร่สำเร็จ! เว็บจริงจะอัปเดตภายในประมาณ 1–2 นาที', 'ok');
          log.append(h('p', null, h('a', { href: siteUrl(), target: '_blank', rel: 'noopener' }, 'เปิดเว็บการ์ด →')));
          toast('เผยแพร่สำเร็จ');
        } catch (e) {
          log.innerHTML = ''; say(ghError(e), 'err'); pubBtn.disabled = false;
        }
      }
    }, icon('upload'), 'เผยแพร่ขึ้นเว็บตอนนี้');

    const importInput = h('input', { type: 'file', accept: '.js,.json,application/json,text/javascript', hidden: true, onchange: () => importFile(importInput) });

    return [
      intro('การแก้ไขทั้งหมดถูกเก็บเป็นร่างไว้ในเบราว์เซอร์นี้ แขกจะเห็นข้อมูลใหม่ก็ต่อเมื่อกดเผยแพร่'),
      card('การเปลี่ยนแปลง', null,
        keys.length
          ? [h('ul', { class: 'changes' }, keys.map(k => h('li', null, KEY_LABELS[k] || k))), h('p', { class: 'field__hint' }, `แก้ไข ${keys.length} หัวข้อ ยังไม่ได้เผยแพร่`)]
          : notice('ok', 'ไม่มีการแก้ไขใหม่ ข้อมูลตรงกับเว็บจริงแล้ว')),
      card('เผยแพร่ผ่าน GitHub', 'เว็บนี้อยู่บน GitHub Pages การเผยแพร่คือการอัปเดตไฟล์ js/config.js ใน repo',
        grid(lbl('Owner', fOwner), lbl('Repository', fRepo), lbl('Branch', fBranch), lbl('ไฟล์ config', fPath),
          lbl('GitHub token', fToken, 'Token เก็บไว้ในเบราว์เซอร์นี้เท่านั้น ไม่ถูกส่งไปที่ไหนนอกจาก GitHub', 'span-all'),
          h('label', { class: 'toggle span-all' }, fRemember, h('span', { class: 'sw' }), h('span', null, h('b', null, 'จำ token ไว้ในเบราว์เซอร์นี้'), h('small', null, 'ปิดไว้ถ้าใช้เครื่องสาธารณะ')))),
        h('div', { class: 'btn-row' }, pubBtn, testBtn),
        log),
      card('วิธีสร้าง GitHub token', 'ทำครั้งเดียว ใช้ได้จนกว่าจะหมดอายุ',
        h('ol', { class: 'steps' },
          h('li', null, 'เปิด ', h('a', { href: 'https://github.com/settings/personal-access-tokens/new', target: '_blank', rel: 'noopener' }, 'GitHub → Fine-grained token ใหม่')),
          h('li', null, 'ตั้งชื่อ เช่น “Webding admin” และเลือกวันหมดอายุ'),
          h('li', null, 'Repository access → ', h('b', null, 'Only select repositories'), ' → เลือก repo ของเว็บการ์ด'),
          h('li', null, 'Permissions → Repository → ', h('b', null, 'Contents: Read and write')),
          h('li', null, 'กด Generate แล้วคัดลอก token มาวางด้านบน'))),
      card('สำรองและกู้คืน', null,
        h('div', { class: 'btn-row', style: 'margin-top:0' },
          h('button', { type: 'button', class: 'btn', onclick: download }, icon('download'), 'ดาวน์โหลด config.js'),
          h('button', { type: 'button', class: 'btn', onclick: () => importInput.click() }, icon('file'), 'นำเข้าไฟล์ config'),
          h('button', { type: 'button', class: 'btn btn--danger', disabled: !keys.length, onclick: discard }, icon('reset'), 'ทิ้งการแก้ไขทั้งหมด'),
          importInput),
        h('p', { class: 'field__hint', style: 'margin:12px 0 0' }, 'ดาวน์โหลดไฟล์ไปแทนที่ js/config.js เองได้ ถ้าไม่อยากใช้ token'))
    ];
  }

  function download() {
    const a = h('a', { href: URL.createObjectURL(new Blob([toConfigJs(cfg)], { type: 'text/javascript' })), download: 'config.js' });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  function importFile(input) {
    const file = input.files[0];
    if (!file) return;
    file.text().then(txt => {
      let data;
      try { data = JSON.parse(txt); } catch (e) {
        try { const w = {}; new Function('window', txt)(w); data = w.WEDDING; } catch (e2) { data = null; }
      }
      if (!data || typeof data !== 'object') { toast('อ่านไฟล์ไม่ได้'); return; }
      cfg = normalize(data);
      changed(); route(); toast('นำเข้าข้อมูลแล้ว (ยังไม่ได้เผยแพร่)');
    });
    input.value = '';
  }

  function discard() {
    if (!confirm('ทิ้งการแก้ไขทั้งหมด แล้วกลับไปใช้ข้อมูลที่เผยแพร่อยู่?')) return;
    cfg = clone(published);
    changed(); route(); toast('ทิ้งการแก้ไขแล้ว');
  }

  /* ---------------------------------------------------------
     Draft, state, preview
     --------------------------------------------------------- */
  function saveDraft() {
    if (isDirty()) store.set(DRAFT_KEY, JSON.stringify(cfg)); else store.del(DRAFT_KEY);
  }
  let draftTimer, previewTimer;
  function changed() {
    clearTimeout(draftTimer); draftTimer = setTimeout(saveDraft, 250);
    updateState();
    clearTimeout(previewTimer); previewTimer = setTimeout(() => refreshPreview({ keepScroll: true }), 650);
  }

  function updateState() {
    const dirty = isDirty();
    const el = $('#saveState');
    el.textContent = dirty ? 'บันทึกร่างแล้ว · ยังไม่เผยแพร่' : 'เผยแพร่ล่าสุดแล้ว';
    el.classList.toggle('is-draft', dirty);
    const dot = $('#menu a[href="#/publish"] .dot');
    if (dot) dot.hidden = !dirty;
  }

  const frame = $('#pvFrame');
  const device = $('#device');
  const stage = $('#stage');
  let pvLang = 'th';
  let pvDevice = store.get('webding-admin-device') || 'mobile';

  function envelopeShowing() {
    try { return !!frame.contentDocument.getElementById('envelope'); } catch (e) { return false; }
  }
  function refreshPreview({ anchor = null, envelope, keepScroll = false } = {}) {
    store.set(PREVIEW_KEY, JSON.stringify(cfg));
    if (envelope === undefined) envelope = keepScroll ? envelopeShowing() : false;
    const q = new URLSearchParams({ preview: '1', lang: pvLang, t: Date.now() });
    if (!envelope) { q.set('open', '1'); q.set('static', '1'); }
    if (keepScroll && !envelope) {
      try { const y = Math.round(frame.contentWindow.scrollY); if (y > 0) q.set('y', y); } catch (e) { /* ignore */ }
    }
    frame.src = `../index.html?${q}${anchor && !envelope && !q.has('y') ? '#' + anchor : ''}`;
  }

  function fitDevice() {
    const r = stage.getBoundingClientRect();
    const [w, hh] = pvDevice === 'desktop' ? [1280, 800] : [390, 844];
    const s = Math.min((r.width - 40) / w, (r.height - 40) / hh, 1);
    device.style.transform = `translate(-50%, -50%) scale(${Math.max(s, .1)})`;
  }
  function setDevice(v) {
    pvDevice = v;
    store.set('webding-admin-device', v);
    device.classList.toggle('is-desktop', v === 'desktop');
    $$('#pvDevice button').forEach(b => b.classList.toggle('is-active', b.dataset.v === v));
    fitDevice();
  }
  function setLang(v) {
    pvLang = v;
    $$('#pvLang button').forEach(b => b.classList.toggle('is-active', b.dataset.v === v));
  }

  /* ---------------------------------------------------------
     Menu & routing
     --------------------------------------------------------- */
  function renderMenu() {
    const link = (href, ic, label, extra) => h('a', { href }, icon(ic), h('span', null, label), extra);
    $('#menu').replaceChildren(
      link('#/dashboard', 'home', 'ภาพรวม'),
      link('#/settings', 'settings', 'ตั้งค่า (Settings)'),
      h('div', { class: 'sub' }, SETTINGS.map(s => link(`#/settings/${s.id}`, s.icon, s.label))),
      link('#/publish', 'upload', 'เผยแพร่', h('span', { class: 'dot', hidden: true }))
    );
  }

  function rerender() {
    const top = $('#content').scrollTop;
    route({ keepPreview: true });
    $('#content').scrollTop = top;
  }

  function route(opts = {}) {
    const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
    let page = parts[0] || 'dashboard';
    let sub = parts[1] || null;
    if (!['dashboard', 'settings', 'publish'].includes(page)) page = 'dashboard';
    if (page === 'settings' && !SETTINGS.some(s => s.id === sub)) sub = SETTINGS[0].id;
    const changedPage = page !== current.page || sub !== current.sub;
    current = { page, sub };

    let title, crumb, nodes, anchor = null;
    if (page === 'settings') {
      const s = SETTINGS.find(x => x.id === sub);
      title = s.label; crumb = 'ตั้งค่า'; nodes = s.render(); anchor = s.anchor;
    } else if (page === 'publish') {
      title = 'เผยแพร่'; crumb = 'Webding Admin'; nodes = pagePublish();
    } else {
      title = 'ภาพรวม'; crumb = 'Webding Admin'; nodes = pageDashboard();
    }
    $('#pageTitle').textContent = title;
    $('#crumb').textContent = crumb;
    document.title = `${title} · Webding Admin`;
    $('#content').replaceChildren(...[].concat(nodes).flat(Infinity).filter(Boolean));

    const activeHref = page === 'settings' ? `#/settings/${sub}` : `#/${page}`;
    $$('#menu a').forEach(a => {
      const href = a.getAttribute('href');
      a.classList.toggle('is-active', href === activeHref || (page === 'settings' && href === '#/settings'));
    });
    updateState();
    $('#app').classList.remove('show-menu');

    if (changedPage && !opts.keepPreview) {
      $('#content').scrollTop = 0;
      if (anchor === '@envelope') refreshPreview({ envelope: true });
      else if (anchor) refreshPreview({ anchor });
      else if (!frame.src) refreshPreview();
    }
  }

  /* ---------------------------------------------------------
     Toast
     --------------------------------------------------------- */
  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('is-show'), 2200);
  }

  /* ---------------------------------------------------------
     Boot
     --------------------------------------------------------- */
  async function loadPublished() {
    // Fetch fresh (GitHub Pages caches for ~10 min); fall back to the <script> copy
    try {
      const r = await fetch(`../js/config.js?v=${Date.now()}`, { cache: 'no-store' });
      if (r.ok) {
        const w = {};
        new Function('window', await r.text())(w);
        if (w.WEDDING) return w.WEDDING;
      }
    } catch (e) { /* ignore */ }
    return window.WEDDING;
  }

  async function boot() {
    published = normalize(clone(await loadPublished() || {}));
    let draft = null;
    try { draft = JSON.parse(store.get(DRAFT_KEY)); } catch (e) { /* ignore */ }
    cfg = draft ? normalize(draft) : clone(published);

    setLang(cfg.defaultLang || 'th');
    setDevice(pvDevice);
    renderMenu();

    $('#pvLang').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { setLang(b.dataset.v); refreshPreview({ keepScroll: true }); } });
    $('#pvDevice').addEventListener('click', e => { const b = e.target.closest('button'); if (b) setDevice(b.dataset.v); });
    $('#pvPlay').addEventListener('click', () => refreshPreview({ envelope: true }));
    $('#previewBtn').addEventListener('click', () => { $('#app').classList.add('show-preview'); fitDevice(); });
    $('#pvClose').addEventListener('click', () => $('#app').classList.remove('show-preview'));
    $('#menuBtn').addEventListener('click', () => $('#app').classList.add('show-menu'));
    $('#scrim').addEventListener('click', () => $('#app').classList.remove('show-menu', 'show-preview'));
    if (window.ResizeObserver) new ResizeObserver(fitDevice).observe(stage); else window.addEventListener('resize', fitDevice);

    window.addEventListener('hashchange', () => route());
    route();
    if (!frame.src) refreshPreview();
  }

  boot();
})();
