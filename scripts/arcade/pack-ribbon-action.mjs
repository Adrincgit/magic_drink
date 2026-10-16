import sharp from 'sharp';
import fs from 'node:fs/promises';
const root='C:/Users/cabra/.codex/generated_images/01a0b82d-f99d-7130-97af-f2af843b8646/';
const actor=root+'exec-00771b0f-7ec8-472b-a721-c5b1a5c40bfc.png';
const effect=root+'exec-8695d72d-90cf-43d1-8d2a-72b982e814cc.png';
const hips=[177,525,870,1225,183,515,879,1225,173,523,893,1230,200,540,879,1230];
const feet=[282,282,281,282,568,568,566,568,856,864,866,855,1113,1115,1117,1119];
const tips=[[76,64],[625,189],[1017,160],[1324,188],[291,482],[637,345],[1003,316],[1330,499],[99,653],[503,591],[841,589],[1319,711],[320,1075],[646,1062],[978,1050],[1321,1029]];
// Neighbouring cels have a few overlapping gutter pixels. Keep the connected
// actor, including its antialiased edge, rather than copying the next cel's star.
async function actorCrop(file,rect){
 const {data,info}=await sharp(file).extract(rect).ensureAlpha().raw().toBuffer({resolveWithObject:true}),w=info.width,h=info.height,n=w*h,labels=new Int32Array(n),queue=new Int32Array(n);let id=0,best=0,bestSize=0;
 for(let seed=0;seed<n;seed++)if(!labels[seed]&&data[seed*4+3]>8){
  id++;let head=0,tail=1;queue[0]=seed;labels[seed]=id;
  while(head<tail){const p=queue[head++],x=p%w,y=Math.floor(p/w);for(const [dx,dy]of [[-1,0],[1,0],[0,-1],[0,1]]){const xx=x+dx,yy=y+dy,k=yy*w+xx;if(xx>=0&&xx<w&&yy>=0&&yy<h&&!labels[k]&&data[k*4+3]>8){labels[k]=id;queue[tail++]=k;}}}
  if(tail>bestSize){bestSize=tail;best=id;}
 }
 for(let k=0;k<n;k++)if(labels[k]!==best){const x=k%w,y=Math.floor(k/w);let edge=false;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(x+dx>=0&&x+dx<w&&y+dy>=0&&y+dy<h&&labels[(y+dy)*w+x+dx]===best)edge=true;if(!edge)data[k*4+3]=0;}
 return sharp(data,{raw:info});
}
const xs=[0,358,690,1053,1374],starts=[0,285,558,863],ends=[287,576,873,1145],scale=.85,layers=[],atlas=[];
for(let i=0;i<16;i++){
 const col=i%4,row=Math.floor(i/4),left=xs[col],top=starts[row],width=xs[col+1]-left,height=ends[row]-top;
 const w=Math.round(width*scale),h=Math.round(height*scale),dx=Math.round(160-(hips[i]-left)*scale),dy=Math.round(300-(feet[i]-top)*scale),cx=Math.max(0,-dx),cy=Math.max(0,-dy);
 const input=await(await actorCrop(actor,{left,top,width,height})).resize(w,h).extract({left:cx,top:cy,width:Math.min(w-cx,320-Math.max(0,dx)),height:Math.min(h-cy,320-Math.max(0,dy))}).png().toBuffer();
 layers.push({input,left:col*320+Math.max(0,dx),top:row*320+Math.max(0,dy)});
 atlas.push({tip:[Math.round(160+(tips[i][0]-hips[i])*scale),Math.round(300+(tips[i][1]-feet[i])*scale)]});
}
await sharp({create:{width:1280,height:1280,channels:4,background:'#00000000'}}).composite(layers).webp({quality:96}).toFile('public/arcade/sprites/hexy/ribbon-action.webp');
await fs.writeFile('src/components/arcade/adventure/actors/hexy/hexyRibbonActionAtlas.js','// Two-handed whip poses; feet registered at y=300, hand-measured star tips.\nexport default '+JSON.stringify(atlas)+';\n');
const spin=root+'exec-43bf5b0a-274a-4710-819c-ea4d5feb5484.png',sm=await sharp(spin).metadata(),spinLayers=[],spinAtlas=[];
const spinHips=[210,670,1107,1534,225,646,1095,1547],spinFeet=[423,425,421,425,846,849,848,849],spinTips=[[409,228],[808,153],[948,192],[1405,170],[48,650],[496,684],[1258,642],[1730,656]],ss=.62;
for(let i=0;i<8;i++){
 const col=i%4,row=Math.floor(i/4),left=Math.round(col*sm.width/4),top=Math.round(row*sm.height/2),width=Math.round((col+1)*sm.width/4)-left,height=Math.round((row+1)*sm.height/2)-top;
 const w=Math.round(width*ss),h=Math.round(height*ss),dx=Math.round(160-(spinHips[i]-left)*ss),dy=Math.round(300-(spinFeet[i]-top)*ss),cx=Math.max(0,-dx),cy=Math.max(0,-dy);
 spinLayers.push({input:await sharp(spin).extract({left,top,width,height}).resize(w,h).extract({left:cx,top:cy,width:Math.min(w-cx,320-Math.max(0,dx)),height:Math.min(h-cy,320-Math.max(0,dy))}).png().toBuffer(),left:col*320+Math.max(0,dx),top:row*320+Math.max(0,dy)});
 spinAtlas.push({tip:[Math.round(160+(spinTips[i][0]-spinHips[i])*ss),Math.round(300+(spinTips[i][1]-spinFeet[i])*ss)]});
}
await sharp({create:{width:1280,height:640,channels:4,background:'#00000000'}}).composite(spinLayers).webp({quality:96}).toFile('public/arcade/sprites/hexy/ribbon-spin.webp');
await fs.writeFile('src/components/arcade/adventure/actors/hexy/hexyRibbonSpinAtlas.js','// Full turn, all eight views; fixed foot pivot and registered wand tips.\nexport default '+JSON.stringify(spinAtlas)+';\n');
const fx=[],m=await sharp(effect).metadata();
for(let i=0;i<8;i++){
 const col=i%4,row=Math.floor(i/4),left=Math.round(col*m.width/4),top=Math.round(row*m.height/2),width=Math.round((col+1)*m.width/4)-left,height=Math.round((row+1)*m.height/2)-top;
 fx.push({input:await sharp(effect).extract({left,top,width,height}).resize(320,320).png().toBuffer(),left:col*320,top:row*320});
}
await sharp({create:{width:1280,height:640,channels:4,background:'#00000000'}}).composite(fx).webp({quality:96}).toFile('public/arcade/sprites/effects/ribbon-slam.webp');
const binding=root+'exec-fcea5b1a-98fe-463a-91e2-f9b8c785451c.png',bm=await sharp(binding).metadata(),bindLayers=[];
for(let i=0;i<8;i++){
 const col=i%4,row=Math.floor(i/4),left=Math.round(col*bm.width/4),width=Math.round((col+1)*bm.width/4)-left;
 bindLayers.push({input:await sharp(binding).extract({left,top:row?565:0,width,height:row?230:530}).resize(320,320).png().toBuffer(),left:col*320,top:row*320});
}
await sharp({create:{width:1280,height:640,channels:4,background:'#00000000'}}).composite(bindLayers).webp({quality:96}).toFile('public/arcade/sprites/effects/ribbon-bind.webp');
console.log('Packed Ribbon body actions, full turn, impact and binding atlases.');
