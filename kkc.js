const LEVELS = [
  { label: 'Never been',        color: '#ffffff', points: 0 },
  { label: 'Passed through',    color: '#6baed6', points: 1 },
  { label: 'Brief stop',        color: '#74c476', points: 2 },
  { label: 'Walked around',     color: '#fdd835', points: 3 },
  { label: 'Stayed overnight',  color: '#fb8c00', points: 4 },
  { label: 'Long stay',         color: '#e53935', points: 5 },
  { label: 'Lived there',       color: '#8e24aa', points: 6 },
];

function initKKC(cfg) {
  const { regions, count, storageKey, shareName, clearPrompt,
          formatName, formatLabel, legendLabel, fullVB, initVB } = cfg;

  const state = {};
  regions.forEach(r => state[r.code] = 0);

  function saveState() {
    localStorage.setItem(storageKey, encodeState());
  }

  function loadState() {
    const urlData = new URLSearchParams(window.location.search).get('d');
    const data = urlData || localStorage.getItem(storageKey);
    if (!data) return;
    for (let i = 0; i < Math.min(data.length, count); i++) {
      const v = parseInt(data[i], 10);
      if (v >= 0 && v <= 6) state[i + 1] = v;
    }
  }

  function encodeState() {
    let s = '';
    for (let i = 1; i <= count; i++) s += state[i];
    return s;
  }

  function getScore() {
    let total = 0;
    for (let i = 1; i <= count; i++) total += LEVELS[state[i]].points;
    return total;
  }

  function colorMap() {
    const svg = document.querySelector('#mapContainer svg');
    for (let i = 1; i <= count; i++) {
      const g = svg.querySelector(`g[data-code="${i}"]`);
      if (!g) continue;
      const color = LEVELS[state[i]].color;
      g.querySelectorAll('polygon, path').forEach(el => el.setAttribute('fill', color));
    }
  }

  function renderLegend() {
    let html = '';
    LEVELS.forEach(l => {
      html += `<div class="legend-chip"><div class="swatch" style="background:${l.color}"></div>${legendLabel(l)}</div>`;
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
    const region = regions.find(r => r.code === code);
    if (!region) return;
    const current = state[code];
    let html = `<h3>${formatName(region)}</h3><div class="modal-sub">Select your experience level</div>`;
    LEVELS.forEach((l, i) => {
      html += `<div class="modal-option${i === current ? ' selected' : ''}" data-level="${i}">
        <div class="mo-swatch" style="background:${l.color}"></div>
        <div class="mo-label">${formatLabel(l)}</div>
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
      <div class="modal-sub">Copy the URL below to share your ${shareName}</div>
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

    for (let i = 1; i <= count; i++) {
      const g = svg.querySelector(`g[data-code="${i}"]`);
      if (!g) continue;
      const region = regions[i - 1];

      g.addEventListener('mouseenter', () => {
        const l = LEVELS[state[i]];
        tooltipName.textContent = formatName(region);
        tooltipLevel.textContent = `${l.label} — ${l.points} points`;
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

  function setupZoomPan() {
    const container = document.getElementById('mapContainer');
    const svg = container.querySelector('svg');

    let vb = { ...initVB };
    const MIN_ZOOM = 0.8;
    const MAX_ZOOM = 10;

    function clampViewBox() {
      vb.x = Math.max(fullVB.x - vb.w * 0.5, Math.min(fullVB.x + fullVB.w - vb.w * 0.5, vb.x));
      vb.y = Math.max(fullVB.y - vb.h * 0.5, Math.min(fullVB.y + fullVB.h - vb.h * 0.5, vb.y));
    }

    function applyViewBox() {
      clampViewBox();
      svg.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
    }

    applyViewBox();

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
  document.getElementById('btnAbout').addEventListener('click', () => {
    document.getElementById('aboutOverlay').classList.add('show');
  });
  document.getElementById('btnCloseAbout').addEventListener('click', () => {
    document.getElementById('aboutOverlay').classList.remove('show');
  });
  document.getElementById('aboutOverlay').addEventListener('click', (e) => {
    if (e.target.id === 'aboutOverlay') e.target.classList.remove('show');
  });
  document.getElementById('btnReset').addEventListener('click', () => {
    if (confirm(clearPrompt)) {
      for (let i = 1; i <= count; i++) state[i] = 0;
      updateAll();
      localStorage.removeItem(storageKey);
      window.history.replaceState({}, '', window.location.pathname);
    }
  });
}
