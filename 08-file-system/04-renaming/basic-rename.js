// ============================================================
//  RENAMING AND MOVING — Basic File Renaming
// ============================================================
//
//  WHAT  : Change a file's name while keeping it in the same
//          folder.
//
//  HOW   : fs.rename(oldPath, newPath) tells the OS to update
//          the directory entry. The file's content is unchanged
//          — only its name pointer is updated. This is instant
//          and uses zero extra disk space.
//
//  WHY   : Fix naming mistakes, add timestamps to filenames,
//          mark files as "processed" or "archived", follow
//          naming conventions automatically.
//
//  KEY POINT: rename() is also used to MOVE files (next file).
//  The OS doesn't distinguish rename from move — both are the
//  same operation: "update this directory entry".
// ============================================================

const fs   = require('fs').promises;
const path = require('path');

const WORK_DIR = path.join(__dirname, '..', 'output', 'renaming');

async function run() {
  console.log('=== Basic File Renaming ===\n');

  await fs.mkdir(WORK_DIR, { recursive: true });

  // ── 1. Simple rename ─────────────────────────────────────────
  console.log('--- 1. Simple rename ---');

  await fs.writeFile(path.join(WORK_DIR, 'old-name.txt'), 'file content', 'utf8');
  console.log('  Created: old-name.txt');

  await fs.rename(
    path.join(WORK_DIR, 'old-name.txt'),   // from
    path.join(WORK_DIR, 'new-name.txt')    // to
  );
  console.log('  ✓ Renamed: old-name.txt → new-name.txt\n');

  // Verify: old name is gone, new name exists
  const files = await fs.readdir(WORK_DIR);
  console.log('  Files now:', files.join(', '), '\n');

  // ── 2. Add a timestamp to a filename ────────────────────────
  //
  // WHY? Archive files by date so you can identify when they
  // were processed. Common in log rotation and data pipelines.
  //
  console.log('--- 2. Add timestamp to filename ---');

  await fs.writeFile(path.join(WORK_DIR, 'report.txt'), 'monthly report', 'utf8');

  function addTimestamp(filename) {
    const ext  = path.extname(filename);                      // '.txt'
    const base = path.basename(filename, ext);                // 'report'
    const date = new Date().toISOString().slice(0, 10);       // '2026-05-22'
    return `${base}-${date}${ext}`;                           // 'report-2026-05-22.txt'
  }

  const original  = 'report.txt';
  const timestamped = addTimestamp(original);

  await fs.rename(
    path.join(WORK_DIR, original),
    path.join(WORK_DIR, timestamped)
  );
  console.log(`  ✓ Renamed: ${original} → ${timestamped}\n`);

  // ── 3. Rename overwrites the target if it exists ─────────────
  //
  // ⚠️  If newPath already exists, rename() SILENTLY OVERWRITES it.
  //     This is intentional (it's how atomic file replacement works)
  //     but can be dangerous if you're not expecting it.
  //
  console.log('--- 3. Rename overwrites existing files (be careful!) ---');

  await fs.writeFile(path.join(WORK_DIR, 'source.txt'), 'source content', 'utf8');
  await fs.writeFile(path.join(WORK_DIR, 'target.txt'), 'target content', 'utf8');
  console.log('  Created source.txt ("source content")');
  console.log('  Created target.txt ("target content")');

  await fs.rename(
    path.join(WORK_DIR, 'source.txt'),
    path.join(WORK_DIR, 'target.txt')
  );

  const targetContent = await fs.readFile(path.join(WORK_DIR, 'target.txt'), 'utf8');
  console.log(`  After rename, target.txt contains: "${targetContent}"`);
  console.log('  ⚠️  Original target.txt content is gone — overwritten\n');

  // ── 4. Safe rename — check before overwriting ────────────────
  console.log('--- 4. Safe rename — fail if target exists ---');

  await fs.writeFile(path.join(WORK_DIR, 'file-a.txt'), 'file a', 'utf8');
  await fs.writeFile(path.join(WORK_DIR, 'file-b.txt'), 'file b', 'utf8');

  async function safeRename(from, to) {
    try {
      // Try to access 'to' — if it exists, access() succeeds → we refuse
      await fs.access(to);
      console.log(`  ✗ Rename blocked: ${path.basename(to)} already exists`);
    } catch {
      // access() threw → file doesn't exist → safe to rename
      await fs.rename(from, to);
      console.log(`  ✓ Renamed: ${path.basename(from)} → ${path.basename(to)}`);
    }
  }

  await safeRename(
    path.join(WORK_DIR, 'new-name.txt'),    // source (exists from step 1)
    path.join(WORK_DIR, 'safe-output.txt')  // target (doesn't exist)
  );

  await safeRename(
    path.join(WORK_DIR, 'file-a.txt'),      // source
    path.join(WORK_DIR, 'file-b.txt')       // target (already exists → blocked)
  );
  console.log();

  // ── 5. Change file extension ─────────────────────────────────
  console.log('--- 5. Changing a file extension ---');

  await fs.writeFile(path.join(WORK_DIR, 'data.txt'), '{"key":"value"}', 'utf8');

  async function changeExtension(filePath, newExt) {
    const dir     = path.dirname(filePath);
    const base    = path.basename(filePath, path.extname(filePath));
    const newPath = path.join(dir, base + newExt);
    await fs.rename(filePath, newPath);
    return newPath;
  }

  const newPath = await changeExtension(path.join(WORK_DIR, 'data.txt'), '.json');
  console.log(`  ✓ data.txt → ${path.basename(newPath)}\n`);
}

run().catch(console.error);
