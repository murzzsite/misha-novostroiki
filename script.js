(() => {
  const LEAD_ENDPOINT = 'https://lead-relay.leestygpt.workers.dev/lead/CUQSASEWWS';
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // load choreography
  const go = () => root.classList.add('ready');
  if (document.fonts && document.fonts.ready) {
    Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1200))]).then(() => setTimeout(go, 80));
  } else { setTimeout(go, 200); }

  // header + hero parallax
  const header = document.getElementById('header');
  const hero = document.querySelector('.hero');
  const heroImg = document.querySelector('.hero__img');
  const onScrollHeader = () => {
    const y = window.scrollY;
    const vh = window.innerHeight;
    header.classList.toggle('is-solid', y > vh * 0.6);
    if (heroImg && !reduce && y < vh * 1.2) heroImg.style.setProperty('--py', (y * 0.14).toFixed(1) + 'px');
  };

  // burger
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');
  const setMenu = open => {
    burger.classList.toggle('is-open', open);
    nav.classList.toggle('is-open', open);
    header.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
  };
  burger?.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));

  // phone mask (+7 only if user types digits)
  document.querySelectorAll('input[type="tel"]').forEach(input => {
    input.addEventListener('input', e => {
      const raw = e.target.value;
      if (/[a-zA-Z@а-яА-Я_]/.test(raw)) return; // позволяем вводить @ник Telegram
      let v = raw.replace(/\D/g, '');
      if (!v) { e.target.value = raw.startsWith('+') ? '+' : ''; return; }
      if (v.startsWith('8')) v = '7' + v.slice(1);
      if (!v.startsWith('7')) v = '7' + v;
      v = v.slice(0, 11);
      let out = '+7';
      if (v.length > 1) out += ' (' + v.slice(1, 4);
      if (v.length >= 4) out += ') ' + v.slice(4, 7);
      if (v.length >= 7) out += '-' + v.slice(7, 9);
      if (v.length >= 9) out += '-' + v.slice(9, 11);
      e.target.value = out;
    });
  });

  // budget dial
  const range = document.getElementById('dialRange');
  const val = document.getElementById('dialValue');
  const fill = document.getElementById('dialFill');
  const nameEl = document.getElementById('dialName');
  const textEl = document.getElementById('dialText');
  const cls = document.querySelector('.dial__class');
  const sel = document.getElementById('budgetSel');
  const tiers = [
    { max: 50, i: 0, name: 'Бизнес-класс, 20–60 млн ₽',
      text: 'Закрытые дворы, подземный паркинг, продуманные планировки. Сравниваю застройщиков, очереди и условия оплаты, чтобы вы не переплатили за громкое имя.' },
    { max: 100, i: 1, name: 'Премиум-класс, 50–150 млн ₽',
      text: 'Расположение, архитектура и сервис дома. Подбираю комплексы, где качество подтверждено документами и репутацией застройщика, и проверяю, что в договоре записано обещанное.' },
    { max: 1000, i: 2, name: 'Элитная недвижимость, от 100 млн ₽',
      text: 'Редкие лоты и закрытые предложения. Работаю предметно: отбираю единичные варианты, проверяю юридическую чистоту и веду переговоры об условиях лично.' }
  ];
  let lastTier = -1;
  const updateDial = () => {
    const v = +range.value;
    const t = tiers.find(x => v < x.max) || tiers[2];
    val.textContent = v >= 150 ? '150 млн ₽ и выше' : v + ' млн ₽';
    fill.style.setProperty('--p', ((v - 20) / 130).toFixed(3));
    if (t.i !== lastTier) {
      nameEl.textContent = t.name;
      textEl.textContent = t.text;
      if (sel) sel.selectedIndex = t.i;
      if (lastTier !== -1 && !reduce) {
        cls.classList.remove('swap'); void cls.offsetWidth; cls.classList.add('swap');
      }
      lastTier = t.i;
    }
  };
  if (range) { range.addEventListener('input', updateDial); updateDial(); }

  // scroll story
  const story = document.querySelector('.story');
  const items = document.querySelectorAll('#storyList li');
  const imgs = document.querySelectorAll('.story__img');
  let storyIdx = 0;
  const updateStory = () => {
    if (!story) return;
    const r = story.getBoundingClientRect();
    const total = story.offsetHeight - window.innerHeight;
    const p = Math.min(0.999, Math.max(0, -r.top / total));
    const idx = Math.floor(p * items.length);
    if (idx !== storyIdx) {
      storyIdx = idx;
      items.forEach((li, k) => li.classList.toggle('is-active', k === idx));
      imgs.forEach((im, k) => im.classList.toggle('is-on', k === idx));
    }
  };

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { onScrollHeader(); updateStory(); ticking = false; });
  }, { passive: true });
  onScrollHeader(); updateStory();

  // steps row
  const row = document.getElementById('row');
  const bar = document.getElementById('bar');
  const stepW = () => (row.querySelector('.step')?.offsetWidth || 300) + 32;
  const updateBar = () => {
    const max = row.scrollWidth - row.clientWidth;
    const p = max > 0 ? row.scrollLeft / max : 1;
    bar.style.transform = 'scaleX(' + (0.18 + 0.82 * p).toFixed(3) + ')';
  };
  row?.addEventListener('scroll', updateBar, { passive: true });
  document.getElementById('next')?.addEventListener('click', () => row.scrollBy({ left: stepW(), behavior: 'smooth' }));
  document.getElementById('prev')?.addEventListener('click', () => row.scrollBy({ left: -stepW(), behavior: 'smooth' }));
  let drag = null;
  row?.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse') return;
    drag = { x: e.clientX, left: row.scrollLeft };
    row.classList.add('drag');
  });
  window.addEventListener('pointermove', e => { if (drag) row.scrollLeft = drag.left - (e.clientX - drag.x); });
  window.addEventListener('pointerup', () => {
    if (!drag) return;
    drag = null; row.classList.remove('drag');
  });
  updateBar();

  // form
  const form = document.getElementById('leadForm');
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const orig = btn.textContent;
    const payload = {};
    new FormData(form).forEach((v, k) => { payload[k] = v; });
    if (payload._gotcha) return;
    if (!payload.name || !payload.phone) { alert('Заполните имя и контакт для связи'); return; }
    if (!payload.consent) { alert('Нужно согласие на обработку персональных данных'); return; }
    payload.consent = 'да';
    btn.disabled = true;
    btn.textContent = 'Отправляем...';
    try {
      const resp = await fetch(LEAD_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      btn.textContent = 'Заявка отправлена. Свяжусь с вами';
      form.reset();
      updateDial();
    } catch (err) {
      console.error(err);
      btn.textContent = 'Не отправилось, попробуйте ещё раз';
    } finally {
      setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 3500);
    }
  });

  // smooth anchors with header offset
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href.length <= 1) return;
      const t = document.querySelector(href);
      if (!t) return;
      e.preventDefault();
      const top = t.getBoundingClientRect().top + window.scrollY - (href === '#contact' ? 0 : 56);
      window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  // staged reveal: heading, then text, then picture
  const targets = document.querySelectorAll(
    '.budget .head, .budget__note, .budget__panel, .story__head, .steps__top, .step, .faq .head, .faq__lead, .faq details, .faq .btn, .faq__tall, .faq__sq, .cta__title, .cta__sub, .form, .footer__cols ul'
  );
  const groups = new Map();
  targets.forEach(el => {
    const parent = el.parentElement;
    const n = groups.get(parent) || 0;
    groups.set(parent, n + 1);
    el.classList.add('rv');
    el.style.setProperty('--d', Math.min(n * 0.08, 0.5).toFixed(2) + 's');
  });
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  targets.forEach(el => io.observe(el));
})();
