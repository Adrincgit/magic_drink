const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
(async () => {
  fs.mkdirSync(path.join(__dirname, 'arte-fuente'), {recursive:true});
  const manifest = [];
  for (const name of ['garden-grass-v11', 'garden-grove-v11', 'festival-stage-front-v11', 'hexy-dj-wave-v11', 'hexy-dj-mix-v11']) {
    const job = JSON.parse(fs.readFileSync(path.join(__dirname, name + '.json')));
    const source = job.hint.match(/ as (C:\\.*?\.png) by default/)[1];
    const original = path.join(__dirname, 'arte-fuente', name + '.png');
    fs.copyFileSync(source, original);
    const target = path.resolve('public/image/journey', name + '.webp');
    await sharp(original).webp({quality:88, alphaQuality:100, effort:6}).toFile(target + '.tmp');
    fs.renameSync(target + '.tmp', target);
    const meta = await sharp(target).metadata();
    manifest.push({name, prompt:job.prompt, refs:job.refs, file:target, width:meta.width, height:meta.height, alpha:meta.hasAlpha, bytes:fs.statSync(target).size});
  }
  fs.writeFileSync(path.join(__dirname, 'assets-manifest.json'), JSON.stringify(manifest,null,2));
  console.log(manifest.map(({name,bytes,alpha})=>({name,bytes,alpha})));
})();
