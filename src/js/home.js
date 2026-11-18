(() => {
  const { reduce } = window.JB;
  const L = JSON.parse(document.getElementById('pad-data').textContent);
  const KEYS = '1234QWERASDF';
  const FEATURED = L.findIndex(l => l.featured);

  const CAME = (() => {
    try {
      const r = new URL(document.referrer);
      if (r.origin !== location.origin) return -1;
      const slug = r.pathname
        .split('/')
        .pop()
        .replace(/\.html$/, '');
      return L.findIndex(l => l.url.replace(/^\.\//, '').replace(/\.html$/, '') === slug);
    } catch {
      return -1;
    }
  })();

  const pads = [...document.querySelectorAll('#pads .pad')],
    lcd = document.getElementById('lcd'),
    read = document.getElementById('read');
  const esc = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const meter = s => {
    const v = +s;
    return (
      '<span class="meter" aria-hidden="true">' +
      Array.from({ length: 10 }, (_, k) => `<i class="${v >= k + 1 ? 'on' : v > k ? 'half' : ''}"></i>`).join(
        '',
      ) +
      '</span>'
    );
  };
  function show(l) {
    lcd.innerHTML = `<b>PAD ${l.n}</b> · ${esc(l.album.toUpperCase())}<br>${esc(l.artist.toUpperCase())}<div class="bar">${meter(l.score)} ${l.score} · ${l.tier.toUpperCase()}</div>`;
    read.href = l.url;
  }

  const wave = document.getElementById('wave'),
    wlit = document.getElementById('waveLit'),
    wclip = wlit.parentNode;
  let wseed = 5,
    wruns = [];
  const rng = n => {
    const x = Math.sin(n * 9301 + 49297) * 233280;
    return x - Math.floor(x);
  };

  function paint(c, color) {
    const dpr = Math.min(2, devicePixelRatio),
      w = wave.clientWidth,
      h = wave.clientHeight;
    if (!w) return;
    if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) {
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
    }
    const x = c.getContext('2d');
    x.setTransform(dpr, 0, 0, dpr, 0, 0);
    x.clearRect(0, 0, w, h);
    x.fillStyle = color;
    const bars = Math.floor(w / 4);
    for (let i = 0; i < bars; i++) {
      const env = Math.sin((i / bars) * Math.PI) * 0.6 + 0.4,
        v = (rng(wseed * 1000 + i) * 0.7 + 0.3) * env,
        bh = v * h * 0.9;
      x.fillRect(i * 4, (h - bh) / 2, 2.4, bh);
    }
  }
  function drawWave() {
    paint(wave, 'rgba(182,242,138,.5)');
    paint(wlit, '#e6ffd0');
  }
  function runWave() {
    drawWave();
    wruns.forEach(a => a.cancel());
    wruns = [];
    if (reduce.matches) return;
    const o = { duration: 1800, easing: 'linear' };
    wruns = [
      wclip.animate([{ transform: 'translateX(-100%)' }, { transform: 'none' }], o),
      wlit.animate([{ transform: 'translateX(100%)' }, { transform: 'none' }], o),
    ];
    wclip.classList.add('run');
    wruns[0].finished.then(
      () => wclip.classList.remove('run'),
      () => {},
    );
  }

  let ac,
    sound = false;
  function hit(i) {
    if (!sound) return;
    ac = ac || new AudioContext();
    if (ac.state === 'suspended') ac.resume();
    const t = ac.currentTime,
      row = Math.floor(i / 4),
      col = i % 4,
      o = ac.createOscillator(),
      g = ac.createGain();
    g.connect(ac.destination);
    if (row === 0) {
      o.frequency.setValueAtTime(120 + col * 18, t);
      o.frequency.exponentialRampToValueAtTime(42, t + 0.25);
      g.gain.setValueAtTime(0.9, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      o.connect(g);
      o.start(t);
      o.stop(t + 0.36);
    } else {
      const len = ac.sampleRate * 0.25,
        b = ac.createBuffer(1, len, ac.sampleRate),
        d = b.getChannelData(0);
      for (let k = 0; k < len; k++) d[k] = (Math.random() * 2 - 1) * Math.pow(1 - k / len, row === 1 ? 2 : 6);
      const n = ac.createBufferSource();
      n.buffer = b;
      const f = ac.createBiquadFilter();
      f.type = row === 1 ? 'bandpass' : 'highpass';
      f.frequency.value = row === 1 ? 1500 + col * 300 : 6000 + col * 800;
      g.gain.value = 0.5;
      n.connect(f).connect(g);
      n.start(t);
    }
  }
  const replay = (el, a) => {
    const b = a + '2',
      [off, on] = el.classList.contains(a) ? [a, b] : [b, a];
    el.classList.remove(off);
    el.classList.add(on);
  };
  function press(i, held) {
    replay(read, 'flash');
    const p = pads[i],
      l = L[i];
    wseed = +l.n;
    pads.forEach(x => {
      x.classList.toggle('on', x === p);
      x.setAttribute('aria-pressed', x === p);
    });
    p.classList.add('down');
    replay(p, 'flare');
    if (!held) setTimeout(() => p.classList.remove('down'), 90);
    show(l);
    hit(i);
    runWave();
    rock(i);
  }
  const lift = p => p.classList.remove('down');

  function light(i) {
    wseed = +L[i].n;
    pads.forEach(x => {
      x.classList.toggle('on', x === pads[i]);
      x.setAttribute('aria-pressed', x === pads[i]);
    });
    show(L[i]);
    drawWave();
  }
  let lastTap = { i: -1, t: 0 };
  pads.forEach((p, i) => {
    p.addEventListener('pointerdown', e => {
      press(i, true);
      if (p.setPointerCapture)
        try {
          p.setPointerCapture(e.pointerId);
        } catch {}
    });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(t => p.addEventListener(t, () => lift(p)));
    p.addEventListener('pointerup', e => {
      if (e.pointerType === 'mouse') return;
      const now = performance.now();
      if (lastTap.i === i && now - lastTap.t < 380) location.href = L[i].url;
      lastTap = { i, t: now };
    });
    p.addEventListener('keydown', e => {
      if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
        e.preventDefault();
        press(i);
      }
    });
    p.addEventListener('dblclick', e => {
      if (e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents) return;
      location.href = L[i].url;
    });
  });
  addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
    const i = KEYS.indexOf(e.key.toUpperCase());
    if (i > -1 && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) press(i);
  });
  const snd = document.getElementById('snd');
  snd.onclick = () => {
    sound = !sound;
    snd.setAttribute('aria-pressed', sound);

    if (sound) {
      ac = ac || new AudioContext();
      if (ac.state === 'suspended') ac.resume();
    }
  };

  read.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    const b = read.getBoundingClientRect();
    read.style.setProperty('--hx', Math.round(((e.clientX - b.left) / b.width) * 100) + '%');
  });
  read.addEventListener('pointerleave', () => read.style.removeProperty('--hx'));

  const rig = document.getElementById('rig'),
    chrome = document.getElementById('chrome');
  const inlayGlints = [...rig.querySelectorAll('.inlay .glint')].map(g => ({ g, at: +g.dataset.at }));
  const knobGlints = [...rig.querySelectorAll('.knob .glint')];
  const touch = matchMedia('(hover: none) and (pointer: coarse)');
  const lastSet = new Map();
  const put = (el, k, v) => {
    const m = lastSet.get(el) || lastSet.set(el, {}).get(el);
    if (m[k] !== v) {
      m[k] = v;
      el.style.setProperty(k, v);
    }
  };
  const wide = matchMedia('(min-width:901px)'),
    BASE = () => (wide.matches ? 4 : 2);
  let px = 0,
    py = 0,
    sc = 0;
  let rx = BASE() + (reduce.matches || CAME > -1 ? 0 : 3.2),
    ry = 0;
  let kx = 0,
    ky = 0,
    vx = 0,
    vy = 0;
  let raf = 0,
    last = 0;
  const born = performance.now();
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function frame(now) {
    raf = 0;
    const dt = Math.min(64, last ? now - last : 16.7);
    last = now;
    const s = dt / 1000;
    const still = reduce.matches;
    const tRx = BASE() - py * 2 + sc * 2.4,
      tRy = px * 2.4;
    const tau = now - born < 1600 ? 560 : 200,
      k = still ? 1 : 1 - Math.exp(-dt / tau);
    rx += (tRx - rx) * k;
    ry += (tRy - ry) * k;
    if (still) {
      kx = ky = vx = vy = 0;
    } else {
      const K = 380,
        C = 22,
        n = Math.ceil(s * 120),
        h = s / n;
      for (let j = 0; j < n; j++) {
        vx += (-K * kx - C * vx) * h;
        kx += vx * h;
        vy += (-K * ky - C * vy) * h;
        ky += vy * h;
      }
    }
    const RX = rx + kx,
      RY = ry + ky;
    chrome.style.transform = `rotateX(${RX.toFixed(3)}deg) rotateY(${RY.toFixed(3)}deg)`;

    const soft = touch.matches,
      q = v => (soft ? Math.round(v * 40) / 40 : v);
    const nx = q(clamp(-(soft ? ry : RY) / 1.4, -1, 1)),
      ny = q(clamp(((soft ? rx : RX) - BASE()) / 2, -1, 1));
    put(rig, '--nx', nx.toFixed(4));
    put(rig, '--ny', ny.toFixed(4));

    const at = 0.32 - nx * 0.3;
    for (const { g, at: a } of inlayGlints) {
      const near = Math.max(0, 1 - Math.abs(a - at) / 0.1),
        facet = 0.55 + 0.45 * Math.cos(nx * 9 + ny * 7 + a * 47);
      put(g, '--g', (Math.pow(near, 1.6) * facet).toFixed(3));
    }
    knobGlints.forEach((g, i) => {
      const c = Math.max(0, Math.cos(nx * 3.2 - ny * 2.4 + i * 1.9 - 0.4));
      put(g, '--g', Math.pow(c, 8).toFixed(3));
    });
    const moving =
      Math.abs(tRx - rx) + Math.abs(tRy - ry) > 0.002 ||
      Math.abs(kx) + Math.abs(ky) + Math.abs(vx) + Math.abs(vy) > 0.002;
    if (moving && !still) raf = requestAnimationFrame(frame);
    else last = 0;
  }
  const kick = () => {
    if (!raf) raf = requestAnimationFrame(frame);
  };

  function rock(i) {
    if (reduce.matches) return;
    const row = Math.floor(i / 4),
      col = i % 4;
    vx += [11, 8, 5.5][row] || 6;
    vy += ((col - 1.5) / 1.5) * 9;
    kick();
  }
  addEventListener(
    'pointermove',
    e => {
      if (e.pointerType !== 'mouse') return;
      px = e.clientX / innerWidth - 0.5;
      py = e.clientY / innerHeight - 0.5;
      kick();
    },
    { passive: true },
  );
  document.documentElement.addEventListener('pointerleave', () => {
    px = py = 0;
    kick();
  });
  addEventListener(
    'scroll',
    () => {
      const v = clamp(scrollY / innerHeight, 0, 1);
      if (v !== sc) {
        sc = v;
        kick();
      }
    },
    { passive: true },
  );
  wide.addEventListener('change', kick);
  reduce.addEventListener('change', kick);
  kick();

  drawWave();
  addEventListener('resize', drawWave);
  if (CAME > -1) light(CAME);
  else if (reduce.matches) press(FEATURED);
  else {
    pads.forEach((p, i) => {
      const d = ((i % 4) + Math.floor(i / 4)) * 90;
      setTimeout(() => p.classList.add('boot'), 300 + d);
      setTimeout(() => p.classList.remove('boot'), 700 + d);
    });
    setTimeout(() => press(FEATURED), 1500);
  }

  const ranks = document.getElementById('ranks'),
    rows = [...ranks.children];
  const d = r => r.dataset;
  const sorters = {
    score: (a, b) => +d(b).score - +d(a).score || d(a).album.localeCompare(d(b).album),
    artist: (a, b) => d(a).artist.localeCompare(d(b).artist) || d(a).album.localeCompare(d(b).album),
    album: (a, b) => d(a).album.localeCompare(d(b).album),
  };
  function sortBy(k) {
    const first = new Map(rows.map(r => [r, r.getBoundingClientRect().top]));
    rows.sort(sorters[k]).forEach((r, i) => {
      r.querySelector('.row__rank').textContent = String(i + 1).padStart(2, '0');
      ranks.append(r);
    });
    if (reduce.matches) return;
    rows.forEach(r => {
      const dy = first.get(r) - r.getBoundingClientRect().top;
      if (dy)
        r.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], {
          duration: 620,
          easing: 'cubic-bezier(.3,0,.1,1)',
        });
    });
  }

  const fbs = [...document.querySelectorAll('[data-sort]')],
    unpress = b => b.classList.remove('down');
  fbs.forEach(b => {
    b.addEventListener('pointerdown', () => b.classList.add('down'));
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(t => b.addEventListener(t, () => unpress(b)));
    b.addEventListener('click', e => {
      if (e.detail === 0) {
        b.classList.add('down');
        setTimeout(() => unpress(b), 90);
      }
      const was = fbs.find(x => x.classList.contains('on'));
      fbs.forEach(x => {
        x.classList.toggle('on', x === b);
        x.setAttribute('aria-pressed', x === b);
      });
      replay(b, 'flare');
      if (was !== b) sortBy(b.dataset.sort);
    });
  });
})();
