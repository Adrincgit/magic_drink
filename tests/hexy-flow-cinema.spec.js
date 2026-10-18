import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import sharp from 'sharp';
import {openAdventureMenu} from './arcade-input.helpers';
import {createAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {createTutorial,stepTutorial,TUTORIAL_LESSONS,tutorialDemoInput} from '../src/components/arcade/adventure/engine/adventureTutorial';
import {makeEnemy,updateEnemies,updateBoss} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {stepClownBoosters} from '../src/components/arcade/adventure/actors/enemies/adventureClownBooster';
import {FINISH_DEFAULTS,normalizeFinish,updateFinishState,vintageColorMatrix} from '../src/components/global/illustratedFinishState';

const dir='context/arcade/rehearsal-cinema/';
test('the tutorial has eleven base lessons and no mod-specific coaster lesson',()=>{expect(TUTORIAL_LESSONS).toHaveLength(11);expect(TUTORIAL_LESSONS.some(q=>q.id==='coaster')).toBe(false);});
for(const id of ['aim','fire','drink','strong','super'])test(`${id}: tutorial clowns patrol a real interval without fast direction reversals`,()=>{
 const s=createTutorial(id);for(const e of s.enemies){e.hp=e.maxHp=999;expect(e.practiceRight-e.practiceLeft).toBeGreaterThan(60);}
 const previous=new Map(s.enemies.map(e=>[e,{dir:e.dir,turned:-99}]));let turns=0;
 for(let frame=0;frame<120*5;frame++){
  stepTutorial(s,{},1/120);
  for(const e of s.enemies){const q=previous.get(e);if(!q)continue;if(q.dir!==e.dir){expect(s.time-q.turned).toBeGreaterThan(.5);q.dir=e.dir;q.turned=s.time;turns++;}expect(e.x).toBeGreaterThanOrEqual(e.practiceLeft-.01);expect(e.x).toBeLessThanOrEqual(e.practiceRight+.01);}
 }
 expect(turns).toBeGreaterThan(2);expect(turns).toBeLessThan(16);
});

test('shield demo blocks a stream, breaks from real magic depletion and recovers on release',()=>{
 const s=createTutorial('guard');let minimum=100,recovered=false;
 for(let frame=0;frame<120*8.2;frame++){
  stepTutorial(s,tutorialDemoInput(s),1/120);minimum=Math.min(minimum,s.magic);if(s.tutorial.breaks>0&&s.time>5.2&&s.magic>15&&!s.player.guarding)recovered=true;
 }
 expect(s.tutorial.blocks).toBeGreaterThanOrEqual(4);expect(s.tutorial.breaks).toBeGreaterThan(0);expect(minimum).toBe(0);expect(recovered).toBe(true);expect(s.hearts).toBe(s.maxHearts);
});

for(const hz of [30,60,120])test(`ghosts keep their facing with a target directly above or below at ${hz} Hz`,()=>{
 for(const dy of [-240,240]){
  const s=createAdventure(7);s.graves=[];s.damage=()=>{};const e=Object.assign(makeEnemy(4000,300,19),{active:true,baseY:480,phase:'patrol',timer:999,blinkCooldown:999,dir:1});s.enemies=[e];
  for(let f=0;f<hz*2;f++){s.player.x=4000+Math.sin(f*2.7)*4;s.player.y=e.y+dy;updateEnemies(s,1/hz,()=>({x:0,y:0,w:1,h:1}),()=>{});expect(e.dir).toBe(1);expect(e.x).toBe(4000);}
  s.player.x=3900;updateEnemies(s,1/hz,()=>({x:0,y:0,w:1,h:1}),()=>{});expect(e.dir).toBe(-1);expect(e.x).toBeLessThan(4000);
 }
});

test('vintage and monochrome are mutually exclusive, bounded and compatible with old saved preferences',()=>{
 const legacy=normalizeFinish({grain:30,monochrome:true});expect(legacy.vintage).toBe(false);expect(legacy.filmTitles).toBe(true);
 const vintage=updateFinishState(legacy,{vintage:true,vintageStrength:150});expect(vintage.monochrome).toBe(false);expect(vintage.vintage).toBe(true);expect(vintage.vintageStrength).toBe(100);
 const mono=updateFinishState(vintage,{monochrome:true});expect(mono.vintage).toBe(false);expect(mono.monochrome).toBe(true);
 expect(normalizeFinish({monochrome:true,vintage:true}).vintage).toBe(false);expect(normalizeFinish({filmWear:NaN}).filmWear).toBe(0);
 expect(vintageColorMatrix(0)).toBe('1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0');
});

test('river boats and loaded clown cannons keep their aim side through vertical alignment',()=>{
 const s=createAdventure(2);s.damage=()=>{};const boat=makeEnemy(500,480,9);boat.dir=1;boat.timer=999;s.enemies=[boat];
 for(let i=0;i<120;i++){s.player.x=boat.x+Math.sin(i*2)*4;s.player.y=boat.y-200;updateEnemies(s,1/120,()=>({x:-999,y:0,w:1,h:1}),()=>{});expect(boat.dir).toBe(1);}s.player.x=boat.x-100;updateEnemies(s,1/120,()=>({x:-999,y:0,w:1,h:1}),()=>{});expect(boat.dir).toBe(-1);
 const cannon=makeEnemy(500,480,5),passenger=makeEnemy(500,480,0);Object.assign(cannon,{dir:1,boosterPassenger:passenger,boosterAge:.43});passenger.boosterHidden=true;s.enemies=[cannon,passenger];
 for(let i=0;i<20;i++){s.player.x=cannon.x+Math.sin(i*2)*4;stepClownBoosters(s,1/120);expect(cannon.dir).toBe(1);expect(passenger.dir).toBe(1);}s.player.x=cannon.x-100;stepClownBoosters(s,1/120);expect(cannon.dir).toBe(-1);
});

for(const index of [0,3,6,8,9,10])test(`boss ${index} holds its facing under an aligned target and turns when it crosses the margin`,()=>{
 const s=createAdventure(index),b=s.boss;Object.assign(b,{dir:1,engaged:true,phase:index===3?'recover':'patrol',timer:999,stage:1});s.damage=()=>{};
 const helpers={body:()=>({x:-999,y:0,w:1,h:1}),say:()=>{},particles:()=>{}};
 for(let i=0;i<120;i++){s.player.x=b.x+Math.sin(i*2)*4;s.player.y=b.y-220;updateBoss(s,1/120,helpers);expect(b.dir).toBe(1);}s.player.x=b.x-100;updateBoss(s,1/120,helpers);expect(b.dir).toBe(-1);
});

test('vintage controls persist independently, keep grayscale exclusive and change rendered colours',async({page})=>{
 test.setTimeout(90000);fs.mkdirSync(dir,{recursive:true});await page.goto('/arcade');await openAdventureMenu(page);await page.locator('[data-open-settings]').click();await page.getByRole('tab',{name:'Imagen',exact:true}).click();
 const slider=async(name,value)=>{await page.locator('[data-visual-setting='+name+']').evaluate((el,n)=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,String(n));el.dispatchEvent(new Event('input',{bubbles:true}));},value);};
 for(const name of ['grain','chromatic','vignette'])await slider(name,0);
 await page.locator('[data-monochrome-toggle]').click();await page.locator('[data-vintage-toggle]').click();await expect(page.locator('[data-monochrome-toggle]')).toHaveAttribute('aria-pressed','false');await expect(page.locator('[data-vintage-toggle]')).toHaveAttribute('aria-pressed','true');await slider('vintageStrength',100);await slider('filmWear',50);
 await page.keyboard.press('Escape');await expect(page.locator('[data-finish-wear]')).toHaveAttribute('data-film-state','running');
 await page.evaluate(()=>{const q=document.createElement('div');q.dataset.vintageProbe='';q.style='position:fixed;left:540px;top:310px;width:180px;height:160px;background:rgb(130,120,150);z-index:9999';document.querySelector('[data-hexy-adventure]').append(q);});
 const image=await page.screenshot({path:dir+'vintage-probe.png'}),{data,info}=await sharp(image).removeAlpha().raw().toBuffer({resolveWithObject:true}),i=(390*info.width+620)*3,rgb=[...data.subarray(i,i+3)];expect(rgb[0]).toBeGreaterThan(130);expect(rgb[2]).toBeLessThan(150);
 await page.locator('[data-game-screen]').evaluate(el=>el.dataset.mangaImpact='true');const manga=await sharp(await page.screenshot()).removeAlpha().raw().toBuffer(),gray=[...manga.subarray(i,i+3)];expect(Math.max(...gray)-Math.min(...gray)).toBeLessThan(4);for(const name of ['wear','vignette'])expect(await page.locator('[data-finish-'+name+']').evaluate(el=>getComputedStyle(el).filter)).toBe('grayscale(1)');await page.locator('[data-game-screen]').evaluate(el=>delete el.dataset.mangaImpact);
 await page.evaluate(()=>document.querySelector('[data-vintage-probe]').remove());await page.reload();await openAdventureMenu(page);await page.locator('[data-open-settings]').click();await page.getByRole('tab',{name:'Imagen',exact:true}).click();await expect(page.locator('[data-vintage-toggle]')).toHaveAttribute('aria-pressed','true');await expect(page.locator('[data-visual-setting=vintageStrength]')).toHaveValue('100');
 await page.locator('[data-monochrome-toggle]').click();await expect(page.locator('[data-vintage-toggle]')).toHaveAttribute('aria-pressed','false');await expect(page.locator('[data-monochrome-toggle]')).toHaveAttribute('aria-pressed','true');
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('magic-drink:arcade:illustrated-finish:v1')));expect(saved.vintage).toBe(false);expect(saved.monochrome).toBe(true);expect(saved.filmWear).toBe(50);
});

test('eleven lesson buttons, shield energy feedback and the shop note appear in the real tutorial',async({page})=>{
 await page.goto('/arcade');await openAdventureMenu(page);await page.getByRole('button',{name:/Cómo jugar/}).click();await expect(page.locator('[data-tutorial-lesson]')).toHaveCount(11);await expect(page.locator('[data-tutorial]')).toContainText('tienda de Miso');
 await page.locator('[data-tutorial-lesson=guard]').click();const meter=page.getByRole('meter',{name:'Magia del escudo'});await expect(meter).toBeVisible();await expect.poll(()=>meter.evaluate(q=>q.value)).toBeLessThan(70);await page.screenshot({path:dir+'guard-ui.png'});
});

test('desktop hides the touch pause, and chapter titles can use the vintage presentation',async({page})=>{
 await page.goto('/arcade');await openAdventureMenu(page);await page.locator('[data-practice]').click();const card=page.locator('[data-chapter-intro]');await expect(card).toHaveAttribute('data-vintage','true');await page.waitForTimeout(500);await page.screenshot({path:dir+'chapter-vintage.png'});
 await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','playing');await expect(page.getByRole('button',{name:'Pausar o continuar'})).toBeHidden();await page.keyboard.press('KeyP');await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','paused');await expect(page.getByRole('button',{name:'Continuar',exact:true})).toHaveText('Continuar');
});

test('defeat keeps the depleted HUD through the result and restores resources on the retry chapter card',async({page})=>{
 await page.route('**/src/components/arcade/adventure/engine/adventureModel.js*',async route=>{
  const response=await route.fetch(),source=await response.text();
  await route.fulfill({response,body:source.replace('function stepAdventure(s,input,dt){',`function stepAdventure(s,input,dt){
   if(!s.reviewDefeat){s.reviewDefeat=true;s.enemies=[];s.hearts=1;s.magic=17;s.superCooldown=45;s.notice='rescueMagic';s.noticeTime=8;}
   if(s.time>1.4&&s.hearts>0){s.hearts=0;beginPlayerDefeat(s);}
  `)});
 });
 await page.goto('/arcade');await openAdventureMenu(page);await page.locator('[data-practice]').click();await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','playing');
 const subtitle=page.locator('[data-adventure-subtitle]');await expect(subtitle).toBeVisible();const style=await subtitle.evaluate(el=>{const q=getComputedStyle(el);return{color:q.color,size:parseFloat(q.fontSize),shadow:q.textShadow};});expect(style.color).toBe('rgb(255, 228, 110)');expect(style.size).toBeGreaterThan(20);expect(style.shadow).not.toBe('none');await page.screenshot({path:dir+'yellow-subtitles.png'});
 await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','result',{timeout:10000});await expect(page.locator('[data-life]')).toHaveAttribute('aria-label','Vida: 0 / 5');expect(await page.getByRole('meter',{name:'Energía de magia'}).evaluate(el=>el.value)).toBeLessThan(35);
 await expect(page.locator('[data-restart-level]')).toHaveText('Reiniciar nivel');await expect(page.locator('[data-restart-level]>svg')).toHaveCount(1);await page.screenshot({path:dir+'defeat-hud.png'});
 await page.locator('[data-restart-level]').click();await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','chapter-intro');await expect(page.locator('[data-life]')).toHaveAttribute('aria-label','Vida: 5 / 5');expect(await page.locator('[data-game-hud] meter').first().evaluate(el=>el.value)).toBe(100);
});

test('touch retains pause, title cards can be disabled, and film wear respects reduced motion',async({browser})=>{
 const context=await browser.newContext({baseURL:process.env.MAGIC_DRINK_TEST_URL||'http://localhost:4321',viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'}),page=await context.newPage();
 try{
  await page.addInitScript(()=>localStorage.setItem('magic-drink:arcade:illustrated-finish:v1',JSON.stringify({filmTitles:false,filmWear:60})));await page.goto('/arcade');await openAdventureMenu(page);await expect(page.locator('[data-finish-wear]')).toHaveAttribute('data-film-state','still');await page.locator('[data-practice]').click();await expect(page.locator('[data-chapter-intro]')).toHaveAttribute('data-vintage','false');await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','playing');await expect(page.getByRole('button',{name:'Pausar o continuar'})).toBeVisible();await page.getByRole('button',{name:'Pausar o continuar'}).click();await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','paused');
 }finally{await context.close();}
});
