import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve('dist/math-space-defender/browser');
const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json', '.png': 'image/png', '.ico': 'image/x-icon' };
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', 'http://localhost');
    let file = resolve(root, '.' + decodeURIComponent(url.pathname));
    if (file !== root && !file.startsWith(root + sep)) { res.writeHead(403).end(); return; }
    if (url.pathname === '/') file = resolve(root, 'index.html');
    try { if ((await stat(file)).isDirectory()) file = resolve(file, 'index.html'); } catch { if (!extname(url.pathname)) file = resolve(root, 'index.html'); }
    const body = await readFile(file); res.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-cache' }); res.end(body);
  } catch { res.writeHead(404).end('Not found. Run npm run build first.'); }
});
server.listen(4200, '127.0.0.1', () => console.log('Math Space Defender: http://127.0.0.1:4200 (works without internet)'));
