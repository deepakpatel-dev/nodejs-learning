# Node.js Learning Path

A hands-on, module-by-module guide to learning Node.js from first principles through to secure production patterns. Each folder is a self-contained lesson with runnable examples.

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [npm](https://www.npmjs.com/) (comes with Node.js)
- Basic JavaScript knowledge

## Module Overview

| # | Module | Topics Covered |
|---|--------|---------------|
| [01](./01-basics) | **Basics** | Hello World, built-in modules, file system, CommonJS modules |
| [02](./02-http-server) | **HTTP Server** | `http` module, routing, middleware, request/response lifecycle |
| [03](./03-express) | **Express** | Express.js setup, routing, middleware, error handling |
| [04](./04-rest-api) | **REST API** | CRUD operations, RESTful design, JSON responses |
| [05](./05-database) | **Database** | MongoDB + Mongoose, schemas, models, queries |
| [06](./06-authentication) | **Authentication** | JWT tokens, bcrypt password hashing, protected routes |
| [07](./07-https-and-url) | **HTTPS & URL** | TLS/HTTPS server, URL parsing, HTTPS requests, parallel fetching |

## Quick Start

Each module is independent. Navigate into any folder and run it:

```bash
cd 01-basics
node hello-world.js
```

For modules with dependencies (02 onwards):

```bash
cd 03-express
npm install      # install dependencies
npm start        # run the server
npm run dev      # run with auto-reload (nodemon)
```

## Project Structure

```
nodejs-learning/
├── .gitignore              # ignores node_modules, .pem keys, .env
├── README.md               # this file
├── 01-basics/              # no dependencies — plain Node.js
├── 02-http-server/         # http module only
├── 03-express/             # express
├── 04-rest-api/            # express, REST design
├── 05-database/            # express, mongoose, mongodb
├── 06-authentication/      # express, jsonwebtoken, bcryptjs
└── 07-https-and-url/       # express, helmet, https, URL APIs
    ├── src/
    │   ├── http/           # GET, POST, redirect, parallel requests
    │   ├── server/         # Express HTTPS server
    │   └── url/            # URL parsing demos
    ├── public/             # static files (HTML UI)
    ├── ssl/                # TLS certs (self-signed, git-ignored)
    └── tests/              # unit tests (node:test)
```

## Security Notes

- **SSL keys** (`*.pem`) are git-ignored — never commit private keys
- **Environment variables** (`.env`) are git-ignored — store secrets there
- The SSL certs in `07-https-and-url/ssl/` are self-signed and for local development only
- Generate your own certs: `openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes`

## Running Tests

```bash
cd 07-https-and-url
npm test         # runs 43 URL parsing unit tests
```

## License

ISC
