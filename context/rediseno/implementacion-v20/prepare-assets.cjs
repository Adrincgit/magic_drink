const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const assets = require('./assets.json');
(async () => {
  for (const [key, asset] of Object.entries(assets)) {
    const destination = path.resolve('public/image/journey', asset.file);
    await sharp(asset.source).resize(1536, 1024, { fit: 'fill' }).webp({ quality: 90, effort: 6 }).toFile(destination);
    console.log(key, fs.statSync(destination).size);
  }
})();
