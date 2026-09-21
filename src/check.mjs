// src/check.mjs — validates the generated site. Exit 1 on any failure.
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const genres = JSON.parse(readFileSync(join(root, 'src/genres.json'), 'utf8'));
const failures = [];
const fail = (msg) => failures.push(msg);
const count = (s, re) => (s.match(re) || []).length;

const pages = ['index.html', ...genres.map((g) => `${g.slug}/index.html`)];
for (const f of ['sitemap.xml', 'robots.txt', 'style.css', '.nojekyll', 'assets/icon.png', 'assets/og.png']) {
  if (!existsSync(join(root, f))) fail(`missing ${f}`);
}
for (const rel of pages) {
  const p = join(root, rel);
  if (!existsSync(p)) { fail(`missing ${rel}`); continue; }
  const html = readFileSync(p, 'utf8');
  for (const [name, re] of [
    ['<title>', /<title>[^<]+<\/title>/g],
    ['meta description', /<meta name="description" content="[^"]+"/g],
    ['canonical', /<link rel="canonical" href="https:\/\/[^"]+"/g],
    ['apple-itunes-app', /<meta name="apple-itunes-app"/g],
    ['SoftwareApplication', /"@type": "SoftwareApplication"/g],
  ]) if (count(html, re) !== 1) fail(`${rel}: expected exactly one ${name}`);
  for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const url = m[1];
    if (/^(https?:|mailto:|#)/.test(url)) continue;
    const target = resolve(dirname(p), url.replace(/\/$/, '/index.html'));
    if (!existsSync(target)) fail(`${rel}: broken link ${url}`);
  }
}
const sitemap = readFileSync(join(root, 'sitemap.xml'), 'utf8');
if (count(sitemap, /<loc>/g) !== 1 + genres.length) fail(`sitemap has ${count(sitemap, /<loc>/g)} urls, expected ${1 + genres.length}`);
if (new Set(genres.map((g) => g.slug)).size !== genres.length) fail('duplicate slug in genres.json');
for (const g of genres) if (!existsSync(join(root, 'assets/screenshots', g.screenshot))) fail(`${g.slug}: screenshot ${g.screenshot} missing`);

if (failures.length) { for (const f of failures) console.error('✗', f); process.exit(1); }
console.log(`✓ ${pages.length} pages checked`);
