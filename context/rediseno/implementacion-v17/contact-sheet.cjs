const fs = require('node:fs');
const sharp = require('sharp');
(async () => {
  const source = 'src/components/marketplace';
  const output = 'context/rediseno/implementacion-v17/capturas';
  fs.mkdirSync(output, { recursive: true });
  const names = fs.readdirSync(source).filter(name => name.endsWith('.webp'));
  for (let page = 0; page < Math.ceil(names.length / 16); page++) {
    const composite = [];
    for (let i = 0; i < 16 && page * 16 + i < names.length; i++) {
      const name = names[page * 16 + i], left = i % 4 * 280, top = Math.floor(i / 4) * 205;
      composite.push({ input: await sharp(`${source}/${name}`).resize(276, 178, { fit: 'contain', background: '#392c48' }).png().toBuffer(), left, top });
      const label = `${page * 16 + i}: ${name}`.slice(0, 36).replace(/&/g, '&amp;');
      composite.push({ input: Buffer.from(`<svg width="278" height="26"><text x="4" y="17" fill="white" font-size="12">${label}</text></svg>`), left, top: top + 178 });
    }
    await sharp({ create: { width: 1120, height: 820, channels: 4, background: '#392c48' } }).composite(composite).png().toFile(`${output}/marketplace-${page}.png`);
  }
  fs.writeFileSync(`${output}/marketplace-index.json`, JSON.stringify(names, null, 2));
})();
