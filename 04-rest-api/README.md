# 04 — REST API

Build a RESTful CRUD API with Express following REST conventions.

## What You Learn

- REST design principles (resources, verbs, status codes)
- Full CRUD: Create, Read, Update, Delete
- Route parameters (`/users/:id`) vs query strings (`?sort=asc`)
- Correct HTTP status codes (200, 201, 204, 400, 404)
- In-memory data store (before adding a real database in module 05)

## Files

| File | What it shows |
|------|--------------|
| `index.js` | Express REST API with full CRUD for a resource |

## Setup & Run

```bash
npm install

npm start        # node index.js
npm run dev      # auto-reload
```

API base URL: `http://localhost:3000`

## REST Conventions

| Method | Path | Action | Status |
|--------|------|--------|--------|
| GET | `/api/posts` | List all | 200 |
| GET | `/api/posts/:id` | Get one | 200 / 404 |
| POST | `/api/posts` | Create | 201 |
| PUT | `/api/posts/:id` | Replace | 200 / 404 |
| PATCH | `/api/posts/:id` | Update fields | 200 / 404 |
| DELETE | `/api/posts/:id` | Delete | 204 / 404 |

## Test with curl

```bash
# Create
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"Hello","body":"World"}'

# Read
curl http://localhost:3000/api/posts/1

# Delete
curl -X DELETE http://localhost:3000/api/posts/1
```
