import { readFile } from 'node:fs/promises';
import { posix, resolve } from 'node:path';

export async function inlineStyles (html, file) {
  const embeddedFonts = new Set();
  const links = [...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g)];
  for (const [tag, href] of links) {
    const stylesheet = new URL(href, `https://build.invalid/${file}`);
    let css = await readFile(resolve('dist', stylesheet.pathname.slice(1)), 'utf8');
    // Bundle the UI fonts with critical styles so visible text is ready with HTML.
    for (const [url, , asset] of css.matchAll(/url\((['"]?)([^)'"]*\.woff2)\1\)/g)) {
      if (/^(?:data:|https?:|\/|#)/.test(asset)) continue;
      const font = new URL(asset, stylesheet);
      embeddedFonts.add(font.href);
      const bytes = await readFile(resolve('dist', font.pathname.slice(1)));
      css = css.replace(url, `url("data:font/woff2;base64,${bytes.toString('base64')}")`);
    }
    const inline = css.replace(/url\((['"]?)(.*?)\1\)/g, (original, quote, asset) => {
      if (/^(?:data:|https?:|\/|#)/.test(asset)) return original;
      const target = new URL(asset, stylesheet);
      const relative = posix.relative(posix.dirname(file), target.pathname.slice(1));
      return `url("${relative}${target.search}${target.hash}")`;
    });
    // The document already supplies these styles. Keep a disabled link so Vite's
    // route preloader recognizes them without downloading a duplicate at startup.
    html = html.replace(tag, () => `<style data-build-css="${href}">${inline}</style>${tag.replace('<link ', '<link disabled media="print" ')}`);
  }
  return html.replace(/<link\b[^>]*>/g, (tag) => {
    const href = tag.match(/\bhref="([^"]+)"/)?.[1];
    return /\brel="preload"/.test(tag) && href &&
      embeddedFonts.has(new URL(href, `https://build.invalid/${file}`).href)
      ? ''
      : tag;
  });
}
