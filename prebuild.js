const fs = require('fs');
const path = require('path');

const origFilePath = path.join(__dirname, 'node_modules/jssha/dist/sha1.js');
const destFilePath = path.join(__dirname, 'vendor/jssha/sha1.js');

let content = fs.readFileSync(origFilePath, 'utf8');

// Escape backticks
content = content.replace(/`/g, '\\`');

const hashedContent = "`" + content + "`";
const exportedContent = "const sha1Source = " + hashedContent + ";" + "\nexport default sha1Source;";

// Write to file
fs.writeFileSync(destFilePath, exportedContent);
