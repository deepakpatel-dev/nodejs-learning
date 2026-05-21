# 01 — Node.js Basics

No dependencies. Pure Node.js built-in modules only.

## What You Learn

- Running JavaScript outside the browser with `node`
- CommonJS module system (`require` / `module.exports`)
- Reading and writing files with the `fs` module
- URL parsing with the `url` module
- Simple HTTP responses without any framework

## Files

| File | What it shows |
|------|--------------|
| `hello-world.js` | First Node.js program, `console.log`, process info |
| `file-system/index.js` | `fs.readFile`, `fs.writeFile`, `fs.readdir` |
| `modules/math.js` | Exporting functions with `module.exports` |
| `modules/index.js` | Importing a local module with `require` |
| `url-parsing.js` | `url.parse` and `new URL` basics |
| `file-server.js` | Serving a file over HTTP with `http.createServer` |
| `data.json` | Sample JSON file used by file system examples |
| `sample.txt` | Sample text file used by file system examples |

## Run

```bash
node hello-world.js
node file-system/index.js
node modules/index.js
node url-parsing.js
node file-server.js
```

## Key Concepts

```js
// Import a built-in module
const fs = require('fs');

// Import a local module
const math = require('./modules/math');

// Export from a module
module.exports = { add, subtract };
```
