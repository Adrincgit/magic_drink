import {test,expect} from '@playwright/test';

test('Echo follows and fires in sync through Xbox input, stays quiet on release and disappears on Y',async({page})=>{
 test.setTimeout(90000);const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize({width:960,height:540});
 await page.route('**/echo-sync-harness',route=>route.fulfill({contentType:'text/html',body:'<body style="margin:0;background:#211e2b"><canvas style="width:960px;height:540px"></canvas></body>'}));await page.goto('/echo-sync-harness');
 await page.evaluate(async()=>{
  const base='/src/components/arcade/adventure/',{loadAdventureArt,renderAdventure}=await import(base+'render/adventureCanvas.js'),{createTrial}=await import(base+'engine/adventureTrial.js'),{stepAdventure}=await import(base+'engine/adventureModel.js'),{MODS}=await import(base+'engine/adventureMods.js'),{readAdventureGamepad}=await import(base+'input/adventureGamepad.js');
  const art=await loadAdventureArt(),canvas=document.querySelector('canvas'),s=createTrial(MODS.find(m=>m.id==='starter-8'));s.enemies=[];s.supplies=[];
  window.echoTest={s,canvas,frames:[],run(buttons=[]){const input=readAdventureGamepad({connected:true,mapping:'standard',axes:[0,0],buttons:Array.from({length:17},(_,i)=>({pressed:buttons.includes(i),value:buttons.includes(i)?1:0}))});stepAdventure(s,input,1/120);const fresh=s.shots.filter(q=>q.age<.01);this.frames.push({t:s.time,attack:input.attack,ammo:s.ammo,clones:s.drinkFields.length,playerX:s.player.x,cloneX:s.drinkFields[0]?.x,main:fresh.filter(q=>!q.echoCopy).length,copies:fresh.filter(q=>q.echoCopy).length});},render(){renderAdventure(canvas,s,art);}};
  const chunks=[],rec=new MediaRecorder(canvas.captureStream(30),{mimeType:'video/webm;codecs=vp9'});rec.ondataavailable=e=>chunks.push(e.data);rec.onstop=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(chunks,{type:'video/webm'}));a.download='echo-sync.webm';a.click();};echoTest.rec=rec;echoTest.render();rec.start();
 });
 await page.evaluate(async()=>{
  let last=await new Promise(requestAnimationFrame),lag=0;
  while(echoTest.s.time<5.6){const now=await new Promise(requestAnimationFrame);lag+=Math.min(.05,(now-last)/1000);last=now;
   while(lag>=1/120){const t=echoTest.s.time,buttons=[];if(t<.3||t>=5&&t<5.12)buttons.push(3);if(t>.55&&t<1.15)buttons.push(15);if(t>=1.5&&t<3)buttons.push(2);echoTest.run(buttons);lag-=1/120;}echoTest.render();
  }
 });
 const frames=await page.evaluate(()=>echoTest.frames),volleys=frames.filter(f=>f.main||f.copies);expect(volleys.length).toBeGreaterThan(3);expect(volleys.every(f=>f.attack&&f.main===1&&f.copies===1)).toBe(true);
 const idle=frames.filter(f=>f.t>.4&&f.t<1.5),released=frames.filter(f=>f.t>=3.1&&f.t<5);expect(new Set(idle.map(f=>f.ammo)).size).toBe(1);expect(new Set(released.map(f=>f.ammo)).size).toBe(1);expect(idle.at(-1).cloneX).toBeGreaterThan(idle[0].cloneX);expect(released.every(f=>f.clones===1&&!f.main&&!f.copies)).toBe(true);expect(frames.at(-1).clones).toBe(0);
 const download=page.waitForEvent('download');await page.evaluate(()=>echoTest.rec.stop());await(await download).saveAs('tests/artifacts/arcade/combat-polish/echo-sync.webm');expect(errors).toEqual([]);
});
