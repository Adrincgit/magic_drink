const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

(async () => {
  const root = path.resolve('context/rediseno/implementacion-v8');
  const manifest = process.argv[2] || 'assets.json';
  const { assets } = JSON.parse(fs.readFileSync(path.join(root, manifest), 'utf8').replace(/^\uFEFF/, ''));
  fs.mkdirSync(path.join(root, 'arte-fuente'), { recursive: true });
  const report = [];
  for (const asset of assets) {
    const source = path.join(root, 'arte-fuente', `${asset.name}.png`);
    fs.copyFileSync(asset.source, source);
    const output = path.resolve('public/image/journey', `${asset.name}.webp`);
    await sharp(source).webp({ quality: 85, alphaQuality: 100, effort: 5 }).toFile(output);
    const metadata = await sharp(output).metadata();
    const { data, info } = await sharp(output).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const centerAlpha = data[(Math.floor(info.height * .7) * info.width + Math.floor(info.width / 2)) * 4 + 3];
    report.push({ name: asset.name, width: metadata.width, height: metadata.height, alpha: metadata.hasAlpha, centerAlpha, bytes: fs.statSync(output).size });
  }
  fs.writeFileSync(path.join(root, manifest.replace('.json', '-sizes.json')), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
})().catch(error => { console.error(error); process.exitCode = 1; });
