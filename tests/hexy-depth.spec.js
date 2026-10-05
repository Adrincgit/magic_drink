import {test,expect} from '@playwright/test';
import {createAdventure,stepAdventure,playerBody,adventureCarry} from '../src/components/arcade/adventureModel';
import {updateBoss,BOSS_MOVES,makeEnemy} from '../src/components/arcade/adventureEnemies';
import {actorFrame} from '../src/components/arcade/adventureSprites';
const tick=(s,keys={},frames=1)=>{for(let i=0;i<frames;i++)stepAdventure(s,keys,1/120);};

test('aiming, crouching, dash and damage use the actual player hitbox',()=>{
 for(const [keys,expected] of [[{attack:true},[1,0]],[{up:true,attack:true},[0,-1]],[{up:true,right:true,attack:true},[1,-1]],[{down:true,attack:true},[1,0]]]){
  const s=createAdventure();tick(s,keys);expect(s.shots).toHaveLength(1);for(const [axis,value] of [['vx',expected[0]],['vy',expected[1]]]){if(value===0)expect(s.shots[0][axis]).toBeCloseTo(0,6);else expect(Math.sign(s.shots[0][axis])).toBe(value);}
  if(keys.down){expect(playerBody(s.player).h).toBe(30);expect(s.player.y-s.shots[0].y).toBeGreaterThan(18);expect(s.player.y-s.shots[0].y).toBeLessThan(38);}
 }
 const duck=createAdventure();duck.hostile.push({x:85,y:duck.player.y-51,vx:0,vy:0,r:8,age:0,life:1,kind:'ball'});tick(duck,{down:true});expect(duck.hearts).toBe(5);
 const stand=createAdventure();stand.hostile.push({x:85,y:stand.player.y-51,vx:0,vy:0,r:8,age:0,life:1,kind:'ball'});tick(stand);expect(stand.hearts).toBe(4);
 const dodge=createAdventure();dodge.hostile.push({x:90,y:dodge.player.y-30,vx:0,vy:0,r:14,age:0,life:1,kind:'ball'});tick(dodge,{dash:true});expect(dodge.player.dash).toBeGreaterThan(0);expect(dodge.hearts).toBe(5);expect(dodge.events).toContain('dash');
 const shield=createAdventure();shield.shield=1;shield.hostile.push({x:85,y:shield.player.y-30,vx:0,vy:0,r:12,age:0,life:1,kind:'ball'});tick(shield);expect(shield.shield).toBe(0);expect(shield.hearts).toBe(5);
});

test('drinks change projectiles and the rescued chorus gives distinct rewards',()=>{
 const s=createAdventure();s.hearts=2;s.enemies=[];
 for(let i=0;i<3;i++){const q=s.cages[i];q.open=true;s.player.x=q.x;s.player.y=q.y;s.player.ground=s.platforms.findIndex(p=>q.x>=p.x&&q.x<=p.x+p.w&&q.y===p.y);tick(s);}
 expect(s.rescued).toBe(3);expect(s.hearts).toBeGreaterThanOrEqual(4);expect(s.shield).toBe(0);expect(s.buff).toBeGreaterThan(15);
 const carry=adventureCarry({...s,weapon:2,ammo:17,doubleJump:true});expect(createAdventure(1,false,carry)).toMatchObject({weapon:2,ammo:17,doubleJump:true,hearts:s.hearts,shield:s.shield});
 const bubble=createAdventure();bubble.weapon=3;bubble.enemies=[makeEnemy(140,480)];tick(bubble,{attack:true},30);expect(bubble.enemies[0].trap).toBeGreaterThan(0);
 const banana=createAdventure();banana.weapon=1;tick(banana,{attack:true},1);tick(banana,{},95);expect(banana.shots[0].vx).toBeLessThan(0);
});

test('boss arenas allow optional rescues, announce attacks and expose recovery windows',()=>{
 for(let i=0;i<5;i++){
  const s=createAdventure(i),a=s.level.arena;s.player.x=a.entry+10;s.player.y=a.y;s.player.ground=s.platforms.findIndex(p=>p.x===a.left);s.enemies=[];
  tick(s);expect(s.rescued).toBe(0);expect(s.boss.phase).toBe('intro');expect(s.arenaLocked).toBe(true);expect(s.hostile).toHaveLength(0);
  const kinds=new Set(),moves=new Set();let recovery=false,minions=false;s.damage=()=>{};
  // The new ascent and bombing pass extend the balloon's complete move cycle.
  for(let n=0;n<5400;n++){s.boss.hp=s.boss.maxHp*.25;updateBoss(s,1/120,{say:()=>{},particles:()=>{},body:playerBody});moves.add(s.boss.move);s.hostile.forEach(p=>kinds.add(p.kind));minions||=s.enemies.some(e=>e.type===6);recovery||=s.boss.phase==='recover'&&s.boss.vulnerable;}
  expect([...moves]).toEqual(expect.arrayContaining(BOSS_MOVES[i]));expect(recovery).toBe(true);expect(s.boss.stage).toBe(i===0?2:3);
  if(i===0)expect([...kinds]).toEqual(expect.arrayContaining(['streamer','bomb']));
  if(i===0||i===3)expect(minions).toBe(true);
  if(i===1)expect([...kinds]).toEqual(expect.arrayContaining(['clown','streamer']));
  if(i===2)expect([...kinds]).toEqual(expect.arrayContaining(['ball','ring']));
  if(i===4)expect([...kinds]).toEqual(expect.arrayContaining(['note','streamer']));
  s.boss.hp=0;tick(s);if(i===0){expect(s.boss.defeat).toBeTruthy();tick(s,{},360);}expect(s.arenaLocked).toBe(false);
 }
});

test('animation poses respond to state and charge direction stays telegraphed',()=>{
 expect(actorFrame({hp:2,flash:0,action:.2,phase:'patrol',clock:1})).toBe(8);
 expect(actorFrame({hp:2,flash:.2,phase:'patrol',clock:1})).toBe(10);
 expect(actorFrame({hp:0,phase:'patrol',clock:1})).toBe(11);
 const s=createAdventure(3);s.damage=()=>{};Object.assign(s.boss,{phase:'attack',move:'charge',timer:1,attackClock:0,shotClock:2,dir:-1});s.player.x=s.boss.x+100;const x=s.boss.x;
 updateBoss(s,1/120,{say:()=>{},particles:()=>{},body:playerBody});expect(s.boss.x).toBeLessThan(x);expect(s.boss.dir).toBe(-1);
});

test('one paid ticket spans five chapters and receipts cannot be replayed',async({page})=>{
 await page.goto('/arcade');
 const result=await page.evaluate(async()=>{
  const m=await import('/src/components/arcade/arcadeStore.js');localStorage.removeItem(m.SAVE_KEY);
  const t=await m.beginRun(),coins=[],ids=[],duplicate=[];
  for(let level=0;level<4;level++){
   const both=await Promise.all([m.advanceAdventure(t.id,{level,stars:40}),m.advanceAdventure(t.id,{level,stars:40})]);duplicate.push(both.filter(Boolean).length);
   const save=JSON.parse(localStorage.getItem(m.SAVE_KEY));coins.push(save.coins);ids.push(save.run.id);
  }
  await m.finishRun(t.id,{level:4,stars:50,won:true});return {coins,ids,duplicate,id:t.id,save:JSON.parse(localStorage.getItem(m.SAVE_KEY))};
 });
 expect(result.coins).toEqual([0,0,0,0]);expect(new Set(result.ids).size).toBe(1);expect(result.duplicate).toEqual([1,1,1,1]);expect(result.save).toMatchObject({run:null,stars:210,adventureCleared:[0,1,2,3,4],adventureUnlocked:4,coins:1});
});

test('mobile aiming and ducking controls fit, and the supplied field arrangement plays',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/arcade');const root=page.locator('[data-hexy-adventure]');await expect(root).toHaveAttribute('data-phase','ready');await page.locator('[data-practice]').click();await expect(root).toHaveAttribute('data-phase','playing');
 const canvas=page.locator('[data-adventure-canvas]');await page.keyboard.down('ArrowDown');await expect(canvas).toHaveAttribute('data-crouch','true');await page.keyboard.up('ArrowDown');
 await page.keyboard.down('ArrowUp');await expect.poll(async()=>Number(await canvas.getAttribute('data-aim'))).toBe(-1);await page.keyboard.up('ArrowUp');
 const music=page.locator('audio').first();await expect(music).toHaveAttribute('src','/arcade/music/exploration/meadow.mp3');await expect.poll(()=>music.evaluate(a=>a.currentTime)).toBeGreaterThan(0);
 await page.getByRole('button',{name:'Sonido del juego',exact:true}).click();await expect.poll(()=>music.evaluate(a=>a.paused)).toBe(true);
 const diagonal=page.getByRole('button',{name:'Apuntar diagonal derecha',exact:true});await diagonal.hover();await page.mouse.down();await expect.poll(async()=>Number(await canvas.getAttribute('data-aim'))).toBeCloseTo(-1/Math.SQRT2,5);await page.mouse.up();await expect(canvas).toHaveAttribute('data-aim','0');
 for(const label of ['Apuntar arriba','Apuntar diagonal izquierda','Apuntar diagonal derecha','Agacharse','Impulso','Lanzar magia','Saltar']){const b=await page.getByRole('button',{name:label,exact:true}).boundingBox();expect(b.x).toBeGreaterThanOrEqual(0);expect(b.x+b.width).toBeLessThanOrEqual(390);}
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
