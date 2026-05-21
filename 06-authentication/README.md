# 06 — Authentication (JWT + bcrypt)

Add secure user authentication to an Express API using industry-standard tools.

## What You Learn

- Password hashing with bcrypt (never store plain-text passwords)
- JSON Web Tokens (JWT) — signing and verifying
- Protecting routes with auth middleware
- The register → login → access protected route flow
- Storing secrets in environment variables

## Files

| File | What it shows |
|------|--------------|
| `index.js` | Register, login, and protected routes with JWT middleware |

## Setup & Run

```bash
npm install

# Required — set a strong secret (never commit this)
export JWT_SECRET="your-very-long-random-secret-here"
export PORT=3000

npm start        # node index.js
npm run dev      # auto-reload
```

## Auth Flow

```
1. POST /api/register   { email, password }
        ↓  bcrypt hashes the password → stored in DB
        ← 201 Created

2. POST /api/login      { email, password }
        ↓  bcrypt compares password → signs a JWT
        ← 200 { token: "eyJ..." }

3. GET  /api/profile    Authorization: Bearer eyJ...
        ↓  middleware verifies JWT → attaches user to req
        ← 200 { user: { id, email } }
```

## Key Concepts

```js
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');

// Hash a password before saving
const hash = await bcrypt.hash(password, 10); // 10 = cost factor

// Verify on login
const match = await bcrypt.compare(password, hash);

// Sign a token (expires in 24h)
const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' });

// Verify in middleware
const payload = jwt.verify(token, process.env.JWT_SECRET);
```

## Security Checklist

- [ ] `JWT_SECRET` is long (32+ chars), random, stored in `.env`
- [ ] `.env` is in `.gitignore` — never committed
- [ ] Passwords are hashed with bcrypt before storage
- [ ] Tokens have an expiry (`expiresIn`)
- [ ] HTTPS is used in production (see module 07)
