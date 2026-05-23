// ============================================================
//  WRITING FILES — Streams for Large Files
// ============================================================
//
//  WHAT  : Read or write files in small CHUNKS (called chunks
//          or buffers) instead of loading everything into memory.
//
//  HOW   : A stream is a sequence of data flowing over time,
//          like water through a pipe. Node reads a chunk →
//          processes it → reads the next chunk. At no point
//          is the full file in memory.
//
//  WHY STREAMS?
//  Imagine reading a 2GB log file with readFile():
//    ❌ readFile()  → loads ALL 2GB into RAM at once → crash/slow
//    ✅ stream      → loads 64KB at a time → uses almost no RAM
//
//  Real-world uses:
//  - Uploading/downloading large files
//  - Processing CSV/JSON files with millions of rows
//  - Video/audio streaming
//  - Copying files efficiently
//  - Compressing files on the fly
// ============================================================

const fs   = require('fs');       // streams use the regular fs (not fs.promises)
const path = require('path');

const SAMPLE_DIR = path.join(__dirname, '..', 'sample-files');
const OUTPUT_DIR = path.join(__dirname, '..', 'output', 'writing');

// Create output directory (sync is fine at startup)
require('fs').mkdirSync(OUTPUT_DIR, { recursive: true });

console.log('=== Streams for Large Files ===\n');

// ── 1. Reading a large file with a Readable Stream ──────────
//
// fs.createReadStream opens the file and emits 'data' events
// each time a chunk is ready. The default chunk size is 64KB.
//
console.log('--- 1. Reading large-file.txt chunk by chunk ---');

const readStream = fs.createReadStream(
  path.join(SAMPLE_DIR, 'large-file.txt'),
  {
    encoding:  'utf8',
    highWaterMark: 512, // chunk size in bytes (small so we can see multiple chunks)
  }
);

let chunkCount  = 0;
let totalBytes  = 0;

// 'data' fires every time a new chunk arrives from disk
readStream.on('data', (chunk) => {
  chunkCount++;
  totalBytes += chunk.length;
  if (chunkCount <= 3) {
    console.log(`  Chunk ${chunkCount}: ${chunk.length} bytes | "${chunk.slice(0, 40).trim()}..."`);
  }
});

// 'end' fires when all chunks have been read
readStream.on('end', () => {
  console.log(`  ... (${chunkCount} total chunks)`);
  console.log(`  ✓ Done. Total: ${totalBytes} bytes read in ${chunkCount} chunks\n`);
  step2(); // move to next demo
});

// 'error' fires if something goes wrong (file missing, permissions, etc.)
readStream.on('error', (err) => {
  console.error('  Stream error:', err.message);
});

// ── 2. Writing a large file with a Writable Stream ──────────
function step2() {
  console.log('--- 2. Writing many lines with a Writable Stream ---');

  const writeStream = fs.createWriteStream(
    path.join(OUTPUT_DIR, 'stream-output.txt'),
    { encoding: 'utf8' }
  );

  // Write 200 lines — each write() call sends a chunk to disk
  for (let i = 1; i <= 200; i++) {
    const line = `Line ${String(i).padStart(3, '0')}: Generated at ${new Date().toISOString()}\n`;

    // write() returns false when the internal buffer is full
    // WHY check? If buffer is full, we should pause and wait
    // for 'drain' before writing more (backpressure).
    const canContinue = writeStream.write(line);

    if (!canContinue && i % 50 === 0) {
      console.log(`  Buffer full at line ${i} — backpressure applied`);
    }
  }

  // end() flushes the buffer and closes the file
  writeStream.end(() => {
    console.log('  ✓ stream-output.txt written (200 lines)\n');
    step3();
  });

  writeStream.on('error', (err) => console.error('Write error:', err.message));
}

// ── 3. Piping — the most powerful stream pattern ─────────────
//
// pipe() connects a readable stream to a writable stream.
// Data flows automatically: read chunk → write chunk → read next.
// This is the cleanest way to COPY a file.
//
function step3() {
  console.log('--- 3. Copying a file with pipe() ---');

  const source      = fs.createReadStream(path.join(SAMPLE_DIR, 'large-file.txt'));
  const destination = fs.createWriteStream(path.join(OUTPUT_DIR, 'large-file-copy.txt'));

  console.time('  Copy time');

  // pipe() handles all the chunk flow, backpressure, and closing automatically
  source.pipe(destination);

  destination.on('finish', () => {
    console.timeEnd('  Copy time');
    console.log('  ✓ large-file-copy.txt created via pipe()\n');
    step4();
  });

  source.on('error', (err) => console.error('Source error:', err.message));
  destination.on('error', (err) => console.error('Destination error:', err.message));
}

// ── 4. Transform stream — modify data while streaming ────────
//
// A Transform stream sits between a readable and writable.
// It receives chunks, modifies them, and passes them along.
// Example: convert file content to UPPERCASE while copying.
//
function step4() {
  console.log('--- 4. Transform stream — uppercase while copying ---');

  const { Transform } = require('stream');

  // Create a custom transform that uppercases each chunk
  const upperCaseTransform = new Transform({
    transform(chunk, encoding, callback) {
      // chunk = incoming data, callback = signal "I'm done with this chunk"
      this.push(chunk.toString().toUpperCase());
      callback();
    }
  });

  const source = fs.createReadStream(
    path.join(SAMPLE_DIR, 'hello.txt'),
    { encoding: 'utf8' }
  );
  const dest = fs.createWriteStream(path.join(OUTPUT_DIR, 'uppercased.txt'));

  // Chain: source → transform → destination
  source.pipe(upperCaseTransform).pipe(dest);

  dest.on('finish', () => {
    const result = require('fs').readFileSync(
      path.join(OUTPUT_DIR, 'uppercased.txt'), 'utf8'
    );
    console.log('  Original: "Hello from Node.js File System!"');
    console.log('  Transformed:', result.split('\n')[0]);
    console.log('  ✓ uppercased.txt created\n');

    printSummary();
  });
}

function printSummary() {
  console.log('=== Streams Summary ===');
  console.log(`
  Method            | Use case
  ------------------+------------------------------------------
  createReadStream  | Read large files without loading into RAM
  createWriteStream | Write large files in chunks
  pipe()            | Copy / transfer data between streams
  Transform stream  | Modify data on the fly (compress, encrypt)

  Key events:
    readable.on('data')   → chunk received
    readable.on('end')    → all data has been read
    writable.on('finish') → all data has been written
    stream.on('error')    → something went wrong
  `);
}
