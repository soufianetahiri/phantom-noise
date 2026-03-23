// ============================================================================
// Phantom Noise — Popup UI Controller
// ============================================================================

(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const $$ = sel => document.querySelectorAll(sel);

  const powerBtn = $('power-btn');
  const statusText = $('status-text');
  const intensityBtns = $$('.intensity-btn');
  const intensityBadge = $('intensity-badge');
  const intensityDesc = $('intensity-desc');
  const logFeed = $('log-feed');
  const filterBtns = $$('.filter-btn');
  const bandwidthCanvas = $('bandwidth-chart');

  let currentState = null;
  let currentFilter = 'all';
  let refreshInterval = null;

  const INTENSITY_META = {
    low:  { label: 'Low',    desc: 'Light background noise (~18/hr). Minimal resource usage.' },
    med:  { label: 'Medium', desc: 'Moderate noise (~60/hr). Good default for daily use.' },
    high: { label: 'High',   desc: 'Heavy noise (~150/hr). Noticeably more tabs opening/closing.' },
    max:  { label: 'Max',    desc: 'Maximum noise (~300/hr). Uses more bandwidth and CPU.' }
  };

  // ─── Initialize ─────────────────────────────────────────────────────────
  async function init() {
    await fetchState();
    setupTabs();
    setupPowerButton();
    setupIntensityButtons();
    setupLogFilters();
    setupLogActions();
    setupSettings();
    loadLogs();
    startRefreshLoop();
  }

  function send(msg) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(msg, resolve);
    });
  }

  async function fetchState() {
    currentState = await send({ action: 'getState' });
    if (currentState) updateUI();
  }

  // ─── UI Updates ───────────────────────────────────────────────────────
  function updateUI() {
    if (!currentState) return;

    powerBtn.classList.toggle('active', currentState.running);
    statusText.textContent = currentState.running ? 'Running' : 'Stopped';
    statusText.classList.toggle('active', currentState.running);

    intensityBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.level === currentState.intensity);
    });
    const meta = INTENSITY_META[currentState.intensity];
    intensityBadge.textContent = meta.label;
    intensityDesc.textContent = meta.desc;

    $('stat-searches').textContent = fmt(currentState.stats.session.searches);
    $('stat-visits').textContent = fmt(currentState.stats.session.visits);
    $('stat-adclicks').textContent = fmt(currentState.stats.session.adClicks);
    $('stat-tabs').textContent = currentState.activeTabCount || 0;

    if (currentState.running && currentState.stats.session.startedAt) {
      $('session-uptime').textContent = formatDuration(Date.now() - currentState.stats.session.startedAt);
    } else {
      $('session-uptime').textContent = '\u2014';
    }

    $('alltime-searches').textContent = fmt(currentState.stats.allTime.searches);
    $('alltime-visits').textContent = fmt(currentState.stats.allTime.visits);
    $('alltime-adclicks').textContent = fmt(currentState.stats.allTime.adClicks);
    $('alltime-bandwidth').textContent = formatBytes(currentState.stats.allTime.totalBandwidth * 1024);

    drawSparkline(currentState.stats.bandwidth.history);
    syncSettings();
  }

  function fmt(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return String(n);
  }

  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    return (bytes / 1073741824).toFixed(2) + ' GB';
  }

  function formatDuration(ms) {
    const s = Math.floor(ms / 1000);
    if (s < 60) return s + 's';
    if (s < 3600) return Math.floor(s / 60) + 'm ' + (s % 60) + 's';
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return h + 'h ' + m + 'm';
  }

  // ─── Sparkline ────────────────────────────────────────────────────────
  function drawSparkline(data) {
    const ctx = bandwidthCanvas.getContext('2d');
    const w = bandwidthCanvas.width;
    const h = bandwidthCanvas.height;
    const dpr = window.devicePixelRatio || 1;

    bandwidthCanvas.width = w * dpr;
    bandwidthCanvas.height = h * dpr;
    bandwidthCanvas.style.width = w + 'px';
    bandwidthCanvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    if (!data || data.length < 2) {
      ctx.fillStyle = '#5a5f75';
      ctx.font = '11px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Waiting for data...', w / 2, h / 2 + 4);
      return;
    }

    const max = Math.max(...data, 1);
    const pad = { top: 8, bottom: 8, left: 4, right: 4 };
    const cw = w - pad.left - pad.right;
    const ch = h - pad.top - pad.bottom;
    const sx = cw / (data.length - 1);

    const grad = ctx.createLinearGradient(0, pad.top, 0, h - pad.bottom);
    grad.addColorStop(0, 'rgba(108,92,231,0.3)');
    grad.addColorStop(1, 'rgba(108,92,231,0.02)');

    ctx.beginPath();
    ctx.moveTo(pad.left, h - pad.bottom);
    data.forEach((v, i) => ctx.lineTo(pad.left + i * sx, pad.top + ch * (1 - v / max)));
    ctx.lineTo(pad.left + (data.length - 1) * sx, h - pad.bottom);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    data.forEach((v, i) => {
      const x = pad.left + i * sx, y = pad.top + ch * (1 - v / max);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#6c5ce7';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.stroke();

    const lx = pad.left + (data.length - 1) * sx;
    const ly = pad.top + ch * (1 - data[data.length - 1] / max);
    ctx.beginPath();
    ctx.arc(lx, ly, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#a29bfe';
    ctx.fill();
  }

  // ─── Tabs ─────────────────────────────────────────────────────────────
  function setupTabs() {
    $$('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        $$('.tab').forEach(t => t.classList.remove('active'));
        $$('.panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        $(`panel-${tab.dataset.tab}`).classList.add('active');
        if (tab.dataset.tab === 'log') loadLogs();
      });
    });
  }

  // ─── Power ────────────────────────────────────────────────────────────
  function setupPowerButton() {
    powerBtn.addEventListener('click', async () => {
      await send({ action: currentState?.running ? 'stop' : 'start' });
      await fetchState();
    });
  }

  // ─── Intensity ────────────────────────────────────────────────────────
  function setupIntensityButtons() {
    intensityBtns.forEach(btn => {
      btn.addEventListener('click', async () => {
        await send({ action: 'setIntensity', value: btn.dataset.level });
        await fetchState();
      });
    });
  }

  // ─── Log ──────────────────────────────────────────────────────────────
  function setupLogFilters() {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        loadLogs();
      });
    });
  }

  function setupLogActions() {
    $('export-logs').addEventListener('click', async () => {
      const resp = await send({ action: 'exportLogs' });
      if (resp?.logs) {
        const blob = new Blob([JSON.stringify(resp.logs, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `phantom-noise-logs-${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    });

    $('clear-logs').addEventListener('click', async () => {
      await send({ action: 'clearLogs' });
      logFeed.innerHTML = '<div class="log-empty">Logs cleared.</div>';
    });
  }

  async function loadLogs() {
    const resp = await send({ action: 'getLogs', limit: 200 });
    if (!resp?.logs) return;

    const filtered = currentFilter === 'all'
      ? resp.logs
      : resp.logs.filter(l => l.type === currentFilter);

    if (filtered.length === 0) {
      logFeed.innerHTML = '<div class="log-empty">No matching entries.</div>';
      return;
    }
    logFeed.innerHTML = filtered.map(renderLogEntry).join('');
  }

  function renderLogEntry(entry) {
    const time = new Date(entry.timestamp).toLocaleTimeString();
    let message = '', url = '';

    switch (entry.type) {
      case 'search':
        message = `Searched: "${entry.query}"`;
        url = entry.url;
        break;
      case 'visit':
        message = 'Visited page';
        url = entry.url;
        break;
      case 'adclick':
        message = 'Visited ad/shopping site';
        url = entry.url;
        break;
      case 'interaction':
        const d = entry.detail || {};
        if (d.type === 'scroll') message = `Scrolled ${d.distance}px over ${d.duration}ms`;
        else if (d.type === 'hover') message = `Hovered: ${d.text || d.tag}`;
        else if (d.type === 'click') message = `Clicked: ${d.text || d.href || d.tag}`;
        else if (d.type === 'select') message = `Selected text: "${d.text}"`;
        else if (d.type === 'simulation-complete') message = `Completed ${d.actions} interactions`;
        else message = `${d.type}: ${JSON.stringify(d).slice(0, 80)}`;
        url = entry.url || '';
        break;
      case 'system':
        message = entry.message;
        break;
      case 'error':
        message = entry.message || 'Error occurred';
        break;
      default:
        message = JSON.stringify(entry).slice(0, 100);
    }

    return `
      <div class="log-entry" data-type="${entry.type}">
        <span class="log-type ${entry.type}">${entry.type}</span>
        <div class="log-body">
          <div class="log-message">${escapeHtml(message)}</div>
          ${url ? `<div class="log-url">${escapeHtml(truncUrl(url))}</div>` : ''}
        </div>
        <span class="log-time">${time}</span>
      </div>`;
  }

  function truncUrl(url, max = 60) {
    return url.length <= max ? url : url.slice(0, max - 3) + '...';
  }

  function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  // ─── Settings ─────────────────────────────────────────────────────────
  function setupSettings() {
    $('setting-incognito').addEventListener('change', saveSettings);
    $('setting-cleanup').addEventListener('change', saveSettings);
    $('setting-schedule-enabled').addEventListener('change', saveSettings);
    $('setting-start-hour').addEventListener('change', saveSettings);
    $('setting-end-hour').addEventListener('change', saveSettings);

    ['search', 'browse', 'adsite'].forEach(key => {
      $(`mix-${key}`).addEventListener('input', e => {
        $(`mix-${key}-val`).textContent = e.target.value + '%';
      });
      $(`mix-${key}`).addEventListener('change', saveSettings);
    });

    $('setting-max-lifetime').addEventListener('input', e => { $('max-lifetime-val').textContent = e.target.value + 's'; });
    $('setting-min-lifetime').addEventListener('input', e => { $('min-lifetime-val').textContent = e.target.value + 's'; });
    $('setting-max-lifetime').addEventListener('change', saveSettings);
    $('setting-min-lifetime').addEventListener('change', saveSettings);

    $('reset-stats').addEventListener('click', async () => {
      if (confirm('Reset all-time statistics?')) {
        const data = await chrome.storage.local.get('phantomState');
        if (data.phantomState) {
          data.phantomState.stats.allTime = { searches: 0, visits: 0, adClicks: 0, totalBandwidth: 0 };
          await chrome.storage.local.set(data);
        }
        await fetchState();
      }
    });

    $('reset-settings').addEventListener('click', async () => {
      if (confirm('Reset all settings to defaults?')) {
        await chrome.storage.local.remove('phantomState');
        await fetchState();
        syncSettings();
      }
    });

    populateSearchEngines();
    populateCategories();
  }

  function populateSearchEngines() {
    const container = $('search-engine-list');
    const engines = { google: 'Google', duckduckgo: 'DuckDuckGo', bing: 'Bing', yahoo: 'Yahoo' };
    container.innerHTML = Object.entries(engines).map(([key, label]) => `
      <div class="engine-row">
        <div class="engine-left">
          <label class="toggle-row" style="padding:0;border:none;">
            <input type="checkbox" id="engine-${key}" checked>
            <span class="toggle-switch"></span>
          </label>
          <span>${label}</span>
        </div>
        <input type="number" class="engine-weight" id="weight-${key}" min="1" max="100" value="25" title="Relative weight">
      </div>`).join('');

    Object.keys(engines).forEach(key => {
      $(`engine-${key}`).addEventListener('change', saveSettings);
      $(`weight-${key}`).addEventListener('change', saveSettings);
    });
  }

  function populateCategories() {
    const container = $('category-list');
    if (!currentState?.categories) return;
    container.innerHTML = Object.entries(currentState.categories).map(([key, label]) => `
      <label class="cat-toggle">
        <input type="checkbox" id="cat-${key}" checked>
        <span>${label}</span>
      </label>`).join('');

    Object.keys(currentState.categories).forEach(key => {
      $(`cat-${key}`)?.addEventListener('change', saveSettings);
    });

    $('toggle-all-cats').addEventListener('click', () => {
      const cbs = container.querySelectorAll('input[type="checkbox"]');
      const allOn = Array.from(cbs).every(c => c.checked);
      cbs.forEach(c => { c.checked = !allOn; });
      saveSettings();
    });
  }

  function syncSettings() {
    if (!currentState?.settings) return;
    const s = currentState.settings;

    $('setting-incognito').checked = s.useIncognito;
    $('setting-cleanup').checked = s.cleanupAfterClose;

    // Update incognito status indicator
    const statusEl = $('incognito-status');
    const helpEl = $('incognito-help');
    if (statusEl) {
      if (!s.useIncognito && currentState.hiddenWindowId) {
        // Incognito was tried but failed, now using hidden window fallback
        statusEl.className = 'incognito-status warn';
        statusEl.textContent = 'Incognito unavailable — using hidden window with cleanup instead';
        if (helpEl) helpEl.style.display = 'block';
      } else if (!s.useIncognito) {
        statusEl.className = 'incognito-status off';
        statusEl.textContent = 'Incognito disabled — using hidden window with cleanup';
        if (helpEl) helpEl.style.display = 'none';
      } else if (currentState.incognitoWindowId) {
        statusEl.className = 'incognito-status ok';
        statusEl.textContent = 'Incognito active — decoy tabs are fully private';
        if (helpEl) helpEl.style.display = 'none';
      } else if (currentState.running) {
        statusEl.className = 'incognito-status warn';
        statusEl.textContent = 'Incognito not available — check the steps below to enable it';
        if (helpEl) helpEl.style.display = 'block';
      } else {
        statusEl.className = 'incognito-status off';
        statusEl.textContent = 'Incognito will be tested when the engine starts';
        if (helpEl) helpEl.style.display = 'block';
      }
    }
    $('setting-schedule-enabled').checked = s.schedule?.enabled || false;
    $('setting-start-hour').value = s.schedule?.startHour || 8;
    $('setting-end-hour').value = s.schedule?.endHour || 22;

    Object.keys(s.searchEngines || {}).forEach(k => { const el = $(`engine-${k}`); if (el) el.checked = s.searchEngines[k]; });
    Object.keys(s.engineWeights || {}).forEach(k => { const el = $(`weight-${k}`); if (el) el.value = s.engineWeights[k]; });

    if (s.taskMix) {
      $('mix-search').value = s.taskMix.search; $('mix-search-val').textContent = s.taskMix.search + '%';
      $('mix-browse').value = s.taskMix.browse; $('mix-browse-val').textContent = s.taskMix.browse + '%';
      $('mix-adsite').value = s.taskMix.adsite; $('mix-adsite-val').textContent = s.taskMix.adsite + '%';
    }

    $('setting-max-lifetime').value = s.maxTabLifetime || 45;
    $('max-lifetime-val').textContent = (s.maxTabLifetime || 45) + 's';
    $('setting-min-lifetime').value = s.minTabLifetime || 8;
    $('min-lifetime-val').textContent = (s.minTabLifetime || 8) + 's';

    Object.keys(s.categories || {}).forEach(k => { const el = $(`cat-${k}`); if (el) el.checked = s.categories[k]; });
  }

  async function saveSettings() {
    const settings = {
      useIncognito: $('setting-incognito').checked,
      cleanupAfterClose: $('setting-cleanup').checked,
      schedule: {
        enabled: $('setting-schedule-enabled').checked,
        startHour: parseInt($('setting-start-hour').value) || 8,
        endHour: parseInt($('setting-end-hour').value) || 22
      },
      searchEngines: {},
      engineWeights: {},
      taskMix: {
        search: parseInt($('mix-search').value) || 40,
        browse: parseInt($('mix-browse').value) || 45,
        adsite: parseInt($('mix-adsite').value) || 15
      },
      categories: {},
      maxTabLifetime: parseInt($('setting-max-lifetime').value) || 45,
      minTabLifetime: parseInt($('setting-min-lifetime').value) || 8
    };

    ['google', 'duckduckgo', 'bing', 'yahoo'].forEach(k => {
      const en = $(`engine-${k}`), wt = $(`weight-${k}`);
      if (en) settings.searchEngines[k] = en.checked;
      if (wt) settings.engineWeights[k] = parseInt(wt.value) || 25;
    });

    if (currentState?.categories) {
      Object.keys(currentState.categories).forEach(k => {
        const el = $(`cat-${k}`);
        if (el) settings.categories[k] = el.checked;
      });
    }

    await send({ action: 'updateSettings', settings });
  }

  // ─── Live Updates ─────────────────────────────────────────────────────
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === 'stateUpdate') {
      currentState = { ...currentState, ...msg.state };
      updateUI();
    }
    if (msg.action === 'log') {
      if (document.querySelector('.tab[data-tab="log"]').classList.contains('active')) {
        if (currentFilter === 'all' || msg.entry.type === currentFilter) {
          const empty = logFeed.querySelector('.log-empty');
          if (empty) empty.remove();
          logFeed.insertAdjacentHTML('afterbegin', renderLogEntry(msg.entry));
          while (logFeed.children.length > 200) logFeed.lastElementChild.remove();
        }
      }
    }
  });

  function startRefreshLoop() {
    refreshInterval = setInterval(() => fetchState(), 3000);
  }

  window.addEventListener('unload', () => { if (refreshInterval) clearInterval(refreshInterval); });

  init();
})();
