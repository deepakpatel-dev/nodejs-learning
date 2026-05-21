# 05 — Database (MongoDB + Mongoose)

Connect a Node.js app to MongoDB using the Mongoose ODM.

## What You Learn

- Connecting to MongoDB with Mongoose
- Defining schemas and models
- CRUD operations with Mongoose methods
- Data validation with schema types
- Async/await with database operations

## Files

| File | What it shows |
|------|--------------|
| `index.js` | Express + Mongoose connection, schema, model, CRUD routes |

## Setup & Run

### 1. Install MongoDB locally

```bash
# macOS (Homebrew)
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

Or use [MongoDB Atlas](https://www.mongodb.com/atlas) (free cloud tier).

### 2. Install dependencies and start

```bash
npm install

# Set your MongoDB connection string (optional — defaults to localhost)
export MONGODB_URI="mongodb://localhost:27017/nodejs-learning"

npm start        # node index.js
npm run dev      # auto-reload
```

## Key Concepts

```js
const mongoose = require('mongoose');

// Connect
await mongoose.connect(process.env.MONGODB_URI);

// Schema + Model
const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body:  String,
  createdAt: { type: Date, default: Date.now }
});
const Post = mongoose.model('Post', postSchema);

// Create
const post = await Post.create({ title: 'Hello' });

// Query
const posts = await Post.find();
const one   = await Post.findById(id);

// Update
await Post.findByIdAndUpdate(id, { title: 'Updated' });

// Delete
await Post.findByIdAndDelete(id);
```
