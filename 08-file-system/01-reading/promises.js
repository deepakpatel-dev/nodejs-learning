// ============================================================
//  READING FILES WITH PROMISES (Modern Approach)
// ============================================================
//
//  WHAT  : Same goal as callbacks.js — read files from disk.
//
//  HOW   : Instead of passing a callback function, fs.promises
//          returns a Promise. We use async/await to wait for
//          it to finish — but without blocking Node's thread.
//
//  WHY PROMISES OVER CALLBACKS?
//  1. Cleaner code — no deeply nested "callback hell"
//  2. try/catch for error handling (familiar from sync code)
//  3. async/await reads top-to-bottom like normal code
//  4. Easy to run multiple operations in parallel (Promise.all)
//
//  This is the RECOMMENDED approach for all new Node.js code.
// ============================================================

// fs.promises is the modern Promise-based version of the fs module
const fs   = require('fs').promises;
const path = require('path');

const SAMPLE_DIR = path.join(__dirname, '..', 'sample-files');

// ── async/await: the modern way ──────────────────────────────
//
// 'async' before a function means it always returns a Promise.
// 'await' pauses execution inside the function until the
// Promise resolves — but does NOT block the rest of Node.
//
async function readWithAwait() {
  console.log('=== Reading Files with Promises (async/await) ===\n');

  // ── Basic read ─────────────────────────────────────────────
  console.log('--- 1. Basic text file read ---');
  try {
    // 'await' here means: pause this function, go do the read,
    // come back when done, then assign the result to 'content'
    const content = await fs.readFile(
      path.join(SAMPLE_DIR, 'hello.txt'),
      'utf8'
    );
    console.log(content);
  } catch (err) {
    // try/catch replaces the if(err) check from callbacks
    console.error('Failed to read file:', err.message);
  }

  // ── Reading JSON ────────────────────────────────────────────
  console.log('--- 2. Reading and parsing a JSON file ---');
  try {
    const raw  = await fs.readFile(path.join(SAMPLE_DIR, 'data.json'), 'utf8');
    const data = JSON.parse(raw);
    console.log('Module name:', data.module);
    console.log('Topics:', data.topics);
    console.log();
  } catch (err) {
    console.error('Failed to read JSON:', err.message);
  }

  // ── Reading multiple files SEQUENTIALLY ────────────────────
  //
  // Each await finishes before the next starts.
  // Use this when file 2 depends on the result of file 1.
  //
  console.log('--- 3. Reading two files sequentially ---');
  console.time('sequential');
  try {
    const file1 = await fs.readFile(path.join(SAMPLE_DIR, 'hello.txt'), 'utf8');
    const file2 = await fs.readFile(path.join(SAMPLE_DIR, 'data.json'), 'utf8');
    console.log('File 1 size:', file1.length, 'chars');
    console.log('File 2 size:', file2.length, 'chars');
  } catch (err) {
    console.error(err.message);
  }
  console.timeEnd('sequential');
  console.log();

  // ── Reading multiple files IN PARALLEL ─────────────────────
  //
  // Promise.all fires ALL reads at the same time.
  // Total time = slowest single file (not sum of all files).
  // Use this when files are independent of each other.
  //
  console.log('--- 4. Reading two files in parallel (faster) ---');
  console.time('parallel');
  try {
    const [file1, file2] = await Promise.all([
      fs.readFile(path.join(SAMPLE_DIR, 'hello.txt'), 'utf8'),
      fs.readFile(path.join(SAMPLE_DIR, 'data.json'), 'utf8'),
    ]);
    console.log('File 1 size:', file1.length, 'chars');
    console.log('File 2 size:', file2.length, 'chars');
  } catch (err) {
    // If ANY file fails, the catch runs immediately
    console.error('One of the files failed:', err.message);
  }
  console.timeEnd('parallel');
  console.log();

  // ── Reading file metadata (stat) ───────────────────────────
  //
  // fs.stat gives you info ABOUT the file without reading its content:
  // size, creation date, last modified, whether it's a file or folder.
  //
  console.log('--- 5. Reading file metadata with fs.stat ---');
  try {
    const stats = await fs.stat(path.join(SAMPLE_DIR, 'hello.txt'));
    console.log('Is a file?    ', stats.isFile());
    console.log('Is a folder?  ', stats.isDirectory());
    console.log('Size (bytes): ', stats.size);
    console.log('Created:      ', stats.birthtime.toLocaleString());
    console.log('Last modified:', stats.mtime.toLocaleString());
  } catch (err) {
    console.error(err.message);
  }
  console.log();

  // ── Reading a directory listing ────────────────────────────
  //
  // fs.readdir returns an array of filenames inside a folder.
  //
  console.log('--- 6. Listing files in a directory ---');
  try {
    const files = await fs.readdir(SAMPLE_DIR);
    console.log('Files in sample-files/:');
    files.forEach((file, i) => console.log(`  ${i + 1}. ${file}`));
  } catch (err) {
    console.error(err.message);
  }
  console.log();

  // ── Error handling: file not found ─────────────────────────
  console.log('--- 7. Graceful error handling ---');
  try {
    await fs.readFile(path.join(SAMPLE_DIR, 'does-not-exist.txt'), 'utf8');
  } catch (err) {
    console.log('Caught error code:', err.code);    // ENOENT = file not found
    console.log('App did not crash — error was caught with try/catch');
  }
}

// Run the async function
// WHY .catch() at the end? Any unhandled rejection inside the
// async function will bubble up here — a final safety net.
readWithAwait().catch(console.error);
