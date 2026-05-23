// ============================================================
//  CREATING AND WRITING FILES — fs.writeFile()
// ============================================================
//
//  WHAT  : Create a new file or COMPLETELY REPLACE an existing
//          file with new content.
//
//  HOW   : fs.writeFile() opens the file, writes your content
//          from scratch, and closes it. If the file doesn't
//          exist, it creates it. If it does exist, it ERASES
//          the old content and writes the new content.
//
//  WHY   : Use this when you want to save a complete document,
//          config, report, or data snapshot. Think of it like
//          "Save As" — it always writes the full content.
//
//  ⚠️  OVERWRITES without warning! If you want to ADD to a
//      file instead of replacing it, use appendFile (next file).
// ============================================================

const fs   = require('fs').promises;
const path = require('path');

// All files we create go into an 'output' folder so they
// don't clutter the project. We create the folder first.
const OUTPUT_DIR = path.join(__dirname, '..', 'output', 'writing');

async function run() {
  console.log('=== Creating and Writing Files with fs.writeFile() ===\n');

  // Create the output directory if it doesn't exist
  // { recursive: true } = don't throw an error if it already exists
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  console.log(`Output folder ready: ${OUTPUT_DIR}\n`);

  // ── 1. Writing a plain text file ───────────────────────────
  console.log('--- 1. Writing a plain text file ---');

  const textContent = `Hello from Node.js!
This file was created by fs.writeFile().
Timestamp: ${new Date().toISOString()}
`;

  await fs.writeFile(
    path.join(OUTPUT_DIR, 'hello-output.txt'),
    textContent,
    'utf8'     // encoding — always specify for text files
  );
  console.log('✓ hello-output.txt created\n');

  // ── 2. Writing a JSON file ──────────────────────────────────
  //
  // WHY write JSON? Config files, saving app state, API caches.
  // JSON.stringify(data, null, 2) — the '2' adds 2-space indentation
  // so the file is human-readable (not one long line).
  //
  console.log('--- 2. Writing a JSON file ---');

  const userData = {
    id: 1,
    name: 'Deepak Patel',
    skills: ['Node.js', 'JavaScript', 'Express'],
    createdAt: new Date().toISOString()
  };

  await fs.writeFile(
    path.join(OUTPUT_DIR, 'user.json'),
    JSON.stringify(userData, null, 2),  // pretty-print with 2-space indent
    'utf8'
  );
  console.log('✓ user.json created');
  console.log('  Content:', JSON.stringify(userData), '\n');

  // ── 3. Overwrite demo ──────────────────────────────────────
  //
  // Calling writeFile on an existing file REPLACES its content.
  // Run this script twice to see the timestamp change.
  //
  console.log('--- 3. Overwriting an existing file ---');

  const filePath = path.join(OUTPUT_DIR, 'overwrite-demo.txt');

  await fs.writeFile(filePath, 'First write — original content.\n', 'utf8');
  console.log('  Written: "First write"');

  // Read back to confirm
  const before = await fs.readFile(filePath, 'utf8');
  console.log('  File now:', before.trim());

  // Overwrite it completely
  await fs.writeFile(filePath, 'Second write — old content is GONE.\n', 'utf8');

  const after = await fs.readFile(filePath, 'utf8');
  console.log('  File now:', after.trim());
  console.log('  ⚠️  First write is gone — writeFile always replaces.\n');

  // ── 4. Writing with flags ──────────────────────────────────
  //
  // The default 'flag' is 'w' (write, truncate first).
  // You can change this:
  //   'w'  — create or overwrite (default)
  //   'wx' — create only, fail if file already exists
  //
  console.log('--- 4. Using wx flag (create only, never overwrite) ---');

  const exclusivePath = path.join(OUTPUT_DIR, 'exclusive.txt');

  // Delete it if it exists from a previous run
  try { await fs.unlink(exclusivePath); } catch {}

  try {
    await fs.writeFile(exclusivePath, 'Created fresh.\n', { flag: 'wx' });
    console.log('✓ exclusive.txt created (file did not exist)');
  } catch (err) {
    console.log('✗ Could not create — file already exists (EEXIST)');
  }

  // Try again — this time it already exists, so wx will fail
  try {
    await fs.writeFile(exclusivePath, 'This should fail.\n', { flag: 'wx' });
    console.log('  Wrote again (unexpected)');
  } catch (err) {
    console.log('✓ Second write blocked — wx protects existing files');
    console.log('  Error code:', err.code, '\n'); // EEXIST
  }

  // ── 5. Writing a CSV file ──────────────────────────────────
  //
  // Practical example: exporting data as a CSV spreadsheet.
  //
  console.log('--- 5. Writing a CSV file ---');

  const employees = [
    { name: 'Alice',   role: 'Engineer',  salary: 95000 },
    { name: 'Bob',     role: 'Designer',  salary: 85000 },
    { name: 'Charlie', role: 'Manager',   salary: 105000 },
  ];

  const csvHeader = 'Name,Role,Salary\n';
  const csvRows   = employees.map(e => `${e.name},${e.role},${e.salary}`).join('\n');
  const csvContent = csvHeader + csvRows + '\n';

  await fs.writeFile(path.join(OUTPUT_DIR, 'employees.csv'), csvContent, 'utf8');
  console.log('✓ employees.csv created');
  console.log('  Preview:\n' + csvContent);

  console.log('=== All files written to:', OUTPUT_DIR, '===');
}

run().catch(console.error);
