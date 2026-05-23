// ============================================================
//  DELETING FILES — Single File
// ============================================================
//
//  WHAT  : Remove a file from disk permanently.
//
//  HOW   : fs.unlink() removes the file's directory entry.
//          The OS reclaims the disk space. There is no
//          Recycle Bin / Trash in Node — deletion is permanent.
//
//  WHY   : Clean up temporary files, old exports, uploaded files
//          that have been processed, cache files, log rotation.
//
//  ⚠️  NO UNDO — deleted files are gone forever.
//      Always confirm the path before deleting.
// ============================================================

const fs   = require('fs').promises;
const path = require('path');

const WORK_DIR = path.join(__dirname, '..', 'output', 'deleting');

async function run() {
  console.log('=== Deleting a Single File ===\n');

  // Create workspace and some dummy files to delete
  await fs.mkdir(WORK_DIR, { recursive: true });
  await fs.writeFile(path.join(WORK_DIR, 'temp.txt'),    'Temporary file\n',  'utf8');
  await fs.writeFile(path.join(WORK_DIR, 'cache.json'),  '{"cached":true}\n', 'utf8');
  await fs.writeFile(path.join(WORK_DIR, 'old-log.txt'), 'Old log entry\n',   'utf8');
  console.log('  Created 3 dummy files to delete.\n');

  // ── 1. Basic delete ─────────────────────────────────────────
  console.log('--- 1. Basic file deletion with fs.unlink() ---');

  await fs.unlink(path.join(WORK_DIR, 'temp.txt'));
  console.log('  ✓ temp.txt deleted\n');

  // ── 2. Safe delete — check first, then delete ───────────────
  //
  // WHY check first? If the file doesn't exist, unlink() throws
  // an error (ENOENT). In real apps you often want to delete
  // "if it exists" without crashing if it doesn't.
  //
  console.log('--- 2. Safe delete — check existence first ---');

  async function deleteIfExists(filePath) {
    try {
      await fs.access(filePath); // throws if file doesn't exist
      await fs.unlink(filePath);
      console.log(`  ✓ Deleted: ${path.basename(filePath)}`);
    } catch (err) {
      if (err.code === 'ENOENT') {
        console.log(`  - Skipped: ${path.basename(filePath)} (doesn't exist)`);
      } else {
        throw err; // re-throw unexpected errors
      }
    }
  }

  await deleteIfExists(path.join(WORK_DIR, 'cache.json'));    // exists → deleted
  await deleteIfExists(path.join(WORK_DIR, 'ghost.txt'));     // missing → skipped
  console.log();

  // ── 3. Delete and handle error inline ───────────────────────
  //
  // Alternative pattern: just try and ignore ENOENT.
  // This is shorter and idiomatic in Node.js.
  //
  console.log('--- 3. Try-and-ignore pattern (most concise) ---');

  async function silentDelete(filePath) {
    try {
      await fs.unlink(filePath);
      console.log(`  ✓ Deleted: ${path.basename(filePath)}`);
    } catch (err) {
      if (err.code !== 'ENOENT') throw err; // only ignore "not found"
      console.log(`  - Not found: ${path.basename(filePath)} (ignored)`);
    }
  }

  await silentDelete(path.join(WORK_DIR, 'old-log.txt')); // exists
  await silentDelete(path.join(WORK_DIR, 'old-log.txt')); // already gone — no crash
  console.log();

  // ── 4. Verify deletion ───────────────────────────────────────
  console.log('--- 4. Verifying the file is really gone ---');

  const targetPath = path.join(WORK_DIR, 'verify-me.txt');
  await fs.writeFile(targetPath, 'delete me', 'utf8');

  // Confirm it exists
  const before = await fs.readdir(WORK_DIR);
  console.log('  Before delete:', before.join(', '));

  await fs.unlink(targetPath);

  // Confirm it's gone
  const after = await fs.readdir(WORK_DIR);
  console.log('  After delete: ', after.length ? after.join(', ') : '(empty)');
  console.log();

  // ── 5. Common error codes ────────────────────────────────────
  console.log('--- 5. Error codes you will encounter ---');
  console.log(`
  ENOENT  → File or directory not found
  EACCES  → Permission denied (you don't have rights to delete)
  EBUSY   → File is being used by another process
  EISDIR  → You tried to use unlink() on a directory (use rmdir/rm instead)
  `);
}

run().catch(console.error);
