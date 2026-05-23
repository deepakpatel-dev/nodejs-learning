// ============================================================
//  CREATING AND WRITING FILES — File Handles
// ============================================================
//
//  WHAT  : A file handle gives you a direct "grip" on an open
//          file so you can read, write, and position precisely.
//
//  HOW   : fs.open() opens the file and returns a FileHandle
//          object. You call methods on it (read, write, seek).
//          You MUST close it when done — open files consume
//          OS resources (file descriptors).
//
//  WHY USE HANDLES over writeFile/appendFile?
//  1. Write to a SPECIFIC position in a file (not just the end)
//  2. Read AND write the same file without reopening
//  3. Write multiple chunks efficiently without re-opening
//  4. Get precise control over buffering and flushing
//
//  In everyday code you'll use writeFile/appendFile.
//  Handles are for advanced cases: binary files, large files,
//  partial updates, database-style file storage.
// ============================================================

const fs   = require('fs').promises;
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'output', 'writing');

async function run() {
  console.log('=== File Handles — Fine-Grained File Control ===\n');

  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  // ── 1. Open → Write → Close cycle ───────────────────────────
  //
  // This is the fundamental pattern: open, use, close.
  // The 'w' flag means: create if missing, truncate if exists.
  //
  console.log('--- 1. Open → Write → Close ---');

  let fileHandle; // declare outside try so we can close in finally

  try {
    // Open the file — get a handle (like grabbing a door handle)
    fileHandle = await fs.open(
      path.join(OUTPUT_DIR, 'handle-demo.txt'),
      'w'  // 'w' = write mode (create or truncate)
    );
    console.log('  ✓ File opened');

    // Write first chunk
    await fileHandle.write('First chunk of data.\n');
    console.log('  ✓ Wrote first chunk');

    // Write second chunk — appended after the first
    await fileHandle.write('Second chunk of data.\n');
    console.log('  ✓ Wrote second chunk');

    // Flush — make sure OS writes buffered data to disk
    // WHY? OS sometimes buffers writes in memory for speed.
    // flush() forces it to disk immediately.
    await fileHandle.sync();
    console.log('  ✓ Data flushed to disk');

  } finally {
    // ALWAYS close in a finally block — runs even if an error occurred
    // WHY? Unclosed handles leak OS file descriptors. Too many = crash.
    if (fileHandle) {
      await fileHandle.close();
      console.log('  ✓ File handle closed\n');
    }
  }

  // Verify the result
  const content = await fs.readFile(
    path.join(OUTPUT_DIR, 'handle-demo.txt'), 'utf8'
  );
  console.log('  Result:', content);

  // ── 2. Writing multiple chunks efficiently ──────────────────
  //
  // WHY better than calling writeFile multiple times?
  // Each writeFile call opens + closes the file.
  // One handle = one open/close, multiple writes in between.
  //
  console.log('--- 2. Writing multiple chunks with one handle ---');

  const multiPath = path.join(OUTPUT_DIR, 'multi-chunk.txt');
  const chunks = [
    'Name: Deepak Patel\n',
    'Role: Node.js Developer\n',
    'Module: File System\n',
    `Date: ${new Date().toDateString()}\n`,
  ];

  let handle;
  try {
    handle = await fs.open(multiPath, 'w');

    for (const chunk of chunks) {
      const { bytesWritten } = await handle.write(chunk);
      console.log(`  Wrote "${chunk.trim()}" (${bytesWritten} bytes)`);
    }
  } finally {
    await handle?.close();
  }

  console.log('  ✓ All chunks written with a single open/close\n');

  // ── 3. Read + Write with same handle ────────────────────────
  //
  // Flag 'r+' = open for reading AND writing.
  // The file must already exist (unlike 'w').
  //
  console.log('--- 3. Reading and writing with one handle (r+ mode) ---');

  const rwPath = path.join(OUTPUT_DIR, 'read-write.txt');
  await fs.writeFile(rwPath, 'AAABBBCCC\n', 'utf8'); // create it first

  let rwHandle;
  try {
    rwHandle = await fs.open(rwPath, 'r+');

    // Read the first 3 bytes
    const readBuf = Buffer.alloc(3); // empty buffer, 3 bytes
    await rwHandle.read(readBuf, 0, 3, 0); // read 3 bytes starting at position 0
    console.log('  Read first 3 bytes:', readBuf.toString()); // "AAA"

    // Write 3 bytes starting at position 3 (overwrite "BBB" with "XYZ")
    const writeBuf = Buffer.from('XYZ');
    await rwHandle.write(writeBuf, 0, 3, 3); // write at position 3
    console.log('  Overwrote positions 3-5 with "XYZ"');

  } finally {
    await rwHandle?.close();
  }

  const final = await fs.readFile(rwPath, 'utf8');
  console.log('  Result:', final.trim(), '  (BBB → XYZ)\n');

  // ── 4. Using 'using' pattern (auto-close) ───────────────────
  //
  // FileHandle implements Symbol.asyncDispose, meaning it works
  // with the new 'await using' syntax (Node 20+).
  // WHY? Handles close automatically — no try/finally needed.
  //
  console.log('--- 4. File flags cheat sheet ---');
  console.log(`
  Flag  | Behaviour
  ------+--------------------------------------------------
  'r'   | Read only.  File must exist.
  'r+'  | Read + Write.  File must exist.
  'w'   | Write only.  Creates file or TRUNCATES existing.
  'wx'  | Write only.  Fails if file already EXISTS.
  'w+'  | Read + Write.  Creates or truncates.
  'a'   | Append only.  Creates if missing.
  'a+'  | Read + Append.  Creates if missing.
  `);
}

run().catch(console.error);
