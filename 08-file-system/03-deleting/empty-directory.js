// ============================================================
//  DELETING — Emptying a Directory Without Deleting It
// ============================================================
//
//  WHAT  : Remove all files (and optionally subfolders) inside
//          a directory, but keep the directory itself.
//
//  HOW   : Read the directory contents, then delete each item.
//          For subfolders, use recursive deletion.
//
//  WHY   : Cache folders, temp folders, build output folders —
//          you want to clear the contents but keep the folder
//          so your app doesn't have to recreate it every time.
//
//  Example: Clearing a 'uploads/temp/' folder after processing,
//           or wiping a 'dist/' folder before a fresh build.
// ============================================================

const fs   = require('fs').promises;
const path = require('path');

const WORK_DIR = path.join(__dirname, '..', 'output', 'deleting', 'empty-dir');

async function buildTestStructure() {
  // Create a directory with mixed content: files + subfolders
  await fs.mkdir(WORK_DIR, { recursive: true });

  // Top-level files
  await fs.writeFile(path.join(WORK_DIR, 'report.txt'),  'report content',  'utf8');
  await fs.writeFile(path.join(WORK_DIR, 'cache.json'),  '{"key":"value"}', 'utf8');
  await fs.writeFile(path.join(WORK_DIR, 'temp.log'),    'log line 1\n',    'utf8');

  // Subfolder with its own files
  const subDir = path.join(WORK_DIR, 'thumbnails');
  await fs.mkdir(subDir, { recursive: true });
  await fs.writeFile(path.join(subDir, 'thumb-01.jpg'), 'fake image 1', 'utf8');
  await fs.writeFile(path.join(subDir, 'thumb-02.jpg'), 'fake image 2', 'utf8');

  // Another subfolder
  const subDir2 = path.join(WORK_DIR, 'processed');
  await fs.mkdir(subDir2, { recursive: true });
  await fs.writeFile(path.join(subDir2, 'result.csv'), 'a,b,c', 'utf8');
}

async function showContents(label) {
  console.log(`\n  [${label}]`);
  async function list(dir, indent = '  ') {
    const items = await fs.readdir(dir, { withFileTypes: true });
    if (items.length === 0) { console.log(`${indent}  (empty)`); return; }
    for (const item of items) {
      const marker = item.isDirectory() ? '📁' : '📄';
      console.log(`${indent}${marker} ${item.name}`);
      if (item.isDirectory()) {
        await list(path.join(dir, item.name), indent + '  ');
      }
    }
  }
  await list(WORK_DIR);
}

async function run() {
  console.log('=== Emptying a Directory Without Deleting It ===\n');
  await buildTestStructure();
  await showContents('Structure before emptying');

  // ── 1. Remove only top-level files (keep subfolders) ─────────
  console.log('\n--- 1. Delete only files in the top level ---');

  async function deleteTopLevelFiles(dirPath) {
    const items = await fs.readdir(dirPath, { withFileTypes: true });
    // withFileTypes: true → gives Dirent objects with .isFile() / .isDirectory()

    const fileItems = items.filter(item => item.isFile());
    await Promise.all(
      fileItems.map(item => fs.unlink(path.join(dirPath, item.name)))
    );
    console.log(`  ✓ Deleted ${fileItems.length} files from top level`);
    console.log(`  ✓ ${items.filter(i => i.isDirectory()).length} subdirectory(ies) kept`);
  }

  await deleteTopLevelFiles(WORK_DIR);
  await showContents('After top-level file delete');

  // Rebuild for next demo
  await buildTestStructure();

  // ── 2. Empty everything (files + subdirs) but keep root ──────
  console.log('\n--- 2. Empty EVERYTHING inside (keep the folder itself) ---');

  async function emptyDirectory(dirPath) {
    const items = await fs.readdir(dirPath, { withFileTypes: true });

    await Promise.all(
      items.map(item => {
        const fullPath = path.join(dirPath, item.name);
        if (item.isDirectory()) {
          // Recursively remove the entire subfolder
          return fs.rm(fullPath, { recursive: true, force: true });
        } else {
          return fs.unlink(fullPath);
        }
      })
    );

    console.log(`  ✓ Emptied: ${path.basename(dirPath)}`);
    console.log(`  ✓ Removed ${items.length} items (folder itself still exists)`);
  }

  await emptyDirectory(WORK_DIR);
  await showContents('After full empty');

  // Verify the folder itself still exists
  const stats = await fs.stat(WORK_DIR);
  console.log(`\n  Folder still exists: ${stats.isDirectory()}`);

  // ── 3. Selective empty — only files matching a pattern ───────
  console.log('\n--- 3. Delete only .log and .tmp files ---');

  // Recreate files
  await buildTestStructure();
  await fs.writeFile(path.join(WORK_DIR, 'important.txt'), 'keep this!', 'utf8');
  await fs.writeFile(path.join(WORK_DIR, 'debug.log'),     'debug log',  'utf8');

  async function deleteByExtension(dirPath, ...extensions) {
    const items = await fs.readdir(dirPath, { withFileTypes: true });
    const targets = items.filter(
      item => item.isFile() && extensions.some(ext => item.name.endsWith(ext))
    );

    await Promise.all(
      targets.map(item => fs.unlink(path.join(dirPath, item.name)))
    );
    console.log(`  ✓ Deleted ${targets.length} files: ${targets.map(i => i.name).join(', ')}`);
  }

  await deleteByExtension(WORK_DIR, '.log', '.tmp');
  await showContents('After selective delete');

  console.log('\n=== Summary ===');
  console.log('  readdir + withFileTypes  → distinguish files from folders');
  console.log('  Filter by item.isFile()  → target only files');
  console.log('  Filter by extension      → selective cleanup');
  console.log('  fs.rm(dir, {recursive})  → nuke a subfolder completely');
}

run().catch(console.error);
