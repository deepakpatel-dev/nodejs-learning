// ============================================================
//  routes.js — All route handlers in one place
// ============================================================
//
//  WHAT  : Defines what happens for each method + URL combination.
//
//  WHY SEPARATE FROM app.js?
//  app.js is responsible for STARTING the server.
//  routes.js is responsible for HANDLING requests.
//  Keeping them separate makes each file focused and easy to read.
//  This is the same pattern Express uses (app.js + router files).
// ============================================================

const { readJSON, readFormData } = require('./body-parser');
const { getCurrentDate, formatCurrency } = require('./utils');

// ── Helper: send a JSON response ─────────────────────────────
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data, null, 2));
}

// ── Helper: send an HTML response ────────────────────────────
function sendHTML(res, statusCode, html) {
  res.writeHead(statusCode, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

// ============================================================
//  GET Routes
// ============================================================

// GET / — Home page
function handleHome(req, res) {
  sendHTML(res, 200, `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Node.js HTTP Server</title>
      <style>
        body { font-family: system-ui, sans-serif; max-width: 650px; margin: 50px auto; padding: 0 20px; }
        h1   { color: #2563eb; }
        .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 16px 0; }
        code { background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-size: 14px; }
        pre  { background: #0f172a; color: #e2e8f0; padding: 12px; border-radius: 6px; font-size: 13px; }
      </style>
    </head>
    <body>
      <h1>Node.js HTTP Server</h1>
      <p>Date: <strong>${getCurrentDate()}</strong></p>

      <div class="card">
        <h2>Available Routes</h2>
        <table>
          <tr><td><code>GET  /</code></td><td>— This page</td></tr>
          <tr><td><code>GET  /api/status</code></td><td>— Server status</td></tr>
          <tr><td><code>POST /api/users</code></td><td>— Create a user (JSON)</td></tr>
          <tr><td><code>POST /api/echo</code></td><td>— Echo back any JSON</td></tr>
          <tr><td><code>POST /api/form</code></td><td>— Handle HTML form data</td></tr>
          <tr><td><code>POST /api/calculate</code></td><td>— Add two numbers</td></tr>
        </table>
      </div>

      <div class="card">
        <h2>Test with curl</h2>
        <pre>curl -X POST http://localhost:3000/api/users \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Deepak","role":"Developer"}'</pre>
      </div>
    </body>
    </html>
  `);
}

// GET /api/status — Server health check
function handleStatus(req, res) {
  sendJSON(res, 200, {
    status:      'running',
    timestamp:   new Date().toISOString(),
    nodeVersion: process.version,
    uptime:      `${Math.floor(process.uptime())}s`,
    memory:      `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
  });
}

// ============================================================
//  POST Routes
// ============================================================

// POST /api/users — Create a user
// Expects JSON: { "name": string, "role": string }
async function handleCreateUser(req, res) {
  const body = await readJSON(req);

  // Validate required fields
  if (!body.name || !body.role) {
    return sendJSON(res, 400, {
      error: 'Missing required fields: name, role'
    });
  }

  // Simulate creating a user (in real app, you'd save to a database)
  const newUser = {
    id:        Math.floor(Math.random() * 10000),
    name:      body.name,
    role:      body.role,
    createdAt: new Date().toISOString(),
  };

  sendJSON(res, 201, {        // 201 = Created
    message: 'User created successfully',
    user:    newUser,
  });
}

// POST /api/echo — Echo back whatever JSON is sent
async function handleEcho(req, res) {
  const body = await readJSON(req);

  sendJSON(res, 200, {
    message:   'Here is what you sent:',
    received:  body,
    timestamp: new Date().toISOString(),
  });
}

// POST /api/form — Handle HTML form (application/x-www-form-urlencoded)
// Expects form fields: name, email, message
async function handleForm(req, res) {
  const data = await readFormData(req);

  if (!data.name || !data.email) {
    return sendJSON(res, 400, { error: 'name and email are required' });
  }

  sendJSON(res, 200, {
    message: 'Form received successfully',
    data,
    formatted: `Hello ${data.name}, we will contact you at ${data.email}`,
  });
}

// POST /api/calculate — Add two numbers from JSON body
// Expects JSON: { "a": number, "b": number }
async function handleCalculate(req, res) {
  const body = await readJSON(req);

  const a = Number(body.a);
  const b = Number(body.b);

  if (isNaN(a) || isNaN(b)) {
    return sendJSON(res, 400, { error: 'Both "a" and "b" must be numbers' });
  }

  sendJSON(res, 200, {
    input:    { a, b },
    results: {
      add:      a + b,
      subtract: a - b,
      multiply: a * b,
      divide:   b !== 0 ? parseFloat((a / b).toFixed(4)) : 'Cannot divide by zero',
    },
    formatted: `${formatCurrency(a)} + ${formatCurrency(b)} = ${formatCurrency(a + b)}`,
  });
}

// sort 
async function handleSort(req,res){
  const body = await readJSON(req)
 
 const a = Number(body.a);
 const b = Number(body.b);
 const c = Number(body.c);

 if (isNaN(a) || isNaN(b) || isNaN(c)) {
    return sendJSON(res, 400, { error: 'Both "a" and "b" must be numbers' });
  }
 sendJSON(res, 200, {
  input : { a, b, c },
  result : {
    sortedNumber : [a,b,c].sort((x,y)=> x-y),
  }
 })

}
// ============================================================
//  Main router — maps method + url to handler
// ============================================================
async function router(req, res) {
  const { method, url } = req;

  // Strip query strings for matching: /api/users?foo=bar → /api/users
  const path = url.split('?')[0];

  try {
    // GET routes
    if (method === 'GET'  && path === '/')             return handleHome(req, res);
    if (method === 'GET'  && path === '/api/status')   return handleStatus(req, res);

    // POST routes
    if (method === 'POST' && path === '/api/users')    return await handleCreateUser(req, res);
    if (method === 'POST' && path === '/api/echo')     return await handleEcho(req, res);
    if (method === 'POST' && path === '/api/form')     return await handleForm(req, res);
    if (method === 'POST' && path === '/api/calculate') return await handleCalculate(req, res);
    if (method === 'POST' && path === '/api/sort')     return await handleSort(req, res);

    // 404 — no route matched
    sendJSON(res, 404, { error: `Cannot ${method} ${path}` });

  } catch (err) {
    // Specific known errors → meaningful HTTP responses
    if (err.message === 'INVALID_JSON') {
      return sendJSON(res, 400, { error: 'Request body is not valid JSON' });
    }
    if (err.message === 'EMPTY_BODY') {
      return sendJSON(res, 400, { error: 'Request body is empty' });
    }
    if (err.message === 'PAYLOAD_TOO_LARGE') {
      return sendJSON(res, 413, { error: 'Request body exceeds 1MB limit' });
    }

    // Unexpected error → 500
    throw err; // let app.js handle it
  }
}

module.exports = { router };
