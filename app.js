'use strict';

/* =====================================================================
   1. BASE DE DATOS SIMULADA
   Todos los precios son Number (MXN, aproximados). Se formatean solo al renderizar.
   t = presupuestos donde aplica (eco | mid | high), u = usos (basic | work | gaming)
   ===================================================================== */
const row = (brand, big, detail, price, t = [], u = [], x = {}) => ({ brand, big, detail, price, t, u, ...x });
const ALL_T = ['eco', 'mid', 'high'];
const ALL_U = ['basic', 'work', 'gaming'];

const DB = {
  // igpu: trae gráficos integrados | ram: tipo de memoria que usa su plataforma
  cpu: [
    row('Intel', 'Core i3', '12100', 2900, ['eco'], ['basic', 'work'], { igpu: true, ram: 'DDR4' }),
    row('AMD', 'Ryzen 5', '5600G', 3300, ['eco'], ['basic', 'work'], { igpu: true, ram: 'DDR4' }),
    row('AMD', 'Ryzen 5', '5500', 2300, ['eco'], ['gaming'], { ram: 'DDR4' }),
    row('Intel', 'Core i3', '12100F', 2300, ['eco'], ['gaming'], { ram: 'DDR4' }),
    row('Intel', 'Core i5', '12400', 4200, ['mid'], ['basic', 'work'], { igpu: true, ram: 'DDR4' }),
    row('AMD', 'Ryzen 5', '7600', 5300, ['mid'], ALL_U, { igpu: true, ram: 'DDR5' }),
    row('Intel', 'Core i5', '12400F', 3500, ['mid'], ['gaming'], { ram: 'DDR4' }),
    row('AMD', 'Ryzen 5', '5600', 3000, ['mid'], ['gaming'], { ram: 'DDR4' }),
    row('AMD', 'Ryzen 7', '7700', 6900, ['high'], ALL_U, { igpu: true, ram: 'DDR5' }),
    row('Intel', 'Core i7', '14700K', 9800, ['high'], ['work', 'gaming'], { igpu: true, ram: 'DDR5' }),
    row('AMD', 'Ryzen 7', '7800X3D', 9500, ['high'], ['gaming'], { igpu: true, ram: 'DDR5' }),
  ],
  gpu: [
    row('Procesador', 'Integrada', 'Ya viene incluida', 0, ALL_T, ['basic', 'work'], { integrated: true }),
    row('NVIDIA', 'GTX 1650', '4 GB', 3300, ['eco'], ['gaming']),
    row('AMD', 'RX 6500 XT', '4 GB', 3000, ['eco'], ['gaming']),
    row('NVIDIA', 'RTX 3060', '12 GB', 6500, ['mid'], ['gaming']),
    row('AMD', 'RX 7600', '8 GB', 6000, ['mid'], ['gaming']),
    row('NVIDIA', 'RTX 4060', '8 GB', 7200, ['mid'], ['gaming']),
    row('NVIDIA', 'RTX 4060 Ti', '8 GB', 9500, ['high'], ['work', 'gaming']),
    row('AMD', 'RX 7800 XT', '16 GB', 12500, ['high'], ['gaming']),
    row('NVIDIA', 'RTX 4070 Super', '12 GB', 15500, ['high'], ['gaming']),
  ],
  ram: [
    row('Kingston', '16 GB', 'DDR4 3200 MHz', 3200, ['eco', 'mid'], ALL_U, { type: 'DDR4' }),
    row('Corsair', '16 GB', 'DDR4 3200 MHz', 3600, ['eco', 'mid'], ALL_U, { type: 'DDR4' }),
    row('Crucial', '16 GB', 'DDR4 3200 MHz', 3400, ['eco', 'mid'], ALL_U, { type: 'DDR4' }),
    row('Kingston', '16 GB', 'DDR5 5600 MHz', 5200, ['mid', 'high'], ALL_U, { type: 'DDR5' }),
    row('Corsair', '32 GB', 'DDR5 6000 MHz', 9500, ['high'], ['work', 'gaming'], { type: 'DDR5' }),
  ],
  ssd: [
    row('Kingston', '500 GB', 'NV2 NVMe', 900, ['eco'], ALL_U),
    row('WD', '1 TB', 'Blue SN580 NVMe', 1500, ['eco', 'mid'], ALL_U),
    row('Crucial', '1 TB', 'P3 Plus NVMe', 1600, ['mid'], ALL_U),
    row('WD', '1 TB', 'Black SN770 NVMe', 1900, ['mid', 'high'], ALL_U),
    row('Samsung', '2 TB', '990 EVO Plus NVMe', 3500, ['high'], ALL_U),
  ],
};

// PC genérica que se muestra cuando no hay combinación exacta
const FALLBACK = {
  cpu: row('Intel', 'Core i5', '12400', 4200),
  gpu: row('Procesador', 'Integrada', 'Ya viene incluida', 0),
  ram: row('Kingston', '16 GB', 'DDR4 3200 MHz', 3200),
  ssd: row('WD', '1 TB', 'Blue SN580 NVMe', 1500),
};

const PARTS = [
  ['cpu', '🧠', 'Procesador'],
  ['gpu', '🎮', 'Tarjeta de video'],
  ['ram', '⚡', 'Memoria RAM'],
  ['ssd', '💾', 'Almacenamiento'],
];

const OPTIONS = {
  use: [
    { id: 'gaming', icon: '🎮', label: 'Jugar', hint: 'Videojuegos sin trabas' },
    { id: 'work', icon: '💻', label: 'Trabajar / Estudiar', hint: 'Tareas, clases y oficina' },
    { id: 'basic', icon: '🌐', label: 'Uso básico', hint: 'Internet, videos y chats' },
  ],
  budget: [
    { id: 'eco', icon: '🪙', label: 'Económico', hint: 'Cuidando cada peso' },
    { id: 'mid', icon: '⚖️', label: 'Intermedio', hint: 'Buen equilibrio' },
    { id: 'high', icon: '🚀', label: 'Alto', hint: 'Lo mejor para rendir más' },
  ],
};

/* =====================================================================
   2. FORMATO (solo capa de render)
   ===================================================================== */
const mxn = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
const slug = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const labelOf = (key, id) => (OPTIONS[key].find(o => o.id === id) || { label: '' }).label.toLowerCase();

/* =====================================================================
   3. MOTOR DE RECOMENDACIÓN
   ===================================================================== */
const pick = list => list[Math.floor(Math.random() * list.length)];
const fits = (item, budget, use) => item.t.includes(budget) && item.u.includes(use);
const keyOf = b => PARTS.map(([k]) => `${b[k].brand}${b[k].big}${b[k].detail}`).join('|');
const totalOf = b => PARTS.reduce((sum, [k]) => sum + b[k].price, 0);

function pickBuild(use, budget) {
  const cpu = pick(DB.cpu.filter(p => fits(p, budget, use)));
  if (!cpu) return null;
  // Sin gráficos integrados en el procesador, la tarjeta de video es obligatoria
  const gpu = pick(DB.gpu.filter(p => fits(p, budget, use) && (cpu.igpu || !p.integrated)));
  // La RAM debe ser compatible con la plataforma del procesador (DDR4 o DDR5)
  const ram = pick(DB.ram.filter(p => fits(p, budget, use) && p.type === cpu.ram));
  const ssd = pick(DB.ssd.filter(p => fits(p, budget, use)));
  return gpu && ram && ssd ? { cpu, gpu, ram, ssd } : null;
}

function recommend(use, budget, lastKey = '') {
  let build = null;
  try {
    for (let i = 0; i < 8; i++) {            // evita repetir la misma combinación seguida
      const next = pickBuild(use, budget);
      if (!next) break;
      build = next;
      if (keyOf(next) !== lastKey) break;
    }
  } catch (err) {
    console.error(err);
    build = null;
  }
  return build ? { ...build, fallback: false } : { ...FALLBACK, fallback: true };
}

/* =====================================================================
   4. ESTADO Y VISTAS
   ===================================================================== */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const state = { use: null, budget: null, last: '', timer: null };

function show(name) {
  $$('.view').forEach(v => {
    const on = v.dataset.view === name;
    v.hidden = !on;
    v.classList.toggle('active', on);
  });
  const title = $(`.view[data-view="${name}"] .title`);
  if (title) title.focus({ preventScroll: true });
  window.scrollTo({ top: 0 });
}

function syncNext() {
  $('[data-action="next-use"]').disabled = !state.use;
  $('[data-action="next-budget"]').disabled = !state.budget;
}

function renderOptions(key) {
  $(`#opts-${key}`).innerHTML = OPTIONS[key].map(o => `
    <button type="button" class="opt" data-key="${key}" data-value="${o.id}" aria-pressed="false">
      <span class="opt-icon" aria-hidden="true">${o.icon}</span>
      <span class="opt-text"><strong>${o.label}</strong><small>${o.hint}</small></span>
    </button>`).join('');
}

function choose(key, value) {
  state[key] = value;
  $$(`.opt[data-key="${key}"]`).forEach(b => b.setAttribute('aria-pressed', String(b.dataset.value === value)));
  syncNext();
}

function reset() {
  clearTimeout(state.timer);                 // cancela un análisis en curso
  Object.assign(state, { use: null, budget: null, last: '' });
  $$('.opt').forEach(b => b.setAttribute('aria-pressed', 'false'));
  syncNext();
  show('welcome');
}

function analyze() {
  if (!state.use || !state.budget) return;
  show('loading');
  clearTimeout(state.timer);
  state.timer = setTimeout(() => showResults(false), 1500 + Math.random() * 500);
}

function showResults(reroll) {
  const build = recommend(state.use, state.budget, reroll ? state.last : '');
  state.last = keyOf(build);

  $('#summary').textContent = build.fallback
    ? 'No encontré una combinación exacta, pero esta PC equilibrada te va a funcionar muy bien.'
    : `Para ${labelOf('use', state.use)}, con presupuesto ${labelOf('budget', state.budget)}.`;

  $('#cards').innerHTML = PARTS.map(([k, icon, name]) => {
    const p = build[k];
    const link = p.price
      ? `<a class="ml" href="https://listado.mercadolibre.com.mx/${slug(`${p.brand} ${p.big} ${p.detail}`)}" target="_blank" rel="noopener">Ver en Mercado Libre</a>`
      : '';
    return `
      <article class="card">
        <span class="part-icon" aria-hidden="true">${icon}</span>
        <h3>${name}</h3>
        <p class="maker">${p.brand}</p>
        <p class="big">${p.big}</p>
        <p class="detail">${p.detail}</p>
        <p class="price">${p.price ? mxn.format(p.price) : 'Incluida'}</p>
        ${link}
      </article>`;
  }).join('');

  $('#total').textContent = mxn.format(totalOf(build));
  show('results');
}

/* =====================================================================
   5. TEMA CAMALEÓN
   ===================================================================== */
const root = document.documentElement;
const media = window.matchMedia('(prefers-color-scheme: light)');
const currentTheme = () => root.dataset.theme || (media.matches ? 'light' : 'dark');

function paintThemeButton() {
  const light = currentTheme() === 'light';
  const btn = $('#theme');
  btn.textContent = light ? '🌙' : '☀️';
  btn.setAttribute('aria-label', light ? 'Cambiar a tema oscuro' : 'Cambiar a tema claro');
}

function toggleTheme() {
  const next = currentTheme() === 'light' ? 'dark' : 'light';
  root.dataset.theme = next;
  try { localStorage.setItem('pcr-theme', next); } catch (e) { /* sin almacenamiento */ }
  paintThemeButton();
}

/* =====================================================================
   6. EVENTOS E INICIO
   ===================================================================== */
const actions = {
  reset,
  theme: toggleTheme,
  start: () => show('use'),
  'back-use': () => show('welcome'),
  'next-use': () => { if (state.use) show('budget'); },
  'back-budget': () => show('use'),
  'next-budget': analyze,
  other: () => showResults(true),
};

document.addEventListener('click', e => {
  const btn = e.target.closest('button');
  if (!btn || btn.disabled) return;
  e.preventDefault();                        // nunca se recarga la página
  if (btn.classList.contains('opt')) return choose(btn.dataset.key, btn.dataset.value);
  const run = actions[btn.dataset.action];
  if (run) run();
});

function init() {
  try {
    const saved = localStorage.getItem('pcr-theme');
    if (saved === 'light' || saved === 'dark') root.dataset.theme = saved;
  } catch (e) { /* sin almacenamiento */ }
  media.addEventListener('change', paintThemeButton);
  renderOptions('use');
  renderOptions('budget');
  syncNext();
  paintThemeButton();
}

init();
