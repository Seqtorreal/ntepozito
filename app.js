'use strict';

/* ---------- helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

const MONTHS = ['Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος', 'Μάιος', 'Ιούνιος', 'Ιούλιος', 'Αύγουστος', 'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος'];
const MONTHS_ACC = MONTHS.map(m => m.slice(0, -1)); // «από τον Σεπτέμβριο»
const MONTHS_SHORT = ['Ιαν', 'Φεβ', 'Μάρ', 'Απρ', 'Μάι', 'Ιούν', 'Ιούλ', 'Αύγ', 'Σεπ', 'Οκτ', 'Νοέ', 'Δεκ'];

const nf = (min, max = min) => new Intl.NumberFormat('el-GR', { minimumFractionDigits: min, maximumFractionDigits: max });
const nf2 = nf(2), nf3 = nf(3), nf1 = nf(0, 1), nf0 = nf(0);
const eur = n => `${nf2.format(n)} €`;
const eur0 = n => `${nf0.format(n)} €`;
const dayFmt = new Intl.DateTimeFormat('el-GR', { weekday: 'short', day: 'numeric', month: 'short' });
const dateFmt = new Intl.DateTimeFormat('el-GR', { day: 'numeric', month: 'short', year: 'numeric' });

const parseNum = s => {
  const t = String(s ?? '').trim().replace(/\s/g, '').replace(',', '.');
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
};
const round = (n, d) => Math.round(n * 10 ** d) / 10 ** d;
const numIn = (n, d) => (n == null ? '' : String(round(n, d)).replace('.', ','));
const sum = (arr, fn) => arr.reduce((a, x) => a + (fn(x) || 0), 0);
const monthKey = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
const nowLocal = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};
const DAY = 864e5;

/* ---------- icons: Phosphor Icons (MIT), regular και fill ---------- */
const svg = d => `<svg viewBox="0 0 256 256" fill="currentColor" aria-hidden="true"><path d="${d}"/></svg>`;
const ICON = Object.fromEntries(Object.entries({
  car: 'M240,104H229.2L201.42,41.5A16,16,0,0,0,186.8,32H69.2a16,16,0,0,0-14.62,9.5L26.8,104H16a8,8,0,0,0,0,16h8v80a16,16,0,0,0,16,16H64a16,16,0,0,0,16-16V184h96v16a16,16,0,0,0,16,16h24a16,16,0,0,0,16-16V120h8a8,8,0,0,0,0-16ZM69.2,48H186.8l24.89,56H44.31ZM64,200H40V184H64Zm128,0V184h24v16Zm24-32H40V120H216ZM56,144a8,8,0,0,1,8-8H80a8,8,0,0,1,0,16H64A8,8,0,0,1,56,144Zm112,0a8,8,0,0,1,8-8h16a8,8,0,0,1,0,16H176A8,8,0,0,1,168,144Z',
  carFill: 'M240,104H229.2L201.42,41.5A16,16,0,0,0,186.8,32H69.2a16,16,0,0,0-14.62,9.5L26.8,104H16a8,8,0,0,0,0,16h8v80a16,16,0,0,0,16,16H64a16,16,0,0,0,16-16v-8h96v8a16,16,0,0,0,16,16h24a16,16,0,0,0,16-16V120h8a8,8,0,0,0,0-16ZM80,152H56a8,8,0,0,1,0-16H80a8,8,0,0,1,0,16Zm120,0H176a8,8,0,0,1,0-16h24a8,8,0,0,1,0,16ZM44.31,104,69.2,48H186.8l24.89,56Z',
  moto: 'M216,120a41,41,0,0,0-6.6.55l-5.82-15.14A55.64,55.64,0,0,1,216,104a8,8,0,0,0,0-16H196.88L183.47,53.13A8,8,0,0,0,176,48H144a8,8,0,0,0,0,16h26.51l9.23,24H152c-18.5,0-33.5,4.31-43.37,12.46a16,16,0,0,1-16.76,2.07C81.29,97.72,31.13,77.33,26.71,75.6L21,73.36A17.74,17.74,0,0,0,16,72a8,8,0,0,0-2.87,15.46h0c.46.18,47.19,18.3,72.13,29.63a32.15,32.15,0,0,0,33.56-4.29c4.86-4,14.57-8.8,33.19-8.8h18.82a71.74,71.74,0,0,0-24.17,36.59A15.86,15.86,0,0,1,131.32,152H79.2a40,40,0,1,0,0,16h52.12a31.91,31.91,0,0,0,30.74-23.1,56,56,0,0,1,26.59-33.72l5.82,15.13A40,40,0,1,0,216,120ZM40,168H62.62a24,24,0,1,1,0-16H40a8,8,0,0,0,0,16Zm176,16a24,24,0,0,1-15.58-42.23l8.11,21.1a8,8,0,1,0,14.94-5.74L215.35,136l.65,0a24,24,0,0,1,0,48Z',
  motoFill: 'M216,120a41,41,0,0,0-6.6.55l-5.82-15.14A55.64,55.64,0,0,1,216,104a8,8,0,0,0,0-16H196.88L183.47,53.13A8,8,0,0,0,176,48H144a8,8,0,0,0,0,16h26.51l9.23,24H152c-18.5,0-33.5,4.31-43.37,12.46a16,16,0,0,1-16.76,2.07c-10.58-4.81-73.29-30.12-73.8-30.26a8,8,0,0,0-5,15.19S68.57,109.4,79.6,120.4A55.67,55.67,0,0,1,95.43,152H79.2a40,40,0,1,0,0,16h52.12a31.91,31.91,0,0,0,30.74-23.1,56,56,0,0,1,26.59-33.72l5.82,15.13A40,40,0,1,0,216,120ZM40,168H62.62a24,24,0,1,1,0-16H40a8,8,0,0,0,0,16Zm176,16a24,24,0,0,1-15.58-42.23l8.11,21.1a8,8,0,1,0,14.94-5.74L215.35,136l.65,0a24,24,0,0,1,0,48Z',
  camera: 'M208,56H180.28L166.65,35.56A8,8,0,0,0,160,32H96a8,8,0,0,0-6.65,3.56L75.71,56H48A24,24,0,0,0,24,80V192a24,24,0,0,0,24,24H208a24,24,0,0,0,24-24V80A24,24,0,0,0,208,56Zm8,136a8,8,0,0,1-8,8H48a8,8,0,0,1-8-8V80a8,8,0,0,1,8-8H80a8,8,0,0,0,6.66-3.56L100.28,48h55.43l13.63,20.44A8,8,0,0,0,176,72h32a8,8,0,0,1,8,8ZM128,88a44,44,0,1,0,44,44A44.05,44.05,0,0,0,128,88Zm0,72a28,28,0,1,1,28-28A28,28,0,0,1,128,160Z',
  left: 'M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z',
  right: 'M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z',
  share: 'M216,112v96a16,16,0,0,1-16,16H56a16,16,0,0,1-16-16V112A16,16,0,0,1,56,96H80a8,8,0,0,1,0,16H56v96H200V112H176a8,8,0,0,1,0-16h24A16,16,0,0,1,216,112ZM93.66,69.66,120,43.31V136a8,8,0,0,0,16,0V43.31l26.34,26.35a8,8,0,0,0,11.32-11.32l-40-40a8,8,0,0,0-11.32,0l-40,40A8,8,0,0,0,93.66,69.66Z',
  restore: 'M224,144v64a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V144a8,8,0,0,1,16,0v56H208V144a8,8,0,0,1,16,0Zm-101.66,5.66a8,8,0,0,0,11.32,0l40-40a8,8,0,0,0-11.32-11.32L136,124.69V32a8,8,0,0,0-16,0v92.69L93.66,98.34a8,8,0,0,0-11.32,11.32Z',
  scan: 'M224,40V80a8,8,0,0,1-16,0V48H176a8,8,0,0,1,0-16h40A8,8,0,0,1,224,40ZM80,208H48V176a8,8,0,0,0-16,0v40a8,8,0,0,0,8,8H80a8,8,0,0,0,0-16Zm136-40a8,8,0,0,0-8,8v32H176a8,8,0,0,0,0,16h40a8,8,0,0,0,8-8V176A8,8,0,0,0,216,168ZM40,88a8,8,0,0,0,8-8V48H80a8,8,0,0,0,0-16H40a8,8,0,0,0-8,8V80A8,8,0,0,0,40,88ZM80,72h96a8,8,0,0,1,8,8v96a8,8,0,0,1-8,8H80a8,8,0,0,1-8-8V80A8,8,0,0,1,80,72Zm8,96h80V88H88Z',
  plus: 'M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z',
  month: 'M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32ZM72,48v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24V80H48V48ZM208,208H48V96H208V208Z',
  monthFill: 'M208,32H184V24a8,8,0,0,0-16,0v8H88V24a8,8,0,0,0-16,0v8H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Zm0,48H48V48H72v8a8,8,0,0,0,16,0V48h80v8a8,8,0,0,0,16,0V48h24Z',
  history: 'M136,80v43.47l36.12,21.67a8,8,0,0,1-8.24,13.72l-40-24A8,8,0,0,1,120,128V80a8,8,0,0,1,16,0Zm-8-48A95.44,95.44,0,0,0,60.08,60.15C52.81,67.51,46.35,74.59,40,82V64a8,8,0,0,0-16,0v40a8,8,0,0,0,8,8H72a8,8,0,0,0,0-16H49c7.15-8.42,14.27-16.35,22.39-24.57a80,80,0,1,1,1.66,114.75,8,8,0,1,0-11,11.64A96,96,0,1,0,128,32Z',
  historyFill: 'M224,128A96,96,0,0,1,62.11,197.82a8,8,0,1,1,11-11.64A80,80,0,1,0,71.43,71.43C67.9,75,64.58,78.51,61.35,82L77.66,98.34A8,8,0,0,1,72,112H32a8,8,0,0,1-8-8V64a8,8,0,0,1,13.66-5.66L50,70.7c3.22-3.49,6.54-7,10.06-10.55A96,96,0,0,1,224,128ZM128,72a8,8,0,0,0-8,8v48a8,8,0,0,0,3.88,6.86l40,24a8,8,0,1,0,8.24-13.72L136,123.47V80A8,8,0,0,0,128,72Z',
  stats: 'M224,200h-8V40a8,8,0,0,0-8-8H152a8,8,0,0,0-8,8V80H96a8,8,0,0,0-8,8v40H48a8,8,0,0,0-8,8v64H32a8,8,0,0,0,0,16H224a8,8,0,0,0,0-16ZM160,48h40V200H160ZM104,96h40V200H104ZM56,144H88v56H56Z',
  statsFill: 'M232,208a8,8,0,0,1-8,8H32a8,8,0,0,1,0-16h8V136a8,8,0,0,1,8-8H72a8,8,0,0,1,8,8v64H96V88a8,8,0,0,1,8-8h32a8,8,0,0,1,8,8V200h16V40a8,8,0,0,1,8-8h40a8,8,0,0,1,8,8V200h8A8,8,0,0,1,232,208Z',
  settings: 'M40,88H73a32,32,0,0,0,62,0h81a8,8,0,0,0,0-16H135a32,32,0,0,0-62,0H40a8,8,0,0,0,0,16Zm64-24A16,16,0,1,1,88,80,16,16,0,0,1,104,64ZM216,168H199a32,32,0,0,0-62,0H40a8,8,0,0,0,0,16h97a32,32,0,0,0,62,0h17a8,8,0,0,0,0-16Zm-48,24a16,16,0,1,1,16-16A16,16,0,0,1,168,192Z',
  settingsFill: 'M32,80a8,8,0,0,1,8-8H77.17a28,28,0,0,1,53.66,0H216a8,8,0,0,1,0,16H130.83a28,28,0,0,1-53.66,0H40A8,8,0,0,1,32,80Zm184,88H194.83a28,28,0,0,0-53.66,0H40a8,8,0,0,0,0,16H141.17a28,28,0,0,0,53.66,0H216a8,8,0,0,0,0-16Z'
}).map(([k, v]) => [k, svg(v)]));
const VEH = { car: { name: 'Αμάξι' }, moto: { name: 'Μηχανάκι' } };

/* ---------- storage (IndexedDB, μόνο στη συσκευή) ---------- */
const idb = (() => {
  let ready;
  const open = () => ready ??= new Promise((res, rej) => {
    const r = indexedDB.open('ntepozito', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('fills', { keyPath: 'id' });
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
  const run = async (mode, fn) => {
    const db = await open();
    return new Promise((res, rej) => {
      const t = db.transaction('fills', mode);
      const req = fn(t.objectStore('fills'));
      t.oncomplete = () => res(req?.result);
      t.onerror = t.onabort = () => rej(t.error);
    });
  };
  return {
    all: () => run('readonly', s => s.getAll()),
    put: f => run('readwrite', s => s.put(f)),
    putMany: list => run('readwrite', s => { list.forEach(f => s.put(f)); }),
    del: id => run('readwrite', s => s.delete(id)),
    clear: () => run('readwrite', s => s.clear()),
  };
})();

const prefs = {
  get: (k, d = null) => { try { return localStorage.getItem(k) ?? d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* ιδιωτική λειτουργία */ } },
};

/* ---------- state ---------- */
const now = new Date();
const state = {
  fills: [],
  view: 'month',
  month: { y: now.getFullYear(), m: now.getMonth() },
  filter: 'all',
  statsGrown: false,
};

async function reload() {
  state.fills = (await idb.all()).sort((a, b) => b.date.localeCompare(a.date));
  renderView();
  updateBackupDot();
}

const fillDate = f => new Date(f.date);
const inMonth = (f, y, m) => { const d = fillDate(f); return d.getFullYear() === y && d.getMonth() === m; };

/* ---------- navigation ---------- */
function showView(name) {
  state.view = name;
  $$('.view').forEach(v => v.classList.toggle('is-active', v.id === `view-${name}`));
  $$('.tab').forEach(t => {
    const on = t.dataset.view === name;
    t.classList.toggle('is-active', on);
    on ? t.setAttribute('aria-current', 'page') : t.removeAttribute('aria-current');
  });
  $('#scroller').scrollTop = 0;
  renderView();
}

function renderView() {
  ({ month: renderMonth, history: renderHistory, stats: renderStats, settings: renderSettings })[state.view]();
}

/* ---------- pump counter ---------- */
function counterHTML() {
  return '<div class="counter" id="counter" role="img"></div>';
}

function setCounter(el, value) {
  const [int, dec] = value.toFixed(2).split('.');
  const digits = (int.padStart(4, '0') + dec).split('').map(Number);
  const intLen = Math.max(4, int.length);
  if (el.childElementCount !== digits.length + 2) {
    const wheel = (i) => `<span class="wheel${i >= intLen ? ' is-cent' : ''}"><span class="strip">${'0123456789'.split('').map(n => `<span>${n}</span>`).join('')}</span></span>`;
    el.innerHTML = digits.slice(0, intLen).map((_, i) => wheel(i)).join('')
      + '<span class="comma">,</span>'
      + digits.slice(intLen).map((_, i) => wheel(intLen + i)).join('')
      + '<span class="unit">€</span>';
  }
  el.setAttribute('aria-label', eur(value));
  const strips = $$('.strip', el);
  const firstSig = digits.findIndex(d => d !== 0);
  strips.forEach((s, i) => {
    s.parentElement.classList.toggle('is-lead', i < intLen - 1 && (firstSig === -1 || i < firstSig));
    s.style.setProperty('--delay', `${(strips.length - 1 - i) * 70}ms`);
  });
  // διπλό rAF ώστε να «γυρίσουν» οι ρόδες και στο πρώτο render
  requestAnimationFrame(() => requestAnimationFrame(() => strips.forEach((s, i) => s.style.setProperty('--d', digits[i]))));
}

/* ---------- views: month ---------- */
function renderMonth() {
  const { y, m } = state.month;
  const list = state.fills.filter(f => inMonth(f, y, m));
  const total = sum(list, f => f.amount);
  const car = sum(list.filter(f => f.vehicle === 'car'), f => f.amount);
  const moto = total - car;
  const prevY = m === 0 ? y - 1 : y, prevM = (m + 11) % 12;
  const prevTotal = sum(state.fills.filter(f => inMonth(f, prevY, prevM)), f => f.amount);
  const withL = list.filter(f => f.liters);
  const liters = sum(withL, f => f.liters);
  const avgPrice = liters ? sum(withL, f => f.amount) / liters : null;
  const isNow = y === now.getFullYear() && m === now.getMonth();

  let delta = '';
  if (prevTotal > 0 && list.length) {
    const pct = Math.round((total - prevTotal) / prevTotal * 100);
    delta = pct === 0 ? `Ίδια με τον ${MONTHS_ACC[prevM]}.`
      : `${Math.abs(pct)}% ${pct > 0 ? 'περισσότερα' : 'λιγότερα'} από τον ${MONTHS_ACC[prevM]} (${eur(prevTotal)}).`;
  }

  const el = $('#view-month');
  const hadCounter = $('#counter', el);
  el.innerHTML = `
    <header class="top">
      <h1>${MONTHS[m]}${y !== now.getFullYear() ? ` ${y}` : ''}</h1>
      <div class="month-nav">
        <button class="icon-btn" data-act="prev-month" aria-label="Προηγούμενος μήνας">${ICON.left}</button>
        <button class="icon-btn" data-act="next-month" aria-label="Επόμενος μήνας" ${isNow ? 'disabled' : ''}>${ICON.right}</button>
      </div>
    </header>
    <div class="face">
      <p class="face-label">${isNow ? 'Ξόδεψες αυτόν τον μήνα' : `Ξόδεψες τον ${MONTHS_ACC[m]}`}</p>
      ${counterHTML()}
    </div>
    <div class="split">
      <div class="split-bar" aria-hidden="true">
        <i class="car" style="flex-grow:${total ? car : 0}"></i><i class="moto" style="flex-grow:${total ? moto : 0}"></i>
      </div>
      <ul class="legend">
        <li><span class="swatch car"></span>Αμάξι <strong>${eur(car)}</strong></li>
        <li><span class="swatch moto"></span>Μηχανάκι <strong>${eur(moto)}</strong></li>
      </ul>
      ${delta ? `<p class="delta">${delta}</p>` : ''}
    </div>
    <dl class="facts">
      <div><dt>Γεμίσματα</dt><dd>${list.length}</dd></div>
      <div><dt>Λίτρα</dt><dd>${liters ? nf1.format(liters) : '–'}</dd></div>
      <div><dt>Μέση τιμή</dt><dd>${avgPrice ? nf3.format(avgPrice) : '–'}${avgPrice ? '<small>€/λ</small>' : ''}</dd></div>
    </dl>
    <h2 class="section">Γεμίσματα του μήνα</h2>
    ${list.length ? rowsHTML(list) : `<div class="empty"><strong>Τίποτα ακόμα για ${isNow ? 'αυτόν τον μήνα' : `τον ${MONTHS_ACC[m]}`}.</strong>Πάτα το + στο κάτω μέρος για να περάσεις γέμισμα, με φωτογραφία απόδειξης ή γράφοντας το ποσό.</div>`}
  `;
  // Η μετάβαση από τον προηγούμενο αριθμό κρατά το «γύρισμα» των ροδών μεταξύ μηνών
  const counter = $('#counter', el);
  if (hadCounter && hadCounter.childElementCount) {
    counter.replaceWith(hadCounter);
    setCounter(hadCounter, total);
  } else {
    setCounter(counter, total);
  }
}

function rowsHTML(list) {
  return `<ul class="list">${list.map(f => {
    const d = fillDate(f);
    const fuel = f.liters && f.price ? `${nf2.format(f.liters)} λ × ${nf3.format(f.price)} €/λ` : VEH[f.vehicle].name;
    return `<li><button class="row" data-act="edit" data-id="${esc(f.id)}">
      <span class="veh-badge ${f.vehicle}" aria-label="${VEH[f.vehicle].name}">${ICON[f.vehicle + 'Fill']}</span>
      <span class="row-main">
        <span class="row-title">${esc(dayFmt.format(d))}${f.photo ? ICON.camera : ''}</span>
        <span class="row-fuel">${fuel}</span>
        ${f.station ? `<span class="row-sub">${esc(f.station)}</span>` : ''}
      </span>
      <span class="row-end"><strong>${eur(f.amount)}</strong></span>
    </button></li>`;
  }).join('')}</ul>`;
}

/* ---------- views: history ---------- */
function segmentedHTML(name, options, value, big = false) {
  const i = Math.max(0, options.findIndex(o => o.v === value));
  return `<div class="segmented${big ? ' big' : ''}" role="radiogroup" data-seg="${name}" style="--n:${options.length};--i:${i}">
    <span class="thumb" aria-hidden="true"></span>
    ${options.map(o => `<button type="button" role="radio" data-v="${o.v}" aria-checked="${o.v === value}">${o.icon || ''}${o.label}</button>`).join('')}
  </div>`;
}

function renderHistory() {
  const list = state.fills.filter(f => state.filter === 'all' || f.vehicle === state.filter);
  const groups = new Map();
  list.forEach(f => {
    const k = monthKey(fillDate(f));
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(f);
  });
  const el = $('#view-history');
  el.innerHTML = `
    <header class="top"><h1>Ιστορικό</h1></header>
    ${segmentedHTML('filter', [{ v: 'all', label: 'Όλα' }, { v: 'car', label: 'Αμάξι' }, { v: 'moto', label: 'Μηχανάκι' }], state.filter)}
    ${list.length ? [...groups].map(([k, items]) => {
      const [yy, mm] = k.split('-').map(Number);
      return `<div class="group-head"><h2>${MONTHS[mm - 1]} ${yy}</h2><span>${eur(sum(items, f => f.amount))}</span></div>${rowsHTML(items)}`;
    }).join('') : `<div class="empty" style="margin-top:20px"><strong>Δεν υπάρχουν γεμίσματα${state.filter === 'all' ? '' : ` για ${state.filter === 'car' ? 'το αμάξι' : 'το μηχανάκι'}`}.</strong>Ό,τι περάσεις εμφανίζεται εδώ, ομαδοποιημένο ανά μήνα.</div>`}
  `;
}

/* ---------- views: stats ---------- */
function windowMonths() {
  const out = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({ y: d.getFullYear(), m: d.getMonth(), key: monthKey(d), car: 0, moto: 0 });
  }
  return out;
}

function vehicleStats(list) {
  const total = sum(list, f => f.amount);
  const withL = list.filter(f => f.liters);
  const liters = sum(withL, f => f.liters);
  const asc = [...list].sort((a, b) => a.date.localeCompare(b.date));
  const days = asc.length > 1 ? (fillDate(asc.at(-1)) - fillDate(asc[0])) / DAY / (asc.length - 1) : null;
  // Κατανάλωση με τη μέθοδο «γεμίζω φουλ»: λίτρα μετά την πρώτη ένδειξη / χιλιόμετρα
  const odo = asc.filter(f => f.odometer);
  let l100 = null, perKm = null, km = null;
  if (odo.length > 1) {
    km = odo.at(-1).odometer - odo[0].odometer;
    const after = odo.slice(1);
    const lit = sum(after, f => f.liters);
    if (km > 0 && lit > 0) l100 = lit / km * 100;
    if (km > 0) perKm = sum(after, f => f.amount) / km;
  }
  return { total, count: list.length, liters, avgPrice: liters ? sum(withL, f => f.amount) / liters : null, days, l100, perKm, km };
}

function renderStats() {
  const months = windowMonths();
  const start = new Date(months[0].y, months[0].m, 1);
  const inWin = state.fills.filter(f => fillDate(f) >= start);
  inWin.forEach(f => {
    const mo = months.find(x => x.key === monthKey(fillDate(f)));
    if (mo) mo[f.vehicle] += f.amount;
  });
  const total = sum(inWin, f => f.amount);
  const active = months.filter(x => x.car + x.moto > 0);
  const avg = active.length ? total / active.length : 0;
  const top = active.reduce((a, x) => (x.car + x.moto > (a ? a.car + a.moto : 0) ? x : a), null);

  const el = $('#view-stats');
  if (!inWin.length) {
    el.innerHTML = `<header class="top"><div><h1>Στατιστικά</h1><p class="sub">Τελευταίοι 12 μήνες</p></div></header>
      <div class="empty"><strong>Χρειάζονται μερικά γεμίσματα.</strong>Μόλις περάσεις τα πρώτα, εδώ θα δεις έξοδα ανά μήνα, τιμή λίτρου, κατανάλωση και κάθε πόσο γεμίζεις.</div>`;
    return;
  }
  const legend = `<ul class="legend"><li><span class="swatch car"></span>Αμάξι</li><li><span class="swatch moto"></span>Μηχανάκι</li></ul>`;
  const vehBlock = v => {
    const list = inWin.filter(f => f.vehicle === v);
    if (!list.length) return '';
    const s = vehicleStats(list);
    const rows = [
      ['Σύνολο', eur(s.total)],
      ['Γεμίσματα', s.count],
      s.liters ? ['Λίτρα', `${nf1.format(s.liters)} λ`] : null,
      s.avgPrice ? ['Μέση τιμή λίτρου', `${nf3.format(s.avgPrice)} €`] : null,
      s.days ? ['Γεμίζεις κάθε', `${nf1.format(s.days)} μέρες`] : null,
      s.l100 ? ['Κατανάλωση', `${nf1.format(s.l100)} λ/100 χλμ`] : null,
      s.perKm ? ['Κόστος ανά χιλιόμετρο', `${nf3.format(s.perKm)} €`] : null,
      s.km ? ['Χιλιόμετρα', `${nf0.format(s.km)} χλμ`] : null,
    ].filter(Boolean);
    return `<div class="kv-head"><span class="veh-badge ${v}">${ICON[v + 'Fill']}</span><h2>${VEH[v].name}</h2></div>
      <ul class="kv">${rows.map(([k, val]) => `<li><span>${k}</span><span>${val}</span></li>`).join('')}
      ${s.l100 ? '' : '<li class="note">Γράφε τα χιλιόμετρα του οδομέτρου όταν γεμίζεις φουλ, για να βγαίνει κατανάλωση και κόστος ανά χιλιόμετρο.</li>'}</ul>`;
  };

  el.innerHTML = `
    <header class="top"><div><h1>Στατιστικά</h1><p class="sub">Τελευταίοι 12 μήνες</p></div></header>
    <dl class="stats-grid">
      <div><dt>Σύνολο</dt><dd>${eur0(total)}</dd></div>
      <div><dt>Μέσος όρος μήνα</dt><dd>${eur0(avg)}</dd></div>
      <div><dt>Ακριβότερος μήνας</dt><dd>${top ? eur0(top.car + top.moto) : '–'}<small>${top ? `${MONTHS[top.m]} ${top.y}` : ''}</small></dd></div>
      <div><dt>Γεμίσματα</dt><dd>${inWin.length}<small>${nf1.format(sum(inWin.filter(f => f.liters), f => f.liters))} λίτρα</small></dd></div>
    </dl>
    <h2 class="section">Έξοδα ανά μήνα</h2>
    <div class="chart-card">${legend}<div id="chart-months"></div></div>
    <h2 class="section">Τιμή λίτρου</h2>
    <div class="chart-card">${legend}<div id="chart-price"></div></div>
    ${vehBlock('car')}${vehBlock('moto')}
    <h2 class="section">Πίνακας μηνών</h2>
    <ul class="kv">${[...active].reverse().map(x => `<li><span>${MONTHS[x.m]} ${x.y}<br><small style="color:var(--muted);font-size:13px">Αμάξι ${eur(x.car)}, μηχανάκι ${eur(x.moto)}</small></span><span>${eur(x.car + x.moto)}</span></li>`).join('')}</ul>
  `;
  monthChart($('#chart-months'), months, !state.statsGrown);
  priceChart($('#chart-price'), inWin, start);
  state.statsGrown = true;
}

function niceStep(x) {
  const p = 10 ** Math.floor(Math.log10(x));
  const f = x / p;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p;
}

const topRounded = (x, y, w, h, r) => {
  r = Math.min(r, h, w / 2);
  return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${y + h}Z`;
};

function attachTip(host, svg, pick) {
  const tip = document.createElement('div');
  tip.className = 'tip';
  tip.hidden = true;
  host.style.position = 'relative';
  host.append(tip);
  const show = e => {
    const r = svg.getBoundingClientRect();
    const res = pick((e.clientX - r.left) * (svg.viewBox.baseVal.width / r.width));
    if (!res) return hide();
    tip.innerHTML = res.html;
    tip.hidden = false;
    const scale = r.width / svg.viewBox.baseVal.width;
    const half = tip.offsetWidth / 2 + 4;
    const x = Math.min(Math.max(res.x * scale, half), r.width - half);
    tip.style.left = `${x}px`;
    tip.style.top = `${res.y * scale - 8}px`;
  };
  const hide = () => { tip.hidden = true; pick(null); };
  // στο αφή μόνο tap, ώστε το scroll πάνω στο γράφημα να μην επιλέγει στήλες
  svg.addEventListener('click', show);
  svg.addEventListener('pointermove', e => { if (e.pointerType === 'mouse') show(e); });
  svg.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') hide(); });
  const outside = e => {
    if (!svg.isConnected) return document.removeEventListener('pointerdown', outside, true);
    if (!svg.contains(e.target)) hide();
  };
  document.addEventListener('pointerdown', outside, true);
}

function monthChart(host, months, grow) {
  const W = Math.max(280, host.clientWidth), H = 190, pl = 44, pr = 6, pt = 12, pb = 24;
  const iw = W - pl - pr, ih = H - pt - pb;
  const maxV = Math.max(...months.map(x => x.car + x.moto), 1);
  const step = niceStep(maxV / 2), top = step * 2 >= maxV ? step * 2 : step * 3;
  const ticks = []; for (let v = 0; v <= top + 1e-9; v += step) ticks.push(v);
  const yOf = v => pt + ih - v / top * ih;
  const slot = iw / months.length, bw = Math.min(24, slot * 0.62);
  let s = `<svg class="chart${grow ? ' grow' : ''}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Έξοδα ανά μήνα, τελευταίοι 12 μήνες">`;
  ticks.forEach(v => { s += `<line class="grid" x1="${pl}" x2="${W - pr}" y1="${yOf(v)}" y2="${yOf(v)}"/><text x="${pl - 8}" y="${yOf(v) + 4}" text-anchor="end">${eur0(v)}</text>`; });
  months.forEach((x, i) => {
    const bx = pl + i * slot + (slot - bw) / 2;
    const hc = x.car / top * ih, hm = x.moto / top * ih;
    const base = pt + ih;
    let g = '';
    if (hc > 0) g += hm > 0 ? `<rect class="car" x="${bx}" y="${base - hc}" width="${bw}" height="${hc}"/>` : `<path class="car" d="${topRounded(bx, base - hc, bw, hc, 4)}"/>`;
    if (hm > 0) {
      const gap = hc > 0 ? 2 : 0;
      g += `<path class="moto" d="${topRounded(bx, base - hc - gap - hm, bw, hm, 4)}"/>`;
    }
    s += `<g class="col" data-i="${i}" style="--i:${i}">${g}</g>`;
    const isNow = i === months.length - 1;
    s += `<text x="${pl + i * slot + slot / 2}" y="${H - 6}" text-anchor="middle"${isNow ? ' class="is-now"' : ''}>${MONTHS_SHORT[x.m]}</text>`;
  });
  s += `<rect x="${pl}" y="0" width="${iw}" height="${H}" fill="transparent"/></svg>`;
  host.innerHTML = s;
  const svg = $('svg', host);
  attachTip(host, svg, px => {
    $$('.col', svg).forEach(c => c.classList.remove('is-active'));
    svg.classList.remove('has-active');
    if (px == null) return null;
    const i = Math.floor((px - pl) / slot);
    const x = months[i];
    if (!x || x.car + x.moto === 0) return null;
    $(`.col[data-i="${i}"]`, svg).classList.add('is-active');
    svg.classList.add('has-active');
    return {
      x: pl + i * slot + slot / 2,
      y: yOf(x.car + x.moto),
      html: `<b>${MONTHS[x.m]} ${x.y}: ${eur(x.car + x.moto)}</b><span class="swatch car"></span>Αμάξι ${eur(x.car)}<br><span class="swatch moto"></span>Μηχανάκι ${eur(x.moto)}`,
    };
  });
}

function priceChart(host, fills, start) {
  const pts = fills.filter(f => f.price).map(f => ({ t: +fillDate(f), p: f.price, v: f.vehicle, f })).sort((a, b) => a.t - b.t);
  if (pts.length < 2) {
    host.innerHTML = '<p class="hint" style="margin:6px 4px 8px">Χρειάζονται τουλάχιστον δύο γεμίσματα με λίτρα ή τιμή λίτρου για να φανεί η πορεία της τιμής.</p>';
    return;
  }
  const W = Math.max(280, host.clientWidth), H = 170, pl = 44, pr = 46, pt = 12, pb = 22;
  const iw = W - pl - pr, ih = H - pt - pb;
  const t0 = +start, t1 = Math.max(Date.now(), pts.at(-1).t);
  let lo = Math.floor((Math.min(...pts.map(x => x.p)) - 0.05) * 10) / 10;
  let hi = Math.ceil((Math.max(...pts.map(x => x.p)) + 0.05) * 10) / 10;
  const xOf = t => pl + (t - t0) / (t1 - t0) * iw;
  const yOf = p => pt + ih - (p - lo) / (hi - lo) * ih;
  const mid = round((lo + hi) / 2, 2);
  let s = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Τιμή λίτρου ανά γέμισμα">`;
  [lo, mid, hi].forEach(v => { s += `<line class="grid" x1="${pl}" x2="${W - pr}" y1="${yOf(v)}" y2="${yOf(v)}"/><text x="${pl - 8}" y="${yOf(v) + 4}" text-anchor="end">${nf2.format(v)}</text>`; });
  [0, 4, 8].forEach(i => {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
    s += `<text x="${xOf(+d)}" y="${H - 5}">${MONTHS_SHORT[d.getMonth()]}</text>`;
  });
  const ends = [];
  ['car', 'moto'].forEach(v => {
    const ps = pts.filter(x => x.v === v);
    if (!ps.length) return;
    if (ps.length > 1) s += `<path class="line ${v}" d="${ps.map((x, i) => `${i ? 'L' : 'M'}${xOf(x.t).toFixed(1)},${yOf(x.p).toFixed(1)}`).join('')}"/>`;
    const last = ps.at(-1);
    s += `<circle class="dot ${v}" cx="${xOf(last.t)}" cy="${yOf(last.p)}" r="5"/>`;
    ends.push({ y: yOf(last.p), x: xOf(last.t), p: last.p });
  });
  // ετικέτες τέλους: αν πέφτουν η μία πάνω στην άλλη, κρατάμε μόνο μία
  if (ends.length === 2 && Math.abs(ends[0].y - ends[1].y) < 14) ends.pop();
  ends.forEach(e => { s += `<text class="end-label" x="${e.x + 9}" y="${e.y + 4}">${nf3.format(e.p)}</text>`; });
  s += `<circle class="hover-dot" r="6" cx="-20" cy="-20" fill="none" stroke="var(--ink)" stroke-width="2"/>`;
  s += `<rect x="${pl}" y="0" width="${iw}" height="${H}" fill="transparent"/></svg>`;
  host.innerHTML = s;
  const svg = $('svg', host);
  const ring = $('.hover-dot', svg);
  attachTip(host, svg, px => {
    if (px == null) { ring.setAttribute('cx', -20); return null; }
    const best = pts.reduce((a, x) => (Math.abs(xOf(x.t) - px) < Math.abs(xOf(a.t) - px) ? x : a));
    ring.setAttribute('cx', xOf(best.t));
    ring.setAttribute('cy', yOf(best.p));
    return {
      x: xOf(best.t), y: yOf(best.p) - 6,
      html: `<b>${nf3.format(best.p)} €/λ</b><span class="swatch ${best.v}"></span>${VEH[best.v].name}, ${esc(dateFmt.format(new Date(best.t)))}`,
    };
  });
}

/* ---------- views: settings ---------- */
const lastBackup = () => Number(prefs.get('lastBackup', 0));
const backupStale = () => state.fills.length > 0 && Date.now() - lastBackup() > 30 * DAY;
function updateBackupDot() { $('.tab-dot').hidden = !backupStale(); }

async function renderSettings() {
  const el = $('#view-settings');
  const lb = lastBackup();
  const photos = state.fills.filter(f => f.photo).length;
  el.innerHTML = `
    <header class="top"><h1>Ρυθμίσεις</h1></header>
    <h2 class="section" style="margin-top:6px">Αντίγραφο ασφαλείας</h2>
    <div class="card${backupStale() ? ' warn' : ''}">
      <p>Τα γεμίσματα και οι φωτογραφίες υπάρχουν μόνο σε αυτό το iPhone. Αν σβηστεί η εφαρμογή από την αρχική οθόνη, σβήνονται κι αυτά.</p>
      <p><strong>${lb ? `Τελευταίο αντίγραφο: ${dateFmt.format(new Date(lb))}.` : 'Δεν έχεις κρατήσει αντίγραφο ακόμα.'}</strong> Κράτα ένα στα Αρχεία ή στο iCloud Drive μία φορά τον μήνα.</p>
    </div>
    <div class="btn-stack">
      <button class="btn primary" data-act="export">${ICON.share}Εξαγωγή αντιγράφου</button>
      <label class="btn" style="cursor:pointer">${ICON.restore}Επαναφορά από αντίγραφο<input type="file" accept=".json,application/json" data-act="import" hidden></label>
    </div>
    <h2 class="section">Αποθήκευση</h2>
    <ul class="kv">
      <li><span>Γεμίσματα</span><span>${state.fills.length}</span></li>
      <li><span>Φωτογραφίες αποδείξεων</span><span>${photos}</span></li>
      <li><span>Χώρος</span><span id="usage">…</span></li>
    </ul>
    <div class="btn-stack" style="margin-top:28px">
      <button class="btn danger" data-act="wipe">Διαγραφή όλων των δεδομένων</button>
    </div>
    <p class="form-note" style="text-align:center;margin-top:20px">Ντεπόζιτο 1.0</p>
  `;
  try {
    const est = await navigator.storage?.estimate?.();
    $('#usage').textContent = est ? `${nf1.format(est.usage / 1048576)} MB` : '–';
  } catch { $('#usage').textContent = '–'; }
}

const blobToDataURL = b => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = () => rej(r.error); r.readAsDataURL(b); });
const dataURLToBlob = async u => (await fetch(u)).blob();

// Το iOS δέχεται share μόνο λίγο μετά το πάτημα· αν η προετοιμασία αργήσει, το αρχείο μένει έτοιμο για το επόμενο πάτημα
let preparedBackup = null;

async function exportBackup() {
  let file = preparedBackup && Date.now() - preparedBackup.at < 120000 ? preparedBackup.file : null;
  if (!file) {
    const fills = await idb.all();
    const out = [];
    for (const f of fills) out.push({ ...f, photo: f.photo ? await blobToDataURL(f.photo) : null });
    const json = JSON.stringify({ app: 'ntepozito', version: 1, exported: new Date().toISOString(), fills: out });
    file = new File([json], `ntepozito-${nowLocal().slice(0, 10)}.json`, { type: 'application/json' });
  }
  const name = file.name;
  const done = () => { preparedBackup = null; prefs.set('lastBackup', String(Date.now())); updateBackupDot(); renderSettings(); toast('Το αντίγραφο αποθηκεύτηκε'); };
  if (navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: name }); done(); }
    catch (e) {
      if (e.name === 'NotAllowedError') { preparedBackup = { file, at: Date.now() }; toast('Το αρχείο ετοιμάστηκε, πάτα ξανά Εξαγωγή'); }
      else if (e.name !== 'AbortError') toast('Η εξαγωγή δεν ολοκληρώθηκε');
    }
    return;
  }
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(file), download: name });
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  done();
}

async function importBackup(file) {
  try {
    const data = JSON.parse(await file.text());
    if (data.app !== 'ntepozito' || !Array.isArray(data.fills)) throw new Error('format');
    const list = [];
    for (const f of data.fills) {
      if (!f.id || !f.date || !(f.amount > 0) || !VEH[f.vehicle]) continue;
      list.push({ ...f, photo: f.photo ? await dataURLToBlob(f.photo) : null });
    }
    await idb.putMany(list);
    await reload();
    toast(`Επαναφέρθηκαν ${list.length} γεμίσματα`);
  } catch {
    toast('Αυτό το αρχείο δεν είναι αντίγραφο του Ντεπόζιτου');
  }
}

/* ---------- sheet (σύρσιμο με spring) ---------- */
const sheetEl = $('#sheet'), scrimEl = $('#scrim');
let sheetY = 0, stopSpring = null, onSheetClose = null;

function setSheetY(y) {
  sheetY = y;
  sheetEl.style.transform = `translateY(${y}px)`;
  scrimEl.style.opacity = String(Math.min(1, Math.max(0, 1 - y / (sheetEl.offsetHeight || 1))));
}

function springTo(target, velocity = 0, { damping = 1, response = 0.4 } = {}, done) {
  stopSpring?.();
  if (reduceMotion.matches) { setSheetY(target); done?.(); return; }
  const k = (2 * Math.PI / response) ** 2, c = 4 * Math.PI * damping / response;
  let x = sheetY, v = velocity, last = performance.now(), raf;
  const tick = t => {
    let dt = Math.min(0.05, (t - last) / 1000);
    last = t;
    while (dt > 0) { const h = Math.min(dt, 1 / 240); v += (-k * (x - target) - c * v) * h; x += v * h; dt -= h; }
    if (Math.abs(x - target) < 0.4 && Math.abs(v) < 12) { setSheetY(target); stopSpring = null; done?.(); return; }
    setSheetY(x);
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  stopSpring = () => { cancelAnimationFrame(raf); stopSpring = null; };
}

function openSheet(html, onClose) {
  onSheetClose = onClose;
  sheetEl.innerHTML = html;
  sheetEl.hidden = scrimEl.hidden = false;
  setSheetY(sheetEl.offsetHeight);
  springTo(0, 0, { damping: 1, response: 0.42 });
}

function closeSheet(velocity = 0) {
  springTo(sheetEl.offsetHeight + 24, Math.max(velocity, 0), { damping: 1, response: 0.36 }, () => {
    sheetEl.hidden = scrimEl.hidden = true;
    sheetEl.innerHTML = '';
    onSheetClose?.();
    onSheetClose = null;
  });
}

scrimEl.addEventListener('click', () => closeSheet());
sheetEl.addEventListener('pointerdown', e => {
  const grab = e.target.closest('.sheet-grab');
  if (!grab || e.target.closest('button')) return;
  const startY = e.clientY, from = sheetY;
  const hist = [{ y: e.clientY, t: e.timeStamp }];
  let dragging = false;
  stopSpring?.();
  const move = ev => {
    const dy = ev.clientY - startY;
    if (!dragging && Math.abs(dy) < 4) return;
    if (!dragging) { dragging = true; grab.setPointerCapture(ev.pointerId); }
    const y = from + dy;
    setSheetY(y < 0 ? -Math.sqrt(-y) * 2 : y); // λάστιχο προς τα πάνω
    hist.push({ y: ev.clientY, t: ev.timeStamp });
    if (hist.length > 6) hist.shift();
  };
  const up = ev => {
    grab.removeEventListener('pointermove', move);
    grab.removeEventListener('pointerup', up);
    grab.removeEventListener('pointercancel', up);
    if (!dragging) { if (from !== 0) springTo(0); return; }
    const a = hist[0], b = hist.at(-1);
    const vel = b.t > a.t ? (b.y - a.y) / (b.t - a.t) * 1000 : 0;
    const projected = sheetY + (vel / 1000) * 0.998 / (1 - 0.998);
    if (projected > sheetEl.offsetHeight * 0.45) closeSheet(vel);
    else springTo(0, vel, { damping: 0.8, response: 0.3 });
    ev.preventDefault();
  };
  grab.addEventListener('pointermove', move);
  grab.addEventListener('pointerup', up);
  grab.addEventListener('pointercancel', up);
});

/* ---------- φόρμα γεμίσματος ---------- */
let draft = null;
const photoURLs = new WeakMap();
const photoURL = blob => { if (!photoURLs.has(blob)) photoURLs.set(blob, URL.createObjectURL(blob)); return photoURLs.get(blob); };

function openForm(existing) {
  const lastVeh = prefs.get('vehicle') || state.fills[0]?.vehicle || 'car';
  draft = existing ? { ...existing } : { vehicle: lastVeh, date: nowLocal(), photo: null };
  const stations = [...new Set(state.fills.map(f => f.station).filter(Boolean))];
  openSheet(`
    <div class="sheet-grab">
      <div class="grabber"></div>
      <div class="sheet-head">
        <button class="link" data-act="cancel">Άκυρο</button>
        <h2 id="sheet-title">${existing ? 'Γέμισμα' : 'Νέο γέμισμα'}</h2>
        <button class="save" data-act="save">Αποθήκευση</button>
      </div>
    </div>
    <form class="sheet-body" id="fill-form" novalidate>
      ${segmentedHTML('vehicle', [{ v: 'car', label: 'Αμάξι', icon: ICON.car }, { v: 'moto', label: 'Μηχανάκι', icon: ICON.moto }], draft.vehicle, true)}
      <div id="photo-slot"></div>
      <div class="pump-form">
        <label class="pf-row main"><span>Πλήρωσα</span><input id="f-amount" inputmode="decimal" autocomplete="off" placeholder="0,00" value="${numIn(draft.amount, 2)}"><em>€</em></label>
        <label class="pf-row"><span>Λίτρα</span><input id="f-liters" inputmode="decimal" autocomplete="off" placeholder="προαιρετικό" value="${numIn(draft.liters, 2)}"><em>λ</em></label>
        <label class="pf-row"><span>Τιμή λίτρου</span><input id="f-price" inputmode="decimal" autocomplete="off" placeholder="προαιρετικό" value="${numIn(draft.price, 3)}"><em>€/λ</em></label>
      </div>
      <p class="form-note">Γράψε δύο από τα τρία και το τρίτο υπολογίζεται μόνο του.</p>
      <div class="fields">
        <label class="field"><span>Ημερομηνία</span><input id="f-date" type="datetime-local" value="${esc(draft.date)}"></label>
        <label class="field"><span>Χιλιόμετρα</span><input id="f-odo" inputmode="numeric" autocomplete="off" placeholder="οδόμετρο, προαιρετικό" value="${draft.odometer ?? ''}"></label>
        <label class="field"><span>Πρατήριο</span><input id="f-station" list="stations" autocomplete="off" placeholder="προαιρετικό" value="${esc(draft.station)}"></label>
      </div>
      <datalist id="stations">${stations.map(s => `<option value="${esc(s)}">`).join('')}</datalist>
      <p class="form-error" id="f-error" role="alert"></p>
      <div class="btn-stack">
        <button type="submit" class="btn primary">Αποθήκευση</button>
        ${existing ? '<button type="button" class="btn danger" data-act="delete">Διαγραφή γεμίσματος</button>' : ''}
      </div>
    </form>
  `, () => { draft = null; });
  renderPhotoSlot();
  updateHints();
  $('#fill-form').addEventListener('submit', e => { e.preventDefault(); saveForm(); });
  $('#fill-form').addEventListener('input', e => { if (['f-amount', 'f-liters', 'f-price'].includes(e.target.id)) updateHints(); $('#f-error').textContent = ''; });
  if (!existing && !reduceMotion.matches) setTimeout(() => $('#f-amount')?.focus({ preventScroll: true }), 450);
}

function renderPhotoSlot(status = '') {
  const slot = $('#photo-slot');
  if (!slot) return;
  slot.innerHTML = draft.photo
    ? `<div class="photo">
        <button type="button" class="thumb-btn" data-act="view-photo" aria-label="Μεγέθυνση φωτογραφίας"><img src="${photoURL(draft.photo)}" alt=""></button>
        <div class="photo-text"><div id="ocr-status">${status || '<p>Η φωτογραφία της απόδειξης θα αποθηκευτεί μαζί με το γέμισμα.</p>'}</div>
          ${draft.ocr ? `<button type="button" class="link see" data-act="see-ocr">${ICON.scan}Δες τι διάβασε</button>` : ''}
          <button type="button" class="link" data-act="remove-photo">Αφαίρεση φωτογραφίας</button></div>
      </div>
      <div class="ocr-view" id="ocr-view" hidden></div>`
    : `<label class="photo-btn">${ICON.camera}Φωτογραφία απόδειξης<input type="file" accept="image/*" data-act="photo"></label>`;
}

function updateHints() {
  const a = parseNum($('#f-amount').value), l = parseNum($('#f-liters').value), p = parseNum($('#f-price').value);
  // η τιμή που υπολογίζεται φαίνεται έντονα στο κενό πεδίο και αποθηκεύεται μαζί
  const hint = (id, calc, d, empty) => {
    const input = $(id);
    input.placeholder = calc ? numIn(calc, d) : empty;
    input.closest('.pf-row').classList.toggle('is-calc', !!calc && !input.value.trim());
  };
  hint('#f-amount', l && p ? l * p : null, 2, '0,00');
  hint('#f-liters', a && p ? a / p : null, 2, 'προαιρετικό');
  hint('#f-price', a && l ? a / l : null, 3, 'προαιρετικό');
}

async function saveForm() {
  const err = msg => { $('#f-error').textContent = msg; };
  let amount = parseNum($('#f-amount').value), liters = parseNum($('#f-liters').value), price = parseNum($('#f-price').value);
  if ([amount, liters, price].some(n => n != null && n <= 0)) return err('Τα ποσά πρέπει να είναι θετικοί αριθμοί.');
  if (amount == null && liters && price) amount = round(liters * price, 2);
  if (amount == null) return err('Γράψε πόσα πλήρωσες.');
  if (liters == null && price) liters = round(amount / price, 2);
  if (price == null && liters) price = round(amount / liters, 3);
  const date = $('#f-date').value;
  if (!date || Number.isNaN(+new Date(date))) return err('Διάλεξε ημερομηνία.');
  const odoRaw = $('#f-odo').value.replace(/\D/g, '');
  const isNew = !draft.id;
  const rec = {
    ...draft,
    id: draft.id || crypto.randomUUID(),
    vehicle: $('[data-seg="vehicle"] [aria-checked="true"]').dataset.v,
    date, amount, liters, price,
    odometer: odoRaw ? Number(odoRaw) : null,
    station: $('#f-station').value.trim(),
    created: draft.created || Date.now(),
    updated: Date.now(),
  };
  try {
    await idb.put(rec);
  } catch {
    return err('Δεν αποθηκεύτηκε. Ο χώρος του κινητού ίσως έχει γεμίσει.');
  }
  prefs.set('vehicle', rec.vehicle);
  navigator.storage?.persist?.();
  closeSheet();
  const d = new Date(rec.date);
  if (isNew) {
    state.month = { y: d.getFullYear(), m: d.getMonth() };
    if (state.view !== 'month') showView('month');
  }
  await reload();
  toast(isNew ? 'Το γέμισμα αποθηκεύτηκε' : 'Οι αλλαγές αποθηκεύτηκαν');
}

/* ---------- φωτογραφία & ανάγνωση απόδειξης ---------- */
async function loadBitmap(file) {
  if ('createImageBitmap' in window) {
    try { return await createImageBitmap(file); } catch { /* fallback */ }
  }
  const img = new Image();
  img.src = URL.createObjectURL(file);
  await img.decode();
  return img;
}

function drawScaled(src, maxSide) {
  const w0 = src.width, h0 = src.height;
  const s = Math.min(1, maxSide / Math.max(w0, h0));
  const c = document.createElement('canvas');
  c.width = Math.round(w0 * s);
  c.height = Math.round(h0 * s);
  c.getContext('2d').drawImage(src, 0, 0, c.width, c.height);
  return c;
}

function prepForOcr(src) {
  const c = drawScaled(src, 2000);
  const ctx = c.getContext('2d', { willReadFrequently: true });
  const img = ctx.getImageData(0, 0, c.width, c.height);
  const d = img.data;
  // γκρι + τέντωμα αντίθεσης: οι θερμικές αποδείξεις είναι συχνά ξεθωριασμένες
  let lo = 255, hi = 0;
  for (let i = 0; i < d.length; i += 4) {
    const g = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
    d[i] = g;
    if (g < lo) lo = g;
    if (g > hi) hi = g;
  }
  const span = Math.max(1, hi - lo);
  for (let i = 0; i < d.length; i += 4) {
    const g = Math.min(255, Math.max(0, ((d[i] - lo) / span) ** 1.4 * 255));
    d[i] = d[i + 1] = d[i + 2] = g;
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

let tesseractLoad;
function loadTesseract() {
  return tesseractLoad ??= new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';
    s.onload = () => res(window.Tesseract);
    s.onerror = () => { tesseractLoad = null; rej(new Error('offline')); };
    document.head.append(s);
  });
}

const OCR_STEPS = {
  'loading tesseract core': 'Φορτώνω τον αναγνώστη',
  'initializing tesseract': 'Ετοιμάζω τον αναγνώστη',
  'loading language traineddata': 'Φορτώνω ελληνικά',
  'initializing api': 'Ετοιμάζω τον αναγνώστη',
  'recognizing text': 'Διαβάζω την απόδειξη',
};

async function onPhotoPicked(file) {
  if (!file || !draft) return;
  const forDraft = draft;
  let bitmap;
  try {
    bitmap = await loadBitmap(file);
  } catch {
    toast('Δεν άνοιξε η φωτογραφία');
    return;
  }
  const small = drawScaled(bitmap, 1400);
  forDraft.photo = await new Promise(r => small.toBlob(r, 'image/jpeg', 0.72));
  forDraft.ocr = null;
  const setStatus = html => { if (draft === forDraft) { const s = $('#ocr-status'); if (s) s.innerHTML = html; } };
  renderPhotoSlot('<p>Διαβάζω την απόδειξη…</p><div class="progress"><i></i></div>');

  let worker;
  try {
    const T = await loadTesseract();
    worker = await T.createWorker(['ell', 'eng'], 1, {
      logger: m => {
        if (draft !== forDraft) return;
        const label = OCR_STEPS[m.status];
        const bar = $('#ocr-status .progress i');
        if (label) $('#ocr-status p').textContent = `${label}…`;
        if (bar && typeof m.progress === 'number') bar.style.width = `${Math.round(m.progress * 100)}%`;
      },
    });
    const canvas = prepForOcr(bitmap);
    const { data } = await worker.recognize(canvas, {}, { blocks: true });
    if (draft !== forDraft) return;
    const rows = toRows(data.words.filter(w => w.text.trim()).map(w => ({ t: w.text, c: Math.round(w.confidence), b: [w.bbox.x0, w.bbox.y0, w.bbox.x1, w.bbox.y1] })));
    const r = parseReceipt(rows.map(ws => ws.map(w => w.t).join(' ')));
    forDraft.ocr = {
      w: canvas.width, h: canvas.height,
      lines: rows.map(ws => ({ conf: Math.round(sum(ws, w => w.c) / ws.length), words: ws })),
      src: Object.fromEntries(Object.entries(r.src).map(([k, n]) => [k, n && { v: n.v, line: n.line, raw: n.raw }])),
    };
    const filled = [];
    const fill = (id, val, d, label) => {
      const input = $(id);
      if (val == null || !input || input.value.trim()) return;
      input.value = numIn(val, d);
      input.closest('.pf-row').classList.add('is-filled');
      filled.push(label);
    };
    fill('#f-amount', r.amount, 2, 'ποσό');
    fill('#f-liters', r.liters, 2, 'λίτρα');
    fill('#f-price', r.price, 3, 'τιμή λίτρου');
    // η ημερομηνία αλλάζει μόνο αν ο χρήστης δεν την έχει πειράξει
    const dateIn = $('#f-date');
    if (r.date && dateIn?.value === forDraft.date) {
      dateIn.value = r.date;
      dateIn.closest('.field').classList.add('is-filled');
      filled.push('ημερομηνία');
    }
    updateHints();
    renderPhotoSlot(filled.length
      ? `<p>Συμπλήρωσα ${filled.join(', ')} από την απόδειξη. Έλεγξέ τα πριν την αποθήκευση.</p>`
      : '<p>Δεν βρήκα ποσό στην απόδειξη. Γράψ’ το με το χέρι, η φωτογραφία θα αποθηκευτεί κανονικά.</p>');
  } catch {
    setStatus('<p>Η ανάγνωση της απόδειξης θέλει internet την πρώτη φορά. Η φωτογραφία κρατήθηκε, γράψε το ποσό με το χέρι.</p>');
  } finally {
    worker?.terminate();
  }
}

// Ετικέτα αριστερά, τιμή δεξιά: ο αναγνώστης συχνά τις βγάζει σε χωριστές γραμμές.
// Ενώνει λέξεις στο ίδιο ύψος της φωτογραφίας σε μία οπτική γραμμή (words: { t, c, b: [x0, y0, x1, y1] }).
function toRows(words) {
  const hs = words.map(w => w.b[3] - w.b[1]).sort((a, b) => a - b);
  const tol = (hs[hs.length >> 1] || 20) * 0.6;
  const rows = [];
  for (const w of [...words].sort((a, b) => a.b[1] + a.b[3] - b.b[1] - b.b[3])) {
    const y = (w.b[1] + w.b[3]) / 2;
    const row = rows.find(r => Math.abs(r.y - y) < tol);
    if (row) { row.words.push(w); row.y += (y - row.y) / row.words.length; } else rows.push({ y, words: [w] });
  }
  return rows.map(r => r.words.sort((a, b) => a.b[0] - b.b[0]));
}

// Ελληνικές αποδείξεις πρατηρίων: «ΣΥΝΟΛΟ 47,53», «ΠΟΣΟΤΗΤΑ 25,43 LT», «ΤΙΜΗ 1,869», «30/10/2026 17:56».
// Δέχεται κείμενο ή πίνακα γραμμών· το src λέει από ποια γραμμή βγήκε κάθε τιμή (line: null = υπολογίστηκε).
function parseReceipt(input) {
  const LOOK = { A: 'Α', B: 'Β', E: 'Ε', H: 'Η', I: 'Ι', K: 'Κ', M: 'Μ', N: 'Ν', O: 'Ο', P: 'Ρ', T: 'Τ', X: 'Χ', Y: 'Υ', Z: 'Ζ' };
  const norm = l => l.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[ABEHIKMNOPTXYZ]/g, c => LOOK[c]);
  const nums = (l, line) => [...l.matchAll(/(\d{1,4})\s?[.,]\s?(\d{2,3})(?!\d)/g)].map(m => ({ v: Number(`${m[1]}.${m[2]}`), dec: m[2].length, raw: m[0], line }));
  const lines = (Array.isArray(input) ? input : input.split('\n')).map(l => l.trim());
  const DATE = /(?<!\d)(\d{1,2})[/.-](\d{1,2})[/.-](20\d{2}|\d{2})(?!\d)(?:\D{1,3}(\d{1,2})[:.-](\d{2}))?/;
  const pad = n => String(n).padStart(2, '0');
  const totals = [], litersC = [], priceC = [], all = [];
  let date = null;
  lines.forEach((l, i) => {
    const dm = l.match(DATE);
    if (dm) {
      l = l.replace(DATE, ' '); // τα νούμερα της ημερομηνίας δεν είναι ποσά
      const [raw, d, m, y, hh = '12', mm = '00'] = dm;
      const v = `${y.length === 2 ? `20${y}` : y}-${pad(m)}-${pad(d)}T${pad(hh)}:${mm}`;
      const t = new Date(v);
      // shortcut: δέχεται μόνο ημερομηνίες έως 2 χρόνια πίσω, για να μη μπερδεύεται με άλλους κωδικούς
      if (!date && t.getMonth() === m - 1 && t.getDate() === +d && t <= Date.now() + DAY && t > Date.now() - 730 * DAY) date = { v, line: i, raw };
    }
    const u = norm(l);
    const ns = nums(l, i);
    if (!ns.length) return;
    // μετρητά/ρέστα/ΦΠΑ δεν είναι ποτέ το ποσό του καυσίμου
    if (/ΦΠΑ|Φ\.Π\.Α|ΡΕΣΤΑ|ΜΕΤΡΗΤ|ΑΦΜ|ΑΡ\./.test(u) && !/ΣΥΝΟΛ|ΠΛΗΡΩΤ/.test(u)) return;
    all.push(...ns);
    if (/ΣΥΝΟΛ|ΠΛΗΡΩΤ|ΤΟΤΑL|ΚΑΡΤΑ|ΑΞΙΑ/.test(u)) totals.push(...ns.filter(n => n.dec === 2 && n.v < 1000));
    if (/ΛΙΤΡ|LΙΤ|LΤ|ΠΟΣΟΤ|QΤΥ|ΟΤΥ|\bL\b|\bΛ\b/.test(u)) litersC.push(...ns.filter(n => n.v > 0.5 && n.v < 150));
    if (/ΤΙΜΗ|ΤΙΜ\.|\/L|\/Λ|ΡRΙCΕ|ΕUR\/|€\//.test(u)) priceC.push(...ns.filter(n => n.v >= 0.8 && n.v <= 3.5));
  });
  const max = list => list.reduce((a, n) => (n.v > a.v ? n : a));
  const calc = (v, d = 2) => ({ v: round(v, d), line: null });
  let price = priceC.find(n => n.dec === 3) ?? priceC[0] ?? all.find(n => n.dec === 3 && n.v >= 0.8 && n.v <= 3.5) ?? null;
  let liters = litersC.find(n => n.v !== price?.v) ?? null;
  let amount = totals.length ? max(totals) : null;
  // Η αντλία χρεώνει λίτρα × τιμή· αν το «ΣΥΝΟΛΟ» δεν διαβάστηκε καθαρά, αυτό είναι πιο αξιόπιστο
  if (liters && price) {
    const expect = liters.v * price.v;
    const off = v => Math.abs(v - expect) / expect;
    if (!amount || off(amount.v) >= 0.03) {
      const match = all.filter(n => n.dec === 2).sort((a, b) => off(a.v) - off(b.v))[0];
      amount = match && off(match.v) < 0.01 ? match : calc(expect);
    }
  }
  if (!amount) {
    const cands = all.filter(n => n.dec === 2 && n.v >= 2 && n.v < 500);
    if (cands.length) amount = max(cands);
  }
  if (amount && price && !liters) liters = calc(amount.v / price.v);
  if (amount && liters && !price) price = calc(amount.v / liters.v, 3);
  return { amount: amount?.v ?? null, liters: liters?.v ?? null, price: price?.v ?? null, date: date?.v ?? null, src: { amount, liters, price, date } };
}

/* ---------- «τι διάβασε»: σάρωση πάνω στη φωτογραφία ---------- */
const FIELD = { amount: 'Ποσό', liters: 'Λίτρα', price: 'Τιμή', date: 'Ημερομηνία' };
const LOW = 60; // κάτω από αυτή τη βεβαιότητα (%) η λέξη σημειώνεται ως αβέβαιη

function renderOcrView(el) {
  const o = draft.ocr;
  const pos = b => `left:${b[0] / o.w * 100}%;top:${b[1] / o.h * 100}%;width:${(b[2] - b[0]) / o.w * 100}%;height:${(b[3] - b[1]) / o.h * 100}%;--d:${Math.round(b[1] / o.h * 1400)}ms`;
  const digits = t => t.replace(/\D/g, '');
  const keys = Object.entries(o.src).filter(([, n]) => n && n.line != null).map(([k, n]) => {
    const ws = o.lines[n.line].words;
    // η λέξη με τον αριθμό· αλλιώς όλη η γραμμή
    const w = ws.find(x => digits(x.t) === digits(n.raw)) ?? ws.find(x => digits(x.t).length > 1 && digits(n.raw).includes(digits(x.t)));
    const b = w ? w.b : [Math.min(...ws.map(x => x.b[0])), Math.min(...ws.map(x => x.b[1])), Math.max(...ws.map(x => x.b[2])), Math.max(...ws.map(x => x.b[3]))];
    return `<i class="box key ${k}" style="${pos(b)}"><b>${FIELD[k]}</b></i>`;
  });
  const used = new Map(Object.entries(o.src).filter(([, n]) => n && n.line != null).map(([k, n]) => [n.line, k]));
  const fmt = { amount: v => eur(v), liters: v => `${nf2.format(v)} λ`, price: v => `${nf3.format(v)} €/λ`, date: v => `${dateFmt.format(new Date(v))}, ${v.slice(11)}` };
  el.innerHTML = `
    <div class="ocr-scan" style="aspect-ratio:${o.w}/${o.h}">
      <img src="${photoURL(draft.photo)}" alt="Η απόδειξη με σημειωμένες τις λέξεις που διάβασε">
      ${o.lines.flatMap(l => l.words).map(w => `<i class="box${w.c < LOW ? ' low' : ''}" style="${pos(w.b)}"></i>`).join('')}
      ${keys.join('')}
      <i class="scanline" aria-hidden="true"></i>
    </div>
    <ul class="kv ocr-found">${Object.keys(FIELD).map(k => {
      const n = o.src[k];
      if (!(k in o.src)) return ''; // παλιότερες αναγνώσεις χωρίς ημερομηνία
      const how = !n ? 'δεν βρέθηκε' : n.line == null ? 'υπολογίστηκε από τα άλλα δύο' : `γραμμή ${n.line + 1}`;
      return `<li><span><i class="key-dot ${k}"></i>${FIELD[k]}<small>${how}</small></span><span>${n ? fmt[k](n.v) : '–'}</span></li>`;
    }).join('')}</ul>
    <ol class="ocr-lines">${o.lines.map((l, i) => `<li class="${used.has(i) ? `used ${used.get(i)}` : ''}">
      <span>${l.words.map(w => (w.c < LOW ? `<mark>${esc(w.t)}</mark>` : esc(w.t))).join(' ')}</span><em>${l.conf}%</em></li>`).join('')}</ol>
    <p class="form-note">Κόκκινο: λέξεις που διάβασε με βεβαιότητα κάτω από ${LOW}%. Δεξιά, η βεβαιότητα κάθε γραμμής.</p>`;
}

/* ---------- toast ---------- */
let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('is-on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('is-on'), 2200);
}

/* ---------- events ---------- */
document.addEventListener('click', async e => {
  const tab = e.target.closest('.tab');
  if (tab) return showView(tab.dataset.view);

  const seg = e.target.closest('.segmented button');
  if (seg) {
    const group = seg.closest('.segmented');
    $$('button', group).forEach((b, i) => {
      const on = b === seg;
      b.setAttribute('aria-checked', on);
      if (on) group.style.setProperty('--i', i);
    });
    if (group.dataset.seg === 'filter') { state.filter = seg.dataset.v; setTimeout(renderHistory, 180); }
    return;
  }

  const act = e.target.closest('[data-act]')?.dataset.act;
  const { y, m } = state.month;
  switch (act) {
    case 'add': return openForm();
    case 'cancel': return closeSheet();
    case 'save': return saveForm();
    case 'edit': {
      const f = state.fills.find(x => x.id === e.target.closest('[data-id]').dataset.id);
      return f && openForm(f);
    }
    case 'delete':
      if (!confirm('Να διαγραφεί αυτό το γέμισμα;')) return;
      await idb.del(draft.id);
      closeSheet();
      await reload();
      return toast('Το γέμισμα διαγράφηκε');
    case 'prev-month':
      state.month = m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 };
      return renderMonth();
    case 'next-month':
      state.month = m === 11 ? { y: y + 1, m: 0 } : { y, m: m + 1 };
      return renderMonth();
    case 'remove-photo':
      draft.photo = draft.ocr = null;
      return renderPhotoSlot();
    case 'view-photo': {
      const v = $('#viewer');
      $('img', v).src = photoURL(draft.photo);
      v.hidden = false;
      return;
    }
    case 'see-ocr': {
      const v = $('#ocr-view');
      v.hidden = !v.hidden;
      if (!v.hidden) renderOcrView(v);
      return;
    }
    case 'export': return exportBackup();
    case 'wipe':
      if (!state.fills.length) return toast('Δεν υπάρχουν δεδομένα');
      if (!confirm(`Να διαγραφούν οριστικά και τα ${state.fills.length} γεμίσματα με τις φωτογραφίες τους; Αυτό δεν αναιρείται.`)) return;
      await idb.clear();
      await reload();
      return toast('Όλα τα δεδομένα διαγράφηκαν');
  }
});

document.addEventListener('change', e => {
  const act = e.target.dataset?.act;
  if (act === 'photo') onPhotoPicked(e.target.files[0]);
  if (act === 'import' && e.target.files[0]) importBackup(e.target.files[0]);
});

$('#viewer').addEventListener('click', e => { e.currentTarget.hidden = true; });
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (!$('#viewer').hidden) $('#viewer').hidden = true;
  else if (!sheetEl.hidden) closeSheet();
});

/* ---------- start ---------- */
$$('.tab').forEach(t => t.insertAdjacentHTML('afterbegin', ICON[t.dataset.view] + ICON[`${t.dataset.view}Fill`]));
$('.tab-add').innerHTML = ICON.plus;
reload().catch(() => toast('Η αποθήκευση δεν είναι διαθέσιμη σε αυτόν τον browser'));
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
