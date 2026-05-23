# 08 — File System

Complete guide to Node.js file system operations. Every example includes explanations of **what** is happening, **how** it works, and **why** you'd use it.

## What You Learn

- Three ways to read files: callbacks, promises (async/await), and synchronous
- Creating and writing files safely
- Appending to files (logs, audit trails)
- Low-level file handles for fine-grained control
- Streaming large files without loading them into memory
- Deleting single files, multiple files, and directories
- Renaming, moving, and batch-renaming files
- Atomic writes — updating files safely with no corruption risk

## Structure

```
08-file-system/
├── sample-files/           ← input files used by all examples
│   ├── hello.txt
│   ├── data.json
│   └── large-file.txt      ← 500 lines, used by streams example
├── output/                 ← created when you run the examples
│   ├── writing/
│   ├── deleting/
│   └── renaming/
├── 01-reading/
│   ├── callbacks.js        ← original Node.js async pattern (error-first)
│   ├── promises.js         ← modern async/await + parallel reads
│   └── sync.js             ← blocking reads, when and why to use them
├── 02-writing/
│   ├── write-file.js       ← create/overwrite files, JSON, CSV
│   ├── append-file.js      ← add to existing files, building a logger
│   ├── file-handles.js     ← open/read/write/close, file flags
│   └── streams.js          ← chunk-by-chunk reading/writing, pipe()
├── 03-deleting/
│   ├── single-file.js      ← fs.unlink, safe delete, error codes
│   ├── multiple-files.js   ← sequential, parallel, pattern-based
│   ├── directories.js      ← rmdir (empty) vs rm (recursive)
│   └── empty-directory.js  ← clear contents but keep the folder
└── 04-renaming/
    ├── basic-rename.js     ← fs.rename, timestamps, extension change
    ├── move-files.js       ← move between folders, pipeline pattern
    ├── batch-rename.js     ← sequential numbers, normalise, dry-run
    └── atomic-rename.js    ← write-to-temp + rename (safe updates)
```

## Run Any Example

```bash
# Using npm scripts (from this folder)
npm run read:callbacks
npm run read:promises
npm run read:sync

npm run write:file
npm run write:append
npm run write:handles
npm run write:streams

npm run delete:single
npm run delete:multi
npm run delete:dir
npm run delete:empty

npm run rename:basic
npm run rename:move
npm run rename:batch
npm run rename:atomic

# Or run directly with node
node 01-reading/promises.js
```

## Key Concepts at a Glance

### Which read method to use?

| Situation | Use |
|---|---|
| Learning / most new code | `fs.promises` + async/await |
| App startup, config loading | `fs.readFileSync` |
| Old codebase you're maintaining | Callbacks (`fs.readFile`) |
| File too large to fit in RAM | `fs.createReadStream` |

### Which write method to use?

| Situation | Use |
|---|---|
| Save a complete document | `fs.writeFile` |
| Add to a log / audit trail | `fs.appendFile` |
| Write very large data | `fs.createWriteStream` |
| Config / state file (must never corrupt) | Atomic: write to `.tmp` → `fs.rename` |
| Full control (position, partial writes) | File handles (`fs.open`) |

### Error codes you'll see

| Code | Meaning |
|---|---|
| `ENOENT` | File or directory not found |
| `EACCES` | Permission denied |
| `EEXIST` | File already exists (when using `wx` flag) |
| `ENOTEMPTY` | Directory is not empty (rmdir on non-empty dir) |
| `EISDIR` | Expected a file but got a directory |
| `EXDEV` | Cross-device rename not allowed |
