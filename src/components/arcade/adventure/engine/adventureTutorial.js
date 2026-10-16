import {createTrial,stepTrial} from './adventureTrial';
import {equipDrink} from './adventureAmmo';
import {enemyShot} from '../actors/enemies/adventureEnemies';
export const TUTORIAL_LESSONS=[
 {id:'move',title:['Un pasito de magia','A little magic step'],text:['Muévete con la cruceta o el stick izquierdo. La dirección también sirve para apuntar.','Move with the D-pad or left stick. Direction also controls your aim.'],keys:'← → / A D',actions:['left','right'],goal:['Camina por el escenario.','Walk across the stage.']},
 {id:'duck',title:['Por aquí abajo','Down we go'],text:['Mantén abajo para agacharte. Puedes avanzar agachada y disparar desde esa posición.','Hold down to duck. You can walk and shoot while crouching.'],keys:'↓ / S',actions:['down'],goal:['Agáchate un momento.','Duck for a moment.']},
 {id:'jump',title:['Uno… ¡y dos!','One… and two!'],text:['Salta y vuelve a pulsar en el aire para el segundo salto. Suelta entre las dos pulsaciones.','Jump, then press again in the air for a second jump. Release between presses.'],keys:'Espacio',actions:['jump'],goal:['Haz el segundo salto.','Perform the second jump.']},
 {id:'glide',title:['Ligera como una nota','Light as a note'],text:['Mantén salto mientras caes para planear. Usa la dirección para elegir dónde aterrizar.','Hold jump while falling to glide. Steer toward your landing.'],keys:'Espacio · mantener',actions:['jump'],goal:['Planea mientras caes.','Glide while falling.']},
 {id:'aim',title:['Afina la puntería','Tune your aim'],text:['Mantén apuntar sin caminar y elige una dirección. También puedes apuntar en diagonal.','Hold aim in place and choose a direction, including diagonals.'],keys:'F / Ctrl + dirección',actions:['hold','up','attack'],goal:['Apunta hacia arriba sin caminar.','Aim upward while standing still.']},
 {id:'fire',title:['¡Que vuelen las estrellas!','Let the stars fly!'],text:['Mantén disparar para lanzar magia. La varita básica siempre está disponible.','Hold fire to cast magic. The basic wand is always available.'],keys:'Z / J',actions:['attack'],goal:['Lanza un disparo.','Cast a shot.']},
 {id:'dash',title:['Un giro y a seguir','Roll and carry on'],text:['En el suelo ruedas; en el aire haces un dash. Elige la dirección antes de pulsar.','Roll on the ground or dash in the air. Choose your direction before pressing.'],keys:'X / Shift',actions:['dash','jump'],goal:['Rueda o haz un dash.','Roll or air dash.']},
 {id:'guard',title:['El ritmo te protege','Rhythm protects you'],text:['Mantén el escudo musical para bloquear. Consume magia: suéltalo para recuperarla.','Hold the musical shield to block. It uses magic: release it to recover.'],keys:'V',actions:['guard'],goal:['Levanta tu escudo.','Raise your shield.']},
 {id:'drink',title:['Un sabor, otra magia','A flavor, a new spell'],text:['Las bebidas cambian tus disparos. Alterna a la varita básica para conservar la munición; la bebida sigue contigo.','Drinks change your shots. Switch to the basic wand to save ammo; your drink stays with you.'],keys:'Q',actions:['swap','attack'],goal:['Alterna a la varita básica.','Switch to the basic wand.']},
 {id:'strong',title:['Un acento más fuerte','A stronger accent'],text:['La magia fuerte consume parte del medidor. Con una bebida también usa munición.','Strong magic uses part of your magic meter. A drink also uses ammo.'],keys:'C / L',actions:['special'],goal:['Lanza magia fuerte.','Cast strong magic.']},
 {id:'super',title:['Tu gran momento','Your big moment'],text:['Con la carga lista y 90 de magia, libera el súper. Hexy está protegida durante la secuencia.','With a ready charge and 90 magic, unleash your super. Hexy is protected during the sequence.'],keys:'R',actions:['super'],goal:['Activa el súper.','Activate your super.']},
 {id:'coaster',title:['Una pausa en el aire','A pause in the air'],text:['Con el posavasos encantado, crea una plataforma temporal durante el salto. En la tienda puedes descubrir más encantos.','With the enchanted coaster, create a temporary platform during a jump. Discover more charms in the shop.'],keys:'B',actions:['jump','coaster'],goal:['Crea el posavasos en el aire.','Create an airborne coaster.']}
];
export function createTutorial(id){
 const s=createTrial({id:'tutorial'},1);s.tutorial={id,complete:false,startX:260};s.trial.tentX=2000;
 s.level={...s.level,width:960,arena:{entry:2000,left:2000,right:3000,y:480},shop:null};s.boss.x=2900;s.boss.home=2900;
 s.platforms=[{x:0,y:480,baseX:0,baseY:480,w:960,h:180,kind:'earth',dx:0,dy:0}];s.level.platforms=s.platforms;
 Object.assign(s.player,{x:260,y:480,ground:0,dir:1});
 if(!['fire','strong','super','drink','aim'].includes(id))s.enemies=[];else s.enemies=s.enemies.slice(0,2).map((e,i)=>({...e,x:610+i*100,home:610+i*100,practiceLeft:610+i*100,practiceRight:610+i*100}));
 if(id==='drink'){equipDrink(s,0);s.trial.primary=0;}if(id==='coaster')s.mods=['enchanted-coaster'];
 s.camera={x:60,y:480-465/1.4,backdropY:0,zoom:1.4};return s;
}
export function tutorialDemoInput(s){
 const t=s.time,id=s.tutorial.id,pulse=(at,length=.08)=>t>=at&&t<at+length;
 switch(id){
  case 'move':return{right:t>.3&&t<1.2,left:t>1.6&&t<2.5};
  case 'duck':return{down:t>.5&&t<3,right:t>1.3&&t<2};
  case 'jump':return{jump:pulse(.4)||pulse(.82)};
  case 'glide':return{jump:t>.4&&t<.58||t>.9&&t<3.7,right:t>1&&t<3.1};
  case 'aim':return{hold:t>.5&&t<3.2,up:t>.5&&t<1.5,down:t>1.9&&t<3.2,right:t>1.9&&t<3.2,attack:t>.6&&t<3.2};
  case 'fire':return{attack:t>.5&&t<3};
  case 'dash':return{right:t>.3&&t<.9||t>1.7&&t<2.3,dash:pulse(.55)||pulse(2.1),jump:pulse(1.6,.15)};
  case 'guard':return{guard:t>.65&&t<2.8};
  case 'drink':return{attack:t>.4&&t<1||t>1.8&&t<2.5||t>3.7&&t<4.3,swap:pulse(1.3)||pulse(3)};
  case 'strong':return{special:pulse(.8)};
  case 'super':return{super:pulse(.5)};
  case 'coaster':return{jump:pulse(.4,.2),coaster:pulse(.88),right:t>1.3&&t<1.8};
  default:return{};
 }
}
export function stepTutorial(s,input,dt){
 s.trial.spawnWait=999;
 if(s.tutorial.id==='guard'&&!s.tutorial.projectile&&s.time>.3){s.tutorial.projectile=true;enemyShot(s,560,448,Math.PI,160,'streamer');}
 stepTrial(s,input,dt);s.player.x=Math.max(45,Math.min(865,s.player.x));s.camera={x:Math.max(0,Math.min(274,s.player.x-200)),y:480-465/1.4,backdropY:0,zoom:1.4};s.magic=Math.max(95,s.magic);s.player.hurt=0;
 const p=s.player,id=s.tutorial.id;
 const done={move:Math.abs(p.x-s.tutorial.startX)>60,duck:p.crouch,jump:p.jumps>=2,glide:p.gliding,aim:p.holding&&p.aimY<0,fire:s.shots.length>0,dash:p.dash>0,guard:p.guarding,drink:s.basicFire,strong:p.specialCast>0||s.shots.some(q=>q.heavy),super:!!s.superCinematic,coaster:!!s.coaster};
 s.tutorial.complete ||= !!done[id];
}
