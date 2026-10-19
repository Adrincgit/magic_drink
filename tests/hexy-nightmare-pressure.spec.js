import {openAdventureMenu} from './arcade-input.helpers';
import {test,expect} from '@playwright/test';
import {createAdventure,stepAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {beginNightmareUltimate} from '../src/components/arcade/adventure/actors/bosses/nightmareUltimate';
import {nightmarePressureEffort,nightmarePressureFrame} from '../src/components/arcade/adventure/engine/nightmarePressureActing';
import {nightmareCornerLayout,nightmareMangaBorders} from '../src/components/arcade/adventure/render/nightmarePressurePanels';
import {nightmareResistance} from '../src/components/arcade/adventure/engine/nightmareActing';
import {NIGHTMARE_CLASH} from '../src/components/arcade/adventure/engine/nightmarePowerClash';
import {nightmareClashSpeech} from '../src/components/arcade/adventure/render/nightmareClashSpeech';
import {nightmareWindParticle} from '../src/components/arcade/adventure/render/nightmarePressureAtmosphere';
import {hexyPose,hexyMuzzle} from '../src/components/arcade/adventure/actors/hexy/hexyAnimation';
const tick=(s,seconds,input={})=>{for(let i=0;i<seconds*120;i++)stepAdventure(s,input,1/120);};
function duel(side=1,air=false){
 const s=createAdventure(10),a=s.level.arena;s.enemies=[];s.supplies=[];s.arenaLocked=true;Object.assign(s.player,{x:side>0?2850:5650,y:a.y,ground:1,hurt:999});Object.assign(s.boss,{x:side>0?5000:3000,y:a.y,stage:3,hp:260,phase:'recover',timer:100,engaged:true,encoreAid:true});
 beginNightmareUltimate(s);tick(s,1.9);if(air){s.player.y-=100;s.player.ground=null;}stepAdventure(s,{super:true},1/120);
 for(let i=0;i<480&&s.powerClash.state!=='contest';i++)stepAdventure(s,{},1/120);return s;
}
test('the power surge has surprise, moving second-hand support and lasting teeth-clenched strain',()=>{
 const q={state:'boss-boost',age:.05,pressure:.5,portraitPressure:.5,bossBoost:true};expect(nightmarePressureEffort(q)).toBe(1);
 const shock=[];for(const age of [.01,.11,.21,.31]){q.age=age;shock.push(nightmarePressureFrame(q,age));}expect(new Set(shock).size).toBe(4);
 q.age=.7;expect(nightmarePressureEffort(q)).toBe(2);q.state='contest';expect(nightmarePressureEffort(q)).toBe(3);
 q.hexyBoost=true;expect(nightmarePressureEffort(q)).toBe(4);
});
test('the Harlequin keeps laughing while winning, strains after the counter and despairs near defeat',()=>{
 const q={state:'contest',pressure:.5,portraitPressure:.5};expect(nightmarePressureEffort(q,true)).toBe(0);
 q.portraitPressure=.08;expect(nightmarePressureEffort(q,true)).toBe(0);q.state='boss-boost';expect(nightmarePressureEffort(q,true)).toBe(1);
 q.state='contest';q.bossBoost=true;q.bossJoyTier=2;expect(nightmarePressureEffort(q,true)).toBe(2);q.hexyBoost=true;
 for(const pressure of [.7,.6]){q.portraitPressure=pressure;expect(nightmarePressureEffort(q,true)).toBe(3);}
 for(const pressure of [.9,.85]){q.portraitPressure=pressure;expect(nightmarePressureEffort(q,true)).toBe(4);}
});
test('portraits and world casters cycle drawn cels within their current expression, with a reduced-motion hold',()=>{
 for(const boss of [false,true]){const q={state:'contest',pressure:.5},frames=[];for(let i=0;i<120;i++)frames.push(nightmarePressureFrame(q,i/60,boss));expect(new Set(frames).size).toBe(4);
  expect(new Set(frames.map(f=>Math.floor(f/4))).size).toBe(1);
  for(let i=1;i<frames.length;i++)expect(Math.abs(frames[i]-frames[i-1])).toBeLessThanOrEqual(1);
  expect(nightmarePressureFrame(q,1,boss,true)).toBe(nightmarePressureFrame(q,2,boss,true));
 }
});
test('Hexy stays in a lower corner and the Harlequin in an upper corner on either side, including boosts',()=>{
 for(const side of [1,-1])for(const state of ['contest','boss-boost','hexy-boost']){
  const s=duel(side);s.powerClash.state=state;const h=nightmareCornerLayout(s),b=nightmareCornerLayout(s,true);
  expect(h.y+h.h).toBe(540);expect(b.y).toBe(0);expect(h.right).not.toBe(b.right);
  for(const [a,z]of nightmareMangaBorders(s)){expect(Math.abs(a[0]-z[0])).toBeLessThanOrEqual(340);expect(a[0]===0||a[0]===960||a[1]===0||a[1]===540).toBe(true);expect(z[0]===0||z[0]===960||z[1]===0||z[1]===540).toBe(true);}
  for(const p of [h,b]){expect(p.x).toBeGreaterThanOrEqual(0);expect(p.x+p.w).toBeLessThanOrEqual(960);expect(p.y+p.h).toBeLessThanOrEqual(540);}
 }
});
test('speech uses brief event bubbles and leaves sustained combat without a central caption',()=>{
 expect(nightmareClashSpeech({state:'contest',contestAge:4,age:4})).toBeNull();
 expect(nightmareClashSpeech({state:'boss-boost'}).boss).toBe(true);expect(nightmareClashSpeech({state:'hexy-boost'}).boss).toBe(false);
});
test('world acting preserves two-hand support during the second ultimate in ground and air',()=>{
 for(const air of [false,true]){const s=duel(1,air),q=s.powerClash;Object.assign(q,{state:'boss-boost',age:.1});expect(Math.floor(hexyPose(s).frame/4)).toBe(1);
  q.age=.7;expect(Math.floor(hexyPose(s).frame/4)).toBe(2);Object.assign(q,{state:'contest',bossBoost:true});expect(Math.floor(hexyPose(s).frame/4)).toBe(3);
  Object.assign(q,{state:'hexy-boost',hexyBoost:true});s.player.charge=.7;expect(Math.floor(hexyPose(s).frame/4)).toBe(4);expect(hexyMuzzle(s).y).toBeLessThan(s.player.y-40);
 }
});
test('wind advection reverses smoothly, while pressure and double Encore still resolve normally',()=>{
 const s=duel();let boosted=false,sawSurprise=false;
 for(let i=0;i<120*30&&s.powerClash;i++){
  const q=s.powerClash,second=q.boostReady&&!q.hexyBoost&&q.pressure<.11,p=nightmareWindParticle(s,2),before=q.windPhase;
  stepAdventure(s,{attack:(!q.bossBoost||q.hexyBoost)&&i%12<6,super:second},1/120);
  if(q.state==='boss-boost'&&q.age<.28)sawSurprise=true;
  if(q.hexyBoost&&s.powerClash){boosted=true;expect(Math.abs(q.windPhase-before)).toBeLessThan(.009);const n=nightmareWindParticle(s,2),delta=Math.abs(n.phase-p.phase);expect(delta<.01||delta>.99).toBe(true);}
 }
 expect(sawSurprise).toBe(true);expect(boosted).toBe(true);expect(s.powerClash).toBeNull();expect(s.boss.hp).toBe(0);
});

for(const [side,width]of [[1,1440],[-1,780]])test('the real double Encore button keeps the '+(side>0?'left':'right')+' portrait clear and triggers reinforcement',async({page})=>{
 await page.setViewportSize({width,height:width===1440?900:440});
 await page.route('**/src/components/arcade/adventure/engine/adventureModel.js*',async route=>{
  const response=await route.fetch(),source=await response.text(),target='bindCarriedBunnies(s);';expect(source).toContain(target);
  const x=side>0?2850:5650,bx=x+side*1650;
  const inject=`if(index===10){s.player.x=${x};s.player.y=480;s.player.ground=1;s.player.hurt=999;s.arenaLocked=true;s.enemies=[];s.supplies=[];s.stars=[];Object.assign(s.boss,{x:${bx},y:-970,phase:'nightmare-charge',timer:99,engaged:true,vulnerable:false,stage:3,hp:260,encoreAid:true,nightmareCooldown:999,dir:${-side},nightmareUltimate:{state:'charge',age:0,hover:{x:${bx},y:-970},target:{x:${x},y:445}}});}`;
  await route.fulfill({response,body:source.replace(target,inject+target)});
 });
 await page.goto('/arcade');await openAdventureMenu(page);await page.getByRole('button',{name:/Elegir cap/}).click();await page.locator('[data-level-choice="10"]').click();await page.locator('[data-practice]').click();
 const canvas=page.locator('[data-adventure-canvas]');await expect(page.locator('[data-hexy-adventure]')).toHaveAttribute('data-phase','playing');await page.keyboard.press('KeyR');
 await expect(canvas).toHaveAttribute('data-power-clash','contest',{timeout:12000});const button=page.locator('[data-nightmare-boost]');
 // The surprise now requires actually pushing the first beam near her.
 // Exercise real keyboard edges instead of waiting idle for an automatic surge.
 for(let i=0;i<180&&!await button.isVisible();i++){await page.keyboard.press('KeyZ');await page.waitForTimeout(70);}
 await expect(button).toBeVisible({timeout:2000});await expect(button).toHaveAttribute('data-hexy-right',String(side<0));
 const box=await button.boundingBox(),screen=await page.locator('[data-game-screen]').boundingBox();expect(box.x).toBeGreaterThanOrEqual(screen.x);expect(box.x+box.width).toBeLessThanOrEqual(screen.x+screen.width);
 expect(side>0?box.x>screen.x+screen.width/2:box.x+box.width<screen.x+screen.width/2).toBe(true);
 const hud=page.locator('[data-game-hud]');await expect(hud).toHaveAttribute('data-nightmare-right',String(side<0));
 const life=await page.locator('[data-life]').boundingBox();expect(side>0?life.x+life.width<screen.x+screen.width/2:life.x>screen.x+screen.width/2).toBe(true);
 // Capturing the full screen can outlast the last-stand input window on a
 // busy renderer. Exercise the real button before doing image encoding.
 await button.click();await expect(canvas).toHaveAttribute('data-power-clash','hexy-boost');
 await page.locator('[data-game-screen]').screenshot({path:'tests/artifacts/arcade/nightmare-sprites-v6/actual-counter-'+side+'.jpg'});
});

test('the boss reinforcement holds the contest for its close-up, then raises tapping demand until the second ultimate',()=>{
 const s=duel(),q=s.powerClash;
 for(let i=0;i<120*9&&q.state!=='boss-boost';i++)stepAdventure(s,{attack:i%12<6},1/120);
 expect(q.state).toBe('boss-boost');const at=q.contestAge,pressure=q.pressure;
 tick(s,NIGHTMARE_CLASH.bossCharge-.1,{attack:true});expect(q.state).toBe('boss-boost');expect(q.contestAge).toBe(at);expect(q.pressure).toBe(pressure);expect(q.bossAmplification).toBe(0);expect(s.camera.zoom).toBeGreaterThan(.7);
 tick(s,1.2);expect(q.boostReady).toBe(true);q.surgeAge=2;q.contestAge=4;
 const difficult=nightmareResistance({...q,pressure:.5})/.029;expect(difficult).toBeGreaterThan(15);
 q.hexyBoost=true;const restored=nightmareResistance(q)/.029;expect(restored).toBeLessThan(5);expect(difficult).toBeGreaterThan(restored*3);
});
