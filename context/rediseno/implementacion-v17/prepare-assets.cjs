const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const generated = 'C:/Users/cabra/.codex/generated_images/01a0b82d-f99d-7130-97af-f2af843b8646';
const art = 'public/image/journey';
const items = [
  ['figuraa.webp', 'hexy-figure.webp'], ['Fullpeluche.webp', 'hexy-plush.webp'],
  ['mochila.webp', 'hexy-backpack.webp'], ['camisa.webp', 'hexy-shirt.webp'],
  ['tamago.webp', 'hexy-pocket.webp'], ['tenis.webp', 'hexy-sneakers.webp'],
  ['hexq.webp', 'hexy-record.webp'], ['Animalitos y victorias en casa.webp', 'hexy-gaming.webp'],
];
(async () => {
  const output = `${art}/wonderpop-collection`;
  fs.mkdirSync(output, { recursive: true });
  fs.mkdirSync(path.join(__dirname, 'arte-fuente'), { recursive: true });
  const report = [];
  for (const [source, name] of items) {
    await sharp(`src/components/marketplace/${source}`).resize({ width: 840, height: 840, fit: 'inside', withoutEnlargement: true }).webp({ quality: 88 }).toFile(`${output}/${name}`);
    report.push({ source: `src/components/marketplace/${source}`, output: `${output}/${name}`, bytes: fs.statSync(`${output}/${name}`).size });
  }
  for (const [source, name] of [
    ['exec-c49be6e0-b5ac-46cd-a259-9e10c75c3531.png', 'bunny-wave-v17.webp'],
    ['exec-c51850c5-c23f-4ba2-868a-a88d0e62509a.png', 'wonderpop-gallery-v17.webp'],
    ['exec-d2f53176-1665-4acf-9089-9706129a93cb.png', 'plaza-pier-v17.webp'],
  ]) {
    fs.copyFileSync(`${generated}/${source}`, path.join(__dirname, 'arte-fuente', name.replace('.webp', '.png')));
    await sharp(`${generated}/${source}`).webp({ quality: 92, alphaQuality: 100 }).toFile(`${art}/${name}`);
    report.push({ source, output: `${art}/${name}`, bytes: fs.statSync(`${art}/${name}`).size });
  }
  fs.writeFileSync(path.join(__dirname, 'assets.json'), JSON.stringify(report, null, 2));
  const { data, info } = await sharp(`${art}/bunny-wave-v17.webp`).raw().toBuffer({ resolveWithObject: true });
  const feet = [];
  for (let cell = 0; cell < 6; cell++) {
    let foot = 0;
    for (let y = 0; y < 512; y++) for (let x = 0; x < 512; x++) {
      const index = (((Math.floor(cell / 3) * 512 + y) * info.width) + (cell % 3) * 512 + x) * info.channels;
      if (data[index + 3] > 220) foot = y;
    }
    feet.push(foot);
  }
  console.log(JSON.stringify({ feet, assets: report }, null, 2));
})();
