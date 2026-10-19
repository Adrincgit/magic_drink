import {test,expect} from '@playwright/test';
import sharp from 'sharp';
import {createHash} from 'node:crypto';
import {createAdventure,stepAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {actTwoBossDrawing} from '../src/components/arcade/adventure/actors/bosses/adventureActTwoBosses';
import {startNightmareGame} from '../src/components/arcade/adventure/actors/bosses/nightmareGames';
import {nightmareStaffStrike,nightmareStaffParry} from '../src/components/arcade/adventure/actors/bosses/nightmareStaffDefense';
import {hexyPose} from '../src/components/arcade/adventure/actors/hexy/hexyAnimation';
import {nightmarePressureFrame} from '../src/components/arcade/adventure/engine/nightmarePressureActing';
import {nightmareFabricFrame,nightmareFloorPlacement,nightmareSkyPlacement,nightmareRoomSway} from '../src/components/arcade/adventure/render/nightmareArenaCanvas';
import {beginNightmareUltimate} from '../src/components/arcade/adventure/actors/bosses/nightmareUltimate';
import {NIGHTMARE_PERFORMANCE_PALMS} from '../src/components/arcade/adventure/actors/bosses/nightmarePerformanceRegistration';
const tick=(s,t,input={})=>{for(let i=0;i<Math.round(t*120);i++)stepAdventure(s,input,1/120);};
function battle(stage=3){const s=createAdventure(10),a=s.level.arena;s.enemies=[];s.supplies=[];s.arenaLocked=true;Object.assign(s.player,{x:4000,y:a.y,ground:1,hurt:999,dir:1});Object.assign(s.boss,{x:4450,y:a.y,dir:-1,stage,hp:260,phase:'recover',timer:99,engaged:true,vulnerable:true,encoreAid:true,nightmareCooldown:999,staffDefenseCooldown:999});return s;}
test('ordinary jumps use anticipation, seven airborne drawings and three landing drawings',()=>{
 for(const stage of [1,2,3]){const s=battle(stage),frames=new Set();startNightmareGame(s,'moon-hop');for(let i=0;i<312;i++){const d=actTwoBossDrawing(s);if(d.key.startsWith('nightmare-jump-'))frames.add(d.frame);stepAdventure(s,{},1/120);}expect([...frames].sort((a,b)=>a-b)).toEqual(Array.from({length:12},(_,i)=>i));}
});
test('running keeps twelve gait cels in every phase',()=>{
 for(const stage of [1,2,3]){const s=battle(stage),frames=new Set();s.boss.phase='patrol';s.boss.timer=99;for(let i=0;i<156;i++){stepAdventure(s,{},1/120);const d=actTwoBossDrawing(s);if(d.key.endsWith('-walk'))frames.add(d.frame);}expect(frames.size).toBe(12);}
});
test('incoming normal shots trigger a staff spin while heavy and rear shots have openings',()=>{
 const s=battle(),b=s.boss;b.phase='patrol';b.timer=99;b.staffDefenseCooldown=0;const q={x:b.x-240,y:b.y-48,vx:750,vy:0,r:9,kind:0,damage:3,age:0,life:2,hits:[]};s.shots.push(q);const hp=b.hp;tick(s,.4);
 expect(b.game.kind).toBe('staff-spin');expect(b.staffParries).toBeGreaterThan(0);expect(q.life).toBe(0);expect(b.hp).toBe(hp);expect(actTwoBossDrawing(s).key).toBe('nightmare-staff-defense-3');
 expect(nightmareStaffParry(s,{...q,life:1,heavy:true})).toBe(false);expect(nightmareStaffParry(s,{...q,life:1,x:b.x+90,previousX:b.x+100})).toBe(false);expect(b.vulnerable).toBe(true);tick(s,1);expect(b.phase).toBe('recover');expect(b.staffDefenseCooldown).toBeGreaterThan(0);
});
test('a shield rebounds the arms and provokes a finite flurry without losing hearts',()=>{
 const s=battle(),b=s.boss;s.player.hurt=0;startNightmareGame(s,'staff-counter');s.player.dir=-1;const hearts=s.hearts,frames=new Set(),contacts=new Set();
 for(let i=0;i<348;i++){stepAdventure(s,{guard:true},1/120);const d=actTwoBossDrawing(s);if(d.key==='nightmare-staff-defense-3')frames.add(d.frame);if(b.staffContact)contacts.add(b.staffContact.at);}
 expect(s.hearts).toBe(hearts);expect(contacts.size).toBeGreaterThanOrEqual(4);expect([...frames].some(f=>f>=8&&f<=11)).toBe(true);expect([...frames].some(f=>f>=12)).toBe(true);expect(s.magic).toBeLessThan(100);tick(s,.7);expect(b.phase).toBe('recover');expect(b.vulnerable).toBe(true);
});
test('staff hits play Hexy physical reaction cels and heavy hits play the eight-cel fall',()=>{
 const s=battle();s.player.hurt=0;startNightmareGame(s,'staff-counter');const light=new Set(),hearts=s.hearts;for(let i=0;i<200;i++){stepAdventure(s,{},1/120);const d=hexyPose(s);if(d.sheet==='reactions'&&s.player.hitType==='physical'&&s.player.hitReact>0)light.add(d.frame);}expect(s.hearts).toBe(hearts-1);expect(light.size).toBeGreaterThanOrEqual(3);
 const heavy=battle();tick(heavy,1/120);heavy.player.hurt=0;heavy.boss.x=heavy.player.x+60;nightmareStaffStrike(heavy,{heavy:true,followup:false});const fall=new Set();for(let i=0;i<240;i++){const d=hexyPose(heavy);if(d.sheet==='knockdown')fall.add(d.frame);stepAdventure(heavy,{},1/120);}expect(heavy.player.hitType).toBe('physical');expect(fall.size).toBe(8);
});
test('wind displacement is a single quick burst without health damage or projectiles',()=>{
 for(const kind of ['wind-tug','wind-push']){const s=battle(),x=s.player.x,hearts=s.hearts;startNightmareGame(s,kind);tick(s,.8);const end=s.player.x;expect(Math.abs(end-x)).toBeGreaterThan(40);expect(s.hearts).toBe(hearts);expect(s.hostile).toHaveLength(0);tick(s,.3);expect(s.player.x).toBe(end);}
});
test('the boss reacts only after second Encore discharges and becomes desperate near defeat',()=>{
 const s=battle();beginNightmareUltimate(s);tick(s,1.9);stepAdventure(s,{super:true},1/120);for(let i=0;i<2400&&!s.powerClash.boostReady;i++)stepAdventure(s,{attack:i%12<6},1/120);
 const q=s.powerClash;q.pressure=.08;q.portraitPressure=.08;stepAdventure(s,{super:true},1/120);tick(s,.8);expect(q.state).toBe('hexy-boost');expect(nightmarePressureFrame(q,s.fxTime,true)).toBeLessThan(12);expect(q.counterReactionAge).toBeUndefined();tick(s,.08);expect(q.hexyReleased).toBe(true);expect(nightmarePressureFrame(q,s.fxTime,true)).toBeGreaterThanOrEqual(20);tick(s,.5);expect(Math.floor(nightmarePressureFrame(q,s.fxTime,true)/4)).toBe(3);q.pressure=.94;q.portraitPressure=.94;expect(Math.floor(nightmarePressureFrame(q,s.fxTime,true)/4)).toBe(4);
});
test('city and moon retain stable geometry while four actual fabric frames change',()=>{
 const s=battle(),q=nightmareFloorPlacement(s,{width:1536,height:1024}),positions=[],frames=new Set();for(const t of [0,.18,.35,.52]){s.fxTime=t;positions.push(nightmareSkyPlacement(s,q));frames.add(nightmareFabricFrame(s));expect(nightmareRoomSway(s,100,false,'city')).toBe(0);}expect(frames.size).toBe(4);expect(positions.every(p=>p.x===positions[0].x&&p.y===positions[0].y)).toBe(true);expect(nightmareFabricFrame(s,true)).toBe(0);
});
test('movement, defense, Halloween storm and fabric contain distinct real drawings',async()=>{
 for(const [name,count]of Object.entries({'jump-2':12,'jump-3':12,'staff-defense-2':16,'staff-defense-3':16,'halloween-vortex-16':16,'clash-plasma':8,'fast-wind':8})){const file=`public/arcade/act-two/nightmare-performance-v10/${name}.webp`,m=await sharp(file).metadata(),side=m.width/4,hashes=new Set();for(let f=0;f<count;f++){const data=await sharp(file).extract({left:f%4*side,top:Math.floor(f/4)*side,width:side,height:side}).ensureAlpha().raw().toBuffer();for(let p=0;p<data.length;p+=4)if(!data[p+3])data.fill(0,p,p+3);hashes.add(createHash('sha256').update(data).digest('hex'));}expect(hashes.size,name).toBe(count);}
 const cloth=[];for(let i=0;i<4;i++)cloth.push(createHash('sha256').update(await sharp(`public/arcade/act-two/nightmare-performance-v10/cloth-${i}.webp`).raw().toBuffer()).digest('hex'));expect(new Set(cloth).size).toBe(4);expect(NIGHTMARE_PERFORMANCE_PALMS).toHaveLength(24);
});
