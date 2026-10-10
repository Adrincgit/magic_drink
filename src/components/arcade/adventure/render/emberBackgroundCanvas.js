import {emberBurnAt} from '../world/adventureEmberTrail';
import {emberVistaAt} from './emberComposition';
import {painted,paintedParticle} from './paintedDuelCanvas';

export function emberBirdSilhouettes(s,reduced=false){
 const birds=[],time=reduced?12:s.time,vista=emberVistaAt(s.player.x);
 const flock=(age,count,x,y,alpha,seed)=>{
  for(let i=0;i<count;i++)birds.push({x:x-i*18,y:y+Math.abs(i-count/2)*3+Math.sin(i*2.4)*5,
   frame:reduced?2:Math.floor(age*8+i)%8,size:21+(i+seed)%3*5,alpha});
 };
 for(const q of s.emberEnvironment?.flocks||[]){
  if(q.age<0||q.age>44)continue;
  const age=reduced?8:q.age;
  flock(age,q.count,1120-age*29-(s.camera.x-q.x)*q.depth*.35,q.y-age*.7,Math.min(1,age,(44-age)/2)*.85,0);
 }
 // At the overlook, migrations cross the exposed sky continuously. Each
 // flock leaves leftward; its altitude never follows Hexy's jumps or camera.
 if(vista>.01)for(let i=0;i<5;i++){
  const age=(time+i*7.3)%42;
  flock(age,9+i%3*4,1190-age*31,48+i*22-age*.5,Math.min(1,age/2,(42-age)/2)*vista*.95,i);
 }
 return birds.filter(q=>q.x> -35&&q.x<995&&q.alpha>0);
}
export function drawEmberBackgroundLife(c,s,art,reduced=false){
 if(s.fortInside)return;
 const burn=emberBurnAt(s.player.x),vista=emberVistaAt(s.player.x),smoke=Math.max(burn,vista*.8),time=reduced?0:s.time;
 if(burn>.3)for(let i=-1;i<6;i++){
  const x=i*230-((s.camera.x*.16)%230);
  painted(c,art,'fire-show',8+(reduced?2:(Math.floor(time*12+i*3)%8+8)%8),x,370,65,90+i%2*20,0,burn*.65,.5,205/256);
 }
 const sheet=art['ember-smoke'],cw=sheet.width/2,ch=sheet.height/2;
 if(smoke>.04)for(const layer of [{spacing:260,depth:.09,y:105,w:180,h:290,alpha:.36},{spacing:440,depth:.18,y:245,w:610,h:150,alpha:.26}])for(let i=-2;i<5;i++){
  const x=i*layer.spacing-((s.camera.x*layer.depth+time*4)%layer.spacing),phase=time*.1+i*.4+8,frame=Math.floor(phase)%4,mix=phase%1;
  for(const [f,a]of [[frame,1-mix],[(frame+1)%4,mix]]){c.save();c.globalAlpha=smoke*layer.alpha*a;c.drawImage(sheet,f%2*cw,Math.floor(f/2)*ch,cw,ch,x,layer.y,layer.w,layer.h);c.restore();}
 }
 const img=art['ember-birds'],w=img.width/4,h=img.height/2;
 c.save();c.filter='brightness(.2)';
 for(const q of emberBirdSilhouettes(s,reduced)){
  c.globalAlpha=q.alpha;c.drawImage(img,q.frame%4*w,Math.floor(q.frame/4)*h,w,h,q.x,q.y,q.size,q.size);
 }
 c.restore();
 const density=Math.max(burn,vista*.4),count=Math.ceil(density*(reduced?22:115));
 for(let i=0;i<count;i++){
  const age=(time*.075+i*.137)%1,x=((i*167-s.camera.x*.22)%1100+1100)%1100-60-age*45;
  paintedParticle(c,art,3,time+i,x,475-age*430,7+i%4*2,age*2,Math.sin(age*Math.PI)*density*.9);
 }
}
export function drawEmberGroundMist(c,s,art,reduced=false){
 if(s.fortInside)return;
 const burn=emberBurnAt(s.player.x),strength=Math.max(0,(burn-.3)/.7);
 if(!strength)return;
 const sheet=art['ember-smoke'],cw=sheet.width/2,ch=sheet.height/2,time=reduced?0:s.time;
 c.save();c.globalAlpha=strength*.24;
 for(let i=-2;i<4;i++){
  const x=i*530-((s.camera.x*.28+time*8)%530);
  c.drawImage(sheet,i%2===0?0:cw,ch,cw,ch,x,300,800,200);
 }
 c.restore();
}
export function drawEmberAir(c,s,art,reduced=false){
 if(s.fortInside)return;
 const burn=emberBurnAt(s.player.x),time=reduced?0:s.time;
 for(let i=0;i<Math.ceil(burn*(reduced?8:32));i++){
  const age=(time*.1+i*.173)%1,x=((i*193-s.camera.x*.7)%1040+1040)%1040-40-age*70;
  paintedParticle(c,art,3,time+i,x,570-age*580,7+i%4*3,age*3,Math.sin(age*Math.PI)*burn*.7);
 }
}
