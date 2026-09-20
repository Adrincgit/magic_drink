const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

// Conversion only. All scene artwork was authored with built-in ImageGen.
(async () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'assets-manifest.json'), 'utf8'));
  const archive = path.join(__dirname, 'arte-fuente');
  fs.mkdirSync(archive, { recursive: true });
  for (const asset of manifest.assets) {
    const local = path.join(archive, `${asset.name}.png`);
    if (!fs.existsSync(local)) fs.copyFileSync(asset.source, local);
    if (asset.supersededBy) continue;
    // Publish a complete file so an open dev page cannot fetch a partial WebP.
    const temporary = path.join(archive, `${asset.name}.webp.tmp`);
    await sharp(local).webp({ quality: 88, alphaQuality: 100, effort: 6 }).toFile(temporary);
    fs.renameSync(temporary, path.resolve(asset.output));
    const metadata = await sharp(asset.output).metadata();
    asset.width = metadata.width;
    asset.height = metadata.height;
    asset.hasAlpha = metadata.hasAlpha;
    asset.bytes = fs.statSync(asset.output).size;
  }
  fs.writeFileSync(path.join(__dirname, 'assets-manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`${manifest.assets.filter(asset => !asset.supersededBy).length} WebP assets exported`);
})().catch(error => { console.error(error); process.exitCode = 1; });
