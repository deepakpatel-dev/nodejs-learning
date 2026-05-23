// ============================================================
//  DELETING — Directories
// ============================================================
//
//  WHAT  : Remove folders from disk.
//
//  HOW   : Two main tools:
//    fs.rmdir()        → removes an EMPTY directory only
//    fs.rm(path, {recursive: true}) → removes a directory AND
//                                     everything inside it
//
//  WHY THE DISTINCTION?
//  Accidentally deleting a folder full of files is dangerous.
//  rmdir() protects you by refusing to delete non-empty folders.
//  rm() with recursive:true is the "I know what I'm doing" version.
//
//  ⚠️  fs.rm() with recursive:true is PERMANENT and IRREVERSIBLE.
//      Double-check your path before calling it.
// ============================================================

const fs   = require('fs').promises;
const path = require('path');

const WORK_DIR = path.join(__dirname, '..', 'output', 'deleting', 'dirs');

async function makeDir(dirPath, ...files) {
  await fs.mkdir(dirPath, { recursive: true });
  for (const file of files) {
    await fs.writeFile(path.join(dirPath, file), `content of ${file}`, 'utf8');
  }
}

async function run() {
  console.log('=== Deleting Directories ===\n');

  await fs.mkdir(WORK_DIR, { recursive: true });

  // ── 1. Delete an empty directory ────────────────────────────
  console.log('--- 1. Deleting an EMPTY directory with fs.rmdir() ---');

  const emptyDir = path.join(WORK_DIR, 'empty-folder');
  await fs.mkdir(emptyDir, { recursive: true });
  console.log('  Created: empty-folder/');

  await fs.rmdir(emptyDir);
  console.log('  ✓ empty-folder deleted\n');

  // ── 2. rmdir fails on non-empty directory ───────────────────
  console.log('--- 2. rmdir FAILS if directory has content ---');

  const fullDir = path.join(WORK_DIR, 'full-folder');
  await makeDir(fullDir, 'file1.txt', 'file2.txt');
  console.log('  Created: full-folder/ with 2 files');

  try {
    await fs.rmdir(fullDir); // will throw ENOTEMPTY
  } catch (err) {
    console.log('  ✗ rmdir failed — Error code:', err.code);
    console.log('  ✓ This is CORRECT behaviour — protects you from accidents\n');
  }

  // ── 3. Delete a directory and all its contents ──────────────
  //
  // fs.rm() with { recursive: true, force: true } is the
  // equivalent of `rm -rf` on the command line.
  // recursive → delete all files and subfolders inside
  // force     → don't error if the path doesn't exist
  //
  console.log('--- 3. Recursive delete with fs.rm() ---');

  const nestedDir = path.join(WORK_DIR, 'nested');
  await makeDir(path.join(nestedDir, 'sub-a'), 'a1.txt', 'a2.txt');
  await makeDir(path.join(nestedDir, 'sub-b'), 'b1.txt');
  await fs.writeFile(path.join(nestedDir, 'root.txt'), 'root file', 'utf8');

  console.log('  Created structure:');
  console.log('    nested/');
  console.log('      root.txt');
  console.log('      sub-a/ (a1.txt, a2.txt)');
  console.log('      sub-b/ (b1.txt)');

  await fs.rm(nestedDir, { recursive: true, force: true });
  console.log('  ✓ nested/ and ALL contents deleted\n');

  // ── 4. Safe recursive delete — verify path first ─────────────
  //
  // WHY? A typo in the path could delete something important.
  // Always confirm the path is what you expect before rm -rf.
  //
  console.log('--- 4. Safe recursive delete — validate path first ---');

  const tempBuildDir = path.join(WORK_DIR, 'build-output');
  await makeDir(tempBuildDir, 'bundle.js', 'styles.css', 'index.html');
  console.log('  Created: build-output/ (3 files)');

  async function safeRemoveDir(dirPath, mustBeUnder) {
    // Safety check: the path must be inside a known safe parent
    if (!dirPath.startsWith(mustBeUnder)) {
      throw new Error(`Refusing to delete ${dirPath} — outside allowed area`);
    }

    // Check it exists before trying to delete
    try {
      await fs.access(dirPath);
    } catch {
      console.log(`  - Skipped: ${path.basename(dirPath)} (doesn't exist)`);
      return;
    }

    await fs.rm(dirPath, { recursive: true, force: true });
    console.log(`  ✓ Safely deleted: ${path.basename(dirPath)}`);
  }

  await safeRemoveDir(tempBuildDir, WORK_DIR);           // safe — inside WORK_DIR
  // await safeRemoveDir('/tmp/something', WORK_DIR);    // would throw — outside WORK_DIR
  console.log();

  // ── 5. Delete only if empty, otherwise report ───────────────
  console.log('--- 5. Conditional delete — only if empty ---');

  const checkDir = path.join(WORK_DIR, 'maybe-empty');
  await makeDir(checkDir, 'surprise.txt');

  async function deleteIfEmpty(dirPath) {
    const contents = await fs.readdir(dirPath);
    if (contents.length === 0) {
      await fs.rmdir(dirPath);
      console.log(`  ✓ Deleted (was empty): ${path.basename(dirPath)}`);
    } else {
      console.log(`  - Skipped (not empty): ${path.basename(dirPath)} contains [${contents.join(', ')}]`);
    }
  }

  await deleteIfEmpty(checkDir);                         // has files → skipped
  await deleteIfEmpty(path.join(WORK_DIR, 'full-folder')); // still has files → skipped
  console.log();

  console.log('=== Summary ===');
  console.log('  fs.rmdir()                          → empty dirs only');
  console.log('  fs.rm(path, {recursive, force})     → delete everything inside');
  console.log('  Always validate the path before recursive delete!');
}

run().catch(console.error);
