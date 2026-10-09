import fs from 'node:fs';
import sharp from 'sharp';
const spec=JSON.parse(fs.readFileSync('context/arcade/grand-harlequin/entrance-art.json','utf8'));
await sharp(spec.source).webp({quality:93,alphaQuality:100}).toFile(spec.output);
console.log(spec.output);
