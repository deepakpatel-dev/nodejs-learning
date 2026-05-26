// ============================================================
//  body-parser.js — Reusable request body reader
// ============================================================
//
//  WHAT  : Reads the incoming request body chunks and returns
//          the full content as a string or parsed object.
//
//  HOW   : HTTP request bodies arrive in small pieces (chunks).
//          We listen to 'data' events, collect them, then on
//          'end' we have the complete body.
//
//  WHY A SEPARATE FILE?
//  Every POST/PUT route needs to read the body. Instead of
//  copy-pasting the same chunk-collection code everywhere,
//  we put it here once and require() it wherever needed.
// ============================================================

const MAX_BODY_SIZE = 1024 * 1024; // 1MB — protect against huge payloads

/**
 * Reads the raw request body as a string.
 * Returns a Promise that resolves with the full body string.
 *
 * @param {http.IncomingMessage} req
 * @returns {Promise<string>}
 */
function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();

      // Guard: if body exceeds limit, reject immediately
      if (body.length > MAX_BODY_SIZE) {
        reject(new Error('PAYLOAD_TOO_LARGE'));
        req.destroy(); // stop receiving data
      }
    });

    req.on('end',   () => resolve(body));
    req.on('error', (err) => reject(err));
  });
}

/**
 * Reads and parses a JSON request body.
 * Throws if the body is not valid JSON.
 *
 * @param {http.IncomingMessage} req
 * @returns {Promise<object>}
 */
async function readJSON(req) {
  const raw = await readBody(req);

  if (!raw || raw.trim() === '') {
    throw new Error('EMPTY_BODY');
  }

  try {
    return JSON.parse(raw);
  } catch {
    throw new Error('INVALID_JSON');
  }
}

/**
 * Reads and parses an application/x-www-form-urlencoded body.
 * Returns a plain object of key-value pairs.
 *
 * @param {http.IncomingMessage} req
 * @returns {Promise<object>}
 */
async function readFormData(req) {
  const raw = await readBody(req);
  const params = new URLSearchParams(raw);

  // Convert URLSearchParams to a plain object
  const result = {};
  for (const [key, value] of params.entries()) {
    result[key] = value;
  }
  return result;
}

module.exports = { readBody, readJSON, readFormData };
