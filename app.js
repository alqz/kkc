const LEVELS = [
  { label: '未踏',     en: 'Never been',        color: '#ffffff', points: 0 },
  { label: '通過',     en: 'Passed through',     color: '#6baed6', points: 1 },
  { label: '接地',     en: 'Brief stop',         color: '#74c476', points: 2 },
  { label: '散策',     en: 'Walked around',      color: '#fdd835', points: 3 },
  { label: '宿泊',     en: 'Stayed overnight',   color: '#fb8c00', points: 4 },
  { label: '長期滞在', en: 'Long stay',          color: '#e53935', points: 5 },
  { label: '居住',     en: 'Lived there',        color: '#8e24aa', points: 6 },
];

const PREFECTURES = [
  {code:1,  name:'北海道',   en:'Hokkaido'},
  {code:2,  name:'青森',     en:'Aomori'},
  {code:3,  name:'岩手',     en:'Iwate'},
  {code:4,  name:'宮城',     en:'Miyagi'},
  {code:5,  name:'秋田',     en:'Akita'},
  {code:6,  name:'山形',     en:'Yamagata'},
  {code:7,  name:'福島',     en:'Fukushima'},
  {code:8,  name:'茨城',     en:'Ibaraki'},
  {code:9,  name:'栃木',     en:'Tochigi'},
  {code:10, name:'群馬',     en:'Gunma'},
  {code:11, name:'埼玉',     en:'Saitama'},
  {code:12, name:'千葉',     en:'Chiba'},
  {code:13, name:'東京',     en:'Tokyo'},
  {code:14, name:'神奈川',   en:'Kanagawa'},
  {code:15, name:'新潟',     en:'Niigata'},
  {code:16, name:'富山',     en:'Toyama'},
  {code:17, name:'石川',     en:'Ishikawa'},
  {code:18, name:'福井',     en:'Fukui'},
  {code:19, name:'山梨',     en:'Yamanashi'},
  {code:20, name:'長野',     en:'Nagano'},
  {code:21, name:'岐阜',     en:'Gifu'},
  {code:22, name:'静岡',     en:'Shizuoka'},
  {code:23, name:'愛知',     en:'Aichi'},
  {code:24, name:'三重',     en:'Mie'},
  {code:25, name:'滋賀',     en:'Shiga'},
  {code:26, name:'京都',     en:'Kyoto'},
  {code:27, name:'大阪',     en:'Osaka'},
  {code:28, name:'兵庫',     en:'Hyogo'},
  {code:29, name:'奈良',     en:'Nara'},
  {code:30, name:'和歌山',   en:'Wakayama'},
  {code:31, name:'鳥取',     en:'Tottori'},
  {code:32, name:'島根',     en:'Shimane'},
  {code:33, name:'岡山',     en:'Okayama'},
  {code:34, name:'広島',     en:'Hiroshima'},
  {code:35, name:'山口',     en:'Yamaguchi'},
  {code:36, name:'徳島',     en:'Tokushima'},
  {code:37, name:'香川',     en:'Kagawa'},
  {code:38, name:'愛媛',     en:'Ehime'},
  {code:39, name:'高知',     en:'Kochi'},
  {code:40, name:'福岡',     en:'Fukuoka'},
  {code:41, name:'佐賀',     en:'Saga'},
  {code:42, name:'長崎',     en:'Nagasaki'},
  {code:43, name:'熊本',     en:'Kumamoto'},
  {code:44, name:'大分',     en:'Oita'},
  {code:45, name:'宮崎',     en:'Miyazaki'},
  {code:46, name:'鹿児島',   en:'Kagoshima'},
  {code:47, name:'沖縄',     en:'Okinawa'},
];

const state = {};
PREFECTURES.forEach(p => state[p.code] = 0);

function saveState() {
  localStorage.setItem('kkc-state', encodeState());
}

function loadState() {
  // URL param takes priority over localStorage
  const urlData = new URLSearchParams(window.location.search).get('d');
  const data = urlData || localStorage.getItem('kkc-state');
  if (!data) return;
  for (let i = 0; i < Math.min(data.length, 47); i++) {
    const v = parseInt(data[i], 10);
    if (v >= 0 && v <= 6) state[i + 1] = v;
  }
}

function encodeState() {
  let s = '';
  for (let i = 1; i <= 47; i++) s += state[i];
  return s;
}

function getScore() {
  let total = 0;
  for (let i = 1; i <= 47; i++) total += LEVELS[state[i]].points;
  return total;
}

function colorMap() {
  const svg = document.querySelector('#mapContainer svg');
  for (let i = 1; i <= 47; i++) {
    const g = svg.querySelector(`g[data-code="${i}"]`);
    if (!g) continue;
    const color = LEVELS[state[i]].color;
    g.querySelectorAll('polygon, path').forEach(el => el.setAttribute('fill', color));
  }
}

function renderLegend() {
  let html = '';
  LEVELS.forEach((l, i) => {
    html += `<div class="legend-chip"><div class="swatch" style="background:${l.color}"></div>${l.en}</div>`;
  });
  document.getElementById('legendBar').innerHTML = html;
}

function updateScore() {
  document.getElementById('totalScore').textContent = getScore();
}

function updateAll() {
  colorMap();
  updateScore();
  saveState();
}

function showModal(code) {
  const pref = PREFECTURES.find(p => p.code === code);
  if (!pref) return;
  const current = state[code];
  let html = `<h3>${pref.name} / ${pref.en}</h3><div class="modal-sub">Select your experience level</div>`;
  LEVELS.forEach((l, i) => {
    html += `<div class="modal-option${i === current ? ' selected' : ''}" data-level="${i}">
      <div class="mo-swatch" style="background:${l.color}"></div>
      <div class="mo-label">${l.label}<small>${l.en} — ${l.points}pt</small></div>
    </div>`;
  });
  const modal = document.getElementById('modal');
  modal.innerHTML = html;
  document.getElementById('modalOverlay').classList.add('show');

  modal.querySelectorAll('.modal-option').forEach(opt => {
    opt.addEventListener('click', () => {
      state[code] = parseInt(opt.dataset.level, 10);
      document.getElementById('modalOverlay').classList.remove('show');
      updateAll();
    });
  });
}

function showShareModal() {
  const url = window.location.origin + window.location.pathname + '?d=' + encodeState();
  document.getElementById('shareModal').innerHTML = `
    <h3>Share Your Map</h3>
    <div class="modal-sub">Copy the URL below to share your 経県値 map</div>
    <input class="share-url" id="shareUrl" value="${url}" readonly>
    <div class="share-actions">
      <button class="btn" id="btnCopy">Copy URL</button>
      <button class="btn" id="btnCloseShare">Close</button>
    </div>`;
  document.getElementById('shareOverlay').classList.add('show');

  document.getElementById('btnCopy').addEventListener('click', () => {
    navigator.clipboard.writeText(url).then(() => {
      document.getElementById('btnCopy').textContent = 'Copied!';
      setTimeout(() => { document.getElementById('btnCopy').textContent = 'Copy URL'; }, 1500);
    });
  });
  document.getElementById('btnCloseShare').addEventListener('click', () => {
    document.getElementById('shareOverlay').classList.remove('show');
  });
}

function setupTooltip() {
  const svg = document.querySelector('#mapContainer svg');
  const tooltip = document.getElementById('tooltip');
  const tooltipName = document.getElementById('tooltipName');
  const tooltipLevel = document.getElementById('tooltipLevel');

  for (let i = 1; i <= 47; i++) {
    const g = svg.querySelector(`g[data-code="${i}"]`);
    if (!g) continue;
    const pref = PREFECTURES[i - 1];

    g.addEventListener('mouseenter', () => {
      const l = LEVELS[state[i]];
      tooltipName.textContent = `${pref.name} / ${pref.en}`;
      tooltipLevel.textContent = `${l.label} (${l.en}) — ${l.points}pt`;
      tooltip.classList.add('show');
    });
    g.addEventListener('mousemove', (e) => {
      tooltip.style.left = (e.clientX + 16) + 'px';
      tooltip.style.top = (e.clientY - 10) + 'px';
    });
    g.addEventListener('mouseleave', () => tooltip.classList.remove('show'));
    g.addEventListener('click', () => showModal(i));
  }
}

// Zoom & Pan
function setupZoomPan() {
  const container = document.getElementById('mapContainer');
  const svg = container.querySelector('svg');

  const fullVB = { x: 0, y: 0, w: 1537, h: 1760 };
  const initVB = { x: 200, y: 150, w: 1100, h: 1100 };
  let vb = { ...initVB };
  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 10;

  // Restore saved view
  const savedVB = localStorage.getItem('kkc-viewbox');
  if (savedVB) {
    try {
      const s = JSON.parse(savedVB);
      if (s.x != null) { vb.x = s.x; vb.y = s.y; vb.w = s.w; vb.h = s.h; }
    } catch(e) {}
  }

  function clampViewBox() {
    vb.x = Math.max(fullVB.x - vb.w * 0.5, Math.min(fullVB.x + fullVB.w - vb.w * 0.5, vb.x));
    vb.y = Math.max(fullVB.y - vb.h * 0.5, Math.min(fullVB.y + fullVB.h - vb.h * 0.5, vb.y));
  }

  function applyViewBox() {
    clampViewBox();
    svg.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
    localStorage.setItem('kkc-viewbox', JSON.stringify(vb));
  }

  applyViewBox();

  // Wheel zoom
  container.addEventListener('wheel', (e) => {
    e.preventDefault();
    const rect = svg.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / rect.width;
    const my = (e.clientY - rect.top) / rect.height;

    const factor = e.deltaY > 0 ? 1.06 : 1 / 1.06;
    const newW = Math.min(fullVB.w / MIN_ZOOM, Math.max(fullVB.w / MAX_ZOOM, vb.w * factor));
    const newH = Math.min(fullVB.h / MIN_ZOOM, Math.max(fullVB.h / MAX_ZOOM, vb.h * factor));

    vb.x += (vb.w - newW) * mx;
    vb.y += (vb.h - newH) * my;
    vb.w = newW;
    vb.h = newH;
    applyViewBox();
  }, { passive: false });

  // Mouse drag pan
  let dragging = false;
  let dragStart = { x: 0, y: 0 };
  let vbStart = { x: 0, y: 0 };
  let dragScale = { x: 1, y: 1 };

  function getScale() {
    const rect = svg.getBoundingClientRect();
    return { x: vb.w / rect.width, y: vb.h / rect.height };
  }

  container.addEventListener('mousedown', (e) => {
    dragging = true;
    dragStart = { x: e.clientX, y: e.clientY };
    vbStart = { x: vb.x, y: vb.y };
    dragScale = getScale();
  });

  window.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    vb.x = vbStart.x - (e.clientX - dragStart.x) * dragScale.x;
    vb.y = vbStart.y - (e.clientY - dragStart.y) * dragScale.y;
    applyViewBox();
  });

  window.addEventListener('mouseup', () => { dragging = false; });

  // Touch pinch zoom & pan
  let lastTouches = null;

  container.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      lastTouches = [...e.touches];
    } else if (e.touches.length === 1 && !e.target.closest('g[data-code]')) {
      dragging = true;
      dragStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      vbStart = { x: vb.x, y: vb.y };
      dragScale = getScale();
    }
  }, { passive: false });

  container.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2 && lastTouches) {
      e.preventDefault();
      const oldDist = Math.hypot(
        lastTouches[0].clientX - lastTouches[1].clientX,
        lastTouches[0].clientY - lastTouches[1].clientY
      );
      const newDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = oldDist / newDist;
      const rect = svg.getBoundingClientRect();
      const cx = ((e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left) / rect.width;
      const cy = ((e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top) / rect.height;

      const newW = Math.min(fullVB.w / MIN_ZOOM, Math.max(fullVB.w / MAX_ZOOM, vb.w * factor));
      const newH = Math.min(fullVB.h / MIN_ZOOM, Math.max(fullVB.h / MAX_ZOOM, vb.h * factor));
      vb.x += (vb.w - newW) * cx;
      vb.y += (vb.h - newH) * cy;
      vb.w = newW;
      vb.h = newH;
      applyViewBox();
      lastTouches = [...e.touches];
    } else if (e.touches.length === 1 && dragging) {
      vb.x = vbStart.x - (e.touches[0].clientX - dragStart.x) * dragScale.x;
      vb.y = vbStart.y - (e.touches[0].clientY - dragStart.y) * dragScale.y;
      applyViewBox();
    }
  }, { passive: false });

  container.addEventListener('touchend', () => {
    dragging = false;
    lastTouches = null;
  });

  document.getElementById('btnResetZoom').addEventListener('click', () => {
    vb.x = initVB.x;
    vb.y = initVB.y;
    vb.w = initVB.w;
    vb.h = initVB.h;
    applyViewBox();
  });
}

// Init
loadState();
colorMap();
renderLegend();
updateScore();
setupTooltip();
setupZoomPan();

document.getElementById('modalOverlay').addEventListener('click', (e) => {
  if (e.target.id === 'modalOverlay') e.target.classList.remove('show');
});
document.getElementById('shareOverlay').addEventListener('click', (e) => {
  if (e.target.id === 'shareOverlay') e.target.classList.remove('show');
});
document.getElementById('btnShare').addEventListener('click', showShareModal);
document.getElementById('btnReset').addEventListener('click', () => {
  if (confirm('Clear all prefectures?')) {
    for (let i = 1; i <= 47; i++) state[i] = 0;
    updateAll();
    localStorage.removeItem('kkc-state');
    window.history.replaceState({}, '', window.location.pathname);
  }
});
