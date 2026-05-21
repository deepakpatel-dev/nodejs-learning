# 03 — Express.js Basics

Introduction to Express — the most popular Node.js web framework.

## What You Learn

- Creating an Express app and defining routes
- Using middleware (`app.use`)
- Handling route parameters and query strings
- Sending JSON, HTML, and status codes
- Error handling middleware (the 4-argument pattern)

## Files

| File | What it shows |
|------|--------------|
| `index.js` | Express app with routes, middleware, and error handling |

## Setup & Run

```bash
npm install          # installs express + nodemon

npm start            # node index.js
npm run dev          # nodemon index.js (auto-reloads on save)
```

Server runs at: `http://localhost:3000`

## Key Concepts

```js
const express = require('express');
const app = express();

// Middleware — runs on every request
app.use(express.json());

// Route
app.get('/users/:id', (req, res) => {
  res.json({ id: req.params.id });
});

// Error handler — must have 4 arguments
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

app.listen(3000);
```

> **Express vs raw http:** Express adds routing, middleware chaining, and helpers on top of `http`. The `req` and `res` objects are the same ones from module 02, just extended.
