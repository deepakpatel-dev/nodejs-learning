// =============================================
// 05 - DATABASE: Connect Node.js to MongoDB
// =============================================
// We use Mongoose (ODM for MongoDB) to interact with the database.
//
// SETUP:
//   npm init -y
//   npm install express mongoose
//
// Make sure MongoDB is running locally OR use a free cloud DB at https://cloud.mongodb.com
//
// Start: npm start

const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

// ---- Connect to MongoDB ----
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/nodejs-learning';

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// ---- Define a Schema & Model ----
const userSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  email:     { type: String, required: true, unique: true },
  createdAt: { type: Date,   default: Date.now },
});

const User = mongoose.model('User', userSchema);

// ---- Routes ----
app.get('/users', async (req, res) => {
  const users = await User.find();
  res.json(users);
});

app.post('/users', async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/users/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User deleted' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
