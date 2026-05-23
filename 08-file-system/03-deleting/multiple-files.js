// ============================================================
//  DELETING FILES — Multiple Files
// ============================================================
//
//  WHAT  : Delete several files at once.
//
//  HOW   : Three strategies depending on your needs:
//    1. Sequential   — delete one at a time (simple, predictable)
//    2. Parallel     — delete all at once (fast)
//    3. Pattern-based — find files matching a pattern, delete them
//
//  WHY   : Clean up entire temp directories, delete all files
//          matching a pattern (e.g., all *.log files older than
//          7 days), bulk file management in scripts.
// ============================================================

const fs   = require('fs').promises;
const path = require('path');

const WORK_DIR = path.join(__dirname, '..', 'output', 'deleting', 'multi');

async function setup() {
  await fs.mkdir(WORK_DIR, { recursive: true });
  // Create dummy files to work with
  const files = [
    'report-2024-01.txt', 'report-2024-02.txt', 'report-2024-03.txt',
    'cache-a.tmp',  'cache-b.tmp',  'cache-c.tmp',
    'image-01.jpg', 'image-02.jpg',
    'keep-this.txt'
  ];
  await Promise.all(
    files.map(f => fs.writeFile(path.join(WORK_DIR, f), `content of ${f}\n`, 'utf8'))
  );
  console.log(`  Created ${files.length} dummy files.\n`);
  return files;
}

async function run() {
  console.log('=== Deleting Multiple Files ===\n');
  await setup();

  // ── 1. Sequential deletion (one at a time) ───────────────────
  //
  // Use when: order matters, or you want to stop on first error.
  //
  console.log('--- 1. Sequential deletion ---');

  const toDeleteSeq = ['report-2024-01.txt', 'report-2024-02.txt'];

  for (const filename of toDeleteSeq) {
    await fs.unlink(path.join(WORK_DIR, filename));
    console.log(`  ✓ Deleted: ${filename}`);
  }
  console.log();

  // ── 2. Parallel deletion with Promise.all ────────────────────
  //
  // WHY parallel? Disk I/O can overlap. Deleting 10 files in
  // parallel is often faster than deleting them one by one.
  // Use when: files are independent and you want max speed.
  //
  console.log('--- 2. Parallel deletion with Promise.all ---');

  const toDeletePar = ['cache-a.tmp', 'cache-b.tmp', 'cache-c.tmp'];
  console.time('  Parallel delete');

  await Promise.all(
    toDeletePar.map(async (filename) => {
      await fs.unlink(path.join(WORK_DIR, filename));
      console.log(`  ✓ Deleted: ${filename}`);
    })
  );

  console.timeEnd('  Parallel delete');
  console.log();

  // ── 3. Pattern-based deletion ────────────────────────────────
  //
  // Read the directory, filter by pattern, delete matches.
  // Use when: you want to delete all files of a certain type.
  //
  console.log('--- 3. Delete all .jpg files ---');

  const allFiles   = await fs.readdir(WORK_DIR);
  const jpgFiles   = allFiles.filter(f => f.endsWith('.jpg'));

  console.log(`  Found ${jpgFiles.length} .jpg files: ${jpgFiles.join(', ')}`);

  await Promise.all(
    jpgFiles.map(f => fs.unlink(path.join(WORK_DIR, f)))
  );
  console.log('  ✓ All .jpg files deleted\n');

  // ── 4. Delete with results report ────────────────────────────
  //
  // Promise.allSettled — unlike Promise.all, it does NOT stop
  // if one deletion fails. It reports success/failure for each.
  // Use when: some files may not exist and that's OK.
  //
  console.log('--- 4. Delete with per-file results (allSettled) ---');

  const targets = [
    'report-2024-03.txt', // exists
    'does-not-exist.txt', // doesn't exist
    'keep-this.txt',      // exists
  ];

  const results = await Promise.allSettled(
    targets.map(f => fs.unlink(path.join(WORK_DIR, f)))
  );

  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      console.log(`  ✓ Deleted:  ${targets[i]}`);
    } else {
      console.log(`  ✗ Failed:   ${targets[i]} — ${result.reason.code}`);
    }
  });
  console.log();

  // ── 5. Show what's left ──────────────────────────────────────
  const remaining = await fs.readdir(WORK_DIR);
  console.log('--- Files remaining after all deletions ---');
  if (remaining.length === 0) {
    console.log('  (directory is empty)');
  } else {
    remaining.forEach(f => console.log('  •', f));
  }
}

run().catch(console.error);
