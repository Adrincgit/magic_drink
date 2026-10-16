import sharp from 'sharp';
const src='context/arcade/ember-fort/sources/',out='public/arcade/sprites/bosses/ember-fort/';
// Preserve the shared scale of the four damage states; align their feet.
const wall=[];
for(let i=0;i<4;i++)wall.push({input:await sharp(src+'bulwark.png').extract({left:i%2*627,top:Math.floor(i/2)*627,width:627,height:627}).extend({top:i>1?28:0,bottom:i>1?0:28,left:0,right:0,background:'#0000'}).resize(512,535).png().toBuffer(),left:i%2*512,top:Math.floor(i/2)*535});
await sharp({create:{width:1024,height:1070,channels:4,background:'#0000'}}).composite(wall).webp({lossless:true}).toFile(out+'bulwark.webp');
// Register the fixed jamb and threshold; the generated sheet drifts in x.
const gates=[],bounds=[[14,529],[11,527],[7,528],[4,529]];
for(let i=0;i<4;i++){
 const [x,w]=bounds[i];gates.push({input:await sharp(src+'grand-gate.png').extract({left:i*543+x,top:23,width:w,height:616}).resize(384,384,{fit:'fill'}).png().toBuffer(),left:i*384,top:0});
}
await sharp({create:{width:1536,height:384,channels:4,background:'#0000'}}).composite(gates).webp({lossless:true}).toFile(out+'grand-gate.webp');
console.log('Packed registered bulwark damage and main gate opening.');
