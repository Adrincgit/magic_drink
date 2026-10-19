import fs from 'node:fs/promises';
import sharp from 'sharp';
const dir='context/arcade/nightmare-pressure-v4',out='public/arcade/act-two/nightmare-pressure-v4',reg=JSON.parse(await fs.readFile(dir+'/registration.json','utf8')),report=[];
for(const [name,cels]of Object.entries(reg)){
 const hero=name==='hexy-ground'||name==='hexy-air',portrait=name.includes('portraits'),side=hero?320:portrait?640:512,img=sharp(out+'/'+name+'.webp'),m=await img.metadata();
 if(m.width!==side*4||m.height!==side*Math.ceil(cels.length/4)||!m.hasAlpha)throw Error(name+' invalid atlas dimensions/alpha');
 const nativeFrames=new Set();let smallest=1,largest=0;
 for(const [i,q]of cels.entries()){
  const {data}=await img.clone().extract({left:i%4*side,top:Math.floor(i/4)*side,width:side,height:side}).ensureAlpha().raw().toBuffer({resolveWithObject:true});let count=0,edge=0;
  for(let y=0;y<side;y++)for(let x=0;x<side;x++)if(data[(y*side+x)*4+3]>80){count++;if(x<2||y<2||x>=side-2||y>=side-2)edge++;}
  const density=count/side**2;smallest=Math.min(smallest,density);largest=Math.max(largest,density);
  if(edge||density<.04||density>.9)throw Error(name+' cell '+i+' alpha/edge/density failed');
  if(portrait&&q.scale>1)throw Error(name+' upscales portrait source');
  if(!portrait&&(!Number.isFinite(q.tip[0]+q.tip[1])||q.tip[0]<0||q.tip[0]>side||q.tip[1]<0||q.tip[1]>side))throw Error(name+' invalid star/palm');
  nativeFrames.add(q.source.file+':'+q.source.sourceFrame);
 }
 report.push({name,cells:cels.length,nativeFrames:nativeFrames.size,dimensions:[m.width,m.height],smallest,largest,alphaEdges:'clear',portraitUpscaling:false});
}
const meter=await sharp(out+'/meter.webp').metadata();if(!meter.hasAlpha||meter.width<1500)throw Error('Meter lacks native detail or transparency');
const result={runtimeCels:report.reduce((n,q)=>n+q.cells,0),meter:[meter.width,meter.height],report};await fs.writeFile(dir+'/art-check.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({runtimeCels:result.runtimeCels,atlases:report.length,meter:result.meter,alphaEdges:'clear',portraitUpscaling:false}));
