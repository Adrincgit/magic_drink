import {test,expect} from '@playwright/test';
import fs from 'node:fs/promises';
import sharp from 'sharp';
import {createHash} from 'node:crypto';
import {createAdventure,stepAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {actTwoBossDrawing,actTwoBossBody,actTwoBossMuzzle} from '../src/components/arcade/adventure/actors/bosses/adventureActTwoBosses';
import {startNightmareGame} from '../src/components/arcade/adventure/actors/bosses/nightmareGames';
import {nightmareMirage} from '../src/components/arcade/adventure/render/nightmareIllusionCanvas';
import {NIGHTMARE_BODY_MUZZLES} from '../src/components/arcade/adventure/actors/bosses/nightmareBodyRegistration';
import {beginNightmareUltimate} from '../src/components/arcade/adventure/actors/bosses/nightmareUltimate';
const tick=(s,time)=>{for(let i=0;i<Math.round(time*120);i++)stepAdventure(s,{},1/120);};
function battle(stage){
 const s=createAdventure(10),a=s.level.arena;s.enemies=[];s.supplies=[];s.arenaLocked=true;
 Object.assign(s.player,{x:2850,y:a.y,ground:1,hurt:999});
 Object.assign(s.boss,{stage,x:5000,y:a.y,hp:stage===3?260:500,phase:'recover',timer:99,engaged:true,vulnerable:true,encoreAid:true,nightmareCooldown:999});return s;
}
test('all three standing cel loops stay fifteen percent taller than the actual Hexy drawing',async()=>{
 const r=JSON.parse(await fs.readFile('context/arcade/nightmare-coherence-v7/registration.json','utf8'));
 for(let stage=1;stage<=3;stage++){
  const s=battle(stage),frames=new Set(),sizes=new Set();
  for(let i=0;i<80;i++){tick(s,1/120);const d=actTwoBossDrawing(s),n=r.registration[d.key][d.frame];frames.add(d.frame);sizes.add(d.size);
   expect(d.key).toBe(`nightmare-phase-${stage}-idle`);expect(n.visibleHeight/r.reference.hexyHeight).toBeGreaterThan(1.13);expect(n.visibleHeight/r.reference.hexyHeight).toBeLessThan(1.17);
  }
  expect(frames.size).toBe(4);expect(sizes.size).toBe(1);expect(actTwoBossBody(s).h).toBeLessThan(r.reference.targetHeight);
 }
});
test('the added cel sheets contain four distinct transparent drawings and palm sockets stay on the white glove',async()=>{
 for(let stage=1;stage<=3;stage++)for(const kind of ['idle','cast']){
  const file=`public/arcade/act-two/nightmare-coherence-v7/phase-${stage}-${kind}.webp`,hashes=[];
  const s=battle(stage);if(kind==='cast')startNightmareGame(s,'candy-fan');
  for(let f=0;f<4;f++){
   const rgba=await sharp(file).extract({left:f*512,top:0,width:512,height:512}).ensureAlpha().raw().toBuffer();
   for(let p=0;p<512*512;p++)if(!rgba[p*4+3])rgba.fill(0,p*4,p*4+3);
   hashes.push(createHash('sha256').update(rgba).digest('hex'));
   for(const p of [0,511,511*512,512*512-1])expect(rgba[p*4+3]).toBe(0);
   if(kind==='cast'){const tip=NIGHTMARE_BODY_MUZZLES[`nightmare-phase-${stage}-cast`][f],p=(Math.round(tip[1])*512+Math.round(tip[0]))*4;expect(rgba[p+3]).toBeGreaterThan(150);expect(Math.min(...rgba.subarray(p,p+3))).toBeGreaterThan(160);}
  }
  expect(new Set(hashes).size).toBe(4);
  if(kind==='cast')for(const dir of [-1,1]){s.boss.dir=dir;const m=actTwoBossMuzzle(s);expect((m.x-s.boss.x)*dir).toBeGreaterThan(15);expect(m.y).toBeLessThan(s.boss.y-35);}
 }
});
test('ordinary movement accelerates with each phase without removing the warned blink escape window',()=>{
 const distances=[];
 for(let stage=1;stage<=3;stage++){const s=battle(stage);s.boss.phase='patrol';const x=s.boss.x;tick(s,.5);distances.push(Math.abs(s.boss.x-x));}
 expect(distances[1]).toBeGreaterThan(distances[0]*1.3);expect(distances[2]).toBeGreaterThan(distances[1]*1.2);expect(distances[2]*2).toBeGreaterThan(255);
 const s=battle(3);startNightmareGame(s,'wind-blink');tick(s,.7);expect(nightmareMirage(s)?.strength).toBeGreaterThan(.5);
 tick(s,.55);expect(s.boss.game.arrived).toBe(true);expect(s.hostile).toHaveLength(0);expect(s.boss.vulnerable).toBe(true);
 tick(s,.6);expect(s.hostile).toHaveLength(3);expect(s.enemies).toHaveLength(0);expect(s.dreamMirrors).toHaveLength(0);
 expect(s.hostile.every(q=>q.windShape==='wind-blink')).toBe(true);
});
test('winning the aerial clash continues the landed defeat instead of replaying an upright fall',()=>{
 const s=battle(3);beginNightmareUltimate(s);tick(s,1.9);stepAdventure(s,{super:true},1/120);
 for(let i=0;i<120*30&&s.powerClash;i++){const q=s.powerClash;stepAdventure(s,{attack:i%12<6,super:q.boostReady&&!q.hexyBoost},1/120);}
 expect(s.boss.hp).toBe(0);expect(s.powerClash).toBeNull();expect(s.boss.phase).toBe('dying');expect(actTwoBossDrawing(s).frame).toBe(15);
 tick(s,.2);expect(actTwoBossDrawing(s).frame).toBe(15);tick(s,.4);expect(s.boss.defeat.ready).toBe(true);
});
