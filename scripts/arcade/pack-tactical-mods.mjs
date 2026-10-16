import fs from 'node:fs/promises';
import sharp from 'sharp';
const {jobs}=JSON.parse(await fs.readFile('context/arcade/tactical-mods/art.json','utf8'));
for(const job of jobs)await sharp(job.source).trim({threshold:12}).resize(384,384,{fit:'inside'}).webp({quality:92}).toFile(job.output);
