(() => {
  const body = document.getElementById('body'),
    seed = +body.dataset.n;
  const bar = document.getElementById('wave2'),
    pct = document.getElementById('barPct');
  const rng = k => {
    const x = Math.sin(k * 9301 + 49297) * 233280;
    return x - Math.floor(x);
  };
  function draw(c, p) {
    const dpr = Math.min(2, devicePixelRatio),
      w = c.clientWidth,
      h = c.clientHeight;
    if (!w) return;
    if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) {
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
    }
    const x = c.getContext('2d');
    x.setTransform(dpr, 0, 0, dpr, 0, 0);
    x.clearRect(0, 0, w, h);
    const bars = Math.floor(w / 4);
    for (let i = 0; i < bars; i++) {
      const env = Math.sin((i / bars) * Math.PI) * 0.6 + 0.4,
        v = (rng(seed * 1000 + i) * 0.7 + 0.3) * env,
        bh = v * h * 0.9;
      x.fillStyle = i / bars < p ? '#e6ffd0' : 'rgba(182,242,138,.45)';
      x.fillRect(i * 4, (h - bh) / 2, 2.4, bh);
    }
    if (p > 0 && p < 1) {
      x.fillStyle = '#ff5a5f';
      x.fillRect(p * w, 0, 2, h);
    }
  }
  function progress() {
    const b = body.getBoundingClientRect();
    const p = Math.max(
      0,
      Math.min(1, (innerHeight * 0.35 - b.top) / Math.max(1, b.height - innerHeight * 0.5)),
    );
    draw(bar, p);
    pct.textContent = Math.round(p * 100) + '%';
  }
  let raf = 0;
  addEventListener(
    'scroll',
    () => {
      if (!raf)
        raf = requestAnimationFrame(() => {
          raf = 0;
          progress();
        });
    },
    { passive: true },
  );
  addEventListener('resize', progress);
  progress();
})();
