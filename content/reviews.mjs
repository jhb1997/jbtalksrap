export const SITE = {
  name: 'JB Talks Rap',
  origin: 'https://www.jbtalksrap.com',
  tagline: 'Some Reviews. Some Analysis. Some Opinion. Lots of Rap.',
  email: 'justinhblume@gmail.com',
  instagram: 'jhblume',
};

export const FEATURED = '05';

export const REVIEWS = [
  {
    n: '01',
    slug: 'what-s-in-a-name-the-top-10-most-creative-band-names-of-all-time',
    album: 'A Written Testimony',
    artist: 'Jay Electronica',
    score: '8.1',
    alt: 'trees reflected in still water',
    summary:
      'After a 12-year wait, Jay Electronica’s debut plays like a joint album with Jay Z: Islamic poetry, Black history and complex rhyme.',
  },
  {
    n: '02',
    slug: 'royce-da-5-9-the-allegory-review',
    album: 'The Allegory',
    artist: 'Royce da 5’9',
    score: '8.6',
    alt: 'a burned two-dollar bill',
    summary:
      'Royce da 5’9 returns with a poetic 22-song project on race, drugs and violence in America, with history lessons in every bar.',
  },
  {
    n: '03',
    slug: 'who-is-tory-lanez-new-toronto-3-album-review',
    album: 'New Toronto 3',
    artist: 'Tory Lanez',
    score: '6.9',
    alt: 'Tory Lanez holding a child',
    summary:
      'Tory Lanez, newly mainstream after Quarantine Radio, raps guns, girls and diamonds on a jaded but brilliant tape that leans on borrowed flows.',
  },
  {
    n: '04',
    slug: 'blame-it-on-baby-review',
    album: 'Blame It on Baby',
    artist: 'DaBaby',
    score: '7.0',
    alt: 'DaBaby in a face mask',
    summary:
      'DaBaby answers his critics with melody, triplet flows and introspection: a cohesive third album from an artist, not just a rapper.',
  },
  {
    n: '05',
    slug: 'pray-for-paris-westside-gunn-s-magnum-opus',
    album: 'Pray for Paris',
    artist: 'Westside Gunn',
    score: '9.1',
    alt: 'a repainted Caravaggio',
    summary:
      'Westside Gunn’s Paris-inspired magnum opus: Virgil Abloh cover art, elite beats and features, grit plated like a five-star dish.',
  },
  {
    n: '06',
    slug: 'conway-the-machine-lulu-review',
    album: 'LULU',
    artist: 'Conway the Machine',
    score: '6.5',
    alt: 'a great white shark',
    summary:
      'Conway the Machine and the Alchemist’s 7-song LULU: dark, grimy street rap over menacing beats, if lighter on wordplay and replay value.',
  },
  {
    n: '07',
    slug: 'the-versace-tape-boldy-james-album-review',
    album: 'The Versace Tape',
    artist: 'Boldy James',
    score: '7.3',
    alt: 'Boldy James in Versace',
    summary:
      'Boldy James and Jay Versace’s short, sweet surprise: specific, understated Detroit street tales from one of rap’s most underrated lyricists.',
  },
  {
    n: '08',
    slug: 'from-king-to-a-god-conway-the-machine-finds-his-sound',
    album: 'From King to a God',
    artist: 'Conway the Machine',
    score: '7.8',
    alt: 'Conway with a chrome crown',
    summary:
      'Conway the Machine’s Shady Records debut is his best yet: sharper flows, star producers, no skips and some of the year’s cleverest bars.',
  },
  {
    n: '09',
    slug: 'who-made-the-sunshine-westside-gunn-review',
    album: 'Who Made The Sunshine',
    artist: 'Westside Gunn',
    score: '7.1',
    alt: 'a child’s crayon drawing',
    summary:
      'Westside Gunn plays A&R on a well-curated Shady Records debut full of reunions, fresh sounds and room for the whole Griselda family.',
  },
  {
    n: '10',
    slug: 'burden-of-proof-is-benny-the-butcher-the-best-rapper-in-the-game',
    album: 'Burden of Proof',
    artist: 'Benny the Butcher',
    score: '8.7',
    alt: 'Benny the Butcher, eyes blurred',
    summary:
      'Benny the Butcher makes his case for best in the game over Hit-Boy’s soulful, menacing beats: a precise revival of 2000s New York grit.',
  },
  {
    n: '11',
    slug: 'la-maquina-album-review-conway-the-machine',
    album: 'La Maquina',
    artist: 'Conway the Machine',
    score: '7.7',
    alt: 'a mansion seen from above',
    summary:
      'An all-star producer lineup takes Conway the Machine past the “too grimy” critique on a 50-minute album that still hits like classic Griselda.',
  },
  {
    n: '12',
    slug: 'utopia-no-place',
    album: 'Utopia',
    artist: 'Travis Scott',
    score: '8.2',
    alt: 'Travis Scott in near darkness',
    summary:
      'Travis Scott’s most experimental album treats utopia as a fleeting moment, not a place: bold sound, shifting flows, a crowded feature list.',
  },
];

export const ART = {
  'pray-for-paris-westside-gunn-s-magnum-opus': {
    1: [
      {
        src: 'salvator',
        frame: 'painting',
        alt: 'Salvator Mundi, a painting of Christ holding a crystal orb',
        cap: 'Salvator Mundi, attributed to Leonardo da Vinci, c. 1500. Sold at Christie’s, New York, in 2017.',
      },
    ],
    3: [
      {
        src: 'nb327',
        frame: 'cutout',
        alt: 'A pair of orange and yellow New Balance 327 sneakers seen from above',
        cap: 'New Balance 327s. Photo: Thanin Chaiyawan, Unsplash.',
      },
    ],
    4: [
      {
        src: 'rushmore',
        frame: 'print',
        tilt: 1.4,
        alt: 'Workers on the face of Mount Rushmore during its carving',
        cap: 'Mount Rushmore, during its carving.',
      },
    ],
    6: [
      {
        src: 'djoliba',
        frame: 'print',
        tilt: -1,
        phone: { ratio: '4/5', pos: '50% 18%' },
        alt: 'A narrow Paris street with a hanging sign reading Djoliba Restaurant, sur place ou à emporter',
        cap: 'Djoliba, a restaurant on rue Blondel in Paris, 2021. Photo: Chabe01, CC BY-SA 4.0, cropped.',
      },
    ],
  },
};

export const tier = s => (+s >= 8.5 ? 'Diamond' : +s >= 7.5 ? 'Platinum' : 'Gold');
