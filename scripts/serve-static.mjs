import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { resolve, join, extname, sep } from "node:path";

const root = resolve("out");
if (!existsSync(join(root, "index.html"))) throw new Error("Run npm run build before starting the static preview.");
const port = Number(process.env.PORT || 4173);
const mime = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif", ".mp4": "video/mp4", ".mp3": "audio/mpeg", ".woff2": "font/woff2", ".txt": "text/plain" };
createServer((request, response) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url || "/", "http://localhost").pathname); }
  catch { response.writeHead(400).end(); return; }
  const target = resolve(root, `.${pathname}`);
  if (target !== root && !target.startsWith(root + sep)) { response.writeHead(403).end(); return; }
  let file = target;
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
  let status = 200;
  if (!existsSync(file) || !statSync(file).isFile()) { file = join(root, "404.html"); status = 404; }
  const size = statSync(file).size;
  let start = 0, end = size - 1;
  const headers = { "Content-Type": mime[extname(file)] || "application/octet-stream", "Accept-Ranges": "bytes" };
  if (status === 200 && request.headers.range) {
    const match = request.headers.range.match(/^bytes=(\d+)-(\d*)$/);
    if (!match) { response.writeHead(416, { "Content-Range": `bytes */${size}` }).end(); return; }
    start = Number(match[1]); end = match[2] ? Math.min(Number(match[2]), end) : end;
    if (start > end || start >= size) { response.writeHead(416, { "Content-Range": `bytes */${size}` }).end(); return; }
    status = 206; headers["Content-Range"] = `bytes ${start}-${end}/${size}`;
  }
  headers["Content-Length"] = String(Math.max(0, end - start + 1));
  response.writeHead(status, headers);
  if (request.method === "HEAD" || size === 0) { response.end(); return; }
  createReadStream(file, { start, end }).pipe(response);
}).listen(port, "127.0.0.1", () => console.log(`Static preview: http://127.0.0.1:${port}`));
