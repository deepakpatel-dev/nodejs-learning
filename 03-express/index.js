// =============================================
// 03 - EXPRESS: Basic Express Server
// =============================================
// Express makes routing and middleware much easier than raw http module.
//
// SETUP: Run these commands first:
//   npm init -y
//   npm install express
//
// Then start with: npm start  OR  node index.js

const express = require('express');
const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('<h1>Hello from Express!</h1>');
});

app.get('/about', (req, res) => {
  res.json({ message: 'This is the about page', framework: 'Express.js' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Express server running at http://localhost:${PORT}`);
});
