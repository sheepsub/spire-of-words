const fs = require('fs');

function parse(filename) {
  const html = fs.readFileSync(filename, 'utf8');
  const regex = /title="File:([^"]+)"/gi;
  let m;
  const files = [];
  while ((m = regex.exec(html)) !== null) {
    files.push(m[1]);
  }
  return [...new Set(files)];
}

console.log('=== Characters files ===');
console.log(parse('wiki_chars.html'));

console.log('=== Portrait files ===');
console.log(parse('wiki_portraits.html'));
