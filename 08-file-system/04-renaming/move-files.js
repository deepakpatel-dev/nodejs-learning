// ============================================================
//  RENAMING AND MOVING — Moving Files Between Directories
// ============================================================
//
//  WHAT  : Move a file from one folder to another.
//
//  HOW   : fs.rename(src, dest) works for moving too — just
//          give it a destination in a DIFFERENT directory.
//
//  IMPORTANT LIMITATION:
//  fs.rename() only works if source and destination are on the
//  SAME disk/volume. If they're on different disks, you get
//  EXDEV error. In that case: copy the file, then delete original.
//
//  WHY MOVE FILES?
//  - Move uploads from 'temp/' to 'processed/' after handling
//  - Organise files into dated subfolders automatically
//  - Archive old files to a separate folder
//  - Implement a file processing pipeline (inbox → processing → done)
// ============================================================

const fs   = require('fs').promises;
const path = require('path');

const WORK_DIR = path.join(__dirname, '..', 'output', 'renaming', 'move');

async function run() {
  console.log('=== Moving Files Between Directories ===\n');

  // Create folder structure
  const dirs = ['inbox', 'processing', 'done', 'archive', 'by-date'];
  for (const dir of dirs) {
    await fs.mkdir(path.join(WORK_DIR, dir), { recursive: true });
  }

  // ── 1. Basic move ────────────────────────────────────────────
  console.log('--- 1. Basic move — rename with a different folder ---');

  await fs.writeFile(path.join(WORK_DIR, 'inbox', 'upload.txt'), 'uploaded file', 'utf8');
  console.log('  Created: inbox/upload.txt');

  // Moving = rename with a path that points to a different directory
  await fs.rename(
    path.join(WORK_DIR, 'inbox',   'upload.txt'),
    path.join(WORK_DIR, 'processing', 'upload.txt')
  );
  console.log('  ✓ Moved: inbox/upload.txt → processing/upload.txt\n');

  // ── 2. Move + Rename simultaneously ─────────────────────────
  //
  // Change both the folder AND the filename in one operation.
  //
  console.log('--- 2. Move and rename at the same time ---');

  await fs.writeFile(path.join(WORK_DIR, 'processing', 'upload.txt'), 'processed', 'utf8');

  await fs.rename(
    path.join(WORK_DIR, 'processing', 'upload.txt'),
    path.join(WORK_DIR, 'done', 'upload-completed.txt')   // new name too
  );
  console.log('  ✓ processing/upload.txt → done/upload-completed.txt\n');

  // ── 3. File processing pipeline ─────────────────────────────
  //
  // Real-world pattern: files flow through stages of a pipeline.
  // inbox → processing → done
  //
  console.log('--- 3. Processing pipeline (inbox → processing → done) ---');

  // Add files to inbox
  const inboxFiles = ['order-001.json', 'order-002.json', 'order-003.json'];
  for (const f of inboxFiles) {
    await fs.writeFile(
      path.join(WORK_DIR, 'inbox', f),
      JSON.stringify({ id: f, status: 'new' }),
      'utf8'
    );
  }
  console.log(`  Added ${inboxFiles.length} files to inbox/`);

  // Process each file: inbox → processing → done
  const inbox = await fs.readdir(path.join(WORK_DIR, 'inbox'));
  for (const filename of inbox) {
    // Step 1: move to processing
    await fs.rename(
      path.join(WORK_DIR, 'inbox',      filename),
      path.join(WORK_DIR, 'processing', filename)
    );

    // Simulate processing...
    const content = await fs.readFile(path.join(WORK_DIR, 'processing', filename), 'utf8');
    const data = JSON.parse(content);
    data.status = 'processed';
    await fs.writeFile(path.join(WORK_DIR, 'processing', filename), JSON.stringify(data), 'utf8');

    // Step 2: move to done
    await fs.rename(
      path.join(WORK_DIR, 'processing', filename),
      path.join(WORK_DIR, 'done',       filename)
    );
    console.log(`  ✓ ${filename}: inbox → processing → done`);
  }
  console.log();

  // ── 4. Organise files into dated subfolders ─────────────────
  //
  // WHY? Avoid thousands of files in one folder — date-based
  // subfolders make files easy to find and clean up by age.
  //
  console.log('--- 4. Organise files into YYYY/MM/ subfolders ---');

  // Create some test files
  const testFiles = ['photo-a.jpg', 'photo-b.jpg', 'document.pdf'];
  for (const f of testFiles) {
    await fs.writeFile(path.join(WORK_DIR, 'inbox', f), `content of ${f}`, 'utf8');
  }

  async function moveToDateFolder(filePath, baseDir) {
    const now    = new Date();
    const year   = now.getFullYear().toString();
    const month  = String(now.getMonth() + 1).padStart(2, '0');
    const dated  = path.join(baseDir, year, month);

    await fs.mkdir(dated, { recursive: true });

    const dest = path.join(dated, path.basename(filePath));
    await fs.rename(filePath, dest);
    return dest;
  }

  const inboxContents = await fs.readdir(path.join(WORK_DIR, 'inbox'));
  for (const f of inboxContents) {
    const dest = await moveToDateFolder(
      path.join(WORK_DIR, 'inbox', f),
      path.join(WORK_DIR, 'by-date')
    );
    console.log(`  ✓ ${f} → by-date/${dest.split('by-date/')[1]}`);
  }
  console.log();

  // ── 5. Cross-device move fallback (copy + delete) ───────────
  //
  // If source and destination are on different drives/volumes,
  // rename() throws EXDEV. The solution: copy then delete.
  //
  console.log('--- 5. Cross-device move (copy + delete fallback) ---');

  async function moveFile(src, dest) {
    try {
      await fs.rename(src, dest);
      console.log(`  ✓ Moved (rename): ${path.basename(src)}`);
    } catch (err) {
      if (err.code === 'EXDEV') {
        // Different filesystem — must copy then delete
        await fs.copyFile(src, dest);
        await fs.unlink(src);
        console.log(`  ✓ Moved (copy+delete): ${path.basename(src)}`);
      } else {
        throw err;
      }
    }
  }

  await fs.writeFile(path.join(WORK_DIR, 'archive', 'test-move.txt'), 'test', 'utf8');
  await moveFile(
    path.join(WORK_DIR, 'archive', 'test-move.txt'),
    path.join(WORK_DIR, 'done',    'test-move.txt')
  );
}

run().catch(console.error);
