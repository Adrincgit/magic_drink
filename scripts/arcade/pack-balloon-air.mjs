import fs from 'node:fs/promises';
import sharp from 'sharp';
const dir='context/arcade/balloon-air-restart/';
const source=dir+'air-source.png';
if(process.argv[2])await fs.copyFile(process.argv[2],source);
const {width,height}=await sharp(source).metadata();
const {data,info}=await sharp(source).ensureAlpha().raw().toBuffer({resolveWithObject:true});
const frames=[],layers=[],cellWidth=512,cellHeight=384,root=[20,212];
for(let i=0;i<8;i++){
 const col=i%4,row=Math.floor(i/4),x0=Math.floor(col*width/4),x1=Math.floor((col+1)*width/4),y0=Math.floor(row*height/2),y1=Math.floor((row+1)*height/2);
 let left=width,top=height,right=0,bottom=0;
 for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)if(data[(y*width+x)*4+3]>32){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);}
 let weighted=0,weight=0;
 for(let y=top;y<=bottom;y++)for(let x=left;x<=left+6;x++){const a=data[(y*width+x)*4+3];if(a>32){weighted+=y*a;weight+=a;}}
 const rootY=Math.round(weighted/weight),crop={left:Math.max(x0,left-4),top:Math.max(y0,top-4),width:0,height:0};
 crop.width=Math.min(x1,right+5)-crop.left;crop.height=Math.min(y1,bottom+5)-crop.top;
 const dx=root[0]-(left-crop.left),dy=root[1]-(rootY-crop.top);
 if(dx<0||dy<0||dx+crop.width>cellWidth||dy+crop.height>cellHeight)throw Error('Air frame exceeds cell '+i);
 layers.push({input:await sharp(source).extract(crop).png().toBuffer(),left:col*cellWidth+dx,top:row*cellHeight+dy});
 frames.push({crop,sourceRoot:[left,rootY]});
}
await sharp({create:{width:cellWidth*4,height:cellHeight*2,channels:4,background:'#0000'}}).composite(layers).webp({lossless:true}).toFile('public/arcade/sprites/effects/balloon-air-v1.webp');
await fs.writeFile(dir+'air-registration.json',JSON.stringify({cellWidth,cellHeight,root,frames},null,2));
console.log('Packed eight registered air jets.');
