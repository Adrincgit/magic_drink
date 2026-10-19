import {test,expect} from '@playwright/test';
import sharp from 'sharp';
import {createHash} from 'node:crypto';
import {createAdventure,stepAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {startNightmareGame,nightmareGameWarnings} from '../src/components/arcade/adventure/actors/bosses/nightmareGames';
import {nightmareIllusionCopies,nightmarePrismStrength} from '../src/components/arcade/adventure/actors/bosses/nightmareStaffCombo';
import {actTwoBossDrawing} from '../src/components/arcade/adventure/actors/bosses/adventureActTwoBosses';
import {nightmareSpritePoint} from '../src/components/arcade/adventure/actors/bosses/nightmareDrawing';
import {NIGHTMARE_COMBO_STAFF_TIPS} from '../src/components/arcade/adventure/actors/bosses/nightmareComboRegistration';
import {beginNightmareUltimate} from '../src/components/arcade/adventure/actors/bosses/nightmareUltimate';
import {clashImpactTiming} from '../src/components/arcade/adventure/render/clashImpactCanvas';
import {drawNightmareStormStream} from '../src/components/arcade/adventure/render/nightmareEnergyCanvas';
import {episodeTwoArtPaths} from '../src/components/arcade/adventure/render/episodeTwoCanvas';
const tick=(s,seconds,input={})=>{for(let i=0;i<Math.round(seconds*120);i++)stepAdventure(s,input,1/120);};
function battle(side=1){const s=createAdventure(10),a=s.level.arena;s.enemies=[];s.supplies=[];s.arenaLocked=true;Object.assign(s.player,{x:4000,y:a.y,ground:1,hurt:999,dir:side});Object.assign(s.boss,{x:4450,y:a.y,dir:-1,stage:3,hp:260,phase:'recover',timer:99,engaged:true,vulnerable:true,encoreAid:true,nightmareCooldown:999});return s;}
function reversal(){const s=battle();s.boss.x=5250;beginNightmareUltimate(s);tick(s,1.9);stepAdventure(s,{super:true},1/120);for(let i=0;i<120*18&&!s.powerClash.hexyBoost;i++){const q=s.powerClash;stepAdventure(s,{attack:i%12<6,super:q.boostReady&&!q.hexyBoost},1/120);}for(let i=0;i<240&&s.powerClash.state!=='contest';i++)stepAdventure(s,{},1/120);return s;}

test('the staff chain warns behind, in front and overhead, locking each follow-up before release',()=>{
 for(const side of [-1,1]){
  const s=battle(side),b=s.boss;startNightmareGame(s,'staff-chain');const behind=b.targetX;
  expect((behind-s.player.x)*side).toBeLessThan(0);tick(s,.55+.75);expect(b.x).toBe(behind);
  tick(s,.08);const front=b.game.front;expect((front.x-s.player.x)*side).toBeGreaterThan(0);expect(nightmareGameWarnings(s)[0].x).toBe(front.x);
  s.player.x+=side*25;tick(s,.24);expect(b.x).toBe(front.x);expect(b.dir).toBe(front.dir);
  tick(s,.65);const slam=b.game.slam;expect(nightmareGameWarnings(s)[0].x).toBe(slam.x);s.player.x+=side*60;tick(s,.24);
  expect(b.y).toBeLessThan(s.level.arena.y-200);expect(b.game.slam.x).toBe(slam.x);expect(actTwoBossDrawing(s).key).toBe('nightmare-staff-down-3');
 }
});
test('the drawn descending staff contacts the same floor point as its dust and impact, on either facing',()=>{
 for(const side of [-1,1]){
  const s=battle(side),b=s.boss;startNightmareGame(s,'staff-chain');tick(s,.55+2.52);
  expect(b.game.impacted).toBe(true);const d=actTwoBossDrawing(s);expect(d.frame).toBe(4);
  const tip=nightmareSpritePoint(s,d,NIGHTMARE_COMBO_STAFF_TIPS[d.key][d.frame]);expect(tip.x).toBeCloseTo(b.staffImpact.x,5);expect(tip.y).toBeCloseTo(s.level.arena.y,5);
  expect(s.effects.some(q=>q.cinematicSmoke&&Math.abs(q.x-b.staffImpact.x)<40)).toBe(true);expect(s.shake).toBeGreaterThan(0);
  tick(s,.8);expect(b.phase).toBe('recover');expect(b.vulnerable).toBe(true);
 }
});
test('moving away after the overhead warning evades the committed slam',()=>{
 const s=battle();startNightmareGame(s,'staff-chain');tick(s,.55+1.7);s.player.hurt=0;const hearts=s.hearts,landing=s.boss.game.slam.x;
 tick(s,1.05,{right:true});expect(s.player.x).toBeGreaterThan(landing+82);expect(s.hearts).toBe(hearts);expect(s.enemies).toHaveLength(0);
});
test('purple wind pulls or pushes without damage, with guarding reducing displacement',()=>{
 const offsets={};for(const kind of ['wind-tug','wind-push'])for(const guarding of [false,true]){
  const s=battle();s.player.hurt=0;const x=s.player.x,hearts=s.hearts;startNightmareGame(s,kind);tick(s,1.9,guarding?{guard:true}:{});
  offsets[kind+guarding]=s.player.x-x;expect(s.hearts).toBe(hearts);expect(s.hostile).toHaveLength(0);
 }
 expect(offsets['wind-tugfalse']).toBeGreaterThan(40);expect(offsets['wind-pushfalse']).toBeLessThan(-40);
 expect(Math.abs(offsets['wind-tugtrue'])).toBeLessThan(Math.abs(offsets['wind-tugfalse'])*.5);
});
test('the prism creates four moving attack copies and a color grade without summoned minions',()=>{
 const s=battle(),x=s.boss.x;startNightmareGame(s,'prism-mirage');tick(s,.65);expect(nightmarePrismStrength(s)).toBe(1);
 expect(nightmareIllusionCopies(s)).toHaveLength(4);expect(new Set(nightmareIllusionCopies(s).map(p=>p.x)).size).toBe(4);expect(s.hostile).toHaveLength(0);
 const origins=new Set();for(let i=0;i<120*3;i++){stepAdventure(s,{},1/120);for(const q of s.hostile)if(q.illusion!==undefined)origins.add(q.illusion);}expect(origins.size).toBe(2);expect(s.boss.x).toBe(x);expect(s.enemies).toHaveLength(0);expect(s.dreamMirrors).toHaveLength(0);
 tick(s,1);expect(nightmarePrismStrength(s)).toBe(0);expect(nightmareIllusionCopies(s)).toHaveLength(0);
});
test('after double Encore the boss has one finite frustrated rally and steady tapping can still win from halfway',()=>{
 const s=reversal(),q=s.powerClash;expect(q.hexyBoost).toBe(true);expect(q.pressure).toBe(.5);
 q.pressure=.86;q.portraitPressure=.86;q.age=.6;stepAdventure(s,{},1/120);expect(q.finalSurgeUsed).toBe(true);expect(q.finalSurgeAge).toBe(0);expect(q.pressure).toBeLessThan(.8);
 const fair=reversal(),f=fair.powerClash;
 for(let i=0;i<120*28&&fair.powerClash?.state!=='resolve';i++)stepAdventure(fair,{attack:i%15<7},1/120);
 expect(f.state).toBe('resolve');expect(f.won).toBe(true);expect(f.finalSurgeUsed).toBe(true);expect(f.finalSurgeAge).toBeGreaterThan(1.2);
});
test('the manga explosion flash starts when the losing actor is hit, including a boss victory',()=>{
 for(const won of [true,false]){
  const s=reversal(),q=s.powerClash;q.state='resolve';q.age=.39;q.won=won;q.impactAge=99;tick(s,.025);
  expect(q.state).toBe('flight');expect(q.impactCause).toBe('explosion');expect(q.explosion).toEqual({x:q.flight.x,y:q.flight.y-70});expect(clashImpactTiming(q).manga).toBeGreaterThan(.9);expect(clashImpactTiming(q,true).manga).toBe(0);
 }
});
test('the storm paints its complete source cel without an intermediate rectangular crop',()=>{
 const calls=[],c=new Proxy({drawImage:(...args)=>calls.push(args),createRadialGradient:()=>({addColorStop(){}})},{get:(t,k)=>t[k]??(()=>{}),set:(t,k,v)=>(t[k]=v,true)}),img={width:2048,height:1024};
 const previous=globalThis.document;globalThis.document={createElement:()=>({getContext:()=>c})};
 try{drawNightmareStormStream(c,{'aerial-candy-vortex':img},2,{x:100,y:100},{x:850,y:300},600);}finally{globalThis.document=previous;}
 const call=calls.find(q=>q[0]===img);expect(call.slice(1,5)).toEqual([1024,0,512,512]);expect(episodeTwoArtPaths()['aerial-candy-vortex']).toContain('nightmare-performance-v10');
});
test('each descending sequence has eight distinct padded drawings and the full vortex has transparent gutters',async()=>{
 for(const name of ['staff-down-2','staff-down-3','moon-storm']){
  const hashes=new Set();for(let f=0;f<8;f++){
   const rgba=await sharp(`public/arcade/act-two/nightmare-combo-v9/${name}.webp`).extract({left:f%4*512,top:Math.floor(f/4)*512,width:512,height:512}).ensureAlpha().raw().toBuffer();
   for(let i=0;i<rgba.length;i+=4)if(!rgba[i+3])rgba.fill(0,i,i+3);hashes.add(createHash('sha256').update(rgba).digest('hex'));
   for(let x=0;x<512;x++)expect(rgba[x*4+3]+rgba[((511*512)+x)*4+3]).toBe(0);
  }expect(hashes.size).toBe(8);
 }
});
