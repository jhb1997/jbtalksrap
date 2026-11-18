import { SITE } from '../../content/reviews.mjs';

export function notFoundPage({ code, layout }) {
  const { head, spray } = layout;
  return `${head({
    title: `Page not found · ${SITE.name}`,
    description: 'This page is broken.',
    url: '404.html',
    image: 'assets/og/home.jpg',
    type: 'website',
    sheet: '404.css',
    plate: false,
    preload: ['assets/fonts/newsreader.woff2'],
    extra: '<meta name="robots" content="noindex">\n',
  })}
<body>
${spray}
<main class="lost">
  <div class="lost__wall"><p class="lost__mark" aria-hidden="true" data-paint><span class="foot__ink">404</span><i class="drip" style="left:24%;height:.22em"></i><i class="drip" style="left:71%;top:64%;height:.14em"></i></p></div>
  <h1>This page is broken.</h1>
  <a class="mbtn mbtn--red" href="/">Back to home</a>
</main>
<script src="${code['site.js']}"></script>
</body>
</html>
`
    .replace(/(href|src)="assets\//g, '$1="/assets/')
    .replace(/url\(assets\//g, 'url(/assets/');
}
