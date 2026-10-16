import {test,expect} from '@playwright/test';
import fs from 'node:fs/promises';
const dir='tests/artifacts/arcade/ribbon-transformation/';
test('painted Ribbon renders sip, launch, aerial bind/slam, guard and spinning Xbox dash',async({page})=>{
 test.setTimeout(120000);const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize({width:1280,height:720});
 await page.route('**/ribbon-dance-harness',route=>route.fulfill({contentType:'text/html',body:'<body style="margin:0;background:#211e2b"><canvas style="width:1280px;height:720px"></canvas></body>'}));await page.goto('/ribbon-dance-harness');
 await page.evaluate(async()=>{
  const base='/src/components/arcade/adventure/',{loadAdventureArt,renderAdventure}=await import(base+'render/adventureCanvas.js'),{createTrial,trialDemoInput}=await import(base+'engine/adventureTrial.js'),{stepAdventure}=await import(base+'engine/adventureModel.js'),{MODS}=await import(base+'engine/adventureMods.js'),{readAdventureGamepad}=await import(base+'input/adventureGamepad.js'),{hexyPose}=await import(base+'actors/hexy/hexyAnimation.js'),{takeLoot}=await import(base+'engine/adventureLoot.js');
  const art=await loadAdventureArt(),canvas=document.querySelector('canvas');
  window.dance={art,canvas,demo:trialDemoInput,takeLoot,captures:{},seen:new Set(),frames:[],create(level=1){this.s=createTrial(MODS.find(m=>m.id==='ribbon-duration'),level);this.s.player.x=300;this.s.time=0;for(const [i,e]of this.s.enemies.entries()){e.x=e.home=300+[170,260,330][i];e.y=e.baseY=480;e.hp=30;e.timer=e.recovery=99;e.practice=false;}},draw(){renderAdventure(canvas,this.s,art);const c=canvas.getContext('2d');c.save();c.setTransform(canvas.width/1280,0,0,canvas.height/720,0,0);c.fillStyle='#211323ed';c.fillRect(25,22,1230,70);c.fillStyle='#ffe4ed';c.font='bold 23px sans-serif';c.fillText(this.label||'Ribbon Raspberry',42,52);c.font='18px sans-serif';c.fillText('Danza: '+(this.s.ribbonDance?.remaining||0).toFixed(1)+' s',42,78);c.restore();},capture(name){if(!this.captures[name])this.captures[name]=canvas.toDataURL();},step(input){stepAdventure(this.s,input,1/120);this.draw();const p=this.s.player,pose=hexyPose(this.s);this.frames.push({pose,level:this.s.trial.level,time:this.s.time});
   if(p.drinkCast>.2&&p.drinkCast<.35)this.capture('01-sorbo');
   if(this.s.enemies.some(e=>e.ribbonLift&&e.vy< -100)){this.capture('02-lanzamiento');this.seen.add('launch');}
   if(this.s.enemies.some(e=>e.ribbonControl?.kind==='airbind')){this.capture('03-amarre-aereo');this.seen.add('airbind');}
   if(this.s.events.includes('ribbonGroundImpact')){this.capture('04-remate');this.seen.add('slam');}
   if(p.guarding&&p.guardAge>.25){this.capture('05-guardia');this.seen.add('guard');}
   if(p.dash>0&&pose.sheet==='ribbon-spin'&&pose.frame===4){this.capture('06-dash-giratorio');this.seen.add('dash');}
   if(this.s.shots.some(q=>q.ribbonReflected)){this.capture('07-proyectil-devuelto');this.seen.add('reflect');}
   if(pose.sheet==='ribbon-mastery'&&pose.frame===10)this.capture('08-salto-giratorio');
   if(p.ribbonMasterMove==='wand-toss'&&pose.frame===2){this.capture('09-varita-lanzada');this.seen.add('toss');}
   if(p.ribbonMasterMove==='reel-slam'&&pose.frame===6){this.capture('10-recogida-pierna');this.seen.add('reel');}
   if(this.s.overdrive>0&&p.drinkCast>.2&&p.drinkCast<.3)this.capture('11-original');
   if(p.ribbonCharge?.age>.55)this.capture('12-carga');
  },pad(buttons){return readAdventureGamepad({connected:true,mapping:'standard',axes:[0,0],buttons:Array.from({length:17},(_,i)=>({pressed:buttons.includes(i),value:buttons.includes(i)?1:0}))});}};
  const h=dance;h.create();h.draw();const chunks=[];h.rec=new MediaRecorder(canvas.captureStream(60),{mimeType:'video/webm;codecs=vp9',videoBitsPerSecond:6000000});h.rec.ondataavailable=e=>chunks.push(e.data);h.rec.onstop=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(chunks,{type:'video/webm'}));a.download='ribbon-dance.webm';a.click();};h.rec.start();
 });
 await page.evaluate(async()=>{
  const h=dance;
  for(const mode of ['combo','defense','mastery','wand-toss','reel-slam','sweep','jump','charge-x','charge-y','original']){
   h.create(['combo','defense'].includes(mode)?1:4);h.s.trial.ribbonDemo=mode;if(mode==='original')h.takeLoot(h.s,{type:'original'});h.label=mode==='combo'?'X, Y → salto + Y · Lanzar, amarrar y rematar':mode==='defense'?'Dash giratorio · daño al atravesar · devolver proyectiles':'Coreografía IV · '+mode;
   if(mode==='defense')for(const [i,e]of h.s.enemies.entries()){e.x=e.home=380+i*80;}
   let last=await new Promise(requestAnimationFrame),lag=0;
   while(h.s.time<4.3){const now=await new Promise(requestAnimationFrame);lag+=Math.min(.05,(now-last)/1000);last=now;
    while(lag>=1/120){const t=h.s.time,tap=n=>t>=n&&t<n+.035,buttons=[];
     if(mode==='combo'){
      if(tap(.85))buttons.push(2);if(tap(1.03)||tap(1.72))buttons.push(3);if(t>1.4&&t<1.9)buttons.push(0);if(t>1.4&&t<1.62)buttons.push(15);
     }else if(mode==='defense'){
      if(tap(.9))buttons.push(1);if(t>2.1&&t<3.6)buttons.push(6);
      if(!h.injected){h.injected=true;h.s.hostile.push({kind:'streamer',x:625,y:442,vx:-185,vy:0,life:5,age:0,r:8});}
      if(t>2.35&&!h.second){h.second=true;h.s.hostile.push({kind:'streamer',x:h.s.player.x+95,y:442,vx:-185,vy:0,life:3,age:0,r:8});}
     }else if(mode==='mastery'){if(tap(.8)||tap(1.15))buttons.push(2);if(tap(1.65))buttons.push(0);if(tap(1.87)||tap(2.25))buttons.push(1);if(tap(3.35))buttons.push(3);}
     else if(['wand-toss','reel-slam','sweep'].includes(mode)){const input=h.demo(h.s);if(input.attack)buttons.push(2);if(input.special)buttons.push(3);}
     else if(mode==='jump'){if(t>.9&&t<1.5)buttons.push(0);}
     else if(mode==='charge-x'||mode==='charge-y'){if(t>.9&&t<1.65)buttons.push(mode==='charge-x'?2:3);}
     h.step(h.pad(buttons));lag-=1/120;
    }h.draw();
   }
  }
 });
 const download=page.waitForEvent('download');await page.evaluate(()=>dance.rec.stop());await fs.mkdir(dir,{recursive:true});await(await download).saveAs(dir+'ribbon-dance.webm');
 const r=await page.evaluate(()=>({seen:[...dance.seen],captures:dance.captures,frames:dance.frames}));for(const [name,data]of Object.entries(r.captures))await fs.writeFile(dir+name+'.png',Buffer.from(data.split(',')[1],'base64'));
 await fs.writeFile(dir+'frames.json',JSON.stringify(r.frames));expect(r.seen.sort()).toEqual(['airbind','dash','guard','launch','reel','reflect','slam','toss']);expect(errors).toEqual([]);
});
