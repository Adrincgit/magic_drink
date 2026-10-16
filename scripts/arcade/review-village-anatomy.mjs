import fs from 'node:fs';
import {chromium} from '@playwright/test';
const folder='tests/artifacts/arcade/village-anatomy-fix/';
fs.mkdirSync(folder,{recursive:true});
const browser=await chromium.launch({channel:'chrome'});
const watchdog=setTimeout(()=>{console.error('Animation review exceeded 45 seconds.');void browser.close();},45000);
try{
 const page=await browser.newPage({viewport:{width:1440,height:600}}),errors=[];
 page.on('console',m=>{if(m.text().startsWith('Anatomy:'))console.log(m.text());});
 page.on('pageerror',e=>{errors.push(e.message);console.error(e.message);});
 await page.goto(process.env.MAGIC_DRINK_TEST_URL||'http://127.0.0.1:4321');
 const result=await page.evaluate(async()=>{
  const root='/src/components/arcade/adventure/';
  const [{drawVillagers},{stepBlockedVillager}]=await Promise.all([import(root+'render/villageCanvas.js'),import(root+'engine/villageBlockedCrowd.js')]);
  const art={};await Promise.all(['climb-children','climb-elders','warning'].map(async name=>{
   const img=new Image();img.src='/arcade/sprites/enemies/village-'+name+'-v10.webp';await img.decode();art['village-'+name+'-v10']=img;
  }));
  console.log('Anatomy: three atlases loaded.');
  const canvas=document.createElement('canvas');canvas.width=1440;canvas.height=600;canvas.style='position:fixed;inset:0;width:1440px;height:600px';document.body.append(canvas);
  const ctx=canvas.getContext('2d'),s={camera:{x:0,zoom:1},villageDust:[],villagers:[
   {style:2,x:125,y:260,state:'flee',blocked:true,blockedAge:1,blockedBy:'child',blockadeOrder:0},
   {style:4,x:355,y:260,state:'flee',blocked:true,blockedAge:1,blockedBy:'elder',blockadeOrder:0},
   {style:0,x:590,y:260,state:'warning',age:0}
  ],villageObstacles:[{id:'child',x:85,w:10},{id:'elder',x:315,w:10}]};
  const paint=()=>{ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#30333e';ctx.fillRect(0,0,1440,600);ctx.scale(2,2);drawVillagers(ctx,s,art,false);};
  s.villagers[0].blockedFrame=4;s.villagers[1].blockedFrame=4;s.villagers[2].age=.3;paint();const still=canvas.toDataURL('image/png').split(',')[1];
  s.villagers[0].blockedAge=2.1;s.villagers[1].blockedAge=2.1;
  const chunks=[],stream=canvas.captureStream(60),rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:6000000});
  const video=new Promise(resolve=>{rec.ondataavailable=e=>chunks.push(e.data);rec.onstop=()=>{const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]);r.readAsDataURL(new Blob(chunks,{type:'video/webm'}));};});
  let start,last;const visited=[new Set(),new Set(),new Set()];rec.start();
  await new Promise((resolve,reject)=>{const tick=now=>{try{start??=now;last??=now;const dt=Math.min(.05,(now-last)/1000);last=now;
   for(const [i,n] of s.villagers.entries()){n.y=260;if(i<2){stepBlockedVillager(s,n,dt);visited[i].add(n.blockedFrame);}else{n.age=((now-start)/1000)%.85;visited[i].add(Math.min(3,Math.floor(n.age/.85*4)));}}
   paint();if(now-start<5200)requestAnimationFrame(tick);else resolve();}catch(e){reject(e);}};requestAnimationFrame(tick);});
  rec.stop();const encoded=await video;stream.getTracks().forEach(t=>t.stop());
  console.log('Anatomy: recording complete.');
  const v=document.createElement('video');v.muted=true;v.src='data:video/webm;base64,'+encoded;await new Promise(resolve=>v.onloadeddata=resolve);
  if(!Number.isFinite(v.duration))await new Promise(resolve=>{v.onseeked=resolve;v.currentTime=10000;});
  console.log('Anatomy: video duration '+v.duration);
  const montage=document.createElement('canvas');montage.width=1440;montage.height=800;const m=montage.getContext('2d');
  for(let i=0;i<12;i++){await new Promise(resolve=>{v.onseeked=resolve;v.currentTime=.1+(v.duration-.2)*i/11;});m.drawImage(v,i%3*480,Math.floor(i/3)*200,480,200);}
  return{video:encoded,still,montage:montage.toDataURL('image/png').split(',')[1],frames:visited.map(q=>[...q].sort())};
 });
 for(const [name,key] of [['cycles.webm','video'],['corrected-poses.png','still'],['cycles-motion.png','montage']])fs.writeFileSync(folder+name,Buffer.from(result[key],'base64'));
 if(errors.length||result.frames.some((q,i)=>q.length!==(i<2?8:4)))throw Error(JSON.stringify({errors,frames:result.frames}));
 fs.writeFileSync(folder+'review.json',JSON.stringify({frames:result.frames,errors,renderer:'Production drawVillagers; production blocked-pose clock; isolated presentation without gameplay collision.'},null,2)+'\n');
 console.log('Recorded and decoded all eight child/elder climbing poses and four baker warning poses. No page errors.');
}finally{clearTimeout(watchdog);await browser.close();}
