// ============================================================
//  RENAMING AND MOVING — Atomic Rename Operations
// ============================================================
//
//  WHAT  : Replace a file in a way that is guaranteed to be
//          all-or-nothing — no partial state.
//
//  HOW   : Write new content to a TEMP file → rename temp to
//          final destination. On Linux/macOS, rename() is an
//          atomic OS syscall — it swaps the directory entry
//          instantly with no intermediate broken state.
//
//  WHY THIS MATTERS:
//  Imagine updating config.json directly:
//    ❌ DANGEROUS: fs.writeFile('config.json', newData)
//       If the process crashes WHILE writing, config.json is
//       half-written and CORRUPT. App crashes on next restart.
//
//    ✅ SAFE: write to config.json.tmp → rename to config.json
//       rename() is instant — either the old file exists or
//       the new file exists. There is no in-between state.
//
//  REAL-WORLD USES:
//  - Updating config/settings files
//  - Saving game state or checkpoints
//  - Database-style file storage
//  - Any file that must never be corrupt
// ============================================================

const fs   = require('fs').promises;
const path = require('path');
const os   = require('os');

const WORK_DIR = path.join(__dirname, '..', 'output', 'renaming', 'atomic');

async function run() {
  console.log('=== Atomic Rename Operations ===\n');

  await fs.mkdir(WORK_DIR, { recursive: true });

  // ── 1. The problem: direct writeFile is NOT safe ─────────────
  console.log('--- 1. Why direct writeFile is risky ---');
  console.log(`
  UNSAFE approach (don't do this for important files):

    await fs.writeFile('config.json', newData)
         ↓
    Opens file... writes byte 1... writes byte 2... [CRASH]
    config.json is now half-written and corrupted.

  SAFE approach (atomic rename):

    await fs.writeFile('config.json.tmp', newData)  ← write to temp
    await fs.rename('config.json.tmp', 'config.json') ← instant swap
         ↓
    rename() is a single OS syscall — cannot be interrupted.
    Either old file or new file exists. Never a corrupt state.
  `);

  // ── 2. Atomic write function ─────────────────────────────────
  //
  // This is a reusable helper you can use in any project.
  //
  console.log('--- 2. Atomic write helper function ---');

  async function atomicWrite(filePath, content, encoding = 'utf8') {
    // Step 1: write to a temporary file in the SAME directory.
    // WHY same directory? rename() must be on the same filesystem.
    // A temp file in /tmp/ could be on a different disk → EXDEV error.
    const tmpPath = filePath + '.tmp';

    // Step 2: write all content to the temp file
    await fs.writeFile(tmpPath, content, encoding);

    // Step 3: atomically replace the final file with the temp file
    // If this line is reached, the write was successful.
    // If the process crashed before this, tmpPath exists but filePath is untouched.
    await fs.rename(tmpPath, filePath);
  }

  // ── 3. Using atomic write for a config file ──────────────────
  console.log('--- 3. Safely updating a config file ---');

  const configPath = path.join(WORK_DIR, 'config.json');

  // Initial config
  const config = {
    version: 1,
    theme: 'light',
    language: 'en',
    lastUpdated: new Date().toISOString()
  };

  await atomicWrite(configPath, JSON.stringify(config, null, 2));
  console.log('  ✓ Initial config.json written atomically');

  // Update the config — safely
  config.theme = 'dark';
  config.version = 2;
  config.lastUpdated = new Date().toISOString();

  await atomicWrite(configPath, JSON.stringify(config, null, 2));
  console.log('  ✓ Config updated atomically');

  const saved = JSON.parse(await fs.readFile(configPath, 'utf8'));
  console.log('  Saved config:', saved, '\n');

  // ── 4. Atomic write with temp file in system temp dir ────────
  //
  // Alternative: use os.tmpdir() for the temp file.
  // Useful when you can't write to the destination directory.
  // But watch out for EXDEV if tmpdir is on a different disk!
  //
  console.log('--- 4. Atomic write with os.tmpdir() + fallback ---');

  async function atomicWriteSafe(filePath, content) {
    const dir      = path.dirname(filePath);
    const tmpName  = `.tmp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const tmpPath  = path.join(dir, tmpName); // same dir = same filesystem

    await fs.writeFile(tmpPath, content, 'utf8');

    try {
      await fs.rename(tmpPath, filePath);
      console.log(`  ✓ Written atomically: ${path.basename(filePath)}`);
    } catch (err) {
      // Clean up the temp file if rename failed
      await fs.unlink(tmpPath).catch(() => {});
      throw err;
    }
  }

  await atomicWriteSafe(
    path.join(WORK_DIR, 'state.json'),
    JSON.stringify({ counter: 42, status: 'running' }, null, 2)
  );
  console.log();

  // ── 5. Read-modify-write cycle (atomic) ─────────────────────
  //
  // Common pattern: read a file, modify it in memory, save back.
  // Without atomic writes this is very risky.
  //
  console.log('--- 5. Safe read-modify-write cycle ---');

  const dataPath = path.join(WORK_DIR, 'data.json');
  await atomicWrite(dataPath, JSON.stringify({ visits: 0, users: [] }, null, 2));

  async function updateData(filePath, updaterFn) {
    const raw  = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(raw);

    const updated = updaterFn(data); // apply the change in memory

    await atomicWrite(filePath, JSON.stringify(updated, null, 2));
    return updated;
  }

  // Simulate 3 updates
  for (let i = 1; i <= 3; i++) {
    const result = await updateData(dataPath, (data) => ({
      ...data,
      visits: data.visits + 1,
      users: [...data.users, `user-${i}`],
      lastVisit: new Date().toISOString()
    }));
    console.log(`  Update ${i}: visits=${result.visits}, users=[${result.users.join(', ')}]`);
  }

  console.log('\n=== Summary ===');
  console.log('  write → rename = atomic update (safest pattern)');
  console.log('  Always use the same filesystem for temp file');
  console.log('  Clean up temp file if rename fails');
  console.log('  Essential for: config files, state files, any file that must never corrupt');
}

run().catch(console.error);
