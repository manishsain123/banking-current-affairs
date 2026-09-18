const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4200;
const STATIC_DIR = path.join(__dirname, 'frontend', 'dist', 'banking-current-affairs-frontend', 'browser');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff'
};

const server = http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0].replace(/^\/+/, '');
  const filePath = path.join(STATIC_DIR, urlPath);

  // If request has file extension (assets, js, css, icons)
  if (path.extname(urlPath)) {
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, {
        'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
        'Cache-Control': 'no-cache'
      });
      return fs.createReadStream(filePath).pipe(res);
    }
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    return res.end('Not Found');
  }

  // SPA Fallback for all navigation routes (/, /rrb-agriculture, /daily-digest, /exam-zone, etc.)
  const indexPath = path.join(STATIC_DIR, 'index.html');
  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-cache'
  });
  return fs.createReadStream(indexPath).pipe(res);
});

server.listen(PORT, () => {
  console.log(`BankDCA Web Application is running at http://localhost:${PORT}`);
  console.log(`Connected to live cloud backend at https://bankdca-api.onrender.com`);
});
