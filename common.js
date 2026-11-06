(() => {
  // Номер счётчика Яндекс Метрики: подставляется после создания счётчика
  const YM_ID = 0;
  const LEAD_ENDPOINT = 'https://lead-relay.leestygpt.workers.dev/lead/CUQSASEWWS';
  const KEY = 'cookie-choice';
  const store = {
    get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } },
    set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  };

  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const loadMetrika = () => {
    if (!YM_ID || window.__ymLoaded) return;
    window.__ymLoaded = true;
    (function (m, e, t, r, i, k, a) {
      m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); };
      m[i].l = 1 * new Date();
      k = e.createElement(t); a = e.getElementsByTagName(t)[0]; k.async = 1; k.src = r; a.parentNode.insertBefore(k, a);
    })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');
    window.ym(YM_ID, 'init', { clickmap: true, trackLinks: true, accurateTrackBounce: true, webvisor: false });
  };

  // плашка cookie
  const choice = store.get();
  if (choice === 'yes') loadMetrika();
  if (!choice) {
    const box = document.createElement('div');
    box.className = 'cookie';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', 'Использование cookie');
    box.innerHTML = '<span>Сайт использует cookie и Яндекс Метрику, чтобы работать лучше. Подробности в <a href="privacy.html">политике конфиденциальности</a>.</span>' +
      '<span class="cookie__btns"><button type="button" class="ghost" data-c="no">Отказаться</button><button type="button" data-c="yes">Принять</button></span>';
    document.body.appendChild(box);
    requestAnimationFrame(() => setTimeout(() => box.classList.add('show'), 600));
    box.addEventListener('click', e => {
      const c = e.target.getAttribute && e.target.getAttribute('data-c');
      if (!c) return;
      store.set(c);
      box.classList.remove('show');
      setTimeout(() => box.remove(), 700);
      if (c === 'yes') loadMetrika();
    });
  }

  // внутренние страницы: форма заявки и появление блоков
  if (!document.querySelector('.hero')) {
    const form = document.getElementById('leadForm');
    form?.querySelectorAll('input[type="tel"]').forEach(input => {
      input.addEventListener('input', e => {
        const raw = e.target.value;
        if (/[a-zA-Z@а-яА-Я_]/.test(raw)) return;
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
      payload.page = location.pathname;
      btn.disabled = true; btn.textContent = 'Отправляем...';
      try {
        const r = await fetch(LEAD_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        btn.textContent = 'Заявка отправлена. Свяжусь с вами';
        form.reset();
      } catch (err) { console.error(err); btn.textContent = 'Не отправилось, попробуйте ещё раз'; }
      finally { setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 3500); }
    });

    const targets = document.querySelectorAll('.dhero > *, .sec h2, .sec .lead, .card, .say, .sec table, .sec details, .todo, .fact');
    const seen = new Map();
    targets.forEach(el => {
      const n = seen.get(el.parentElement) || 0;
      seen.set(el.parentElement, n + 1);
      el.classList.add('rv');
      el.style.transitionDelay = Math.min(n * 0.06, 0.4) + 's';
    });
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });
    targets.forEach(el => io.observe(el));
  }
})();
