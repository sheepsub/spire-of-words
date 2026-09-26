const https = require('https');
const fs = require('fs');
const path = require('path');

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    });
  });
}

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://slay-the-spire.fandom.com/'
      }
    }, res => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download ${url}: status ${res.statusCode}`));
      }
      const stream = fs.createWriteStream(dest);
      res.pipe(stream);
      stream.on('finish', () => {
        stream.close();
        resolve(dest);
      });
      stream.on('error', reject);
    });
  });
}

async function main() {
  const chars = ['Ironclad', 'Silent', 'Defect', 'Watcher'];
  for (const c of chars) {
    const html = await fetchPage(`https://slay-the-spire.fandom.com/wiki/${c}`);
    const match = html.match(/property="og:image" content="([^"]+)"/);
    if (match) {
      console.log(`${c} og:image -> ${match[1]}`);
      const cleanUrl = match[1].split('/revision')[0] + '/revision/latest';
      const dest = path.resolve(`scratch_${c.toLowerCase()}.webp`);
      await downloadImage(cleanUrl, dest);
      console.log(`Saved ${c} to ${dest}`);
    } else {
      console.log(`${c} og:image not found`);
    }
  }
}

main().catch(console.error);
