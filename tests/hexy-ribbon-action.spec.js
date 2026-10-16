import {test,expect} from '@playwright/test';
import {createTrial} from '../src/components/arcade/adventure/engine/adventureTrial';
import {stepAdventure} from '../src/components/arcade/adventure/engine/adventureModel';
import {MODS} from '../src/components/arcade/adventure/engine/adventureMods';
import {makeEnemy} from '../src/components/arcade/adventure/actors/enemies/adventureEnemies';
import {hexyPose,hexyMuzzle} from '../src/components/arcade/adventure/actors/hexy/hexyAnimation';
import {swapDrink} from '../src/components/arcade/adventure/engine/adventureAmmo';
import {ribbonControl,stepRibbonControl,ribbonSlide} from '../src/components/arcade/adventure/engine/adventureRibbonControl';
const scene=(level=1)=>{const s=createTrial(MODS.find(m=>m.id==='ribbon-duration'),level);s.enemies=[];s.supplies=[];s.cages=[];s.outposts=[];tick(s,86);return s;};
const tap=(s,input)=>{tick(s,1,input);tick(s,1,{...input,special:false});};
const tick=(s,n,input={})=>{for(let i=0;i<n;i++)stepAdventure(s,input,1/120);};
const enemy=(s,dx,type=0)=>{const e=makeEnemy(s.player.x+dx,s.player.y,type);e.hp=100;e.recovery=99;e.timer=99;return e;};

test('tapped basics chain distinct body poses without overlapping whips and resets after a pause',()=>{
 const s=scene(),poses=new Set(),starts=[];let last;
 for(let i=0;i<150;i++){tick(s,1,{attack:i%46===0});const q=s.shots.find(q=>q.ribbon);if(q&&q!==last){starts.push(q.ribbonCombo);last=q;}expect(s.shots.filter(q=>q.ribbon)).toHaveLength(q?1:0);const pose=hexyPose(s);if(pose.sheet==='ribbon-action')poses.add(pose.frame);}
 expect(starts.slice(0,4)).toEqual([0,1,0,1]);expect([...poses].sort()).toEqual([0,1,2,3,4,5,6,7]);tick(s,100);tick(s,1,{attack:true});expect(s.player.ribbonCombo).toBe(0);
});

test('a recovery tap buffers one strike, while guard and dash cancel the pending strike',()=>{
 const s=scene();tick(s,1,{attack:true});tick(s,29);tick(s,1,{attack:true});const ammo=s.ammo;tick(s,19);expect(s.ammo).toBe(ammo);expect(s.player.ribbonCombo).toBe(1);tick(s,120);expect(s.ammo).toBe(ammo);
 for(const cancel of [{guard:true},{dash:true}]){const q=scene();tick(q,1,{attack:true});tick(q,29);tick(q,1,{attack:true});const ammo=q.ammo;tick(q,1,cancel);tick(q,45);expect(q.ammo).toBe(ammo);expect(q.shots.some(s=>s.ribbon||s.ribbonProbe)).toBe(false);}
});

test('strong has a harmless anticipation, one low-damage launch and a visible airborne reaction on small clowns',()=>{
 const s=scene(),e=enemy(s,170);s.enemies=[e];const ammo=s.ammo;tap(s,{special:true});tick(s,30);expect(e.hp).toBe(100);expect(e.y).toBe(e.baseY);expect(s.ammo).toBe(ammo);
 let impact=false;for(let i=0;i<32;i++){tick(s,1);if(e.ribbonLift){impact=true;expect(e.vy).toBeLessThan(0);expect(s.hitStop).toBeGreaterThan(0);break;}}expect(impact).toBe(true);expect(e.hp).toBe(97.5);tick(s,25);expect(e.y).toBeLessThan(e.baseY-20);tick(s,150);expect(e.hp).toBe(97.5);expect(e.y).toBe(e.baseY);expect(e.ribbonLift).toBe(false);
});

test('strong affects machinery as damage only and cannot lift a shielded umbrella clown',()=>{
 for(const type of [5,12]){const s=scene(),e=enemy(s,190,type);s.enemies=[e];tap(s,{special:true});tick(s,110);expect(e.hp).toBe(97.5);expect(e.jellyLift||0).toBe(0);expect(e.y).toBe(e.baseY);}
 const s=scene(),e=enemy(s,160,14);e.umbrellaAge=.1;e.dir=-1;s.enemies=[e];tap(s,{special:true});tick(s,80);expect(e.hp).toBe(100);expect(e.ribbonLift).toBeFalsy();
});

test('strong clears only projectiles reached during the strike, leaving persistent fire and distant shots intact',()=>{
 const s=scene();tap(s,{special:true});tick(s,44);const q=s.shots.find(q=>q.ribbon),point=q.points[Math.floor(q.points.length*.6)];
 const bullet={x:point.x,y:point.y,vx:-25,vy:0,r:8,life:4,age:0,kind:'streamer'},fire={...bullet,vx:0,kind:'harlequin-groundfire'},far={...bullet,x:1100};s.hostile=[bullet,fire,far];tick(s,1);
 expect(bullet.life).toBe(0);expect(fire.life).toBeGreaterThan(0);expect(far.life).toBeGreaterThan(0);expect(s.events).toContain('ribbonParry');
});

test('strong respects solid terrain, mirrored aim and canceling out of the windup',()=>{
 const s=scene(),e=enemy(s,215);s.enemies=[e];s.platforms.push({x:s.player.x+115,y:250,baseY:250,w:25,h:230,dx:0,dy:0});tap(s,{special:true});tick(s,110);expect(e.hp).toBe(100);
 const left=scene();left.player.x=650;left.player.dir=-1;const target=enemy(left,-175);left.enemies=[target];tap(left,{special:true});tick(left,100);expect(target.hp).toBe(97.5);
 for(const cancel of [{dash:true},{guard:true}]){const s=scene(),e=enemy(s,170);s.enemies=[e];tap(s,{special:true});tick(s,12);tick(s,1,cancel);tick(s,100);expect(e.hp).toBe(cancel.dash?98:100);expect(s.shots.some(q=>q.ribbon||q.ribbonProbe)).toBe(false);}
});

test('Ribbon attacks use the transformation timer, prevent swapping and keep mastery damage bounded',()=>{
 for(const n of [1,2,3]){const s=scene(n),ammo=s.ammo;s.spareDrink={kind:0,ammo:54,capacity:54,tier:1};expect(swapDrink(s)).toBe(false);tap(s,{special:true});const q=s.shots.find(q=>q.ribbon);expect(q.damage).toBe(2.5);expect(q.ribbonDuration).toBeCloseTo(.7/[1,1.28,1.48][n-1]);tick(s,8);expect(q.ribbonOrigin.x).toBeCloseTo(hexyMuzzle(s).x);expect(s.ammo).toBe(ammo);}
});

test('X X Y performs a full turn, reaches both sides and finishes by binding contacted small clowns',()=>{
 const s=scene();s.player.x=500;tick(s,1,{attack:true});tick(s,44);tick(s,1,{attack:true});tick(s,34);expect(s.player.ribbonCount).toBe(2);
 const front=enemy(s,180),rear=enemy(s,-145);s.enemies=[front,rear];const ammo=s.ammo;tap(s,{special:true});const q=s.shots.find(q=>q.ribbonStrong),frames=new Set();let spinning=false,slammed=false;
 for(let i=0;i<190;i++){tick(s,1);const pose=hexyPose(s);if(pose.sheet==='ribbon-spin'){frames.add(pose.frame);spinning=true;}if(s.events.includes('ribbonSlam'))slammed=true;}
 expect(spinning&&slammed).toBe(true);expect([...frames].sort()).toEqual([0,1,2,3,4,5,6,7]);expect(front.hp).toBeGreaterThanOrEqual(94);expect(front.hp).toBeLessThan(100);expect(rear.hp).toBe(99);expect(s.ammo).toBe(ammo);expect(q.life).toBeLessThanOrEqual(0);
});

test('held Y waits for release, performs one charged sweep and consumes only time',()=>{
 const s=scene(),ammo=s.ammo;tick(s,120,{special:true});expect(s.shots.some(q=>q.ribbon)).toBe(false);expect(s.player.ribbonCharge.age).toBeGreaterThan(.5);
 tick(s,1);const q=s.shots.find(q=>q.ribbonStrong);expect(q.ribbonBurst).toBe(true);tick(s,230);expect(s.ammo).toBe(ammo);expect(s.shots.some(q=>q.ribbon)).toBe(false);expect(q.spinTime).toBeLessThan(.46);
});

test('X Y launches and directional Y pushes without killing an ordinary clown',()=>{
 for(const kind of ['launch','push']){const s=scene(),e=enemy(s,170);e.hp=4.6;s.enemies=[e];const start=e.x;
  if(kind==='launch'){tick(s,1,{attack:true});tick(s,1);}
  tap(s,{special:true,...(kind==='push'?{right:true}:{})});expect(s.shots.find(q=>q.ribbonStrong).ribbonFinisher).toBe(kind);
  let lifted=false;for(let i=0;i<110;i++){tick(s,1);lifted||=!!e.ribbonLift;}
  expect(e.hp).toBeGreaterThan(0);expect(kind==='launch'?lifted:e.x>start+35).toBe(true);
 }
});

test('Y Y cancels recovery into a floor slam; even a defeated clown lands and pushes nearby basics only',()=>{
 const s=scene(),e=enemy(s,170),near=enemy(s,285),machine=enemy(s,300,12),far=enemy(s,475);e.hp=4.6;s.enemies=[e,near,machine,far];const ammo=s.ammo;
 tap(s,{special:true});for(let i=0;i<100&&!s.player.ribbonCanChain;i++)tick(s,1);
 expect(e.hp).toBeGreaterThan(0);expect(e.ribbonLift).toBe(true);expect(e.y).toBeLessThan(e.baseY);
 tap(s,{special:true});tick(s,Math.ceil(s.hitStop*120)+1);expect(s.shots.find(q=>q.ribbonStrong).ribbonFinisher).toBe('slam');let landed=false,score;
 for(let i=0;i<140;i++){tick(s,1);if(s.events.includes('ribbonGroundImpact')){landed=true;score=s.score;expect(e.y).toBe(e.baseY);expect(e.defeated).toBe(true);}}
 expect(landed).toBe(true);expect(s.ammo).toBe(ammo);expect(near.x).toBeGreaterThan(s.player.x+310);expect(near.hp).toBe(100);expect(machine.x).toBe(machine.home);expect(far.x).toBe(far.home);expect(s.score).toBe(score);
});

test('binding is attached to actual contacts, limited to three basics, expires, and cannot be refreshed indefinitely',()=>{
 const s=scene();s.player.x=600;tick(s,1,{attack:true});tick(s,44);tick(s,1,{attack:true});tick(s,30);
 const targets=[-140,110,175,220].map(x=>enemy(s,x)),machine=enemy(s,180,12);s.enemies=[...targets,machine];tap(s,{special:true});
 let bound=[];for(let i=0;i<180;i++){tick(s,1);bound=targets.filter(e=>e.ribbonBound>0);if(bound.length===3)break;}
 expect(bound).toHaveLength(3);expect(machine.ribbonBound||0).toBe(0);expect(s.drinkFields).toHaveLength(0);const victim=bound[0],x=victim.x,duration=victim.ribbonControl.duration;
 tick(s,20);expect(victim.x).toBe(x);const age=victim.ribbonControl.age;expect(age).toBeGreaterThan(0);ribbonControl(s,victim,'bind');expect(victim.ribbonControl.duration).toBe(duration);expect(victim.ribbonControl.age).toBe(age);
 for(let i=0;i<220&&victim.ribbonBound>0;i++)tick(s,1);expect(victim.ribbonBound).toBe(0);ribbonControl(s,victim,'bind');expect(victim.ribbonControl).toBeNull();
});

test('the full XXY sequence can bind a normal campaign clown without killing it first',()=>{
 const s=scene(),e=enemy(s,155);e.hp=4.6;s.enemies=[e];tick(s,1,{attack:true});tick(s,44);tick(s,1,{attack:true});tick(s,35);tap(s,{special:true});
 let bound=false;for(let i=0;i<165;i++){tick(s,1);if(e.ribbonBound>0)bound=true;}
 expect(bound).toBe(true);expect(e.hp).toBeGreaterThan(0);expect(e.hp).toBeLessThan(2);
});

test('a blocked spin cannot secretly bind the umbrella wearer at the end of XXY',()=>{
 const s=scene();tick(s,1,{attack:true});tick(s,44);tick(s,1,{attack:true});tick(s,30);
 const e=enemy(s,175,14);e.dir=-1;e.umbrellaAge=0;s.enemies=[e];tap(s,{special:true});const q=s.shots.find(q=>q.ribbonStrong);tick(s,145);
 expect(q.spinHits).toContain(e);expect(q.ribbonContacts||[]).not.toContain(e);expect(e.hp).toBe(100);expect(e.ribbonBound||0).toBe(0);
});

test('mastery adds safe dance travel and air steering without increasing finisher damage or granting lift',()=>{
 const travels=[],air=[];
 for(const level of [1,2,3]){
  const s=scene(level),x=s.player.x;tap(s,{special:true,down:true});const q=s.shots.find(q=>q.ribbonStrong);tick(s,120);travels.push(s.player.x-x);expect(q.damage).toBe(5);
  const flying=scene(level);flying.player.y=280;flying.player.ground=null;tap(flying,{special:true});tick(flying,35);air.push(flying.player.x-220);expect(flying.player.vy).toBeGreaterThan(0);
 }
 expect(travels[0]).toBeGreaterThan(8);expect(travels[1]).toBeGreaterThan(travels[0]);expect(travels[2]).toBeGreaterThan(travels[1]);expect(air[0]).toBeCloseTo(0);expect(air[1]).toBeGreaterThan(air[0]);expect(air[2]).toBeGreaterThan(air[1]);
 const s=scene(3);s.platforms[0].w=s.player.x+25;tap(s,{special:true});tick(s,130);expect(s.player.x).toBeLessThanOrEqual(s.platforms[0].w-19);expect(s.player.y).toBe(480);
 const e=enemy(s,0);ribbonControl(s,e,'push');for(let i=0;i<60;i++)stepRibbonControl(s,e,1/120);expect(e.x).toBeLessThanOrEqual(s.platforms[0].w-11);
 s.platforms=[{x:0,y:480,w:900,h:180},{x:e.x+22,y:410,w:20,h:90}];const before=e.x;ribbonSlide(s,e,100);expect(e.x-before).toBeLessThan(15);
});
