// =============================================
// 01 - BASICS: Using Custom Modules
// =============================================
// Run it with: node index.js

const { add, subtract, multiply, divide } = require('./math');

console.log('add(5, 3)      =>', add(5, 3));
console.log('subtract(5, 3) =>', subtract(5, 3));
console.log('multiply(5, 3) =>', multiply(5, 3));
console.log('divide(9, 3)   =>', divide(9, 3));
