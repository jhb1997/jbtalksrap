(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');

  document.addEventListener('touchstart', () => {}, { passive: true });

  const hdr = document.getElementById('hdr');

  if (hdr && hdr.dataset.hide !== undefined) {
    let lastY = scrollY;
    addEventListener(
      'scroll',
      () => {
        const y = scrollY,
          d = y - lastY;
        if (Math.abs(d) < 6) return;
        hdr.classList.toggle('away', d > 0 && y > 140 && !hdr.contains(document.activeElement));
        lastY = y;
      },
      { passive: true },
    );
    hdr.addEventListener('focusin', () => hdr.classList.remove('away'));
  }

  let picked = null;
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (a) {
      const p = a.querySelector('.pad');
      if (p) picked = p;
    }
  });
  const onScreen = el => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
  };
  const slugOf = url => {
    try {
      return new URL(url, location.href).pathname
        .split('/')
        .pop()
        .replace(/\.html$/, '');
    } catch {
      return '';
    }
  };
  addEventListener('pageswap', e => {
    if (!e.viewTransition || !e.activation || !e.activation.entry) return;

    if (e.activation.navigationType === 'traverse') {
      e.viewTransition.skipTransition();
      return;
    }
    const to = slugOf(e.activation.entry.url);
    if (!to) return;
    let el =
      picked && picked.closest('[data-slug]') && picked.closest('[data-slug]').dataset.slug === to
        ? picked
        : null;
    if (!el)
      el =
        [...document.querySelectorAll(`[data-slug="${to}"] .pad, .pad[data-slug="${to}"]`)].find(onScreen) ||
        null;
    if (!el || !onScreen(el)) return;
    const own = document.querySelector('.slab .pad');
    if (own && own !== el) own.style.viewTransitionName = 'none';
    el.style.viewTransitionName = 'hero';
  });

  addEventListener('pagereveal', e => {
    if (!e.viewTransition || !window.navigation || !navigation.activation || !navigation.activation.from)
      return;
    const from = slugOf(navigation.activation.from.url);
    if (!from) return;
    const el = [
      ...document.querySelectorAll(`.pads .pad[data-slug="${from}"], .ranks [data-slug="${from}"] .pad`),
    ].find(onScreen);
    if (!el || document.querySelector('.slab .pad')) return;
    el.style.viewTransitionName = 'hero';
    const clear = () => {
      el.style.viewTransitionName = '';
    };
    e.viewTransition.finished.then(clear, clear);
  });

  document.querySelectorAll('[data-paint]').forEach(mark => {
    const cv = document.createElement('canvas');
    cv.className = 'foot__paint';
    cv.setAttribute('aria-hidden', 'true');
    mark.append(cv);
    const out = cv.getContext('2d'),
      pc = document.createElement('canvas'),
      ctx = pc.getContext('2d'),
      mc = document.createElement('canvas'),
      mctx = mc.getContext('2d');
    let dpr = 1,
      R = 20,
      queued = false;

    const show = () => {
      queued = false;
      out.globalCompositeOperation = 'copy';
      out.drawImage(mc, 0, 0);
      out.globalCompositeOperation = 'source-in';
      out.drawImage(pc, 0, 0);
      out.globalCompositeOperation = 'source-over';
    };
    const later = () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(show);
      }
    };

    const shape = () => {
      const b = cv.getBoundingClientRect();
      mctx.clearRect(0, 0, mc.width, mc.height);
      if (!b.width) return;
      const walker = document.createTreeWalker(mark, NodeFilter.SHOW_TEXT),
        range = document.createRange();
      for (let t = walker.nextNode(); t; t = walker.nextNode()) {
        const cs = getComputedStyle(t.parentElement),
          px = parseFloat(cs.fontSize) * dpr;
        mctx.font = `${cs.fontStyle} ${cs.fontWeight} ${px}px ${cs.fontFamily}`;
        mctx.textBaseline = 'alphabetic';
        const ascent = mctx.measureText(t.data).fontBoundingBoxAscent;
        mctx.lineWidth = Math.max(1, px * 0.012) * 2;
        for (let i = 0; i < t.data.length; i++) {
          const ch = t.data[i];
          if (!ch.trim()) continue;
          range.setStart(t, i);
          range.setEnd(t, i + 1);
          const r = range.getBoundingClientRect(),
            x = (r.left - b.left) * dpr,
            y = (r.top - b.top) * dpr + ascent;
          mctx.globalCompositeOperation = 'source-over';
          mctx.fillText(ch, x, y);
          mctx.globalCompositeOperation = 'destination-out';
          mctx.strokeText(ch, x, y);
        }
      }
      mctx.globalCompositeOperation = 'source-over';
      for (const d of mark.querySelectorAll('.drip')) {
        const r = d.getBoundingClientRect();
        mctx.fillRect(
          (r.left - b.left) * dpr,
          (r.top - b.top) * dpr,
          r.width * dpr,
          (r.height + r.width) * dpr,
        );
      }
      show();
    };
    const size = () => {
      const b = mark.getBoundingClientRect();
      dpr = Math.min(2, devicePixelRatio || 1);
      const w = Math.round(b.width * dpr),
        h = Math.round(b.height * dpr);
      if (!w || !h) return;
      if (w !== pc.width || h !== pc.height) {
        let old = null;
        if (pc.width && pc.height) {
          old = document.createElement('canvas');
          old.width = pc.width;
          old.height = pc.height;
          old.getContext('2d').drawImage(pc, 0, 0);
        }
        cv.width = pc.width = mc.width = w;
        cv.height = pc.height = mc.height = h;
        if (old) ctx.drawImage(old, 0, 0, w, h);
      }
      R = parseFloat(getComputedStyle(mark).fontSize) * 0.15 * dpr;
      shape();
    };
    const fit = () => {
      mark.style.fontSize = '100px';
      mark.style.width = 'max-content';
      const w = mark.getBoundingClientRect().width;
      mark.style.width = '';
      const box = getComputedStyle(mark.parentElement),
        avail = mark.parentElement.clientWidth - parseFloat(box.paddingLeft) - parseFloat(box.paddingRight);
      mark.style.fontSize = ((100 * avail) / w).toFixed(2) + 'px';
      size();
    };
    if (mark.dataset.fit !== undefined) {
      fit();
      document.fonts && document.fonts.ready.then(fit);
      addEventListener('resize', fit);
    } else {
      size();
      new ResizeObserver(size).observe(mark);
      document.fonts && document.fonts.ready.then(size);
    }

    const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
    function puff(x, y, k) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, R * 0.6);
      g.addColorStop(0, `rgba(232,34,42,${0.24 * k})`);
      g.addColorStop(1, 'rgba(232,34,42,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - R, y - R, R * 2, R * 2);
      const n = Math.round(70 * k);
      for (let i = 0; i < n; i++) {
        const d = R * Math.abs(gauss()) * 1.15,
          a = Math.random() * 6.2832,
          s = (0.45 + Math.random() * 1.25) * dpr;
        ctx.fillStyle = `rgba(${(226 + Math.random() * 24) | 0},${(26 + Math.random() * 20) | 0},${(34 + Math.random() * 14) | 0},${0.35 + Math.random() * 0.6})`;
        ctx.beginPath();
        ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, s, 0, 6.2832);
        ctx.fill();
      }
    }
    let lx = null,
      ly = null;
    const paint = e => {
      const b = cv.getBoundingClientRect(),
        evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
      for (const ev of evs.length ? evs : [e]) {
        const x = (ev.clientX - b.left) * dpr,
          y = (ev.clientY - b.top) * dpr;
        if (lx === null) {
          puff(x, y, 1);
          lx = x;
          ly = y;
          continue;
        }
        const dist = Math.hypot(x - lx, y - ly),
          step = R * 0.22,
          n = Math.max(1, Math.ceil(dist / step));
        for (let i = 1; i <= n; i++)
          puff(lx + ((x - lx) * i) / n, ly + ((y - ly) * i) / n, Math.min(1, dist / n / step));
        lx = x;
        ly = y;
      }
      later();
    };
    mark.addEventListener('pointerenter', e => {
      lx = ly = null;
      paint(e);
    });
    mark.addEventListener('pointermove', paint);
    mark.addEventListener('pointerdown', e => {
      lx = ly = null;
      paint(e);
    });
    mark.addEventListener('pointerleave', () => {
      lx = ly = null;
    });
  });

  window.JB = { reduce };
})();
