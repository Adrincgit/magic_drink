import sharp from 'sharp';
const source='context/arcade/riverwoods-polish/clown-zeppelin-source.webp';
const out='public/arcade/sprites/enemies/';
const meta=await sharp(source).metadata();
// The rear propeller is isolated at native resolution. Keeping the full
// canvas for the hull preserves muzzle and pilot registration while it spins.
const hull=await sharp(source).extract({left:80,top:0,width:meta.width-80,height:meta.height}).toBuffer();
await sharp({create:{width:meta.width,height:meta.height,channels:4,background:'#00000000'}})
 .composite([{input:hull,left:80,top:0}]).webp({quality:95,alphaQuality:100}).toFile(out+'clown-zeppelin.webp');
await sharp(source).extract({left:0,top:107,width:80,height:298})
 .webp({quality:95,alphaQuality:100}).toFile(out+'zeppelin-propeller.webp');
