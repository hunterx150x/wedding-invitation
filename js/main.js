(() => {
  'use strict';

  const C = window.WEDDING;
  const T = window.I18N;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const params = new URLSearchParams(location.search);
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const animOn = hasGsap && !reduceMotion;

  if (animOn) {
    document.documentElement.classList.add('anim');
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ---------------------------------------------------------
     Storage helpers (may throw in private mode)
     --------------------------------------------------------- */
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } }
  };

  /* ---------------------------------------------------------
     Date helpers (display uses the wall-clock time written in config)
     --------------------------------------------------------- */
  const [, Y, Mo, D, h, mi] = C.date.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/).map(Number);
  const eventDate = new Date(C.date);
  const MONTH_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const MONTH_TH = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
  const DAY_EN = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const DAY_TH = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'];
  const ord = n => n + (n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th');
  const pad = n => String(n).padStart(2, '0');
  const weekday = new Date(Date.UTC(Y, Mo - 1, D)).getUTCDay();

  function fmtTimeEn(hh, mm) {
    const ap = hh >= 12 ? 'PM' : 'AM';
    const h12 = hh % 12 || 12;
    return mm ? `${h12}:${pad(mm)} ${ap}` : `${h12} ${ap}`;
  }

  function fmtDayMonth(iso, lang) {
    const [y, m, d] = iso.split('-').map(Number);
    return lang === 'th' ? `${d} ${MONTH_TH[m - 1]} ${y + 543}` : `${MONTH_EN[m - 1]} ${ord(d)}, ${y}`;
  }

  /* ---------------------------------------------------------
     Botanical art (generated SVG) — used for envelope emboss & decor
     --------------------------------------------------------- */
  function bez(p, t) {
    const u = 1 - t;
    return [
      u*u*u*p[0][0] + 3*u*u*t*p[1][0] + 3*u*t*t*p[2][0] + t*t*t*p[3][0],
      u*u*u*p[0][1] + 3*u*u*t*p[1][1] + 3*u*t*t*p[2][1] + t*t*t*p[3][1]
    ];
  }
  function bezAngle(p, t) {
    const a = bez(p, Math.max(0, t - 0.01)), b = bez(p, Math.min(1, t + 0.01));
    return Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI;
  }
  function flower(x, y, r, fill, stroke, sw) {
    let s = '';
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      s += `<circle cx="${(x + Math.cos(a) * r * 1.35).toFixed(1)}" cy="${(y + Math.sin(a) * r * 1.35).toFixed(1)}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
    }
    return s + `<circle cx="${x}" cy="${y}" r="${(r * .55).toFixed(1)}" fill="${stroke}"/>`;
  }
  /** One sprig in a 160x160 box. */
  function sprig(fill, stroke, sw = 1.4) {
    const p = [[14, 150], [40, 112], [84, 72], [140, 16]];
    let s = `<path d="M${p[0]}C${p[1]} ${p[2]} ${p[3]}" fill="none" stroke="${stroke}" stroke-width="${sw * 1.3}" stroke-linecap="round"/>`;
    [0.14, 0.26, 0.38, 0.5, 0.62, 0.74, 0.86].forEach((t, i) => {
      const [x, y] = bez(p, t);
      const a = bezAngle(p, t) + (i % 2 ? 52 : -52);
      const L = (28 - t * 12) / 26;
      s += `<path transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${a.toFixed(1)}) scale(${L.toFixed(2)})" d="M0 0C7-8 19-8 26 0C19 8 7 8 0 0Z" fill="${fill}" stroke="${stroke}" stroke-width="${(sw / L).toFixed(2)}"/>`;
      if (i % 2) s += `<path transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${a.toFixed(1)})" d="M0 0L18 0" stroke="${stroke}" stroke-width="${sw * .7}"/>`;
    });
    [[0.32, -70], [0.58, 72], [0.8, -64]].forEach(([t, off]) => {
      const [x, y] = bez(p, t);
      const a = (bezAngle(p, t) + off) * Math.PI / 180;
      const ex = x + Math.cos(a) * 22, ey = y + Math.sin(a) * 22;
      s += `<path d="M${x.toFixed(1)} ${y.toFixed(1)}L${ex.toFixed(1)} ${ey.toFixed(1)}" stroke="${stroke}" stroke-width="${sw * .8}" stroke-linecap="round"/>`;
      s += flower(+ex.toFixed(1), +ey.toFixed(1), 3, fill, stroke, sw * .7);
    });
    s += flower(140, 16, 3.4, fill, stroke, sw * .7);
    return s;
  }
  function tileArt(fill, stroke, sw) {
    const art = sprig(fill, stroke, sw);
    return [
      `<g transform="translate(0 138)">${art}</g>`,
      `<g transform="translate(300 -6) scale(-1 1)">${art}</g>`,
      `<g transform="translate(176 196) rotate(-28) scale(.58)">${art}</g>`,
      `<g transform="translate(26 6) rotate(18) scale(.55)">${art}</g>`
    ].join('');
  }
  function embossTile(k = 1) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">` +
      `<g transform="translate(.9 1.1)" opacity="${.38 * k}">${tileArt('none', '#2a3220', 1.3)}</g>` +
      `<g transform="translate(-.8 -.9)" opacity="${.42 * k}">${tileArt('none', '#ffffff', 1.1)}</g>` +
      `<g opacity="${k}">${tileArt('rgba(255,255,255,.09)', 'rgba(255,255,255,.05)', 1)}</g>` +
      `</svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  }
  document.documentElement.style.setProperty('--emboss', embossTile(1));
  document.documentElement.style.setProperty('--emboss-light', embossTile(.45));

  // decorative line sprigs in some sections
  const sprigLine = `<svg class="sprig" viewBox="0 0 160 160" aria-hidden="true">${sprig('none', 'currentColor', 1)}</svg>`;
  ['#story', '#venue', '#dress', '#rsvp'].forEach((id, i) => {
    const sec = $(id);
    sec.insertAdjacentHTML('afterbegin', sprigLine.replace('class="sprig"', `class="sprig sprig--${i % 2 ? 'br' : 'tl'}"`));
  });

  /* ---------------------------------------------------------
     Content rendering + i18n
     --------------------------------------------------------- */
  let lang = params.get('lang') || store.get('wedding-lang') || 'th';
  if (!T[lang]) lang = 'th';

  function splitGraphemes(str, l) {
    if (window.Intl && Intl.Segmenter) {
      return Array.from(new Intl.Segmenter(l, { granularity: 'grapheme' }).segment(str), s => s.segment);
    }
    return l === 'th' ? [str] : Array.from(str);
  }

  function setSplit(el, text) {
    el.innerHTML = '';
    el.setAttribute('aria-label', text);
    splitGraphemes(text, lang).forEach(g => {
      const s = document.createElement('span');
      s.className = 'ch';
      s.setAttribute('aria-hidden', 'true');
      s.textContent = g === ' ' ? ' ' : g;
      el.appendChild(s);
    });
  }

  function render() {
    const t = T[lang];
    const isTh = lang === 'th';
    document.documentElement.lang = lang;

    $$('[data-i18n]').forEach(el => { const v = t[el.dataset.i18n]; if (v != null) el.textContent = v; });
    $$('[data-i18n-html]').forEach(el => { const v = t[el.dataset.i18nHtml]; if (v != null) el.innerHTML = v; });

    $$('.js-ini1').forEach(el => el.textContent = C.initials[0]);
    $$('.js-ini2').forEach(el => el.textContent = C.initials[1]);

    const names = C.couple[lang];
    setSplit($('.js-name1'), names[0]);
    setSplit($('.js-name2'), names[1]);
    $$('.js-couple').forEach(el => el.textContent = isTh ? `${names[0]} & ${names[1]}` : `${names[0]} & ${names[1]}`.toUpperCase());
    $('.parents').innerHTML = (C.parents && C.parents[lang]) || '';

    $$('.js-date-short').forEach(el => el.textContent = `${pad(D)} . ${pad(Mo)} . ${String(Y).slice(-2)}`);
    $('.js-date-long').textContent = isTh
      ? `วัน${DAY_TH[weekday]}ที่ ${D} ${MONTH_TH[Mo - 1]} ${Y + 543}`
      : `${DAY_EN[weekday]}, ${MONTH_EN[Mo - 1]} ${ord(D)}`.toUpperCase();
    $('.js-time').textContent = isTh ? `เวลา ${pad(h)}.${pad(mi)} น.` : `AT ${fmtTimeEn(h, mi)}`;

    $$('.js-venue-name').forEach(el => el.textContent = C.venue[lang].name);
    $$('.js-venue-addr').forEach(el => el.textContent = C.venue[lang].address);

    $('.js-rsvp-by').textContent = fmtDayMonth(C.rsvp.by, lang);
    $$('.js-email').forEach(el => { el.textContent = C.rsvp.email; el.href = `mailto:${C.rsvp.email}`; });

    $('#programList').innerHTML = C.program.map(p => {
      const [ph, pm] = p.time.split(':').map(Number);
      const tm = isTh ? `${pad(ph)}.${pad(pm)} น.` : fmtTimeEn(ph, pm);
      return `<li><time>${tm}</time><span>${p[lang]}</span></li>`;
    }).join('');

    $('#storyList').innerHTML = '<span class="story__line"></span>' + C.story.map(s => {
      const yr = isTh ? Number(s.year) + 543 : s.year;
      return `<li><div class="story__year">${yr}</div><div class="story__body"><h3>${s[lang].title}</h3><p>${s[lang].text}</p></div></li>`;
    }).join('');

    document.title = `${names[0]} & ${names[1]} — ${t.calTitle}`;
  }

  render();

  // Static, language-independent bits
  const mapQ = encodeURIComponent(C.venue.mapQuery);
  $('#mapFrame').src = `https://maps.google.com/maps?q=${mapQ}&z=15&output=embed`;
  $('#mapLink').href = C.venue.mapUrl || `https://www.google.com/maps/search/?api=1&query=${mapQ}`;

  /* ---------------------------------------------------------
     Language toggle (crossfade)
     --------------------------------------------------------- */
  const card = $('#card');
  card.classList.add('i18n-fade');
  $('.envelope__inner').classList.add('i18n-fade');

  $('#langToggle').addEventListener('click', () => {
    const root = document.documentElement;
    root.classList.add('lang-switching');
    setTimeout(() => {
      lang = lang === 'th' ? 'en' : 'th';
      store.set('wedding-lang', lang);
      render();
      if (animOn) setupDynamicAnims();
      root.classList.remove('lang-switching');
      if (hasGsap) ScrollTrigger.refresh();
    }, 360);
  });

  /* ---------------------------------------------------------
     Countdown
     --------------------------------------------------------- */
  const cd = { d: $('#cd-d'), h: $('#cd-h'), m: $('#cd-m'), s: $('#cd-s') };
  function tick() {
    let diff = Math.max(0, eventDate - Date.now());
    const d = Math.floor(diff / 864e5); diff -= d * 864e5;
    const hh = Math.floor(diff / 36e5); diff -= hh * 36e5;
    const mm = Math.floor(diff / 6e4); diff -= mm * 6e4;
    const ss = Math.floor(diff / 1e3);
    cd.d.textContent = d; cd.h.textContent = pad(hh); cd.m.textContent = pad(mm); cd.s.textContent = pad(ss);
  }
  tick();
  setInterval(tick, 1000);

  /* ---------------------------------------------------------
     Add to calendar (.ics)
     --------------------------------------------------------- */
  $('#addCal').addEventListener('click', () => {
    const toICS = d => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const end = new Date(eventDate.getTime() + (C.durationHours || 6) * 36e5);
    const names = C.couple[lang];
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//wedding//invite//EN', 'BEGIN:VEVENT',
      `UID:${toICS(eventDate)}-wedding@invite`,
      `DTSTAMP:${toICS(new Date())}`,
      `DTSTART:${toICS(eventDate)}`, `DTEND:${toICS(end)}`,
      `SUMMARY:${T[lang].calTitle} ${names[0]} & ${names[1]}`,
      `LOCATION:${C.venue[lang].name}\\, ${C.venue[lang].address.replace(/,/g, '\\,')}`,
      'END:VEVENT', 'END:VCALENDAR'
    ].join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    a.download = 'wedding.ics';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  });

  /* ---------------------------------------------------------
     QR code
     --------------------------------------------------------- */
  if (window.QRCode) {
    const target = C.rsvp.formUrl || (location.href.split('#')[0].split('?')[0] + '#rsvp');
    new QRCode($('#qr'), { text: target, width: 232, height: 232, colorDark: '#4b5240', colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.M });
  } else {
    $('.qr').remove();
  }

  /* ---------------------------------------------------------
     RSVP form
     --------------------------------------------------------- */
  const form = $('#rsvpForm');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(form);
    const msg = $('#formMsg');
    const name = (fd.get('name') || '').trim();
    if (!name) { msg.textContent = T[lang].needName; form.name.focus(); return; }

    const attend = fd.get('attend') === 'yes' ? T[lang].yes : T[lang].no;
    const body = `${T[lang].fName}: ${name}\n${T[lang].fAttend}: ${attend}\n${T[lang].fGuests}: ${fd.get('guests')}\n${T[lang].fMsg}: ${fd.get('message') || '-'}`;
    if (C.rsvp.formUrl) {
      window.open(C.rsvp.formUrl, '_blank', 'noopener');
    } else {
      location.href = `mailto:${C.rsvp.email}?subject=${encodeURIComponent('RSVP — ' + name)}&body=${encodeURIComponent(body)}`;
    }
    msg.textContent = T[lang].sent;
    burst(form.querySelector('button'));
  });

  function burst(origin) {
    if (!animOn) return;
    const r = origin.getBoundingClientRect();
    for (let i = 0; i < 22; i++) {
      const leaf = document.createElement('span');
      leaf.style.cssText = `position:fixed;left:${r.left + r.width / 2}px;top:${r.top + r.height / 2}px;width:10px;height:5px;border-radius:10px 0;pointer-events:none;z-index:80;background:${['#8f9d74', '#c7b285', '#a7b28d', '#e6dcc3'][i % 4]}`;
      document.body.appendChild(leaf);
      const a = Math.random() * Math.PI * 2, d = 60 + Math.random() * 120;
      gsap.to(leaf, {
        x: Math.cos(a) * d, y: Math.sin(a) * d - 60, rotation: Math.random() * 540 - 270,
        opacity: 0, duration: 1.4 + Math.random() * .6, ease: 'power2.out', onComplete: () => leaf.remove()
      });
    }
  }

  /* ---------------------------------------------------------
     Music (optional)
     --------------------------------------------------------- */
  const bgm = $('#bgm');
  const musicBtn = $('#musicToggle');
  if (C.music) {
    bgm.src = C.music;
    musicBtn.hidden = false;
    musicBtn.addEventListener('click', () => {
      if (bgm.paused) bgm.play().catch(() => {}); else bgm.pause();
    });
    bgm.addEventListener('play', () => musicBtn.classList.add('is-playing'));
    bgm.addEventListener('pause', () => musicBtn.classList.remove('is-playing'));
  }

  /* ---------------------------------------------------------
     Smooth scroll (Lenis) + ScrollTrigger
     --------------------------------------------------------- */
  let lenis = null;
  if (window.Lenis && !reduceMotion) {
    lenis = new Lenis({ duration: 1.25, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    lenis.stop();
    if (hasGsap) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(time => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = time => { lenis.raf(time); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }

  $$('.dots a').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    const target = $(a.getAttribute('href'));
    if (lenis) lenis.scrollTo(target, { duration: 1.6 }); else target.scrollIntoView({ behavior: 'smooth' });
  }));

  /* ---------------------------------------------------------
     Helpers for stroke drawing
     --------------------------------------------------------- */
  function prepDraw(paths) {
    paths.forEach(p => {
      const len = p.getTotalLength ? p.getTotalLength() : 0;
      p.style.strokeDasharray = len;
      p.style.strokeDashoffset = len;
    });
    return paths;
  }

  /* ---------------------------------------------------------
     Scroll animations
     --------------------------------------------------------- */
  let dynTriggers = [];

  function setupDynamicAnims() {
    dynTriggers.forEach(t => t.kill());
    dynTriggers = [];

    // Names: letter-by-letter with blur
    [$('.js-name1'), $('.js-name2')].forEach((el, i) => {
      const tw = gsap.from($$('.ch', el), {
        opacity: 0, yPercent: 60, filter: 'blur(8px)',
        duration: 1.1, ease: 'power3.out', stagger: 0.045, delay: i * 0.25,
        scrollTrigger: { trigger: el, start: 'top 85%', once: true }
      });
      dynTriggers.push(tw.scrollTrigger);
    });

    // Program rows
    const rows = $$('#programList li');
    const tw2 = gsap.timeline({ scrollTrigger: { trigger: '#programList', start: 'top 80%', once: true } });
    tw2.from(rows, { opacity: 0, y: 16, filter: 'blur(6px)', duration: .9, ease: 'power3.out', stagger: .09 })
       .fromTo(rows, { '--line-s': 0 }, { '--line-s': 1, duration: 1, ease: 'power2.inOut', stagger: .09 }, .15);
    dynTriggers.push(tw2.scrollTrigger);

    // Story timeline
    const line = $('.story__line');
    const tw3 = gsap.to(line, {
      scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: '#storyList', start: 'top 70%', end: 'bottom 60%', scrub: .8 }
    });
    dynTriggers.push(tw3.scrollTrigger);
    $$('#storyList li').forEach((li, i) => {
      const tw = gsap.from(li.children, {
        opacity: 0, x: (k) => (k === 0) === (i % 2 === 0) ? -24 : 24, filter: 'blur(6px)',
        duration: 1, ease: 'power3.out', stagger: .12,
        scrollTrigger: { trigger: li, start: 'top 82%', once: true }
      });
      dynTriggers.push(tw.scrollTrigger);
    });
  }

  function setupScrollAnims() {
    // Generic reveal (blur → sharp, like the video)
    $$('[data-reveal]').filter(el => !el.closest('#hero')).forEach(el => {
      gsap.fromTo(el,
        { opacity: 0, y: 26, filter: 'blur(10px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.25, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    });

    // Villa drawing, scrubbed by scroll
    const villaPaths = prepDraw($$('#villa path'));
    gsap.to(villaPaths, {
      strokeDashoffset: 0, ease: 'none', stagger: .015,
      scrollTrigger: { trigger: '#villa', start: 'top 92%', end: 'bottom 50%', scrub: 1 }
    });
    gsap.fromTo('#villa', { opacity: .2 }, { opacity: 1, scrollTrigger: { trigger: '#villa', start: 'top 92%', end: 'center 60%', scrub: true } });

    // Hero parallax out
    gsap.to('#hero > *:not(.scroll-cue)', {
      yPercent: -40, opacity: 0, filter: 'blur(6px)', ease: 'none', stagger: .04,
      scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom 20%', scrub: true }
    });

    // Decorative sprigs drift
    $$('.sprig').forEach(s => {
      gsap.fromTo(s, { y: 40 }, { y: -40, ease: 'none', scrollTrigger: { trigger: s.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
      prepDraw($$('path', s));
      gsap.to($$('path', s), { strokeDashoffset: 0, duration: 2.4, ease: 'power2.inOut', stagger: .03,
        scrollTrigger: { trigger: s.parentElement, start: 'top 70%', once: true } });
    });

    // Swatches pop
    gsap.from('.swatches li', {
      opacity: 0, scale: .5, y: 20, duration: .9, ease: 'back.out(1.8)', stagger: .08,
      scrollTrigger: { trigger: '.swatches', start: 'top 85%', once: true }
    });

    // Titles: gentle letter-spacing settle
    $$('.title').forEach(el => {
      const ls = getComputedStyle(el).letterSpacing;
      gsap.fromTo(el, { letterSpacing: '.22em' }, { letterSpacing: ls === 'normal' ? '0px' : ls, duration: 1.6, ease: 'power3.out', clearProps: 'letterSpacing',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    });

    // Monogram small laurels gently rotate in
    $$('.monogram--sm, .monogram--xs').forEach(m => {
      gsap.from($('.laurel', m), { scale: .7, rotate: -8, duration: 1.4, ease: 'power3.out',
        scrollTrigger: { trigger: m, start: 'top 88%', once: true } });
    });

    // Section dots
    $$('.dots a').forEach(a => {
      ScrollTrigger.create({
        trigger: a.getAttribute('href'), start: 'top center', end: 'bottom center',
        onToggle: self => self.isActive && $$('.dots a').forEach(x => x.classList.toggle('is-active', x === a))
      });
    });

    setupDynamicAnims();
  }

  /* ---------------------------------------------------------
     Hero intro (runs as envelope opens)
     --------------------------------------------------------- */
  function heroIntro(tl, at) {
    const laurelPaths = prepDraw($$('#hero .laurel path, #hero .laurel circle'));
    tl.to(laurelPaths, { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut', stagger: .04 }, at)
      .fromTo('#hero .monogram', { opacity: 0 }, { opacity: 1, duration: .6 }, at)
      .from('#hero .monogram__letters', { opacity: 0, scale: .85, filter: 'blur(8px)', duration: 1.4, ease: 'power3.out' }, at + .5)
      .fromTo('#hero [data-reveal]:not(.monogram)', { opacity: 0, y: 22, filter: 'blur(10px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.3, ease: 'power3.out', stagger: .22 }, at + .9)
      .to(['.frame', '.dots'], { opacity: 1, duration: 1.2, ease: 'power2.out' }, at + .4);
  }

  /* ---------------------------------------------------------
     Envelope opening
     --------------------------------------------------------- */
  const envelope = $('#envelope');
  const seal = $('#seal');
  let opened = false;

  function finishOpen() {
    envelope.remove();
    document.body.classList.remove('is-locked');
    if (lenis) lenis.start();
    if (hasGsap) ScrollTrigger.refresh();
  }

  function openEnvelope(instant) {
    if (opened) return;
    opened = true;
    if (C.music && !instant) bgm.play().catch(() => {});

    if (!animOn) {
      $$('[data-reveal]').forEach(el => el.style.opacity = 1);
      $$('.frame, .dots').forEach(el => el.style.opacity = 1);
      finishOpen();
      return;
    }

    setupScrollAnims();

    if (instant) {
      const tl = gsap.timeline();
      heroIntro(tl, 0);
      tl.progress(1);
      finishOpen();
      return;
    }

    $$('.seal, .envelope__hint').forEach(el => el.style.animation = 'none');
    const tl = gsap.timeline({ onComplete: finishOpen });
    tl.to(['.envelope__hint', '.envelope__to'], { opacity: 0, y: 10, duration: .4, ease: 'power2.out' }, 0)
      .to(seal, { scale: 1.08, duration: .18, ease: 'power2.out' }, 0)
      .to(seal, { scale: .4, opacity: 0, rotate: -25, y: 30, filter: 'blur(6px)', duration: .65, ease: 'power3.in' }, .18)
      .to('.flap-wrap--top',    { rotateX: 165, duration: 1.2, ease: 'power3.inOut' }, .45)
      .to('.flap-wrap--bottom', { rotateX: -165, duration: 1.2, ease: 'power3.inOut' }, .6)
      .to('.flap-wrap--left',   { rotateY: -165, duration: 1.2, ease: 'power3.inOut' }, .7)
      .to('.flap-wrap--right',  { rotateY: 165, duration: 1.2, ease: 'power3.inOut' }, .7)
      .to('.flap-wrap', { opacity: 0, duration: .5, ease: 'power1.in' }, 1.25)
      .to(envelope, { opacity: 0, duration: .9, ease: 'power2.inOut' }, 1.0)
      .fromTo('#card', { scale: .94, y: 40, filter: 'blur(4px)' }, { scale: 1, y: 0, filter: 'blur(0px)', duration: 1.6, ease: 'power3.out', clearProps: 'transform,filter' }, .9);
    heroIntro(tl, 1.3);

    const seek = parseFloat(params.get('seek'));
    if (!isNaN(seek)) { tl.progress(seek).pause(); }
  }
  if (params.has('seek')) setTimeout(() => openEnvelope(false), 300);

  seal.addEventListener('click', () => openEnvelope(false));
  envelope.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openEnvelope(false); });

  // ?open=1 skips the envelope (handy for sharing a direct link / testing)
  if (params.get('open') === '1') {
    openEnvelope(true);
    if (location.hash) {
      const target = $(location.hash);
      if (target) requestAnimationFrame(() => lenis ? lenis.scrollTo(target, { immediate: true }) : target.scrollIntoView());
    }
  }
})();
