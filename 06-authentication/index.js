// =============================================
// 06 - AUTHENTICATION: JWT Auth with Express
// =============================================
// JWT = JSON Web Token — a standard way to protect API routes.
//
// SETUP:
//   npm init -y
//   npm install express jsonwebtoken bcryptjs
//
// Start: npm start
//
// Test flow:
//   1. POST /register  { "username": "deepak", "password": "pass123" }
//   2. POST /login     { "username": "deepak", "password": "pass123" }  → get token
//   3. GET  /profile   with header:  Authorization: Bearer <token>

const express  = require('express');
const jwt      = require('jsonwebtoken');
const bcrypt   = require('bcryptjs');

const app = express();
app.use(express.json());

const SECRET = process.env.JWT_SECRET || 'your-secret-key'; // use env var in production!

// In-memory user store (replace with DB in 05-database)
const users = [];

// ---- Register ----
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });

  const exists = users.find(u => u.username === username);
  if (exists) return res.status(400).json({ error: 'User already exists' });

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword });
  res.status(201).json({ message: 'User registered successfully' });
});

// ---- Login ----
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ username }, SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// ---- Middleware: protect routes ----
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
}

// ---- Protected Route ----
app.get('/profile', authenticate, (req, res) => {
  res.json({ message: `Welcome, ${req.user.username}!`, user: req.user });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Auth server running at http://localhost:${PORT}`));
