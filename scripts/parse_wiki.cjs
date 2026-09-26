const fs = require('fs');

const html = fs.readFileSync('wiki_ironclad.html', 'utf8');
const regex = /<img[^>]+src=["']([^"']+)["']/gi;
let m;
const urls = [];
while ((m = regex.exec(html)) !== null) {
  urls.push(m[1]);
}
console.log('Total img src:', urls.length);
urls.forEach(u => console.log(u));
