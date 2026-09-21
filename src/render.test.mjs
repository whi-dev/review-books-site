import test from 'node:test';
import assert from 'node:assert/strict';
import { render } from './render.mjs';

test('substitutes and escapes variables', () => {
  assert.equal(render('<p>{{a}}</p>', { a: '<b>&' }), '<p>&lt;b&gt;&amp;</p>');
});

test('triple braces insert raw html', () => {
  assert.equal(render('{{{a}}}', { a: '<b>' }), '<b>');
});

test('missing keys render empty', () => {
  assert.equal(render('[{{nope}}]', {}), '[]');
});

test('each loops over arrays with item scope', () => {
  const out = render('{{#each xs}}<i>{{n}}</i>{{/each}}', { xs: [{ n: 1 }, { n: 2 }] });
  assert.equal(out, '<i>1</i><i>2</i>');
});

test('each over strings exposes {{.}}', () => {
  assert.equal(render('{{#each xs}}[{{.}}]{{/each}}', { xs: ['a', 'b'] }), '[a][b]');
});

test('if renders block only when truthy', () => {
  assert.equal(render('{{#if a}}yes{{/if}}', { a: '' }), '');
  assert.equal(render('{{#if a}}yes{{/if}}', { a: 'x' }), 'yes');
});
