import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";

// The imported site sits at the workspace root, alongside this scaffold.
const ROOT = fileURLToPath(new URL("./", import.meta.url));
const PORT = Number(process.env.PORT) || 3000;

// Scaffold/tooling files that must never be served as site content.
const HIDDEN = new Set(["package.json","package-lock.json","server.mjs","build.mjs"]);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".htm": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".bmp": "image/bmp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".eot": "application/vnd.ms-fontobject",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".wasm": "application/wasm",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mp3": "audio/mpeg",
  ".pdf": "application/pdf",
};

function resolveFsPath(rawUrl) {
  const pathname = rawUrl.split("?")[0].split("#")[0];
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  if (decoded === "" || decoded.endsWith("/")) decoded += "index.html";
  if (!decoded.startsWith("/")) decoded = "/" + decoded;
  // Never expose the scaffold or hidden dot-files (e.g. .revx-vendor, .git).
  const top = decoded.slice(1).split("/")[0];
  if (top.startsWith(".") || HIDDEN.has(top)) return null;
  // join collapses any ".." segments; the prefix check blocks escapes out of ROOT.
  const full = join(ROOT, "." + decoded);
  if (!full.startsWith(ROOT)) return null;
  return full;
}

const server = createServer(async (req, res) => {
  const fsPath = resolveFsPath(req.url || "/");
  if (!fsPath) {
    res.statusCode = 404;
    res.setHeader("content-type", "text/plain; charset=utf-8");
    res.end("404 Not Found");
    return;
  }
  let target = fsPath;
  try {
    const info = await stat(target);
    if (info.isDirectory()) target = join(target, "index.html");
  } catch {
    // Missing path falls through to the readFile 404 below.
  }
  try {
    const data = await readFile(target);
    res.statusCode = 200;
    res.setHeader("content-type", MIME[extname(target).toLowerCase()] || "application/octet-stream");
    res.setHeader("cache-control", "no-store");
    res.end(data);
  } catch {
    res.statusCode = 404;
    res.setHeader("content-type", "text/plain; charset=utf-8");
    res.end("404 Not Found");
  }
});

server.listen(PORT, () => {
  console.log(`Serving static site on http://localhost:${PORT}`);
});
