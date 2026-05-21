// ─────────────────────────────────────────────────────────
//  HTTPS Express Server
//
//  Folder layout (paths relative to project root):
//    ssl/cert.pem  ssl/key.pem   ← TLS certificates
//    public/                     ← static files served at /
//    src/server/express-https.js ← this file
// ─────────────────────────────────────────────────────────
const express = require('express');
const https   = require('https');
const fs      = require('fs');
const path    = require('path');
const helmet  = require('helmet');

// ── Paths ─────────────────────────────────────
// __dirname = src/server  →  go up two levels to reach project root
const ROOT   = path.join(__dirname, '..', '..');
const SSL_DIR = path.join(ROOT, 'ssl');
const PUB_DIR = path.join(ROOT, 'public');

// ── Express app ────────────────────────────────
const app = express();

// helmet sets 14 security-related HTTP headers automatically
app.use(helmet());

// Parse incoming JSON and HTML-form bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve everything in public/ as static files
app.use(express.static(PUB_DIR, {
  dotfiles:   'ignore',  // never expose .env, .git, etc.
  etag:       true,      // browser caching via ETag headers
  extensions: ['html', 'htm'],
  index:      'index.html',
  maxAge:     '1d',
  redirect:   true
}));

// ── Routes ─────────────────────────────────────
app.get('/', (req, res) => {
  // index.html from public/ is served by express.static above;
  // this route only runs if the file is missing
  res.send('<h1>Welcome to the Secure Express Server</h1>');
});

app.get('/api/status', (req, res) => {
  res.json({
    status:      'operational',
    timestamp:   new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version
  });
});

// Example POST route — echoes the body back
app.post('/api/echo', (req, res) => {
  res.json({ received: req.body });
});

// ── Error handlers (must be LAST) ──────────────
// 404 — no route matched
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', path: req.path });
});

// 500 — something threw inside a route
// Express identifies error middleware by the 4-argument signature (err, req, res, next)
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error('[ERROR]', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// ── TLS / HTTPS setup ──────────────────────────
const sslOptions = {
  key:  fs.readFileSync(path.join(SSL_DIR, 'key.pem')),
  cert: fs.readFileSync(path.join(SSL_DIR, 'cert.pem')),

  // Reject TLS 1.0 and 1.1 — they have known vulnerabilities
  minVersion: 'TLSv1.2',

  // Only allow strong ciphers; prefixes starting with ! disable weak ones
  ciphers: [
    'TLS_AES_256_GCM_SHA384',
    'TLS_CHACHA20_POLY1305_SHA256',
    'TLS_AES_128_GCM_SHA256',
    'ECDHE-RSA-AES128-GCM-SHA256',
    '!aNULL', '!eNULL', '!EXPORT',
    '!DES',   '!RC4',   '!3DES',
    '!MD5',   '!PSK',   '!DSS'
  ].join(':'),

  honorCipherOrder: true   // server picks the cipher, not the client
};

// ── Start server ───────────────────────────────
const PORT   = process.env.PORT || 3000;
const HOST   = process.env.HOST || '0.0.0.0';
const server = https.createServer(sslOptions, app);

server.listen(PORT, HOST, () => {
  console.log(`\nExpress HTTPS server running at https://localhost:${PORT}`);
  console.log(`Static files served from: ${PUB_DIR}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('Press Ctrl+C to stop\n');
  console.log('Routes available:');
  console.log(`  GET  https://localhost:${PORT}/`);
  console.log(`  GET  https://localhost:${PORT}/api/status`);
  console.log(`  POST https://localhost:${PORT}/api/echo`);
});

// ── Process-level safety nets ──────────────────
process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err);
  process.exit(1); // unrecoverable — restart via a process manager (PM2, systemd)
});

// ── Graceful shutdown ──────────────────────────
// Lets in-flight requests finish before the process exits
function gracefulShutdown(signal) {
  console.log(`\nReceived ${signal} — shutting down gracefully...`);

  server.close(() => {
    console.log('Server closed. Goodbye.');
    process.exit(0);
  });

  // Force-kill if shutdown takes more than 10 s (e.g. a hung request)
  setTimeout(() => {
    console.error('Shutdown timeout — forcing exit.');
    process.exit(1);
  }, 10_000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM')); // sent by PM2 / Docker / systemd
process.on('SIGINT',  () => gracefulShutdown('SIGINT'));  // sent by Ctrl+C
