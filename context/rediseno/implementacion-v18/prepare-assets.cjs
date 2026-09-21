const fs = require('node:fs');
const sharp = require('sharp');
const source = 'C:/Users/cabra/.codex/generated_images/01a0b82d-f99d-7130-97af-f2af843b8646';
(async () => {
  fs.mkdirSync(`${__dirname}/arte-fuente`, { recursive: true });
  const assets = [];
  for (const [id, name] of [['675023d3-ab35-4b1e-a066-99312e7e965a', 'atrium-marble-v18'], ['428e5108-6726-493b-aa81-4217d7badd3f', 'atrium-facade-v18'], ['95f433a5-38e4-4094-9a2a-3ba0ec8f1fe8', 'atrium-lectern-v18']]) {
    const original = `${source}/exec-${id}.png`, output = `public/image/journey/${name}.webp`;
    fs.copyFileSync(original, `${__dirname}/arte-fuente/${name}.png`);
    await sharp(original).resize({ width: 1536, height: 1536, fit: 'inside', withoutEnlargement: true }).webp({ quality: 90, alphaQuality: 100 }).toFile(output);
    assets.push({ source: original, output, bytes: fs.statSync(output).size, alpha: (await sharp(output).stats()).channels[3] });
  }
  fs.writeFileSync(`${__dirname}/assets.json`, JSON.stringify(assets, null, 2));
  console.log(assets);
})();
