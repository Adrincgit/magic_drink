import {test,expect} from '@playwright/test';
import {createAdventure,stepAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {beginNightmareUltimate} from '../src/components/arcade/adventure/actors/bosses/nightmareUltimate';
import {nightmareContact} from '../src/components/arcade/adventure/engine/nightmarePowerClash';
import {nightmarePressureFrame} from '../src/components/arcade/adventure/engine/nightmarePressureActing';
import {startNightmareGame} from '../src/components/arcade/adventure/actors/bosses/nightmareGames';
import {damageActTwoBoss,actTwoBossDrawing} from '../src/components/arcade/adventure/actors/bosses/adventureActTwoBosses';
import {nightmareIllusionCopies} from '../src/components/arcade/adventure/actors/bosses/nightmareIllusions';
import {hexyPose} from '../src/components/arcade/adventure/actors/hexy/hexyAnimation';
import sharp from 'sharp';
import {createHash} from 'node:crypto';
const tick=(s,t,input={})=>{for(let i=0;i<Math.round(t*120);i++)stepAdventure(s,input,1/120);};
function battle(){const s=createAdventure(10),a=s.level.arena;s.enemies=[];s.supplies=[];s.arenaLocked=true;Object.assign(s.player,{x:4000,y:a.y,ground:1,hurt:999,dir:1});Object.assign(s.boss,{x:4400,y:a.y,stage:3,hp:234,phase:'recover',timer:100,engaged:true,vulnerable:true,encoreAid:true,nightmareCooldown:999,staffDefenseCooldown:999});return s;}
function duel(){const s=battle();s.boss.x=5250;beginNightmareUltimate(s);tick(s,1.9);stepAdventure(s,{super:true},1/120);for(let i=0;i<700&&s.powerClash.state!=='contest';i++)stepAdventure(s,{},1/120);return s;}

test('the surprise surge waits for the beam to nearly reach her, including clock expiry while ahead',()=>{
 const s=duel(),q=s.powerClash;tick(s,2);expect(q.bossBoost).toBe(false);
 q.pressure=.87;stepAdventure(s,{attack:true},1/120);expect(q.state).toBe('boss-boost');expect(q.boostPressure).toBeGreaterThan(.88);
 const late=duel(),z=late.powerClash;z.contestAge=z.limit-.001;z.pressure=.65;stepAdventure(late,{},1/120);expect(z.state).toBe('boss-boost');expect(z.won).toBeNull();
});

test('expiry never kills Hexy or awards a victory with the beams still in the arena',()=>{
 for(const pressure of [.18,.45,.7]){const s=duel(),q=s.powerClash;Object.assign(q,{bossBoost:true,hexyBoost:true,hexyReleased:true,pressure,contestAge:80,limit:1});tick(s,.08);expect(q.state).toBe('contest');expect(q.won).toBeNull();expect(s.hearts).toBe(5);}
});

test('loss starts only at Hexy actual endpoint and victory only at the boss endpoint',()=>{
 for(const won of [false,true]){const s=duel(),q=s.powerClash;Object.assign(q,{bossBoost:true,hexyBoost:true,hexyReleased:true,pressure:won?.985:.006,contestAge:2,limit:1});const before=nightmareContact(s);expect(Math.hypot(before.x-before.a.x,before.y-before.a.y)).toBeGreaterThan(1);stepAdventure(s,won?{attack:true}:{},1/120);if(!won)tick(s,.06);expect(q.state).toBe('resolve');expect(q.won).toBe(won);const h=nightmareContact(s),end=won?h.b:h.a;expect(Math.hypot(h.x-end.x,h.y-end.y)).toBeLessThan(.01);}
});

test('double Encore recenters the contact but stopping presses can still lose and shows effortful joy',()=>{
 const s=duel(),q=s.powerClash;Object.assign(q,{bossBoost:true,boostReady:true,pressure:.12});stepAdventure(s,{super:true},1/120);for(let i=0;i<240&&q.state==='hexy-boost';i++)stepAdventure(s,{},1/120);expect(q.pressure).toBe(.5);
 tick(s,1.1);expect(q.state).toBe('contest');expect(q.pressure).toBeLessThan(.42);expect(Math.floor(nightmarePressureFrame(q,s.fxTime,true)/4)).toBe(6);
 for(let i=0;i<120*9&&q.state==='contest';i++)stepAdventure(s,{},1/120);expect(q.won).toBe(false);expect(q.pressure).toBe(0);tick(s,.42);expect(q.state).toBe('flight');expect(s.hearts).toBe(0);expect(s.done).toBe(false);tick(s,5);expect(s.done).toBe(true);
});

test('the aerial ultimate belongs to the last health stretch and a large hit cannot skip it',()=>{
 const s=battle(),b=s.boss;b.nightmareCooldown=0;tick(s,.5);expect(b.nightmareUltimate).toBeUndefined();
 damageActTwoBoss(s,999);expect(b.hp).toBe(1);b.phase='recover';b.timer=1;tick(s,.02);expect(b.nightmareUltimate.state).toBe('leap');expect(b.nightmareLastStandUsed).toBe(true);
});

test('an uncountered beam is fast and a direct hit is lethal through guard, shields and hurt grace',()=>{
 const s=battle();s.shield=3;s.player.hurt=999;s.hostile=[{x:s.player.x-210,y:s.player.y-36,vx:2450,vy:0,r:65,life:3,age:0,actTwo:true,kind:'nightmare-storm',element:'magic',floor:s.level.arena.y}];tick(s,.12,{guard:true});expect(s.hearts).toBe(0);expect(s.playerDefeat).toBeTruthy();expect(s.boss.nightmareBlast).toBeTruthy();
 const actual=battle();beginNightmareUltimate(actual);for(let i=0;i<120*6&&!actual.hostile.some(q=>q.kind==='nightmare-storm');i++)stepAdventure(actual,{},1/120);expect(Math.hypot(actual.hostile[0].vx,actual.hostile[0].vy)).toBe(2450);
});

test('floor detonation expands purple wind, knocks Hexy down and preserves every heart',()=>{
 const s=battle(),x=s.player.x;s.hostile=[{x:x-460,y:s.level.arena.y-100,vx:0,vy:2450,r:65,life:3,age:0,actTwo:true,kind:'nightmare-storm',floor:s.level.arena.y}];tick(s,.4);expect(s.hearts).toBe(5);expect(s.boss.nightmareBlast.windHit).toBe(true);expect(s.player.knockdown).toBeTruthy();expect(s.player.x).toBeGreaterThan(x);expect(hexyPose(s).sheet).toBe('knockdown');tick(s,2);expect(s.hearts).toBe(5);expect(s.boss.nightmareBlast).toBeUndefined();
});

test('the actual AI plays a varied deck of attacks and acrobatics before its last stand',()=>{
 const s=battle(),seen=new Set();s.boss.phase='patrol';s.boss.timer=0;s.boss.nightmareCooldown=0;
 for(let i=0;i<120*65;i++){stepAdventure(s,{},1/120);if(s.boss.game)seen.add(s.boss.game.kind);}
 expect(seen.size).toBeGreaterThanOrEqual(7);expect(seen.has('staff-vault')).toBe(true);expect(seen.has('prism-mirage')).toBe(true);expect(seen.has('staff-chain')).toBe(true);expect(s.boss.nightmareUltimate).toBeUndefined();
});

test('a reactive staff counter does not consume and permanently skip the next wind attack',()=>{
 const s=battle(),b=s.boss;b.phase='patrol';b.timer=0;b.turn=6;b.staffCooldown=0;b.x=s.player.x+130;stepAdventure(s,{},1/120);expect(b.game.kind).toBe('staff-counter');expect(b.turn).toBe(6);
 let wind=false;for(let i=0;i<120*7;i++){stepAdventure(s,{},1/120);wind||=b.game?.kind==='wind-push';}expect(wind).toBe(true);
});

test('illusory casters move, change drawn poses and fire their own staggered projectiles',()=>{
 const s=battle();startNightmareGame(s,'prism-mirage');tick(s,.8);const before=nightmareIllusionCopies(s).map(q=>q.x),frames=new Set(),sources=new Set();
 for(let i=0;i<120*3;i++){stepAdventure(s,{},1/120);for(const q of nightmareIllusionCopies(s)){frames.add(q.key+':'+q.frame);expect(Number.isFinite(q.x)).toBe(true);}for(const q of s.hostile)if(q.illusion!==undefined)sources.add(q.illusion);}
 expect(sources.size).toBe(2);expect(frames.size).toBeGreaterThanOrEqual(8);const after=nightmareIllusionCopies(s).map(q=>q.x);expect(after.some((x,i)=>Math.abs(x-before[i])>30)).toBe(true);expect(s.enemies).toHaveLength(0);
});

test('wide staff and vault movements use their own anticipation, smear and recovery drawings',()=>{
 for(const kind of ['staff-sweep','staff-vault']){const s=battle(),frames=new Set(),heights=[];startNightmareGame(s,kind);for(let i=0;i<120*1.8;i++){const d=actTwoBossDrawing(s);if(d.key==='nightmare-staff-sweep-3')frames.add(d.frame);heights.push(s.boss.y);stepAdventure(s,{},1/120);}expect(frames.size).toBeGreaterThanOrEqual(kind==='staff-vault'?4:8);if(kind==='staff-vault')expect(Math.min(...heights)).toBeLessThan(s.level.arena.y-170);}
});

test('the attacking doubles can make physical contact rather than being harmless decorations',()=>{
 const s=battle();startNightmareGame(s,'prism-mirage');let physical=false;
 for(let i=0;i<120*3.8;i++){s.player.hurt=0;s.hearts=5;stepAdventure(s,{},1/120);if(s.hearts<5&&s.player.hitType==='physical')physical=true;}
 expect(physical).toBe(true);
});

test('the new weapon smears and purple blast have distinct full drawings with transparent borders',async()=>{
 for(const [name,count]of [['staff-sweep-2',12],['staff-sweep-3',12],['purple-detonation',8]]){
  const hashes=new Set();for(let frame=0;frame<count;frame++){
   const b=await sharp(`public/arcade/act-two/nightmare-combat-v11/${name}.webp`).extract({left:frame%4*512,top:Math.floor(frame/4)*512,width:512,height:512}).ensureAlpha().raw().toBuffer();
   for(let i=0;i<b.length;i+=4)if(!b[i+3])b.fill(0,i,i+3);hashes.add(createHash('sha256').update(b).digest('hex'));
   for(let p=0;p<512;p++)expect(b[p*4+3]+b[(511*512+p)*4+3]+b[p*512*4+3]+b[(p*512+511)*4+3]).toBe(0);
  }expect(hashes.size).toBe(count);
 }
});
