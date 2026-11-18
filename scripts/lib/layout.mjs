import { SITE } from '../../content/reviews.mjs';
import { attr, esc } from './util.mjs';
import { buffPatch, footCracks } from './floor.mjs';

export function makeLayout(css) {
  const head = ({
    title,
    description,
    url,
    image,
    type,
    sheet,
    preload = [],
    extra = '',
    plate = true,
  }) => `<!doctype html>
<html lang="en" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${attr(description)}">
${plate ? `<link rel="canonical" href="${SITE.origin}/${url}">` : ''}
<meta property="og:site_name" content="${SITE.name}">
<meta property="og:type" content="${type}">
<meta property="og:title" content="${attr(title)}">
<meta property="og:description" content="${attr(description)}">
<meta property="og:url" content="${SITE.origin}/${url}">
<meta property="og:image" content="${SITE.origin}/${image}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#f2eee5">
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="assets/apple-touch-icon.png">
<link rel="preload" href="assets/fonts/anybody.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="assets/fonts/tag.woff2" as="font" type="font/woff2" crossorigin>
${preload.map(p => `<link rel="preload" href="${p}" as="font" type="font/woff2" crossorigin>`).join('\n')}
${
  plate
    ? `<link rel="preload" href="assets/img/brushed.webp" as="image" media="(min-width:761px)" fetchpriority="high">
<link rel="preload" href="assets/img/brushed-phone.webp" as="image" media="(max-width:760px)" fetchpriority="high">`
    : ''
}
<style>${css[sheet]}</style>
<script>document.documentElement.className='js'</script>
${extra}</head>`;

  const spray = `<svg class="defs" width="0" height="0" aria-hidden="true" focusable="false"><filter id="spray" x="-15%" y="-30%" width="130%" height="170%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="2.2" numOctaves="1" seed="4" result="grain"/><feTurbulence type="fractalNoise" baseFrequency=".06" numOctaves="2" seed="9" result="wobble"/><feDisplacementMap in="SourceGraphic" in2="wobble" scale="3" xChannelSelector="R" yChannelSelector="G" result="rough"/><feGaussianBlur in="rough" stdDeviation="5" result="halo"/><feComposite in="halo" in2="grain" operator="arithmetic" k1="1.9" k2="0" k3="0" k4="-.12" result="specks"/><feComponentTransfer in="specks" result="dots"><feFuncA type="discrete" tableValues="0 0 0 .45 .8 1"/></feComponentTransfer><feMerge><feMergeNode in="dots"/><feMergeNode in="rough"/></feMerge></filter><filter id="spray-sm" x="-20%" y="-40%" width="140%" height="180%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="2.6" numOctaves="1" seed="2" result="grain"/><feTurbulence type="fractalNoise" baseFrequency=".12" numOctaves="2" seed="5" result="wobble"/><feDisplacementMap in="SourceGraphic" in2="wobble" scale="1.6" xChannelSelector="R" yChannelSelector="G" result="rough"/><feGaussianBlur in="rough" stdDeviation="2.2" result="halo"/><feComposite in="halo" in2="grain" operator="arithmetic" k1="2" k2="0" k3="0" k4="-.1" result="specks"/><feComponentTransfer in="specks" result="dots"><feFuncA type="discrete" tableValues="0 0 0 .5 .85 1"/></feComponentTransfer><feMerge><feMergeNode in="dots"/><feMergeNode in="rough"/></feMerge></filter></svg>`;

  const header = (home, next) =>
    home
      ? spray
      : `${spray}<header class="hdr hdr--read" id="hdr" data-hide><a class="hdr__mark" href="./">${SITE.name}</a><nav class="hdr__nav" aria-label="Site"><a href="./#archive">All reviews</a><a class="hdr__next" href="${next.url}">Next review <span aria-hidden="true">→</span></a></nav></header>`;

  const footer = home =>
    `<footer class="foot">${home ? footCracks() + buffPatch('buffRoll2', 'JB', ' buff--foot') : ''}<div class="foot__in"><p class="foot__mark" aria-hidden="true" data-paint data-fit><span class="foot__ink">${SITE.name}</span></p><div class="foot__row"><p><a href="mailto:${SITE.email}">${SITE.email}</a></p><p>© ${SITE.name}</p></div></div></footer>`;
  return { head, spray, header, footer };
}
