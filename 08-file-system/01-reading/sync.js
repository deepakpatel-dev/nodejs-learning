// ============================================================
//  READING FILES SYNCHRONOUSLY
// ============================================================
//
//  WHAT  : Read a file and WAIT for it to finish before
//          running any other code.
//
//  HOW   : fs.readFileSync() blocks the entire Node.js process
//          until the file is fully read. No callback, no Promise
//          — it just returns the content directly.
//
//  WHY EXISTS? Sometimes you NEED the file before anything else
//  can run — like reading a config file at app startup.
//  In those cases, blocking is acceptable because nothing else
//  can work without the config anyway.
//
//  ⚠️  WARNING — When NOT to use sync:
//  NEVER use sync functions inside:
//    - HTTP request handlers  (blocks ALL users while one reads)
//    - Event listeners
//    - Any code that runs repeatedly during the app's lifetime
//
//  RULE OF THUMB:
//    ✅ Sync  → App startup, CLI scripts, one-time setup
//    ❌ Sync  → Inside servers, routes, event loops
// ============================================================

const fs   = require('fs');   // regular fs (not fs.promises)
const path = require('path');

const SAMPLE_DIR = path.join(__dirname, '..', 'sample-files');

console.log('=== Reading Files Synchronously ===\n');

// ── Basic sync read ──────────────────────────────────────────
//
// readFileSync returns the data directly (no callback, no await).
// The next line of code only runs AFTER the file is fully read.
//
console.log('--- 1. Basic sync read ---');

const content = fs.readFileSync(
  path.join(SAMPLE_DIR, 'hello.txt'),
  'utf8'     // encoding: return a string, not a Buffer
);

// This line runs only AFTER the file is fully loaded
console.log(content);
console.log('Line count:', content.split('\n').filter(Boolean).length, '\n');

// ── Reading JSON synchronously ───────────────────────────────
//
// A very common pattern: read a config file at startup.
// require() itself does this internally — it synchronously
// reads and parses JSON files.
//
console.log('--- 2. Reading JSON synchronously ---');

const raw  = fs.readFileSync(path.join(SAMPLE_DIR, 'data.json'), 'utf8');
const data = JSON.parse(raw);

console.log('Loaded config:', data);
console.log('Module:', data.module, '\n');

// ── Sync vs Async: the execution order difference ───────────
//
// With sync, code always runs top-to-bottom in order.
// With async (callbacks/promises), the order is less obvious.
//
console.log('--- 3. Execution order proof ---');

console.log('A: Before sync read');
const proof = fs.readFileSync(path.join(SAMPLE_DIR, 'hello.txt'), 'utf8');
console.log('B: After sync read  ← this only runs AFTER file is fully loaded');
console.log(`C: File had ${proof.length} characters\n`);

// ── Getting file stats synchronously ────────────────────────
console.log('--- 4. File stats (sync) ---');

const stats = fs.statSync(path.join(SAMPLE_DIR, 'hello.txt'));
console.log('Size:', stats.size, 'bytes');
console.log('Last modified:', stats.mtime.toLocaleString(), '\n');

// ── Listing a directory synchronously ───────────────────────
console.log('--- 5. Directory listing (sync) ---');

const files = fs.readdirSync(SAMPLE_DIR);
console.log('Files in sample-files/:');
files.forEach((file, i) => {
  const fileStat = fs.statSync(path.join(SAMPLE_DIR, file));
  console.log(`  ${i + 1}. ${file.padEnd(20)} ${fileStat.size} bytes`);
});
console.log();

// ── Error handling: try/catch ────────────────────────────────
//
// With sync functions, errors are thrown as exceptions.
// Always wrap sync file reads in try/catch.
//
console.log('--- 6. Error handling with try/catch ---');

try {
  const missing = fs.readFileSync(
    path.join(SAMPLE_DIR, 'does-not-exist.txt'),
    'utf8'
  );
  console.log(missing);
} catch (err) {
  console.log('Caught error:', err.code);  // ENOENT
  console.log('App did not crash — try/catch handled it.\n');
}

// ── Checking if a file exists before reading ─────────────────
//
// WHY? Sometimes you want to act differently if a file
// doesn't exist rather than throwing an error.
//
console.log('--- 7. Check if file exists before reading ---');

function readIfExists(filePath) {
  try {
    fs.accessSync(filePath, fs.constants.R_OK); // R_OK = readable?
    const text = fs.readFileSync(filePath, 'utf8');
    console.log(`✓ File exists and was read (${text.length} chars)`);
    return text;
  } catch {
    console.log('✗ File does not exist or is not readable');
    return null;
  }
}

readIfExists(path.join(SAMPLE_DIR, 'hello.txt'));
readIfExists(path.join(SAMPLE_DIR, 'phantom.txt'));

console.log('\n=== Summary ===');
console.log('Sync reads: simple, top-to-bottom, no callbacks needed');
console.log('Use at: app startup, config loading, CLI scripts');
console.log('Avoid inside: HTTP handlers, event listeners, loops');
