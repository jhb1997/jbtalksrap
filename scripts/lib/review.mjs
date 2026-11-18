import { SITE, ART } from '../../content/reviews.mjs';
import { attr, esc, meter, chip, cover, coverSet, COVER_W, reEsc } from './util.mjs';

export function reviewPages({ L, artSize, artSets, code, layout }) {
  const { head, header, footer } = layout;
  const piece = p => {
    const [w, h] = artSize[p.src];
    const img = `<img src="assets/img/art/${p.src}.webp" srcset="${artSets[p.src]}" sizes="${p.type === 'wide' ? '(max-width:1000px) 92vw, 58rem' : '(max-width:760px) 80vw, 15rem'}" alt="${attr(p.alt)}" width="${w}" height="${h}" style="--ar:${w}/${h}" loading="lazy">`;
    const framed =
      p.frame === 'painting'
        ? `<span class="fig__f"><span class="fig__m">${img}</span></span>`
        : p.frame === 'print'
          ? `<span class="fig__f">${img}</span>`
          : img;
    return `<figure class="fig fig--${p.frame || 'print'}${p.type === 'wide' ? ' fig--wide' : ''}"${p.tilt || p.phone ? ` style="${p.tilt ? `--tilt:${p.tilt}deg;` : ''}${p.phone ? `--pr:${p.phone.ratio};--pp:${p.phone.pos}` : ''}"` : ''}>${framed}<figcaption>${esc(p.cap)}</figcaption></figure>`;
  };
  const xlink = o =>
    `<a class="xlink" href="${o.url}" data-slug="${o.page}"><span class="pad"><img src="${cover(o.slug, 240)}" alt="" width="240" height="240" loading="lazy"></span><span><small>ALSO REVIEWED</small><b>${esc(o.album)}</b><em>${esc(o.artist)} · ${o.score}</em></span></a>`;
  function reviewBody(l) {
    const art = ART[l.slug] || {},
      linked = new Set([l.n]);
    let html = '',
      carry = [];
    l.paras.forEach((p, i) => {
      const side = i === 0 ? [] : carry,
        after = [];
      carry = [];
      (art[i] || []).forEach(a => (a.type === 'wide' ? after : side).push(piece(a)));
      L.forEach(o => {
        if (linked.has(o.n)) return;
        if (new RegExp(reEsc(o.album), 'i').test(p)) {
          linked.add(o.n);
          side.push(xlink(o));
        }
      });
      if (i === 0) {
        carry = side.splice(0);
        html += `<p>${esc(p)}</p>` + after.join('');
      } else html += side.join('') + `<p>${esc(p)}</p>` + after.join('');
    });
    html += carry.join('');
    const plain = !/class="(fig|xlink)/.test(html);
    return { html, plain };
  }

  function review(l) {
    const { html, plain } = reviewBody(l);
    const others = L.filter(o => o !== l)
      .sort((a, b) => Math.abs(+a.score - +l.score) - Math.abs(+b.score - +l.score))
      .slice(0, 4);
    const next = L[(L.indexOf(l) + 1) % L.length];
    const ld = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Review',
      name: l.title,
      headline: l.title,
      datePublished: l.iso,
      url: `${SITE.origin}/${l.url}`,
      image: `${SITE.origin}/${cover(l.slug, 1200)}`,
      author: { '@type': 'Person', name: 'JB' },
      publisher: { '@type': 'Organization', name: SITE.name },
      itemReviewed: {
        '@type': 'MusicAlbum',
        name: l.album,
        byArtist: { '@type': 'MusicGroup', name: l.artist },
      },
      reviewRating: { '@type': 'Rating', ratingValue: l.score, bestRating: '10', worstRating: '0' },
    }).replace(/</g, '\\u003c');
    return `${head({
      title: `${l.album} Review`,
      description: l.description,
      url: l.url,
      image: `assets/og/${l.slug}.jpg`,
      type: 'article',
      sheet: 'review.css',
      preload: ['assets/fonts/newsreader.woff2'],
      extra: `<meta property="article:published_time" content="${l.iso}">\n<script type="application/ld+json">${ld}</script>\n`,
    })}
<body>
<a class="skip" href="#body">Skip to the review</a>
${header(false, next)}
<main>
  <div class="rv-wrap">
    <div class="rv-main${plain ? ' rv-main--plain' : ''}">
      <header class="rv-head">
        <div class="slab"><span class="slab__screw"></span><span class="slab__screw"></span><span class="slab__screw"></span><span class="slab__screw"></span><span class="slab__well"><span class="pad"><img src="${cover(l.slug, 1200)}" srcset="${coverSet(l.slug, [480, 1200])}" sizes="(max-width:760px) 64vw, (max-width:1000px) 30vw, 16vw" alt="${attr(`${l.album} cover: ${l.alt}`)}" width="1200" height="1200" fetchpriority="high"></span></span>${l.tier === 'Diamond' ? '<span class="slab__inlay" aria-hidden="true"></span>' : ''}</div>
        <div><h1 class="caps">${esc(l.title)}</h1><p class="rv-by"><span class="by">${esc(l.artist)}</span><time datetime="${l.iso}">Reviewed ${l.date}</time></p></div>
      </header>
      <div class="rv-rate"><b>${l.score}<small>/10</small></b>${meter(l.score)}${chip(l.tier)}</div>
      <article class="rv-body${plain ? ' rv-body--plain' : ''}" id="body" data-n="${l.n}">${html}</article>
    </div>
  </div>
  <section class="next" aria-labelledby="nh"><h2 class="caps" id="nh">More reviews</h2><div class="next__pads">${others.map(o => `<a href="${o.url}" data-slug="${o.page}"><span class="pad"><img src="${cover(o.slug, 480)}" srcset="${coverSet(o.slug, COVER_W)}" sizes="(max-width:760px) 45vw, min(23vw, 22rem)" alt="" width="480" height="480" loading="lazy"></span><b>${esc(o.album)}</b><em>${esc(o.artist)} · ${o.score}</em></a>`).join('')}</div></section>
</main>
${footer(false)}
<div class="bar"><span class="bar__t" aria-hidden="true">${esc(l.album.toUpperCase())}</span><canvas id="wave2" aria-hidden="true"></canvas><span id="barPct" aria-hidden="true">0%</span></div>
<script src="${code['site.js']}"></script><script src="${code['review.js']}"></script>
</body>
</html>
`;
  }
  return L.map(l => [l.url, review(l)]);
}
