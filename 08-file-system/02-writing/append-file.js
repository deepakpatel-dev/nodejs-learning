// ============================================================
//  CREATING AND WRITING FILES — fs.appendFile()
// ============================================================
//
//  WHAT  : Add content to the END of a file without touching
//          what's already there.
//
//  HOW   : fs.appendFile() opens the file in append mode ('a'),
//          moves to the very end, writes your new content, then
//          closes. Existing content is never touched.
//          If the file doesn't exist, it creates it first.
//
//  WHY   : Perfect for log files, audit trails, growing datasets.
//          Every web server, database, and app uses append-mode
//          for logs because you never want to erase history.
//
//  writeFile vs appendFile:
//    writeFile  → "Save the whole document" (replaces content)
//    appendFile → "Add a line to my diary"  (adds to the end)
// ============================================================

const fs   = require('fs').promises;
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'output', 'writing');

async function run() {
  console.log('=== Writing Files with fs.appendFile() ===\n');

  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  // ── 1. Basic append ─────────────────────────────────────────
  console.log('--- 1. Basic append — adding lines to a file ---');

  const logFile = path.join(OUTPUT_DIR, 'app.log');

  // Remove file from previous runs so we start fresh
  try { await fs.unlink(logFile); } catch {}

  // First append — file doesn't exist yet, so it gets created
  await fs.appendFile(logFile, 'Line 1: App started\n', 'utf8');
  console.log('  Appended line 1');

  await fs.appendFile(logFile, 'Line 2: User logged in\n', 'utf8');
  console.log('  Appended line 2');

  await fs.appendFile(logFile, 'Line 3: Data processed\n', 'utf8');
  console.log('  Appended line 3');

  // Read back to see all three lines are there
  const logContent = await fs.readFile(logFile, 'utf8');
  console.log('\n  Final file content:');
  console.log(logContent);

  // ── 2. Building a real logger ────────────────────────────────
  //
  // This is how real logging libraries work internally.
  // Each log entry gets a timestamp and severity level.
  //
  console.log('--- 2. Building a simple logger ---');

  const appLogFile = path.join(OUTPUT_DIR, 'server.log');
  try { await fs.unlink(appLogFile); } catch {}

  // Logger function — appends a formatted line to a log file
  async function log(level, message) {
    const timestamp = new Date().toISOString();
    const line = `[${timestamp}] [${level.toUpperCase().padEnd(5)}] ${message}\n`;
    await fs.appendFile(appLogFile, line, 'utf8');
    process.stdout.write(line); // also print to console
  }

  // Simulate an app lifecycle
  await log('info',  'Server started on port 3000');
  await log('info',  'Connected to database');
  await log('warn',  'Memory usage above 80%');
  await log('error', 'Failed to fetch user profile: timeout');
  await log('info',  'Retrying failed request...');
  await log('info',  'Request succeeded on retry');
  console.log(`\n  ✓ Log saved to: server.log\n`);

  // ── 3. Append vs writeFile comparison ──────────────────────
  console.log('--- 3. Side-by-side comparison ---');

  const compareFile = path.join(OUTPUT_DIR, 'compare.txt');
  try { await fs.unlink(compareFile); } catch {}

  // writeFile — creates and writes full content
  const { writeFile } = require('fs').promises;
  await fs.writeFile(compareFile, 'Original content.\n', 'utf8');
  console.log('  After writeFile:  "Original content."');

  // appendFile — adds to what's already there
  await fs.appendFile(compareFile, 'Appended content.\n', 'utf8');
  const result = await fs.readFile(compareFile, 'utf8');
  console.log('  After appendFile:', result.replace(/\n/g, ' | '));

  // writeFile again — erases everything including the appended line
  await fs.writeFile(compareFile, 'Reset — back to one line.\n', 'utf8');
  const reset = await fs.readFile(compareFile, 'utf8');
  console.log('  After writeFile again:', reset.trim(), '\n');

  // ── 4. Appending structured data over time ───────────────────
  //
  // Real-world use: save sensor readings, user events, metrics.
  //
  console.log('--- 4. Appending JSON records (newline-delimited JSON) ---');

  const metricsFile = path.join(OUTPUT_DIR, 'metrics.ndjson');
  try { await fs.unlink(metricsFile); } catch {}

  // NDJSON = Newline Delimited JSON — one JSON object per line.
  // WHY this format? Easy to append, easy to stream line-by-line.
  const readings = [
    { sensor: 'cpu',    value: 42,  unit: '%' },
    { sensor: 'memory', value: 78,  unit: '%' },
    { sensor: 'disk',   value: 55,  unit: '%' },
  ];

  for (const reading of readings) {
    const record = JSON.stringify({ ...reading, ts: new Date().toISOString() });
    await fs.appendFile(metricsFile, record + '\n', 'utf8');
    console.log('  Appended:', record);
  }

  console.log('\n  ✓ metrics.ndjson — each line is a valid JSON object');
  console.log('  Read it back line-by-line to parse individual records\n');
}

run().catch(console.error);
