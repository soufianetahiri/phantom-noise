// ============================================================================
// Phantom Noise — Content Script
// Simulates realistic human browsing behavior in decoy tabs
// ============================================================================

(() => {
  'use strict';

  let isPhantomTab = false;

  const PROFILES = {
    low:  { scrolls: [1, 3],  clicks: [0, 1], hovers: [1, 3],  readPauses: [800, 2500] },
    med:  { scrolls: [2, 5],  clicks: [0, 2], hovers: [2, 5],  readPauses: [600, 2000] },
    high: { scrolls: [3, 7],  clicks: [1, 3], hovers: [3, 7],  readPauses: [400, 1500] },
    max:  { scrolls: [4, 10], clicks: [1, 4], hovers: [4, 10], readPauses: [300, 1000] }
  };

  function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  // ─── Human-like Scroll ────────────────────────────────────────────────
  async function smoothScroll(distance, duration) {
    const start = window.scrollY;
    const startTime = performance.now();
    return new Promise(resolve => {
      function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        window.scrollTo(0, start + distance * easeInOut(progress));
        if (progress < 1) requestAnimationFrame(step);
        else resolve();
      }
      requestAnimationFrame(step);
    });
  }

  async function simulateScroll() {
    const vh = window.innerHeight;
    const maxScroll = document.documentElement.scrollHeight - vh;
    if (maxScroll <= 0) return;

    const distance = rand(Math.floor(vh * 0.2), Math.floor(vh * 0.8));
    const clamped = Math.min(distance, maxScroll - window.scrollY);
    if (clamped <= 0) return;

    const duration = rand(400, 1200);
    await smoothScroll(clamped, duration);
    report('scroll', { distance: clamped, duration });
  }

  // ─── Human-like Mouse Movement ────────────────────────────────────────
  function dispatchMouse(type, x, y, el) {
    const evt = new MouseEvent(type, {
      bubbles: true, cancelable: true, view: window,
      clientX: x, clientY: y, screenX: x + window.screenX, screenY: y + window.screenY
    });
    (el || document.elementFromPoint(x, y) || document.body).dispatchEvent(evt);
  }

  async function simulateMouseMove(tx, ty, steps = 10) {
    const sx = rand(0, window.innerWidth);
    const sy = rand(0, window.innerHeight);
    const cpx = (sx + tx) / 2 + rand(-100, 100);
    const cpy = (sy + ty) / 2 + rand(-50, 50);

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = Math.round((1-t)*(1-t)*sx + 2*(1-t)*t*cpx + t*t*tx);
      const y = Math.round((1-t)*(1-t)*sy + 2*(1-t)*t*cpy + t*t*ty);
      dispatchMouse('mousemove', x, y);
      await sleep(rand(10, 40));
    }
  }

  // ─── Hover ────────────────────────────────────────────────────────────
  async function simulateHover() {
    const els = getVisible('a, button, img, h2, h3, p, [role="link"]');
    if (!els.length) return;

    const el = els[rand(0, els.length - 1)];
    const r = el.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;

    await simulateMouseMove(x, y);
    dispatchMouse('mouseenter', x, y, el);
    dispatchMouse('mouseover', x, y, el);
    await sleep(rand(300, 1500));
    dispatchMouse('mouseout', x, y, el);
    dispatchMouse('mouseleave', x, y, el);

    report('hover', { tag: el.tagName, text: (el.textContent || '').slice(0, 50) });
  }

  // ─── Click ────────────────────────────────────────────────────────────
  async function simulateClick() {
    const links = getVisible('a[href]').filter(a => {
      try {
        const u = new URL(a.href, location.origin);
        return u.hostname === location.hostname &&
          !a.href.includes('logout') && !a.href.includes('delete') &&
          !a.href.includes('unsubscribe') && !a.href.includes('mailto:') &&
          !a.href.includes('tel:') && !a.closest('form');
      } catch { return false; }
    });
    if (!links.length) return;

    const el = links[rand(0, links.length - 1)];
    const r = el.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;

    await simulateMouseMove(x, y);
    dispatchMouse('mousedown', x, y, el);
    await sleep(rand(50, 150));
    dispatchMouse('mouseup', x, y, el);
    dispatchMouse('click', x, y, el);

    report('click', { tag: el.tagName, href: (el.href || '').slice(0, 100), text: (el.textContent || '').slice(0, 50) });
  }

  // ─── Text Selection ───────────────────────────────────────────────────
  async function simulateSelect() {
    const ps = getVisible('p, article p, .content p, main p');
    if (!ps.length) return;
    const p = ps[rand(0, ps.length - 1)];
    const txt = p.textContent;
    if (!txt || txt.length < 20) return;

    try {
      const range = document.createRange();
      const s = rand(0, Math.floor(txt.length / 2));
      const e = Math.min(s + rand(10, 40), txt.length);
      range.setStart(p.firstChild, s);
      range.setEnd(p.firstChild, e);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      await sleep(rand(200, 800));
      sel.removeAllRanges();
    } catch { /* text node structure may differ */ }

    report('select', { text: (txt || '').slice(0, 30) });
  }

  // ─── Helpers ──────────────────────────────────────────────────────────
  function getVisible(sel) {
    return Array.from(document.querySelectorAll(sel)).filter(el => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.top >= 0 && r.top < window.innerHeight && r.left >= 0 && r.left < window.innerWidth;
    });
  }

  function report(type, detail) {
    try { chrome.runtime.sendMessage({ action: 'interaction', detail: { type, ...detail, timestamp: Date.now() } }); }
    catch { /* popup closed */ }
  }

  // ─── Main Simulation ──────────────────────────────────────────────────
  async function runSimulation(intensity) {
    const p = PROFILES[intensity] || PROFILES.med;
    await sleep(rand(500, 1500));

    const actions = [];
    for (let i = 0; i < rand(...p.scrolls); i++) actions.push('scroll');
    for (let i = 0; i < rand(...p.clicks); i++) actions.push('click');
    for (let i = 0; i < rand(...p.hovers); i++) actions.push('hover');
    if (Math.random() < 0.3) actions.push('select');

    // Shuffle
    for (let i = actions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [actions[i], actions[j]] = [actions[j], actions[i]];
    }

    for (const a of actions) {
      if (!isPhantomTab) return;
      switch (a) {
        case 'scroll': await simulateScroll(); break;
        case 'click': await simulateClick(); break;
        case 'hover': await simulateHover(); break;
        case 'select': await simulateSelect(); break;
      }
      await sleep(rand(...p.readPauses));
    }

    report('simulation-complete', { actions: actions.length });
  }

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.action === 'simulate') {
      isPhantomTab = true;
      runSimulation(msg.intensity).catch(() => {});
      sendResponse({ ok: true });
    }
    return true;
  });
})();
