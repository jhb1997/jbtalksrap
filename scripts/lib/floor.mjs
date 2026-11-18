const rand = seed => () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
const f1 = n => (+n.toFixed(1)).toString();

function fracture(rnd, ax, ay, bx, by, rough, depth) {
  let pts = [
    [ax, ay],
    [bx, by],
  ];
  let amp = Math.hypot(bx - ax, by - ay) * rough;
  for (let d = 0; d < depth; d++) {
    const next = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1],
        [x1, y1] = pts[i],
        len = Math.hypot(x1 - x0, y1 - y0) || 1,
        off = (rnd() - 0.5) * 2 * amp,
        t = 0.35 + rnd() * 0.3;
      next.push(
        [x0 + (x1 - x0) * t - ((y1 - y0) / len) * off, y0 + (y1 - y0) * t + ((x1 - x0) / len) * off],
        pts[i],
      );
    }
    pts = next;
    amp *= 0.52;
  }
  return pts;
}

function sliver(rnd, pts, w0, span = false) {
  const n = pts.length,
    knots = Array.from({ length: Math.ceil(n / 6) + 2 }, () => 0.45 + rnd() * 1.1);
  const width = i => {
    const t = i / (n - 1),
      k = (i / 6) | 0,
      u = i / 6 - k,
      wob = knots[k] * (1 - u) + knots[k + 1] * u;

    const shape = span ? 0.3 + 0.7 * Math.pow(Math.sin(Math.PI * t), 0.7) : Math.pow(1 - t, 0.9);
    return Math.max(0.12, w0 * shape * wob);
  };
  const L = [],
    R = [];
  for (let i = 0; i < n; i++) {
    const [x, y] = pts[i],
      [px, py] = pts[Math.max(0, i - 1)],
      [nx, ny] = pts[Math.min(n - 1, i + 1)],
      len = Math.hypot(nx - px, ny - py) || 1,
      w = width(i) / 2,
      skew = 0.7 + rnd() * 0.6;
    L.push([x - ((ny - py) / len) * w * skew, y + ((nx - px) / len) * w * skew]);
    R.push([x + ((ny - py) / len) * w * (2 - skew), y - ((nx - px) / len) * w * (2 - skew)]);
  }

  const cut = span ? n : Math.floor(n * (0.72 + rnd() * 0.1));
  const body = [...L.slice(0, cut), ...R.slice(0, cut).reverse()];
  const bits = [];
  for (let i = cut; i < n - 2; i += 3 + ((rnd() * 4) | 0)) {
    const j = Math.min(n - 1, i + 2 + ((rnd() * 3) | 0));
    bits.push([...L.slice(i, j + 1), ...R.slice(i, j + 1).reverse()]);
  }
  return [body, ...bits];
}
const poly = p => 'M' + p.map(([x, y]) => f1(x) + ' ' + f1(y)).join('L') + 'Z';

function spall(rnd, x, y, r) {
  const k = 6 + ((rnd() * 3) | 0);
  return Array.from({ length: k }, (_, i) => {
    const a = (i / k) * Math.PI * 2,
      rr = r * (0.55 + rnd() * 0.7);
    return [x + Math.cos(a) * rr * 1.4, y + Math.sin(a) * rr];
  });
}

function crack(id, seed, vb, x, y, ex, ey, w, forks, chips, span = false) {
  const rnd = rand(seed),
    main = fracture(rnd, x, y, ex, ey, span ? 0.1 : 0.16, span ? 8 : 6);
  const shapes = sliver(rnd, main, w, span);
  for (const [at, ang, len, fw] of forks) {
    const [fx, fy] = main[Math.round(at * (main.length - 1))],
      i = Math.round(at * (main.length - 1)),
      [gx, gy] = main[Math.min(main.length - 1, i + 1)],
      a = Math.atan2(gy - fy, gx - fx) + ang;
    shapes.push(
      ...sliver(rnd, fracture(rnd, fx, fy, fx + Math.cos(a) * len, fy + Math.sin(a) * len, 0.2, 5), fw),
    );
  }
  const chipShapes = chips.map(([at, r]) => {
    const [cx, cy] = main[Math.round(at * (main.length - 1))];
    return spall(rnd, cx + (rnd() - 0.5) * r, cy + (rnd() - 0.5) * r, r);
  });
  const d = shapes.map(poly).join(''),
    c = chipShapes.map(poly).join('');
  return `<svg viewBox="${vb}"><defs><filter id="${id}" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="${seed}"/><feDisplacementMap in="SourceGraphic" scale="1.4"/></filter></defs><g filter="url(#${id})"><path d="${c}" fill="rgba(70,78,88,.16)"/><path d="${c}" fill="rgba(255,255,255,.28)" transform="translate(.5 .8)"/><path d="${d}" fill="rgba(255,255,255,.42)" transform="translate(.45 .75)"/><path d="${d}" fill="rgba(28,32,39,.66)"/></g></svg>`;
}

const CABLE =
  'M40 404C41 382 44 366 56 352C74 333 104 334 133 327C168 318 186 296 196 268C207 236 205 205 221 176C238 146 268 136 279 104C289 74 278 40 292 -6';

const CABLE_TALL =
  'M40 404C41 382 45 364 58 348C78 326 106 318 116 290C126 262 104 236 108 206C112 176 138 160 144 128C150 96 130 60 136 -6';
const cord = (k, w, d) =>
  `<svg viewBox="0 0 ${w} 400" class="cable cable--${k}" fill="none" stroke-linecap="round" stroke-linejoin="round"><defs><filter id="cableAmb${k}" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="7"/></filter><filter id="cableContact${k}" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="1.6"/></filter><linearGradient id="boot${k}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3b3b40"/><stop offset=".35" stop-color="#26262a"/><stop offset=".7" stop-color="#151517"/><stop offset="1" stop-color="#0b0b0c"/></linearGradient></defs>
        <path d="${d}" stroke="rgba(18,26,40,.22)" stroke-width="18" filter="url(#cableAmb${k})" transform="translate(6 11)"/>
        <path d="${d}" stroke="rgba(12,16,24,.55)" stroke-width="12" filter="url(#cableContact${k})" transform="translate(1.5 3)"/>
        <path d="${d}" stroke="#0c0c0e" stroke-width="11"/>
        <path d="${d}" stroke="#1d1d21" stroke-width="7.5" transform="translate(-.8 -1.1)"/>
        <path d="${d}" stroke="#2c2c31" stroke-width="3.6" transform="translate(-1.6 -2.1)"/>
        <path d="${d}" stroke="rgba(235,240,250,.2)" stroke-width="1.3" transform="translate(-2.2 -2.9)"/>
        <path d="M28 404 L30 372 Q31 365 36 362 L46 362 Q51 365 52 372 L54 404Z" fill="url(#boot${k})"/>
        <path d="M34 371h14M33.5 378h15M33 385h16M32.6 392h16.8" stroke="rgba(0,0,0,.55)" stroke-width="1.2"/>
        <path d="M34 370.4h14M33.5 377.4h15M33 384.4h16" stroke="rgba(255,255,255,.08)" stroke-width=".8"/>
        <path d="M33 366 Q34 363 38 363" stroke="rgba(255,255,255,.18)" stroke-width="1.2"/>
      </svg>`;
const floor = `<div class="floor" aria-hidden="true">
      <span class="floor__slab">${crack(
        'crackA',
        41,
        '0 0 1800 1500',
        -30,
        430,
        1830,
        640,
        3.4,
        [
          [0.1, -0.7, 120, 1.6],
          [0.9, 0.65, 90, 1.3],
          [0.93, -0.8, 60, 1],
        ],
        [
          [0.13, 3.4],
          [0.87, 2.6],
        ],
        true,
      )}</span>
      <span class="floor__slab">${crack(
        'crackB',
        77,
        '0 0 1800 1500',
        600,
        -30,
        1010,
        1180,
        3,
        [
          [0.11, 0.75, 90, 1.3],
          [0.86, -0.7, 70, 1.1],
        ],
        [
          [0.12, 2.8],
          [0.8, 2.2],
        ],
        true,
      )}</span>
      <span class="floor__slab">${crack('crackC', 7, '0 0 1800 1500', 1530, 120, 1770, 330, 2.6, [[0.45, -0.9, 50, 1]], [[0.08, 2.4]])}</span>
      <span class="floor__cable">${cord('wide', 320, CABLE)}${cord('tall', 200, CABLE_TALL)}</span>
    </div>`;

const buffPatch = (id, word, cls = '') =>
  `<div class="buff${cls}" aria-hidden="true"><span class="buff__tag">${word}</span><svg class="buff__paint" viewBox="0 0 260 150" preserveAspectRatio="none"><defs><filter id="${id}" x="-8%" y="-8%" width="116%" height="116%"><feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" seed="5" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="18" xChannelSelector="R" yChannelSelector="G" result="r"/><feGaussianBlur in="r" stdDeviation="1.6" result="d"/><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="9" result="g"/><feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.5 1.72" result="pin"/><feComposite in="d" in2="pin" operator="in"/></filter></defs><g filter="url(#${id})"><rect x="10" y="16" width="104" height="120" fill="#bcc3cb"/><rect x="92" y="9" width="104" height="132" fill="#c0c7cf" transform="rotate(1.2 144 75)"/><rect x="176" y="20" width="72" height="112" fill="#bec5cd" transform="rotate(-1 212 76)"/></g></svg></div>`;
const footCracks = () =>
  `<div class="foot__cracks" aria-hidden="true"><span class="foot__crack foot__crack--l">${crack(
    'footA',
    23,
    '0 0 1000 420',
    -20,
    130,
    960,
    290,
    3.2,
    [
      [0.32, 0.85, 150, 1.4],
      [0.7, -0.65, 95, 1],
    ],
    [
      [0.05, 3],
      [0.38, 2.2],
    ],
  )}</span><span class="foot__crack foot__crack--r">${crack(
    'footB',
    58,
    '0 0 900 520',
    930,
    545,
    100,
    200,
    3.2,
    [
      [0.3, -0.6, 110, 1.3],
      [0.62, -0.5, 80, 1],
    ],
    [
      [0.06, 3],
      [0.5, 2],
    ],
  )}</span></div>`;

export { floor, buffPatch, footCracks };
