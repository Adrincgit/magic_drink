import { FLOOR, poseFor } from './runnerModel';
const files={bunny:'/arcade/sprites/bunnies/bunny-atlas.webp',city:'/arcade/maps/waterfront/background.webp',hexy:'/image/hexy/world-v47/hexy-front.webp',hall:'/image/hexy/world-v46/hall.webp'};
export async function loadRunnerArt() {
  const entries=await Promise.all(Object.entries(files).map(([key,src])=>new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve([key,image]);image.onerror=()=>reject(new Error('Artwork unavailable'));image.src=src;})));
  return Object.fromEntries(entries);
}
function star(ctx,x,y,r,fill='#ffdf7b') {
  ctx.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.45:r;ctx.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}ctx.closePath();ctx.fillStyle=fill;ctx.fill();ctx.lineWidth=2;ctx.strokeStyle='#90513f';ctx.stroke();
}
function round(ctx,x,y,w,h,r,fill,stroke='#523255'){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();ctx.strokeStyle=stroke;ctx.lineWidth=3;ctx.stroke();}
function obstacle(ctx,o) {
  const x=o.x-o.w/2,y=FLOOR-o.h;
  ctx.fillStyle='#33213c38';ctx.beginPath();ctx.ellipse(o.x,FLOOR+4,o.w*.7,7,0,0,Math.PI*2);ctx.fill();
  if(o.type===0){round(ctx,x,y,o.w,o.h,9,'#97679e');round(ctx,x-3,y+6,o.w+6,10,4,'#e3bc80');star(ctx,o.x,y+33,11);}
  else if(o.type===1){round(ctx,x,y+9,o.w,o.h-9,5,'#82508f');ctx.strokeStyle='#edb27a';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(o.x,y+10);ctx.quadraticCurveTo(o.x-23,y-26,o.x-34,y-13);ctx.moveTo(o.x,y+10);ctx.quadraticCurveTo(o.x+23,y-26,o.x+33,y-9);ctx.stroke();star(ctx,o.x-28,y-10,11,'#ed96c9');star(ctx,o.x+26,y-9,12,'#ffc784');}
  else{round(ctx,x,y,o.w,o.h,7,'#f0cb9c');ctx.fillStyle='#9f4e92';ctx.fillRect(o.x-5,y,10,o.h);ctx.fillRect(x,y+18,o.w,8);ctx.beginPath();ctx.ellipse(o.x-9,y-3,11,6,-.4,0,Math.PI*2);ctx.ellipse(o.x+9,y-3,11,6,.4,0,Math.PI*2);ctx.fill();}
}
export function renderRunner(canvas,run,art,{idle=false,reduced=false,equipped='plain'}={}) {
  const ctx=canvas.getContext('2d'),w=run.width,h=540,dpr=Math.min(window.devicePixelRatio||1,2);
  const cw=canvas.clientWidth,ch=canvas.clientHeight;
  if(canvas.width!==Math.round(cw*dpr)||canvas.height!==Math.round(ch*dpr)){canvas.width=Math.round(cw*dpr);canvas.height=Math.round(ch*dpr);}
  ctx.setTransform(canvas.width/w,0,0,canvas.height/h,0,0);ctx.clearRect(0,0,w,h);
  const bgWidth=810,travel=reduced?0:run.distance*.16,offset=travel%bgWidth,first=Math.floor(travel/bgWidth);
  for(let i=-1;i<Math.ceil(w/bgWidth)+1;i++){
    const x=i*bgWidth-offset;ctx.save();
    if((i+first)%2){ctx.translate(x+bgWidth,0);ctx.scale(-1,1);}else ctx.translate(x,0);
    ctx.drawImage(art.city,0,0,art.city.width,art.city.height*.80,0,-60,bgWidth,FLOOR+60);ctx.restore();
  }
  const wash=ctx.createLinearGradient(0,0,0,540);wash.addColorStop(0,'#432b631c');wash.addColorStop(.7,'#6d337b00');wash.addColorStop(1,'#522c6a80');ctx.fillStyle=wash;ctx.fillRect(0,0,w,h);
  // Foreground rails travel with the ground; distant city moves more slowly.
  if(run.time>=19&&run.time<40){const shift=run.distance%180;ctx.fillStyle='#9f79a5';ctx.fillRect(0,355,w,15);ctx.strokeStyle='#d7b17f';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(0,355);ctx.lineTo(w,355);ctx.stroke();for(let i=-1;i<w/180+1;i++){ctx.fillStyle='#6b507d';ctx.fillRect(i*180-shift,370,14,60);}}
  if(run.time>39){const shift=(run.distance*.65)%400;for(let i=-1;i<w/400+1;i++){const x=i*400-shift;ctx.strokeStyle='#b98474';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,110);ctx.quadraticCurveTo(x+200,205,x+400,110);ctx.stroke();for(let j=1;j<5;j++){star(ctx,x+j*80,145+Math.sin(j/5*Math.PI)*25,9,'#ffe3a5');}}}
  if(run.time>53){
    ctx.save();ctx.globalAlpha=Math.min(1,(run.time-53)/4);
    const sky=ctx.createLinearGradient(0,0,0,FLOOR);sky.addColorStop(0,'#63467d');sky.addColorStop(1,'#f7b4b9');ctx.fillStyle=sky;ctx.fillRect(0,0,w,FLOOR);
    ctx.drawImage(art.hall,0,770,art.hall.width,art.hall.height-770,0,0,w,FLOOR+90);
    ctx.fillStyle='#52275260';ctx.beginPath();ctx.ellipse(w*.65,FLOOR+2,35,7,0,0,Math.PI*2);ctx.fill();
    ctx.drawImage(art.hexy,w*.65-82,FLOOR-245,164,246);ctx.restore();
  }
  const ground=ctx.createLinearGradient(0,FLOOR,0,h);ground.addColorStop(0,'#c791af');ground.addColorStop(1,'#765079');ctx.fillStyle=ground;ctx.fillRect(0,FLOOR,w,h-FLOOR);
  ctx.fillStyle='#f4c77e';ctx.fillRect(0,FLOOR,w,5);ctx.fillStyle='#604061';ctx.fillRect(0,FLOOR+5,w,4);
  const tileOffset=run.distance%100;ctx.strokeStyle='#edbba444';ctx.lineWidth=2;
  for(let row=0;row<3;row++){ctx.beginPath();ctx.moveTo(0,465+row*36);ctx.lineTo(w,465+row*36);ctx.stroke();for(let x=-100;x<w+100;x+=100){ctx.beginPath();ctx.moveTo(x-tileOffset+(row%2)*50,430+row*36);ctx.lineTo(x-tileOffset+(row%2)*50-15,466+row*36);ctx.stroke();}}
  for(const o of run.objects){if(o.kind==='obstacle')obstacle(ctx,o);else star(ctx,o.x,o.y,o.r,'#ffe79d');}
  const px=w*.2,size=138,frame=idle?8:poseFor(run);
  ctx.fillStyle='#472a5c50';ctx.beginPath();ctx.ellipse(px,FLOOR+7,40+run.y*.07,8,0,0,Math.PI*2);ctx.fill();
  ctx.save();if(run.hurt>0&&Math.floor(run.time*12)%2&&!reduced)ctx.globalAlpha=.55;
  ctx.drawImage(art.bunny,(frame%4)*256,Math.floor(frame/4)*256,256,256,px-size/2,FLOOR+run.y-size+4,size,size);
  if(equipped==='crown'){star(ctx,px+7,FLOOR+run.y-size+19,15);star(ctx,px-9,FLOOR+run.y-size+28,9);}
  if(equipped==='scarf'){ctx.fillStyle='#e35daa';ctx.beginPath();ctx.moveTo(px-9,FLOOR+run.y-52);ctx.lineTo(px-49,FLOOR+run.y-64);ctx.lineTo(px-42,FLOOR+run.y-42);ctx.lineTo(px,FLOOR+run.y-43);ctx.fill();}
  ctx.restore();
  if(equipped==='comet'&&!idle)for(let i=1;i<5;i++)star(ctx,px-34-i*20,FLOOR+run.y-20+Math.sin(run.time*5+i)*8,7-i,'#99e7ef');
  for(const p of run.particles){ctx.globalAlpha=Math.min(1,p.life*3);star(ctx,p.x,p.y,5,'#fff2c6');}ctx.globalAlpha=1;
  if(run.won){
    for(const x of [w*.55,w*.82])ctx.drawImage(art.bunny,512,512,256,256,x-48,FLOOR-92,96,96);
    for(let i=0;i<24;i++)star(ctx,(i*139+45)%w,50+(i*63)%270,4+i%3,i%2?'#ffc3d5':'#ffe38e');
  }
  // Paint a little theatrical frame into the world, keeping controls in HTML.
  ctx.strokeStyle='#f7d39b33';ctx.lineWidth=2;ctx.strokeRect(9,9,w-18,h-18);
}
