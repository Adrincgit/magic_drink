import fs from 'node:fs';
import sharp from 'sharp';
const root='context/arcade/halloween-5-1/revision-2/',out='public/arcade/maps/halloween/';
const records={};
async function bounds(file,region){
 const {data,info}=await sharp(file).extract(region).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 let x0=info.width,y0=info.height,x1=0,y1=0;
 for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++)if(data[(y*info.width+x)*4+3]>60){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
 return{left:region.left+x0,top:region.top+y0,width:x1-x0+1,height:y1-y0+1};
}
for(const [name,file]of [['cemetery','cemetery-bank-v2'],['floor','cemetery-path-v2'],['gate','gate-complete-v2']]){
 const source=root+'sources/'+(name==='gate'&&fs.existsSync(root+'sources/gate-clean.png')?'gate-clean':name)+'.png';
 await sharp(source).webp({quality:94,alphaQuality:100}).toFile(out+file+'.webp');
}
// Atlas bands are measured independently; their roots and own earth remain
// in one bitmap, so camera projection cannot detach the tree from its bank.
const file=root+'sources/layers.png',m=await sharp(file).metadata(),cuts=[0,316,526,732,1086],names=['clouds','mountains','woods','bank'];
for(let i=0;i<4;i++){
 const q=await bounds(file,{left:0,top:cuts[i],width:m.width,height:cuts[i+1]-cuts[i]});
 await sharp(file).extract(q).webp({quality:94,alphaQuality:100}).toFile(out+'depth-'+names[i]+'-v2.webp');records[names[i]]=q;
}
for(const [name,cols,rows,cell,fileName,maxHeight]of [['crypt',2,2,512,'crypt-side-v2',470],['arm',4,1,256,'grave-arm-v2',220]]){
 const source=root+'sources/'+name+'.png',m=await sharp(source).metadata(),boxes=[];
 for(let i=0;i<cols*rows;i++){const left=Math.floor(i%cols*m.width/cols),top=Math.floor(Math.floor(i/cols)*m.height/rows);boxes.push(await bounds(source,{left,top,width:Math.floor((i%cols+1)*m.width/cols)-left,height:Math.floor((Math.floor(i/cols)+1)*m.height/rows)-top}));}
 const k=Math.min((cell-30)/Math.max(...boxes.map(q=>q.width)),maxHeight/Math.max(...boxes.map(q=>q.height))),layers=[];
 records[name]=[];
 for(const [i,q]of boxes.entries()){const w=Math.round(q.width*k),h=Math.round(q.height*k),x=i%cols*cell+Math.round(cell/2-w/2),y=Math.floor(i/cols)*cell+cell-8-h;layers.push({input:await sharp(source).extract(q).resize(w,h).png().toBuffer(),left:x,top:y});records[name].push({x,y,w,h,source:q});}
 await sharp({create:{width:cols*cell,height:rows*cell,channels:4,background:'#00000000'}}).composite(layers).webp({quality:97,alphaQuality:100}).toFile(out+fileName+'.webp');
}
fs.writeFileSync(root+'registration.json',JSON.stringify(records,null,2)+'\n');
console.log('Packed nine landscape/prop sheets with original alpha and shared animation scale.');
