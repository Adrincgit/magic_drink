import {test,expect} from '@playwright/test';
import {LEVELS} from '../src/components/arcade/adventureLevels';
import {createAdventure,stepAdventure} from '../src/components/arcade/adventureModel';
const tick=(s,keys={},frames=120)=>{for(let i=0;i<frames;i++)stepAdventure(s,keys,1/120);};
test('every cage and exit has a reachable platform route',()=>{
 for(const l of LEVELS){
  const seen=new Set([0]);let changed=true;
  while(changed){changed=false;for(const a of [...seen])for(let b=0;b<l.platforms.length;b++){
   if(seen.has(b))continue;const f=l.platforms[a],t=l.platforms[b],dy=t.y-f.y;
   const velocity=l.id===2?840:600,disc=velocity*velocity+2*1550*dy;
   if(disc<0)continue;const reach=255*(velocity+Math.sqrt(disc))/1550;
   const distance=Math.max(0,t.x-(f.x+f.w),f.x-(t.x+t.w));
   if(distance+20<reach){seen.add(b);changed=true;}
  }}
  for(const [x,y] of [...l.cages,l.exit])expect(l.platforms.some((p,i)=>seen.has(i)&&x>=p.x&&x<=p.x+p.w&&y===p.y),`${l.id}: unreachable ${x},${y}; reachable ${[...seen]}`).toBe(true);
 }
});
test('variable jump, released keys, checkpoint damage and five different powers work',()=>{
 const short=createAdventure(),long=createAdventure();tick(short,{jump:true},10);tick(short,{},18);tick(long,{jump:true},28);expect(long.player.y).toBeLessThan(short.player.y);
 const walk=createAdventure();tick(walk,{right:true},100);const x=walk.player.x;tick(walk,{},50);expect(walk.player.x-x).toBeLessThan(35);expect(walk.power).toBe(false);
 const kiwi=createAdventure(2);kiwi.doubleJump=true;tick(kiwi,{jump:true},35);tick(kiwi,{},1);const before=kiwi.player.y;tick(kiwi,{jump:true},25);expect(kiwi.player.y).toBeLessThan(before-50);
 for(let i=0;i<5;i++){const s=createAdventure(i);s.weapon=i;tick(s,{attack:true},1);expect(s.shots.length).toBe(i===4?3:i===2?2:1);expect(s.shots[0].kind).toBe(i);}
 const fall=createAdventure();fall.checkpoint=true;fall.player.y=890;fall.player.ground=null;tick(fall,{},1);expect(fall.hearts).toBe(4);expect(fall.player.x).toBe(fall.level.checkpoint[0]);
});
test('cages require magic and bosses must be beaten, while rescues remain optional',()=>{
 const s=createAdventure();s.power=true;s.player.x=s.cages[0].x-80;s.player.y=s.cages[0].y;s.player.ground=0;s.enemies=[];tick(s,{attack:true},130);expect(s.cages[0].open).toBe(true);s.player.x=s.cages[0].x;tick(s,{},2);expect(s.rescued).toBe(1);
 s.player.x=s.level.exit[0];s.player.y=s.level.exit[1];s.player.ground=s.platforms.findIndex(p=>s.player.x>=p.x&&s.player.x<=p.x+p.w);tick(s,{},2);expect(s.won).toBe(false);
 s.boss.hp=0;tick(s,{},2);expect(s.boss.defeat).toBeTruthy();expect(s.won).toBe(false);tick(s,{},1800);expect(s.won).toBe(true);
});
for(const width of [1440,390])test(`${width}: adventure input, practice, pause, chapter selection and save`,async({page})=>{
 await page.setViewportSize({width,height:width===390?844:1000});await page.goto('/arcade');const root=page.locator('[data-hexy-adventure]');await expect(root).toHaveAttribute('data-phase','ready',{timeout:20000});
 await page.locator('[data-practice]').click();await expect(root).toHaveAttribute('data-phase','playing');const canvas=page.locator('[data-adventure-canvas]');await page.keyboard.down('ArrowRight');await expect.poll(async()=>Number(await canvas.getAttribute('data-player-x'))).toBeGreaterThan(190);await page.keyboard.up('ArrowRight');await page.keyboard.press('KeyP');await expect(root).toHaveAttribute('data-phase','paused');const x=await canvas.getAttribute('data-player-x');await page.waitForTimeout(200);expect(await canvas.getAttribute('data-player-x')).toBe(x);await page.getByRole('button',{name:'Terminar práctica'}).click();
 await page.locator('[data-level-choice="4"]').click();await expect(page.locator('[data-insert-coin]')).toBeDisabled();await page.locator('[data-practice]').click();await expect(canvas).toHaveAttribute('data-level','4');await page.keyboard.press('KeyP');await page.getByRole('button',{name:'Terminar práctica'}).click();expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('magic-drink-arcade-v1')).coins)).toBe(1);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('paid victories unlock the next chapter once and practice preserves the collection',async({page})=>{
 await page.goto('/arcade');await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','ready');
 const result=await page.evaluate(async()=>{
  const store=await import('/src/components/arcade/arcadeStore.js');
  await store.collectBunny('shore');await store.equipAccessory('plain');
  const ticket=await store.beginRun();
  const receipts=await Promise.all([store.finishRun(ticket.id,{won:true,stars:97,level:0}),store.finishRun(ticket.id,{won:true,stars:97,level:0})]);
  const practice=await store.beginRun(true);await store.finishRun(practice.id,{won:true,stars:150,level:4});
  return {receipts,save:JSON.parse(localStorage.getItem(store.SAVE_KEY))};
 });
 expect(result.receipts.filter(Boolean)).toHaveLength(1);expect(result.save).toMatchObject({coins:2,stars:97,adventureUnlocked:1,adventureCleared:[0],found:['shore']});
 await page.reload();await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','ready');
 await page.locator('[data-level-choice="1"]').click();await expect(page.locator('[data-insert-coin]')).toBeEnabled();
 await page.locator('[data-level-choice="2"]').click();await expect(page.locator('[data-insert-coin]')).toBeDisabled();
});

test('English mobile accepts simultaneous touch movement and jump, releases both and pauses',async({browser})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'}),page=await context.newPage();
 await page.addInitScript(()=>localStorage.setItem('lang','en'));await page.goto('/arcade');const root=page.locator('[data-hexy-adventure]');await expect(root).toHaveAttribute('data-phase','ready');
 await page.locator('[data-practice]').tap();await expect(root).toHaveAttribute('data-phase','playing');
 const right=await page.getByRole('button',{name:'Move right',exact:true}).boundingBox(),jump=await page.getByRole('button',{name:'Jump',exact:true}).boundingBox(),canvas=page.locator('[data-adventure-canvas]');
 const session=await context.newCDPSession(page),point=(r,id)=>({x:r.x+r.width/2,y:r.y+r.height/2,id});
 await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point(right,1),point(jump,2)]});
 await expect.poll(async()=>Number(await canvas.getAttribute('data-player-x'))).toBeGreaterThan(120);
 expect(Number(await canvas.getAttribute('data-player-y'))).toBeLessThan(455);
 await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.waitForTimeout(250);
 const stopped=Number(await canvas.getAttribute('data-player-x'));await page.waitForTimeout(200);expect(Math.abs(Number(await canvas.getAttribute('data-player-x'))-stopped)).toBeLessThan(1);
 await page.getByRole('button',{name:'Pause or resume'}).tap();await expect(root).toHaveAttribute('data-phase','paused');
 await page.getByRole('button',{name:'End practice'}).tap();expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('magic-drink-arcade-v1')).coins)).toBe(1);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await context.close();
});
