import { SITE } from '../../content/site.mjs';
import { attr, esc, meter, chip, cover, coverSet, KEYS } from './util.mjs';
import { floor, buffPatch } from './slab.mjs';

export function homePage({ L, byScore, featured, code, layout }) {
  const { head, header, footer } = layout;
  const lcdFor = l =>
    `<b>PAD ${l.n}</b> · ${esc(l.album.toUpperCase())}<br>${esc(l.artist.toUpperCase())}<div class="bar">${meter(l.score)} ${l.score} · ${l.tier.toUpperCase()}</div>`;
  const padData = JSON.stringify(
    L.map(l => ({
      n: l.n,
      slug: l.page,
      album: l.album,
      artist: l.artist,
      score: l.score,
      tier: l.tier,
      url: l.url,
      featured: l === featured || undefined,
    })),
  ).replace(/</g, '\\u003c');

  const homeLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE.origin}/#website`,
        url: `${SITE.origin}/`,
        name: SITE.name,
        publisher: { '@id': `${SITE.origin}/#owner` },
      },
      {
        '@type': 'Person',
        '@id': `${SITE.origin}/#owner`,
        name: 'JB',
        url: `${SITE.origin}/`,
        sameAs: [`https://www.instagram.com/${SITE.instagram}/`],
      },
    ],
  }).replace(/</g, '\\u003c');
  const buff = buffPatch('buffRoll', 'Blizz');

  const home = `${head({ title: SITE.name, description: `Rap album reviews by JB. ${SITE.tagline}`, url: '', image: 'assets/og/home.jpg', type: 'website', sheet: 'home.css', preload: ['assets/fonts/plex-mono-400.woff2', 'assets/fonts/plex-mono-600.woff2'], extra: `<script type="application/ld+json">${homeLd}</script>\n` })}
<body>
${header(true)}
<main id="top">
  <section class="hero" aria-label="The pads">
    ${buff}
    <div class="rig" id="rig">
    ${floor}<div class="rig__shadow" aria-hidden="true"></div><div class="chrome" id="chrome"><span class="chrome__env" aria-hidden="true"></span><div class="mpc" id="mpc">
      <span class="mpc__light" aria-hidden="true"><i class="shade"></i><i class="streak"></i><i class="hot"></i></span>
      <span class="screw screw--tl"></span><span class="screw screw--tr"></span><span class="screw screw--bl"></span><span class="screw screw--br"></span>
      <div class="mpc__top"><h1 class="silk">JB Talks <em>Rap</em><i class="drip" style="left:6.2%;top:60%;height:.36em" aria-hidden="true"></i><i class="drip" style="left:46.2%;top:62%;height:.24em" aria-hidden="true"></i><i class="drip drip--red" style="left:93.5%;height:.42em" aria-hidden="true"></i></h1></div><div class="inlay" aria-hidden="true"><i class="inlay__glow"></i><i class="glint" style="left:8%;--rot:20deg" data-at="0.08"></i><i class="glint" style="left:21%;--rot:-10deg" data-at="0.21"></i><i class="glint" style="left:37%;--rot:35deg" data-at="0.37"></i><i class="glint" style="left:52%;--rot:5deg" data-at="0.52"></i><i class="glint" style="left:66%;--rot:-25deg" data-at="0.66"></i><i class="glint" style="left:81%;--rot:15deg" data-at="0.81"></i><i class="glint" style="left:94%;--rot:40deg" data-at="0.94"></i></div>
      <div class="mpc__body">
        <div><div class="lcd" aria-live="polite"><div id="lcd"><div class="lcd__boot">JB TALKS RAP<br>LOADING THE CRATE…</div><div class="lcd__static">${lcdFor(featured)}</div></div><div class="wavebox" aria-hidden="true"><canvas class="wave" id="wave"></canvas><span class="wave__clip"><canvas id="waveLit"></canvas></span></div><span class="lcd__glass" aria-hidden="true"></span></div>
          <div class="controls"><div class="knobs" aria-hidden="true"><span class="knob"><span class="knob__cap"></span><i class="glint" data-knob="0"></i><small>VOL</small></span><span class="knob"><span class="knob__cap"></span><i class="glint" data-knob="1"></i><small>SWING</small></span><span class="knob"><span class="knob__cap"></span><i class="glint" data-knob="2"></i><small>TUNE</small></span><span class="knob"><span class="knob__cap"></span><i class="glint" data-knob="3"></i><small>DECAY</small></span></div>
          <div class="btns"><button class="mbtn" id="snd" aria-pressed="false"><i class="led" aria-hidden="true"></i>Sound</button><a class="readkey" id="read" href="${featured.url}"><span>Read the review</span></a></div></div></div>
        <div class="pads" id="pads">
${L.map((l, i) => `          <span class="well"><button class="pad" data-slug="${l.page}" aria-label="${KEYS[i]}: ${attr(l.album)} by ${attr(l.artist)}" aria-pressed="false"><img src="${cover(l.slug, 480)}" srcset="${coverSet(l.slug, [240, 480])}" sizes="(max-width:900px) 22vw, 13vw" alt="" width="480" height="480" draggable="false"><span class="pad__k" aria-hidden="true">${KEYS[i]}</span></button></span>`).join('\n')}
        </div>
      </div>
    </div></div></div>
    <div class="under"><p class="keys">Keys play the pads: <kbd>1</kbd><kbd>2</kbd><kbd>3</kbd><kbd>4</kbd> <kbd>Q</kbd><kbd>W</kbd><kbd>E</kbd><kbd>R</kbd> <kbd>A</kbd><kbd>S</kbd><kbd>D</kbd><kbd>F</kbd></p></div>
  </section>

  <section class="arch" id="archive" aria-labelledby="ah">
    <div class="arch__head"><h2 class="caps" id="ah">The Archive</h2>
      <div class="sorts" role="group" aria-label="Sort the archive"><i class="sorts__screw" aria-hidden="true"></i>${[
        ['score', 'Score'],
        ['artist', 'Artist'],
        ['album', 'Album'],
      ]
        .map(
          ([k, t], i) =>
            `<span class="fn__well"><button class="fb${i ? '' : ' on'}" data-sort="${k}" aria-pressed="${!i}"><span>${t}</span></button></span>`,
        )
        .join('')}<i class="sorts__screw" aria-hidden="true"></i></div></div>
    <ol class="ranks" id="ranks">
${byScore.map((l, i) => `      <li data-slug="${l.page}" data-score="${l.score}" data-artist="${attr(l.artist)}" data-album="${attr(l.album)}"><a class="row${l.tier === 'Diamond' ? ' row--diamond' : ''}" href="${l.url}"><span class="row__rank">${String(i + 1).padStart(2, '0')}</span><span class="pad"><img src="${cover(l.slug, 240)}" alt="" width="240" height="240" loading="lazy"></span><span class="row__t"><b>${esc(l.album)}</b><em>${esc(l.artist)}</em></span>${meter(l.score)}<span class="row__s">${l.score}<small>/10</small></span>${chip(l.tier)}</a></li>`).join('\n')}
    </ol>
  </section>
</main>
${footer(true)}
<script type="application/json" id="pad-data">${padData}</script>
<script src="${code['site.js']}"></script><script src="${code['home.js']}"></script>
</body>
</html>
`;
  return home;
}
