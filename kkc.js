const LEVELS = [
  { label: 'Never been',        ja: '未踏', jaDesc: '行ってない',  color: '#ffffff', points: 0 },
  { label: 'Passed through',    ja: '通過', jaDesc: '通過した',    color: '#eaeae0', points: 1 },
  { label: 'Set foot on',        ja: '接地', jaDesc: '降り立った',  color: '#d5c5ad', points: 2 },
  { label: 'Walked around',     ja: '訪問', jaDesc: '歩いた',      color: '#ca8371', points: 3 },
  { label: 'Stayed overnight',  ja: '宿泊', jaDesc: '泊まった',    color: '#c2324f', points: 4 },
  { label: 'Extended stay (2w+)', ja: '長期滞在', jaDesc: '2週間以上', color: '#951863', points: 5 },
  { label: 'Lived there (6m+)', ja: '居住', jaDesc: '住んだ',      color: '#5e075e', points: 6 },
];

// Tailwind class sets for button variants
const BTN_BASE = 'inline-flex items-center justify-center font-sans text-s font-medium leading-none text-text whitespace-nowrap no-underline rounded px-l py-s cursor-pointer transition-all duration-100 focus-visible:outline-2 focus-visible:outline-[#6b8aed] focus-visible:outline-offset-2';
const BTN_MODAL = `${BTN_BASE} bg-bg border border-border hover:bg-border-light active:bg-border active:scale-[0.97]`;
const BTN_DEFAULT = `${BTN_BASE} bg-bg border border-border hover:bg-border-light hover:border-border active:bg-border active:scale-[0.97]`;

function initKKC(cfg) {
  const { regions, count, storageKey, shareName, clearPrompt,
          formatName, formatLabel, legendLabel, fullVB, initVB, title,
          moreLinks } = cfg;

  const state = {};
  regions.forEach(r => state[r.code] = 0);

  function saveState() {
    const encoded = encodeState();
    localStorage.setItem(storageKey, encoded);
    const url = window.location.pathname + '?d=' + encoded;
    window.history.replaceState({}, '', url);
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
      html += `<div class="flex items-center gap-s text-s whitespace-nowrap"><div class="w-[14px] h-[14px] rounded-s border-[1.5px] border-border shrink-0" style="background:${l.color}"></div>${legendLabel(l)}</div>`;
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
    let html = `<h3 class="text-l font-semibold mb-m">${formatName(region)}</h3>`;
    LEVELS.forEach((l, i) => {
      const sel = i === current ? ' bg-selected-bg border-selected-border' : ' border-transparent';
      html += `<div class="modal-option flex items-center gap-m px-m py-s mt-xs rounded cursor-pointer transition-colors duration-100 border hover:bg-black/[0.06] hover:border-border-light min-h-[40px]${sel}" data-level="${i}">
        <div class="w-[22px] h-[22px] rounded-s shrink-0 border-[1.5px] border-border" style="background:${l.color}"></div>
        <div class="text-m font-medium">${formatLabel(l)}</div>
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
      <h3 class="text-l font-semibold mb-xs">Share Your Map</h3>
      <div class="text-s text-text-secondary mb-m">Copy the URL or download an image to share your ${shareName}</div>
      <input class="block w-full px-m py-s border border-border-light bg-bg text-text rounded text-s font-sans focus:outline-2 focus:outline-[#6b8aed] focus:-outline-offset-1" id="shareUrl" value="${url}" readonly>
      <div class="flex gap-s mt-m">
        <button class="${BTN_MODAL} flex-1" id="btnCopy">Copy URL</button>
        <button class="${BTN_MODAL} flex-1" id="btnDownloadImg">Download Image</button>
      </div>`;
    document.getElementById('shareOverlay').classList.add('show');

    document.getElementById('btnCopy').addEventListener('click', () => {
      navigator.clipboard.writeText(url).then(() => {
        document.getElementById('btnCopy').textContent = 'Copied!';
        setTimeout(() => { document.getElementById('btnCopy').textContent = 'Copy URL'; }, 1500);
      });
    });
    document.getElementById('btnDownloadImg').addEventListener('click', () => {
      document.getElementById('shareOverlay').classList.remove('show');
      downloadImage();
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
      const region = regions.find(r => r.code === i);

      g.addEventListener('mouseenter', () => {
        const l = LEVELS[state[i]];
        tooltipName.textContent = formatName(region);
        tooltipLevel.textContent = `${l.label} — ${l.points} points`;
        tooltip.classList.remove('hidden');
      });
      g.addEventListener('mousemove', (e) => {
        let x = e.clientX + 16;
        let y = e.clientY - 10;
        const rect = tooltip.getBoundingClientRect();
        if (x + rect.width > window.innerWidth - 8) x = e.clientX - rect.width - 16;
        if (y + rect.height > window.innerHeight - 8) y = e.clientY - rect.height - 10;
        if (y < 8) y = 8;
        tooltip.style.left = x + 'px';
        tooltip.style.top = y + 'px';
      });
      g.addEventListener('mouseleave', () => tooltip.classList.add('hidden'));
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

  function downloadImage() {
    const W = 1080, H = 1350;
    const pad = 50;
    const topH = 80, botH = 80;
    const mapY = topH, mapH = H - topH - botH;
    const mapW = W - pad * 2;

    // Read design tokens from CSS so the image stays in sync
    const rootStyle = getComputedStyle(document.documentElement);
    const imgBg = rootStyle.getPropertyValue('--bg').trim();
    const imgText = rootStyle.getPropertyValue('--text').trim();
    const imgBorder = rootStyle.getPropertyValue('--map-stroke').trim();
    const imgMapBg = rootStyle.getPropertyValue('--map-bg').trim();

    // Clone SVG with current colors
    const svg = document.querySelector('#mapContainer svg').cloneNode(true);
    svg.setAttribute('viewBox', `${fullVB.x} ${fullVB.y} ${fullVB.w} ${fullVB.h}`);
    svg.removeAttribute('style');
    svg.removeAttribute('class');
    svg.setAttribute('width', fullVB.w);
    svg.setAttribute('height', fullVB.h);

    // Inline strokes so they survive serialization
    svg.querySelectorAll('polygon, path').forEach(el => {
      el.setAttribute('stroke', imgBorder);
      el.setAttribute('stroke-width', '1.5');
      el.style.cssText = '';
    });

    // Remove hover/transition styles
    svg.querySelectorAll('g[data-code]').forEach(g => {
      g.style.cssText = '';
    });

    const xml = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext('2d');

      // Background
      ctx.fillStyle = imgBg;
      ctx.fillRect(0, 0, W, H);

      // Ocean background behind map
      ctx.fillStyle = imgMapBg;
      ctx.fillRect(pad, mapY, mapW, mapH);

      // Draw map — fit within the map zone
      const scaleX = mapW / fullVB.w;
      const scaleY = mapH / fullVB.h;
      const scale = Math.min(scaleX, scaleY);
      const drawW = fullVB.w * scale;
      const drawH = fullVB.h * scale;
      const drawX = pad + (mapW - drawW) / 2;
      const drawY = mapY + (mapH - drawH) / 2;
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      URL.revokeObjectURL(url);

      // Title (top-left)
      ctx.fillStyle = imgText;
      ctx.font = 'bold 32px system-ui, sans-serif';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';
      ctx.fillText(title, pad, topH / 2);

      // Score (top-right)
      ctx.font = '24px system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`Score: ${getScore()}`, W - pad, topH / 2);

      // Legend (bottom row)
      const legendY = H - botH / 2;
      const chipW = (W - pad * 2) / LEVELS.length;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.font = '16px system-ui, sans-serif';

      LEVELS.forEach((l, i) => {
        const x = pad + i * chipW;
        // Swatch circle
        ctx.beginPath();
        ctx.arc(x + 10, legendY, 8, 0, Math.PI * 2);
        ctx.fillStyle = l.color;
        ctx.fill();
        ctx.strokeStyle = imgBorder;
        ctx.lineWidth = 1;
        ctx.stroke();
        // Label
        ctx.fillStyle = imgText;
        ctx.fillText(l.label, x + 24, legendY);
      });

      // Download
      canvas.toBlob((pngBlob) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(pngBlob);
        a.download = `${title.replace(/\s+/g, '-').toLowerCase()}-map.png`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      });
    };

    img.onerror = () => URL.revokeObjectURL(url);
    img.src = url;
  }

  function setupOverlays() {
    // Close any open modal on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.show').forEach(el => el.classList.remove('show'));
      }
    });

    // Close modals on backdrop click
    ['modalOverlay', 'shareOverlay', 'aboutOverlay'].forEach(id => {
      document.getElementById(id).addEventListener('click', (e) => {
        if (e.target.id === id) e.target.classList.remove('show');
      });
    });
  }

  function setupButtons() {
    document.getElementById('btnShare').addEventListener('click', showShareModal);

    document.getElementById('btnAbout').addEventListener('click', () => {
      document.getElementById('aboutOverlay').classList.add('show');
    });

    document.getElementById('btnReset').addEventListener('click', () => {
      if (confirm(clearPrompt)) {
        window.history.pushState({}, '', window.location.pathname);
        for (let i = 1; i <= count; i++) state[i] = 0;
        updateAll();
      }
    });

    // Populate about modal
    const linksHtml = moreLinks.map(l => `<a class="${BTN_DEFAULT}" href="${l.href}">${l.label}</a>`).join('');
    document.getElementById('aboutModal').innerHTML = `
      <h3 class="text-l font-semibold mb-xs">More</h3>
      ${linksHtml ? `<div class="flex flex-wrap gap-s my-m">${linksHtml}</div>` : ''}
      <div>
        <p class="text-s leading-relaxed text-text-secondary mb-m">
          I made this because the trademarked 経県値 (keikenchi) tool has some backwards ideas. It obfuscates the share URL so only its own site can read it, and it makes it hard to remove logos or inspect the map. It's filled with ads (4+ per page) and its design makes sure you view them.
        </p>
        <p class="text-s leading-relaxed text-text-secondary">
          This version is completely free to use and free of ads. It's open source. GitHub Pages are always static pages, so no login and no backend processing. The URL is encoded plainly where each region is a digit. The map is an SVG right in the HTML — anyone can inspect it or copy it.
        </p>
      </div>
      `;
  }

  // Init
  loadState();
  colorMap();
  renderLegend();
  updateScore();
  setupTooltip();
  setupZoomPan();
  setupOverlays();
  setupButtons();

  window.addEventListener('popstate', () => {
    loadState();
    colorMap();
    updateScore();
  });
}
