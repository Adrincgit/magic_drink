import fs from 'node:fs/promises';import sharp from 'sharp';
const root='public/arcade/act-two/nightmare-aerial-v3/',reg=JSON.parse(await fs.readFile('context/arcade/nightmare-aerial-v3/registration.json','utf8')),report=[];
for(const [name,frames] of Object.entries(reg)){
 const portrait=name.includes('portraits'),hero=name.startsWith('hexy-')&&!portrait,side=portrait?768:hero?320:512,cols=portrait?2:4,img=sharp(root+name+'.webp'),m=await img.metadata();
 if(m.width!==side*cols||m.height!==Math.ceil(frames.length/cols)*side||!m.hasAlpha)throw Error(name+' invalid atlas');
 let minOpaque=1,maxOpaque=0;for(let f=0;f<frames.length;f++){
  const {data}=await img.clone().extract({left:f%cols*side,top:Math.floor(f/cols)*side,width:side,height:side}).ensureAlpha().raw().toBuffer({resolveWithObject:true});let opaque=0,edge=0;
  for(let y=0;y<side;y++)for(let x=0;x<side;x++){if(data[(y*side+x)*4+3]>80){opaque++;if(x<2||y<2||x>=side-2||y>=side-2)edge++;}}
  const ratio=opaque/(side*side);if(ratio<.035||ratio>.83||edge)throw Error(name+' cell '+f+' alpha/edge failed '+ratio+'/'+edge);minOpaque=Math.min(minOpaque,ratio);maxOpaque=Math.max(maxOpaque,ratio);
  const q=frames[f];if(portrait&&q.scale>1)throw Error('Portrait upscale '+name);
 }
 report.push({name,cells:frames.length,size:[m.width,m.height],alpha:true,minOpaque,maxOpaque});
}
await fs.writeFile('context/arcade/nightmare-aerial-v3/art-check.json',JSON.stringify({totalCells:report.reduce((n,q)=>n+q.cells,0),report},null,2)+'\n');console.log(JSON.stringify({totalCells:report.reduce((n,q)=>n+q.cells,0),atlases:report.length,alphaEdges:'clear',portraitUpscaling:false}));
