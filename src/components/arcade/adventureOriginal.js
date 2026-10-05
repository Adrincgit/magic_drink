import {ORIGINAL_DURATION} from './adventureLoot';
// A short world-space ribbon follows actual movement, including jumps and rolls.
// It expires rather than sticking to the camera, and never grows without bound.
export function stepOriginalTrail(s,dt){
 s.rainbowTrail=(s.rainbowTrail||[]).map(q=>({...q,life:q.life-dt})).filter(q=>q.life>0);
 s.rainbowWait=Math.max(0,(s.rainbowWait||0)-dt);
 const p=s.player;
 if(s.overdrive>0&&!p.drinkCast&&!s.rainbowWait){s.rainbowTrail.push({x:p.x,y:p.y-38,life:.65});s.rainbowWait=1/45;}
}
export function paintOriginalTrail(c,s,reduced){
 const trail=s.rainbowTrail||[],colors=['#ff648e','#ffb64e','#fff179','#7ef1ab','#6ddcfa','#ba92ff'];
 if(trail.length<2||reduced)return;
 c.save();c.lineCap='round';c.lineJoin='round';
 for(let j=0;j<colors.length;j++)for(let i=1;i<trail.length;i++){
  const a=trail[i-1],b=trail[i];if(Math.hypot(a.x-b.x,a.y-b.y)>45)continue;
  c.globalAlpha=Math.min(.96,a.life/.65*1.3);c.strokeStyle=colors[j];c.lineWidth=6;
  c.beginPath();c.moveTo(a.x,a.y+(j-2.5)*5);c.lineTo(b.x,b.y+(j-2.5)*5);c.stroke();
 }
 c.restore();
}

// Screen-space magic celebrates the full effect without hiding enemy attacks.
export function paintOriginalScreen(c,s,art,reduced){
 if(!(s.overdrive>0)||s.player.drinkCast>0)return;
 const strength=Math.min(1,s.overdrive/.8,(ORIGINAL_DURATION-s.overdrive)/.3),time=reduced?0:s.time;
 c.save();c.globalAlpha=Math.max(0,strength)*(reduced?.55:1);
 const glow=c.createRadialGradient(480,270,130,480,270,560);
 glow.addColorStop(0,'#f6aaff00');glow.addColorStop(.45,'#ffd3970a');glow.addColorStop(.78,'#d389ff55');glow.addColorStop(1,'#73efff99');
 c.fillStyle=glow;c.fillRect(0,0,960,540);
 const colors=['#ff8eb35c','#ffe59755','#8ff0c751','#82d9ff55'];
 for(let j=0;j<4;j++){
  c.strokeStyle=colors[j];c.lineWidth=22+j*7;c.lineCap='round';c.beginPath();
  const y=36+j*22+Math.sin(time*.7+j)*12;
  c.moveTo(-70,y);c.bezierCurveTo(210,y-95,630,y+35,1040,y-55);c.stroke();
 }
 const img=art['collectible-star'],cell=img.width/4,count=reduced?10:26;
 const scatter=n=>{const v=Math.sin(n*12.9898)*43758.5453;return v-Math.floor(v);};
 for(let i=0;i<count;i++){
  const x=(scatter(i+1)*960+Math.sin(time*.55+i)*20+960)%960,y=((scatter(i+71)*620-time*(7+i%4*3))%620+620)%620-40;
  const edge=x<130||x>830||y<140||y>430,size=(edge?22:11)+i%3*5;
  c.save();c.translate(x,y);c.rotate(Math.sin(time*.7+i)*.25);c.globalAlpha*=edge?.75:.38;
  c.drawImage(img,0,0,cell,cell,-size/2,-size/2,size,size);c.restore();
 }
 c.restore();
}
