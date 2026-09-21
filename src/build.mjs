// src/build.mjs — generates the site into <root> from src/site.json, src/genres.json and src/templates.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { render } from './render.mjs';

const src = dirname(fileURLToPath(import.meta.url));
const read = (p) => readFileSync(join(src, p), 'utf8');

export function storeLink(site, ct) {
  return site.campaignPt
    ? `https://apps.apple.com/app/apple-store/id${site.appId}?pt=${site.campaignPt}&ct=${ct}&mt=8`
    : site.storeUrl;
}

const faqJsonLd = (faq) => `<script type="application/ld+json">${JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faq.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
})}</script>`;

export function buildSite(root) {
  const site = JSON.parse(read('site.json'));
  const genres = JSON.parse(read('genres.json'));
  const layout = read('templates/layout.html');
  const topTpl = read('templates/top.html');
  const genreTpl = read('templates/genre.html');
  const written = [];
  const write = (rel, text) => { const p = join(root, rel); mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, text); written.push(rel); };

  const page = (rel, { content, title, description, path, root: rootRel, ct, extraHead = '' }) =>
    write(rel, render(layout, { ...site, title, description, canonical: `${site.baseUrl}${path}`, root: rootRel, storeLink: storeLink(site, ct), extraHead, content }));

  page('index.html', {
    title: `${site.appName} - ${site.tagline}`,
    description: '好きなものを自分だけの評価軸で記録するレビュー手帳。非公開・アカウント不要。映画・本・ゲーム・カフェ・ワイン・観劇・コスメ、なんでも記録できる iPhone アプリ。',
    path: '/', root: './', ct: 'site-top',
    content: render(topTpl, { ...site, genres, storeLink: storeLink(site, 'site-top') }),
  });

  for (const g of genres) {
    page(`${g.slug}/index.html`, {
      title: g.title, description: g.description, path: `/${g.slug}/`, root: '../', ct: `site-${g.slug}`,
      extraHead: faqJsonLd(g.faq),
      content: render(genreTpl, { ...g, others: genres.filter((o) => o.slug !== g.slug), storeLink: storeLink(site, `site-${g.slug}`) }),
    });
  }

  const urls = ['/', ...genres.map((g) => `/${g.slug}/`)];
  write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${site.baseUrl}${u}</loc></url>`).join('\n')}\n</urlset>\n`);
  write('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${site.baseUrl}/sitemap.xml\n`);
  write('style.css', read('style.css'));
  return written;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = join(src, '..');
  for (const p of buildSite(root)) console.log('wrote', p);
}
