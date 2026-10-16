import sharp from 'sharp';
const file='context/arcade/painted-machinery/sources/wind-flags.png',m=await sharp(file).metadata(),rows=[0,Math.round(m.height*.333),Math.round(m.height*.59),m.height],frames=[];
for(let row=0;row<3;row++)for(let col=0;col<4;col++){
 const left=Math.round(m.width*col/4),right=Math.round(m.width*(col+1)/4),top=rows[row],height=rows[row+1]-top;
 const crop=await sharp(file).extract({left,top,width:right-left,height}).ensureAlpha().raw().toBuffer({resolveWithObject:true});let x0=crop.info.width,y0=height,x1=0,y1=0;
 for(let y=0;y<height;y++)for(let x=0;x<crop.info.width;x++)if(crop.data[(y*crop.info.width+x)*4+3]>100){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}
 frames.push({row,col,crop,box:{left:x0,top:y0,width:x1-x0+1,height:y1-y0+1}});
}
for(const [name,start,count,w,h]of [['wind-flags-painted',0,8,256,160],['wind-tassels-painted',8,4,192,256]]){
 const seq=frames.slice(start,start+count),scale=Math.min((w-4)/Math.max(...seq.map(f=>f.box.width)),(h-4)/Math.max(...seq.map(f=>f.box.height))),layers=[];
 for(const f of seq){const iw=Math.round(f.box.width*scale),ih=Math.round(f.box.height*scale),input=await sharp(f.crop.data,{raw:f.crop.info}).extract(f.box).resize(iw,ih).png().toBuffer();layers.push({input,left:f.col*w+(name.includes('tassels')?Math.round((w-iw)/2):2),top:(f.row-(start===8?2:0))*h+2});}
 const out='public/arcade/sprites/props/'+name+'.webp';await sharp({create:{width:w*4,height:h*(count/4),channels:4,background:'#0000'}}).composite(layers).webp({quality:95,alphaQuality:100}).toFile(out);console.log(out);
}
