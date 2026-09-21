// src/render.mjs — the whole template language: {{k}}, {{{k}}}, {{#each k}}…{{/each}}, {{#if k}}…{{/if}}
const escape = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const lookup = (data, key) => data?.[key];

export function render(template, data) {
  let out = template.replace(/{{#each (\w+)}}([\s\S]*?){{\/each}}/g, (_, key, body) =>
    (lookup(data, key) ?? []).map((item) => render(body, typeof item === 'object' ? { ...data, ...item } : { ...data, '.': item })).join(''));
  out = out.replace(/{{#if (\w+)}}([\s\S]*?){{\/if}}/g, (_, key, body) => (lookup(data, key) ? render(body, data) : ''));
  out = out.replace(/{{{(\w+|\.)}}}/g, (_, key) => lookup(data, key) ?? '');
  return out.replace(/{{(\w+|\.)}}/g, (_, key) => escape(lookup(data, key) ?? ''));
}
