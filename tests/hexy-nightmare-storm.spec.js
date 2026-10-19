import {test,expect} from '@playwright/test';
import sharp from 'sharp';
import {createHash} from 'node:crypto';
import {createAdventure,stepAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {beginNightmareUltimate,nightmareHand} from '../src/components/arcade/adventure/actors/bosses/nightmareUltimate';
import {startNightmareGame,nightmareGameWarnings} from '../src/components/arcade/adventure/actors/bosses/nightmareGames';
import {actTwoBossDrawing} from '../src/components/arcade/adventure/actors/bosses/adventureActTwoBosses';
import {NIGHTMARE_CLASH,nightmareContact} from '../src/components/arcade/adventure/engine/nightmarePowerClash';
import {clashImpactTiming} from '../src/components/arcade/adventure/render/clashImpactCanvas';
import {NIGHTMARE_STORM_PALMS} from '../src/components/arcade/adventure/actors/bosses/nightmareStormRegistration';
const tick=(s,seconds,input={})=>{for(let i=0;i<Math.round(seconds*120);i++)stepAdventure(s,input,1/120);};
function battle(side=1){const s=createAdventure(10),a=s.level.arena;s.enemies=[];s.supplies=[];s.arenaLocked=true;Object.assign(s.player,{x:3600,y:a.y,ground:1,hurt:999,dir:side});Object.assign(s.boss,{x:4200,y:a.y,dir:-1,stage:3,hp:260,phase:'recover',timer:99,engaged:true,vulnerable:true,encoreAid:true,nightmareCooldown:999});return s;}
function duel(){const s=battle();s.boss.x=5250;beginNightmareUltimate(s);tick(s,1.9);stepAdventure(s,{super:true},1/120);for(let i=0;i<120*15&&s.powerClash.state!=='boss-boost';i++)stepAdventure(s,{attack:i%12<6},1/120);expect(s.powerClash.state).toBe('boss-boost');return s;}
test('the boss holds the front for the whole charge and manga begins on release, before expansion ends',()=>{
 const s=duel(),q=s.powerClash,pressure=q.pressure,visual=q.visualTime,wind=q.windPhase;
 tick(s,NIGHTMARE_CLASH.bossCharge-.02);expect(q.pressure).toBe(pressure);expect(q.visualTime).toBe(visual);expect(q.windPhase).toBe(wind);expect(q.bossReleased).toBeFalsy();expect(clashImpactTiming(q).manga).toBe(0);
 tick(s,.025);expect(q.bossReleased).toBe(true);expect(q.state).toBe('boss-boost');expect(q.impactCause).toBe('boss-surge');expect(clashImpactTiming(q).manga).toBeGreaterThan(.9);
 tick(s,NIGHTMARE_CLASH.bossRelease+.03);expect(q.state).toBe('contest');expect(q.bossAmplification).toBe(1);expect(clashImpactTiming(q).manga).toBe(0);
});
test('double Encore pauses during its charge, launches one manga beat and returns the actual contact to halfway',()=>{
 const s=duel(),q=s.powerClash;tick(s,NIGHTMARE_CLASH.bossCharge+NIGHTMARE_CLASH.bossRelease+.03);
 q.pressure=.08;q.portraitPressure=.08;stepAdventure(s,{super:true},1/120);expect(q.state).toBe('hexy-boost');
 const visual=q.visualTime,pressure=q.pressure,wind=q.windPhase;tick(s,NIGHTMARE_CLASH.boostCharge-.02);
 expect(q.pressure).toBe(pressure);expect(q.visualTime).toBe(visual);expect(q.windPhase).toBe(wind);expect(clashImpactTiming(q).manga).toBe(0);
 tick(s,.025);expect(q.hexyReleased).toBe(true);expect(q.impactCause).toBe('hexy-reversal');expect(clashImpactTiming(q).manga).toBeGreaterThan(.9);
 for(let i=0;i<120&&q.state!=='contest';i++)stepAdventure(s,{},1/120);
 expect(q.pressure).toBe(.5);expect(q.portraitPressure).toBe(.5);const h=nightmareContact(s);
 expect(h.x).toBeCloseTo((h.a.x+h.b.x)/2,8);expect(h.y).toBeCloseTo((h.a.y+h.b.y)/2,8);expect(q.windFlow).toBe(1);expect(clashImpactTiming(q).manga).toBe(0);
});
test('the close-range staff counter locks a destination behind Hexy, telegraphs and strikes only after reappearing',()=>{
 for(const side of [-1,1]){
  const s=battle(side),b=s.boss;s.player.hurt=0;b.x=s.player.x+150;b.phase='patrol';b.timer=0;b.turn=0;tick(s,1/120);
  expect(b.game.kind).toBe('staff-counter');const destination=b.targetX;expect((destination-s.player.x)*side).toBeLessThan(0);expect(nightmareGameWarnings(s)[0].x).toBe(destination);
  const hearts=s.hearts;tick(s,.86);expect(b.x).toBe(destination);expect(b.vulnerable).toBe(true);expect(s.hearts).toBe(hearts);
  tick(s,.4);expect(s.hearts).toBeLessThan(hearts);expect(s.hostile).toHaveLength(0);expect(s.enemies).toHaveLength(0);
 }
});
test('jumping after the staff reappearance evades its committed strike and leaves a recovery opening',()=>{
 const s=battle();s.player.hurt=0;startNightmareGame(s,'staff-counter');tick(s,.86);const hearts=s.hearts;
 tick(s,.5,{jump:true});expect(s.hearts).toBe(hearts);tick(s,.3);expect(s.boss.phase).toBe('recover');expect(s.boss.vulnerable).toBe(true);expect(s.boss.staffCooldown).toBeGreaterThan(0);
});
test('boost and counter keep the world palm anchored and each staff animation has eight distinct drawn poses',async()=>{
 const s=battle();s.boss.nightmareUltimate={state:'fire',age:0};s.boss.y=-970;
 for(const frame of [0,4,8,12]){const rgba=await sharp('public/arcade/act-two/nightmare-storm-v8/boss-air.webp').extract({left:0,top:frame/4*512,width:512,height:512}).ensureAlpha().raw().toBuffer(),[x,y]=NIGHTMARE_STORM_PALMS[frame],p=(Math.round(y)*512+Math.round(x))*4;expect(rgba[p+3]).toBeGreaterThan(150);expect(Math.min(...rgba.subarray(p,p+3))).toBeGreaterThan(160);}
 const origins=[];for(const role of [0,1,2,3]){s.powerClash={kind:'nightmare',state:role===1?'boss-boost':'contest',bossBoost:role>0,hexyBoost:role===3,bossJoyTier:role===2?2:1,actingTime:0};origins.push(nightmareHand(s));}
 for(const p of origins){expect(p.x).toBeCloseTo(origins[0].x,0);expect(p.y).toBeCloseTo(origins[0].y,0);}
 for(const stage of [2,3]){const hashes=[];for(let f=0;f<8;f++){const rgba=await sharp(`public/arcade/act-two/nightmare-storm-v8/staff-${stage}.webp`).extract({left:f%4*512,top:Math.floor(f/4)*512,width:512,height:512}).ensureAlpha().raw().toBuffer();for(let i=0;i<rgba.length;i+=4)if(!rgba[i+3])rgba.fill(0,i,i+3);hashes.push(createHash('sha256').update(rgba).digest('hex'));}expect(new Set(hashes).size).toBe(8);}
});
