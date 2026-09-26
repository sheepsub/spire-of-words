const https = require('https');

function getPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(d));
      res.on('error', reject);
    });
  });
}

async function run() {
  const pages = ['Ironclad', 'Silent', 'Defect', 'Watcher'];
  for (const p of pages) {
    console.log(`\n=== Images for ${p} ===`);
    const html = await getPage(`https://slay-the-spire.fandom.com/wiki/${p}`);
    const regex = /https:\/\/static\.wikia\.nocookie\.net\/[^\s"']+/gi;
    const matches = html.match(regex) || [];
    const clean = [...new Set(matches.map(m => m.split('/revision')[0]))];
    console.log(`Found ${clean.length} images on ${p} page:`);
    clean.slice(0, 15).forEach(u => console.log(u));
  }
}

run().catch(console.error);
