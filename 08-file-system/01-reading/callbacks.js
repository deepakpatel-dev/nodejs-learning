// ============================================================
//  READING FILES WITH CALLBACKS
// ============================================================
//
//  WHAT  : Read a file from disk and get its content.
//
//  HOW   : fs.readFile() tells the OS "go read this file".
//          Node does NOT wait — it moves on and runs other code.
//          When the OS finishes reading, it calls your callback
//          function and hands you the result (or an error).
//
//  WHY CALLBACKS? This was Node's original pattern (2009).
//  Node.js is single-threaded, so it can never afford to sit
//  and wait for a slow disk or network. Instead it says:
//  "go do that, and call me back when done." That's a callback.
//
//  NOTE  : Callbacks are still valid, but modern code prefers
//          Promises (see promises.js). You'll see callbacks
//          everywhere in older Node code, so it's important
//          to understand them.
// ============================================================

const fs   = require('fs');     // 'fs' = file system (built-in, no install needed)
const path = require('path');   // 'path' helps build file paths that work on all OS

// Build the full path to our sample file.
// __dirname = the folder this script lives in.
// We go up one level (..) to reach the module root, then into sample-files/.
const filePath = path.join(__dirname, '..', 'sample-files', 'hello.txt');

console.log('=== Reading Files with Callbacks ===\n');
console.log('Step 1: We ASKED Node to read the file...');
console.log('        (Node handed the job to the OS and moved on)\n');

// ── Reading as a Buffer (raw bytes) ──────────────────────────
//
// By default, fs.readFile returns a Buffer — a raw sequence of bytes.
// WHY? Because files can contain anything: text, images, videos.
// Node doesn't assume it's text until you tell it the encoding.
//
fs.readFile(filePath, (err, data) => {
  // CALLBACK PATTERN: The first argument is ALWAYS the error.
  // This is called "error-first callback" — a Node.js convention.
  // WHY error first? So you can never forget to handle it.
  if (err) {
    console.error('Something went wrong reading the file:', err.message);
    return; // stop here — don't try to use 'data' if there was an error
  }

  console.log('Step 3: Callback fired! File is ready.\n');
  console.log('--- Raw Buffer (bytes, not human-readable) ---');
  console.log(data);              // looks like: <Buffer 48 65 6c 6c 6f ...>
  console.log('\nBuffer length:', data.length, 'bytes\n');
});

// ── Reading as a String (with encoding) ──────────────────────
//
// Pass 'utf8' as the second argument to get a readable string.
// utf8 is the standard text encoding used almost everywhere.
//
fs.readFile(filePath, 'utf8', (err, content) => {
  if (err) {
    console.error('Error:', err.message);
    return;
  }

  console.log('--- File content as a String (utf8 encoding) ---');
  console.log(content);

  // Split into lines to work with individual lines
  const lines = content.split('\n').filter(Boolean); // filter(Boolean) removes empty lines
  console.log(`Total lines in file: ${lines.length}`);
  console.log(`First line: "${lines[0]}"\n`);
});

// ── Reading a JSON file ──────────────────────────────────────
//
// JSON files are just text files with a .json extension.
// Read as utf8 string, then parse with JSON.parse().
//
const jsonPath = path.join(__dirname, '..', 'sample-files', 'data.json');

fs.readFile(jsonPath, 'utf8', (err, content) => {
  if (err) {
    console.error('Error reading JSON:', err.message);
    return;
  }

  // JSON.parse converts the string into a real JavaScript object
  const data = JSON.parse(content);

  console.log('--- Reading a JSON file ---');
  console.log('Parsed object:', data);
  console.log('App name:', data.app);
  console.log('Topics:', data.topics.join(', '));
});

// ── Reading a non-existent file (error handling) ─────────────
//
// WHY show this? Because in real apps, files may not exist.
// Without error handling, your app would crash.
//
const missingPath = path.join(__dirname, '..', 'sample-files', 'missing.txt');

fs.readFile(missingPath, 'utf8', (err, content) => {
  if (err) {
    console.log('\n--- Handling a missing file gracefully ---');
    console.log('Error code:', err.code);       // 'ENOENT' = No Entry (file not found)
    console.log('Error message:', err.message);
    console.log('App did NOT crash — we handled the error properly.\n');
    return;
  }
  console.log(content);
});

console.log('Step 2: This line runs IMMEDIATELY while the file is still being read.');
console.log('        This proves Node did not block/wait for the file.\n');

// ── What is the execution order? ────────────────────────────
//
// Even though the readFile calls appear first in the code,
// the output order will be:
//   1. "Step 1: We ASKED Node to read the file"    ← synchronous
//   2. "Step 2: This line runs IMMEDIATELY"         ← synchronous
//   3. "Step 3: Callback fired!"                    ← async (when OS is done)
//
// This is the EVENT LOOP in action.
