const http = require('http');

const Logger     = require('./logger');
const { router } = require('./routes');

const logger = new Logger('App');

// ── Create server ─────────────────────────────────────────────
//
// Every incoming request — GET or POST — goes to router().
// router() looks at req.method + req.url and calls the right handler.
//
const server = http.createServer(async (req, res) => {
  // Log every incoming request
  logger.log(`${req.method} ${req.url}`);

  try {
    await router(req, res);
  } catch (err) {
    // Last-resort error handler — catches anything router() didn't handle
    logger.error(`Unhandled error: ${err.message}`);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal Server Error' }));
  }
});

// ── Start server ──────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  logger.log(`Server running at http://localhost:${PORT}`);
  logger.log('GET  → /  and  /api/status');
  logger.log('POST → /api/users, /api/echo, /api/form, /api/calculate /api/sort');
});
