// =============================================
// 01 - BASICS: File System (fs module)
// =============================================
// Learn how to read, write, and delete files.
// Run it with: node index.js

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'sample.txt');

// 1. Write a file
fs.writeFileSync(filePath, 'Hello from Node.js fs module!\nThis is line 2.');
console.log('File written:', filePath);

// 2. Read the file
const content = fs.readFileSync(filePath, 'utf8');
console.log('\nFile content:\n', content);

// 3. Append to the file
fs.appendFileSync(filePath, '\nThis line was appended.');
console.log('\nLine appended successfully.');

// 4. Read again to confirm
const updated = fs.readFileSync(filePath, 'utf8');
console.log('\nUpdated content:\n', updated);

// 5. Delete the file
fs.unlinkSync(filePath);
console.log('\nFile deleted.');
