import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildSite, storeLink } from './build.mjs';

test('storeLink adds campaign params only when pt is set', () => {
  const site = { appId: '6809986409', storeUrl: 'https://apps.apple.com/jp/app/id6809986409', campaignPt: '' };
  assert.equal(storeLink(site, 'site-top'), site.storeUrl);
  assert.equal(storeLink({ ...site, campaignPt: '12345' }, 'site-movies'),
    'https://apps.apple.com/app/apple-store/id6809986409?pt=12345&ct=site-movies&mt=8');
});

test('buildSite writes top, genres, sitemap, robots, css', () => {
  const out = mkdtempSync(join(tmpdir(), 'site-'));
  const written = buildSite(out);
  assert.ok(existsSync(join(out, 'index.html')));
  assert.ok(existsSync(join(out, 'movies/index.html')));
  assert.ok(existsSync(join(out, 'style.css')));
  const sitemap = readFileSync(join(out, 'sitemap.xml'), 'utf8');
  assert.equal((sitemap.match(/<loc>/g) || []).length, 9);
  const movies = readFileSync(join(out, 'movies/index.html'), 'utf8');
  assert.match(movies, /<title>映画の記録アプリ｜レビューブック<\/title>/);
  assert.match(movies, /rel="canonical" href="https:\/\/whi-dev\.github\.io\/review-books-site\/movies\/"/);
  assert.match(movies, /apple-itunes-app/);
  assert.match(movies, /"@type": "SoftwareApplication"/);
  assert.match(movies, /"@type":"FAQPage"/);
  assert.equal(written.length, 12);
});
