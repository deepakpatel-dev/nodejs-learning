// =============================================
// 04 - REST API: Full CRUD API with Express
// =============================================
// CRUD = Create, Read, Update, Delete
//
// SETUP:
//   npm init -y
//   npm install express
//
// Start: npm start
//
// Test with curl or Postman:
//   GET    http://localhost:3000/users
//   GET    http://localhost:3000/users/1
//   POST   http://localhost:3000/users       body: { "name": "Alice", "email": "alice@example.com" }
//   PUT    http://localhost:3000/users/1     body: { "name": "Alice Updated" }
//   DELETE http://localhost:3000/users/1

const express = require('express');
const app = express();
app.use(express.json());

// In-memory "database" (replace with real DB in 05-database)
let users = [
  { id: 1, name: 'Deepak', email: 'deepak@example.com' },
  { id: 2, name: 'Jane',   email: 'jane@example.com' },
];
let nextId = 3;

// GET all users
app.get('/users', (req, res) => {
  res.json(users);
});

// GET user by ID
app.get('/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// POST create user
app.post('/users', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'name and email are required' });
  const user = { id: nextId++, name, email };
  users.push(user);
  res.status(201).json(user);
});

// PUT update user
app.put('/users/:id', (req, res) => {
  const index = users.findIndex(u => u.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'User not found' });
  users[index] = { ...users[index], ...req.body };
  res.json(users[index]);
});

// DELETE user
app.delete('/users/:id', (req, res) => {
  const index = users.findIndex(u => u.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'User not found' });
  users.splice(index, 1);
  res.json({ message: 'User deleted' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`REST API running at http://localhost:${PORT}`));
