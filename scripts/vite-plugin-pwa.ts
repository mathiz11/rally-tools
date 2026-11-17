import { createHash } from 'node:crypto';
import type { Plugin } from 'vite';
import { ROUTES } from '../src/routes.ts';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/**
 * Minimal build plugin (no dependency):
 *  1. emits one HTML page per route (essence.html…) with its <title> and description;
 *  2. emits `sw.js`, a service worker that precaches the whole build for offline use.
 */
export function rallyPwa(): Plugin {
  return {
    name: 'rally-pwa',
    enforce: 'post',
    apply: 'build',
    generateBundle: {
      order: 'post',
      handler(_options, bundle) {
        const index = bundle['index.html'];
        if (!index || index.type !== 'asset') throw new Error('rally-pwa: index.html introuvable dans le bundle');
        const html = String(index.source);

        for (const r of ROUTES) {
          if (r.path === '/') continue;
          const page = html
            .replace(/<title>.*?<\/title>/, `<title>${esc(r.title)}</title>`)
            .replace(/(<meta name="description" content=")[^"]*(")/, `$1${esc(r.description)}$2`);
          this.emitFile({ type: 'asset', fileName: `${r.path.slice(1)}.html`, source: page });
        }

        const assets = Object.keys(bundle)
          .filter((f) => f !== 'index.html' && !f.endsWith('.woff')) // woff2 is enough: modern browsers ignore the woff fallback
          .map((f) => `/${f}`);
        const urls = [...ROUTES.map((r) => r.path), ...assets, '/manifest.webmanifest', '/favicon.svg'];
        const version = createHash('sha1').update(html + assets.join()).digest('hex').slice(0, 10);

        this.emitFile({
          type: 'asset',
          fileName: 'sw.js',
          source: `const CACHE='rally-tools-${version}';
const URLS=${JSON.stringify(urls)};
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(URLS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n!==CACHE).map(n=>caches.delete(n)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
  e.respondWith(caches.match(r,{ignoreSearch:true,ignoreVary:true}).then(hit=>hit||fetch(r).catch(()=>r.mode==='navigate'?caches.match('/'):Response.error())));
});
`,
        });
      },
    },
  };
}
