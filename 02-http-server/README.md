# 02 — HTTP Server from Scratch

Build an HTTP server using Node's built-in `http` module — no Express.

## What You Learn

- How `http.createServer` works under the hood
- Parsing request URLs and methods manually
- Setting status codes and response headers
- Structuring a Node app with separate utility files
- Auto-reloading during development with `nodemon`

## Files

| File | What it shows |
|------|--------------|
| `app.js` | HTTP server, routing by `req.url` and `req.method` |
| `logger.js` | Simple request logger utility |
| `utils.js` | Helper functions (JSON response, error response) |

## Setup & Run

```bash
npm install          # installs nodemon

npm start            # run once with node
npm run dev          # run with auto-reload on file changes
```

Server runs at: `http://localhost:3000`

## Key Concepts

```js
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ ok: true }));
});

server.listen(3000);
```

> **Why learn this before Express?** Express is built on top of `http`. Understanding the raw module makes Express patterns much easier to understand.
