import {hexyMuzzle} from '../actors/hexy/hexyAnimation';
const clamp=x=>Math.max(0,Math.min(1,x));
function state(s){
 const ribbon=!!s.ribbonDance,p=s.player,left=ribbon?s.ribbonDance.remaining:s.overdrive;
 if(!left||p.pendingSip)return null;
 const age=ribbon?s.ribbonDance.duration-left:(s.overdriveDuration||8)-left;
 return{ribbon,left,age,sip:p.drinkCast>0?1-p.drinkCast/.7:null};
}
// Stable screen edges signal the transformation even when standing still.
// The playable centre stays clear; no camera shake, zoom or flashing white.
export function paintPowerScreen(c,s,art,reduced=false){
 const f=state(s);if(!f)return;
 const t=reduced?0:s.fxTime,fade=clamp(f.left/.8),build=f.sip===null?1:clamp(f.sip*1.6),pink=f.ribbon;
 c.save();c.globalAlpha=fade*build*(reduced?.55:1);
 const glow=c.createRadialGradient(480,290,150,480,270,560);
 glow.addColorStop(0,'#ffbfe900');glow.addColorStop(.5,pink?'#ef76ad0a':'#ffedab08');glow.addColorStop(.82,pink?'#fa6ba64c':'#bda0fa32');glow.addColorStop(1,pink?'#d954d199':'#ffb7e57a');c.fillStyle=glow;c.fillRect(0,0,960,540);
 const img=art[pink?'ribbon-dance':'collectible-star'];
 if(img){const cell=img.width/4,count=reduced?10:pink?32:16;
  for(let i=0;i<count;i++){
   const side=i%4,along=(i*.618033+t*(.018+i%3*.004))%1,edge=18+(i%5)*15;
   const x=side===0?edge:side===1?960-edge:along*1040-40,y=side===2?edge:side===3?540-edge:along*620-40;
   const size=(pink?38:20)+(i%3)*9;c.save();c.globalAlpha*=.4+(i%3)*.15;c.translate(x,y);c.rotate(reduced?0:t*.35+i);
   c.drawImage(img,(pink?i%4:0)*cell,pink?cell:0,cell,cell,-size/2,-size/2,size,size);c.restore();
  }
 }
 // One readable title on activation, held rather than flickered every frame.
 const title=f.sip!==null?clamp((f.sip-.35)*4):clamp((1.15-f.age)*2);
 if(title>0){c.globalAlpha*=title;c.textAlign='center';c.font='bold 23px Georgia';c.lineWidth=5;c.strokeStyle='#422447';c.fillStyle=pink?'#ffcee9':'#fff3ba';const name=pink?'RIBBON RASPBERRY':'MAGIC DRINK · ORIGINAL';c.strokeText(name,480,104);c.fillText(name,480,104);}
 c.restore();
}
export function paintPowerAura(c,s,art,reduced=false){
 const f=state(s);if(!f)return;
 const p=s.player,charge=p.ribbonCharge,amount=clamp((charge?.age||0)/.5),burst=f.sip!==null?Math.sin(f.sip*Math.PI/2):Math.max(0,1-f.age/.85);
 const radius=78+burst*55+amount*20,x=p.x,y=p.y-43;
 c.save();c.globalAlpha=clamp(f.left/.7)*(reduced?.6:1);
 const halo=c.createRadialGradient(x,y,10,x,y,radius);halo.addColorStop(0,f.ribbon?'#fff0fb55':'#fffac666');halo.addColorStop(.45,f.ribbon?'#f685d545':'#d28eff45');halo.addColorStop(1,'#ee7bfa00');c.fillStyle=halo;c.fillRect(x-radius,y-radius,radius*2,radius*2);
 const img=art[f.ribbon?'ribbon-dance':'collectible-star'];if(img){const cell=img.width/4,count=reduced?5:10;
  for(let i=0;i<count;i++){const a=i/count*Math.PI*2+(reduced?0:s.fxTime*.8),r=43+burst*70,size=(f.ribbon?25:16)+burst*22;c.save();c.globalAlpha*=.65+burst*.25;c.translate(x+Math.cos(a)*r,y+Math.sin(a)*r*.8);c.rotate(a);c.drawImage(img,(f.ribbon?i%4:0)*cell,f.ribbon?cell:0,cell,cell,-size/2,-size/2,size,size);c.restore();}
 }
 if(amount>.3&&art['ribbon-dance']){const hand=hexyMuzzle(s),size=36+amount*28;c.globalAlpha=amount;c.drawImage(art['ribbon-dance'],Math.floor(s.fxTime*9)%4*320,320,320,320,hand.x-size/2,hand.y-size/2,size,size);}
 c.restore();
}
