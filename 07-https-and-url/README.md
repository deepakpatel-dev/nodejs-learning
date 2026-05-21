# 07 — HTTPS & URL

TLS-encrypted servers, URL parsing APIs, and making HTTPS requests from Node.js.

## What You Learn

- URL parsing with `url.parse`, `url.format`, `url.resolve`, and the modern `new URL` / `URLSearchParams`
- Making outbound HTTPS GET and POST requests with Node's built-in `https` module
- Following HTTP redirects manually
- Firing multiple requests in parallel with `Promise.all` and `Promise.allSettled`
- Running an Express server over HTTPS with security headers via `helmet`
- TLS configuration: minimum version, cipher suites, `honorCipherOrder`
- Graceful shutdown handling (`SIGTERM` / `SIGINT`)

## Structure

```
07-https-and-url/
├── src/
│   ├── http/
│   │   ├── get.js          — https.get, streaming response chunks
│   │   ├── post.js         — https.request, sending a JSON body
│   │   ├── redirect.js     — manually follow 301/302/307/308 redirects
│   │   └── parallel.js     — Promise.all vs Promise.allSettled
│   ├── server/
│   │   └── express-https.js — Express on HTTPS with helmet, static files, graceful shutdown
│   └── url/
│       └── url-methods.js  — url.parse / format / resolve / new URL / querystring demos
├── public/
│   └── index.html          — browser UI with buttons to call each API route
├── ssl/
│   ├── cert.pem            — self-signed TLS certificate (git-ignored)
│   └── key.pem             — TLS private key (git-ignored)
└── tests/
    └── url-parsing.test.js — 43 unit tests using node:test
```

## Setup

### Generate SSL certificates (first time only)

```bash
mkdir -p ssl
openssl req -x509 -newkey rsa:4096 \
  -keyout ssl/key.pem -out ssl/cert.pem \
  -days 365 -nodes \
  -subj "/CN=localhost"
```

### Install dependencies

```bash
npm install
```

## Run

```bash
npm run server     # start Express HTTPS server (node)
npm run dev        # start with auto-reload (nodemon)
npm run get        # single HTTPS GET request
npm run post       # HTTPS POST with JSON body
npm run redirect   # follow HTTP → HTTPS redirects
npm run parallel   # 5 parallel requests with Promise.all
npm run url        # URL parsing method demos
npm test           # 43 unit tests
```

Server URL: `https://localhost:3000`

> **Self-signed cert warning:** Your browser will warn "Your connection is not private." Click **Advanced → Proceed to localhost** — this is expected for local development. In production, use a certificate from [Let's Encrypt](https://letsencrypt.org/).

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Serves `public/index.html` |
| GET | `/api/status` | Server status, timestamp, Node version |
| POST | `/api/echo` | Echoes the JSON request body back |

## Key Security Settings

```js
// Minimum TLS version — rejects TLS 1.0 and 1.1
minVersion: 'TLSv1.2'

// Server chooses cipher, not the client
honorCipherOrder: true

// helmet() adds 14 HTTP security headers automatically
app.use(helmet())
```
