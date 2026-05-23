// ============================================================
//  RENAMING AND MOVING — Batch Renaming Files
// ============================================================
//
//  WHAT  : Rename many files at once using a rule or pattern.
//
//  HOW   : Read directory → filter files → apply naming rule
//          → rename each one (in parallel for speed).
//
//  WHY   : Camera files named IMG_0001.jpg, normalise filenames
//          to lowercase+hyphens, add sequential numbers, swap
//          naming conventions across a whole folder at once.
// ============================================================

const fs   = require('fs').promises;
const path = require('path');

const WORK_DIR = path.join(__dirname, '..', 'output', 'renaming', 'batch');

async function setupFiles(subDir, files) {
  const dir = path.join(WORK_DIR, subDir);
  await fs.mkdir(dir, { recursive: true });
  for (const f of files) {
    await fs.writeFile(path.join(dir, f), `content: ${f}`, 'utf8');
  }
  return dir;
}

async function listFiles(dir) {
  const files = await fs.readdir(dir);
  return files.sort();
}

async function run() {
  console.log('=== Batch Renaming Files ===\n');

  // ── 1. Add sequential numbers ────────────────────────────────
  //
  // WHY? Sorting files by name that have inconsistent names.
  // photo.jpg, image.jpg → 001-photo.jpg, 002-image.jpg
  //
  console.log('--- 1. Add sequential numbers to filenames ---');

  const dir1 = await setupFiles('numbered', [
    'sunset.jpg', 'mountain.jpg', 'beach.jpg', 'forest.jpg'
  ]);

  const files1 = await listFiles(dir1);
  console.log('  Before:', files1.join(', '));

  await Promise.all(
    files1.map(async (filename, index) => {
      const number  = String(index + 1).padStart(3, '0'); // 001, 002, ...
      const newName = `${number}-${filename}`;
      await fs.rename(path.join(dir1, filename), path.join(dir1, newName));
    })
  );

  console.log('  After: ', (await listFiles(dir1)).join(', '), '\n');

  // ── 2. Normalise to lowercase with hyphens ───────────────────
  //
  // WHY? Web-safe filenames — spaces and uppercase cause issues
  // in URLs. "My Photo.JPG" → "my-photo.jpg"
  //
  console.log('--- 2. Normalise filenames (lowercase + hyphens) ---');

  const dir2 = await setupFiles('normalised', [
    'My Photo.JPG', 'Summer Vacation.JPG', 'Family Event.PNG', 'Hello World.txt'
  ]);

  const files2 = await listFiles(dir2);
  console.log('  Before:', files2.join(', '));

  function normalise(filename) {
    const ext  = path.extname(filename).toLowerCase();
    const base = path.basename(filename, path.extname(filename));
    return base
      .toLowerCase()         // all lowercase
      .replace(/\s+/g, '-')  // spaces → hyphens
      .replace(/[^a-z0-9-]/g, '') // remove anything not a-z, 0-9, or hyphen
      + ext;
  }

  const renameOps2 = files2
    .map(f => ({ from: f, to: normalise(f) }))
    .filter(op => op.from !== op.to); // skip if name won't change

  await Promise.all(
    renameOps2.map(op =>
      fs.rename(path.join(dir2, op.from), path.join(dir2, op.to))
    )
  );

  console.log('  After: ', (await listFiles(dir2)).join(', '), '\n');

  // ── 3. Replace text in filenames ────────────────────────────
  //
  // WHY? Bulk find-and-replace in filenames — like renaming
  // "draft-" prefix to "final-" across a whole folder.
  //
  console.log('--- 3. Replace text in filenames ---');

  const dir3 = await setupFiles('replaced', [
    'draft-chapter-01.txt', 'draft-chapter-02.txt', 'draft-chapter-03.txt', 'notes.txt'
  ]);

  const files3 = await listFiles(dir3);
  console.log('  Before:', files3.join(', '));

  async function batchReplace(dir, find, replace) {
    const files = await fs.readdir(dir);
    const targets = files.filter(f => f.includes(find));

    await Promise.all(
      targets.map(f => {
        const newName = f.split(find).join(replace); // replace ALL occurrences
        return fs.rename(path.join(dir, f), path.join(dir, newName));
      })
    );
    return targets.length;
  }

  const count = await batchReplace(dir3, 'draft-', 'final-');
  console.log(`  Replaced "draft-" → "final-" in ${count} files`);
  console.log('  After: ', (await listFiles(dir3)).join(', '), '\n');

  // ── 4. Add file extension to files missing one ───────────────
  console.log('--- 4. Add missing extensions ---');

  const dir4 = await setupFiles('extensions', [
    'document',     // missing .txt
    'data',         // missing .json
    'image.png',    // already has extension — skip
    'report'        // missing .txt
  ]);

  const files4 = await listFiles(dir4);
  console.log('  Before:', files4.join(', '));

  // Files with no extension get .txt added
  const noExtension = files4.filter(f => path.extname(f) === '');
  await Promise.all(
    noExtension.map(f =>
      fs.rename(path.join(dir4, f), path.join(dir4, f + '.txt'))
    )
  );

  console.log('  After: ', (await listFiles(dir4)).join(', '), '\n');

  // ── 5. Dry-run mode — preview without executing ──────────────
  //
  // WHY? Batch rename is risky — always preview first.
  // A dry-run shows you what WOULD happen without doing it.
  //
  console.log('--- 5. Dry-run mode — preview changes before applying ---');

  const dir5 = await setupFiles('dryrun', [
    'IMG_0001.JPG', 'IMG_0002.JPG', 'IMG_0003.JPG'
  ]);

  async function batchRenameWithDryRun(dir, transformFn, dryRun = true) {
    const files = await fs.readdir(dir);
    const plan  = files.map(f => ({ from: f, to: transformFn(f) }))
                       .filter(op => op.from !== op.to);

    console.log(`  ${dryRun ? '[DRY RUN] ' : ''}${plan.length} renames planned:`);
    plan.forEach(op => console.log(`    ${op.from} → ${op.to}`));

    if (!dryRun) {
      await Promise.all(
        plan.map(op => fs.rename(path.join(dir, op.from), path.join(dir, op.to)))
      );
      console.log('  ✓ Applied.');
    } else {
      console.log('  (pass dryRun=false to apply these changes)');
    }
  }

  const transform = f => f.replace('IMG_', 'photo-').toLowerCase();

  await batchRenameWithDryRun(dir5, transform, true);   // preview
  console.log();
  await batchRenameWithDryRun(dir5, transform, false);  // apply
}

run().catch(console.error);
